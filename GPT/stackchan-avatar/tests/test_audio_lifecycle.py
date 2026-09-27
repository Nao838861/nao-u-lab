import asyncio
from unittest.mock import AsyncMock

import pytest

from stackchan_server.listen import ListenHandler, TimeoutError
from stackchan_server.speak import SpeakHandler, SpeechInterruptedError


def listener(tmp_path, recognizer, *, timeout=1):
    return ListenHandler(
        speech_recognizer=recognizer,
        recordings_dir=tmp_path,
        debug_recording=False,
        listen_audio_timeout_seconds=0.05,
        transcription_timeout_seconds=timeout,
    )


async def end_recording(handler, ws, send):
    await handler.handle_start(ws)
    await handler.handle_data(ws, 2, b"\0\0")
    await handler.handle_end(
        ws, payload_bytes=0, payload=b"", send_state_command=send, thinking_state=2
    )


@pytest.mark.asyncio
async def test_slow_recognition_does_not_trigger_audio_inactivity(tmp_path):
    release = asyncio.Event()

    async def transcribe(_pcm):
        await release.wait()
        return "遅れても同じ会話の返答"

    handler = listener(tmp_path, AsyncMock(transcribe=transcribe))
    ws, send = AsyncMock(), AsyncMock()
    task = asyncio.create_task(
        handler.listen(
            send_state_command=send, is_closed=lambda: False, idle_state=0, listening_state=1
        )
    )
    await asyncio.sleep(0)
    await end_recording(handler, ws, send)
    # END処理は認識完了を待たず、WebSocket受信ループを解放する。
    await asyncio.sleep(0.15)
    assert not task.done()
    assert all(call.args != (0,) for call in send.await_args_list)
    release.set()
    assert await asyncio.wait_for(task, 1) == "遅れても同じ会話の返答"
    await handler.close()


@pytest.mark.asyncio
async def test_recognition_deadline_cancels_and_does_not_leak_transcript(tmp_path):
    recognizer = AsyncMock()

    async def delayed(_pcm):
        await asyncio.sleep(10)
        return "古い発話"

    recognizer.transcribe.side_effect = delayed
    handler = listener(tmp_path, recognizer, timeout=0.08)
    ws, send = AsyncMock(), AsyncMock()
    task = asyncio.create_task(
        handler.listen(
            send_state_command=send, is_closed=lambda: False, idle_state=0, listening_state=1
        )
    )
    await asyncio.sleep(0)
    await end_recording(handler, ws, send)
    with pytest.raises(TimeoutError, match="recognition timed out"):
        await asyncio.wait_for(task, 1)
    assert not handler._message_ready.is_set()
    await handler.close()


@pytest.mark.asyncio
async def test_new_recording_discards_previous_pending_recognition(tmp_path):
    cancelled = asyncio.Event()
    started = asyncio.Event()

    async def delayed(_pcm):
        started.set()
        try:
            await asyncio.sleep(10)
        finally:
            cancelled.set()

    recognizer = AsyncMock(transcribe=delayed)
    handler = listener(tmp_path, recognizer)
    ws, send = AsyncMock(), AsyncMock()
    await end_recording(handler, ws, send)
    await started.wait()
    await handler.handle_start(ws)
    assert cancelled.is_set()
    assert not handler._message_ready.is_set()
    assert handler._transcript is None
    await handler.close()


@pytest.mark.asyncio
async def test_tap_interrupts_playback_wait_without_two_minute_stall(tmp_path):
    speaker = SpeakHandler(
        websocket=AsyncMock(),
        down_wav_chunk=4096,
        down_segment_millis=500,
        down_segment_stagger_millis=250,
        sample_width=2,
        speech_synthesizer=AsyncMock(),
        recordings_dir=tmp_path,
        debug_recording=False,
    )
    speaker._speaking = True
    task = asyncio.create_task(
        speaker._wait_for_speaking_finished(
            min_counter=1, timeout_seconds=120, is_closed=lambda: False
        )
    )
    await asyncio.sleep(0)
    speaker.handle_speak_cancel_event()
    with pytest.raises(SpeechInterruptedError):
        await asyncio.wait_for(task, 0.5)
