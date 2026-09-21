#include "speaking.hpp"
#include <algorithm>
#include <utility>

namespace
{
constexpr uint32_t kMouthFrameMs = 50;
constexpr uint32_t kMouthClosedThreshold = 200;
constexpr uint32_t kMouthSmallThreshold = 900;
constexpr uint32_t kMouthMediumThreshold = 2400;
} // namespace

void Speaking::reset()
{
  buffer_[0].clear();
  buffer_[1].clear();
  buffer_[2].clear();
  current_buffer_ = 0;
  playing_ = false;
  mic_was_enabled_ = false;
  streaming_ = false;
  next_seq_ = 0;
  sample_rate_ = 24000; // default fallback
  channels_ = 1;
  playback_deadline_ms_ = 0;
  mouth_envelope_.clear();
  mouth_playback_started_ms_ = 0;
  mouth_timeline_started_ = false;
}

void Speaking::init()
{
  reset();
}

void Speaking::begin()
{
  // 念のためマイクを停止し、再生に集中させる
  M5.Mic.end();
}

void Speaking::end()
{
  if (M5.Speaker.isPlaying())
  {
    M5.Speaker.stop();
  }
  M5.Speaker.end();
  reset();
}

void Speaking::handleWavStart(uint32_t seq, uint32_t sampleRate, uint16_t channels)
{
  if (!state_.isThinking() && !state_.isSpeaking())
  {
    log_i("Ignoring TTS stream start outside Thinking/Speaking state");
    return;
  }

  current_buffer_ = (current_buffer_ + 1) % 3;
  std::vector<uint8_t> &buf = buffer_[current_buffer_];
  buf.clear();
  playing_ = false;
  streaming_ = true;
  next_seq_ = seq + 1;
  state_.setState(StateMachine::Speaking);

  if (sampleRate > 0)
  {
    sample_rate_ = sampleRate;
  }
  if (channels > 0)
  {
    channels_ = channels;
  }

  log_i("TTS meta: sample_rate=%u channels=%u", (unsigned)sample_rate_, (unsigned)channels_);
  log_i("TTS stream start seq=%u", (unsigned)seq);
}

void Speaking::handleWavData(uint32_t seq, const uint8_t *body, size_t bodyLen)
{
  if (!streaming_)
  {
    return;
  }

  std::vector<uint8_t> &buf = buffer_[current_buffer_];

  if (seq != next_seq_)
  {
    log_w("TTS seq gap: got=%u expected=%u", (unsigned)seq, (unsigned)next_seq_);
    // TCP 前提で再送しない。検知だけして次を受ける。
    next_seq_ = seq + 1;
  }
  else
  {
    next_seq_++;
  }

  buf.insert(buf.end(), body, body + bodyLen);
  log_d("TTS chunk size=%u recv=%u", (unsigned)bodyLen, (unsigned)buf.size());
}

void Speaking::handleWavEnd(uint32_t seq)
{
  if (!streaming_)
  {
    return;
  }

  if (seq != next_seq_)
  {
    log_w("TTS end seq gap: got=%u expected=%u", (unsigned)seq, (unsigned)next_seq_);
  }

  std::vector<uint8_t> &buf = buffer_[current_buffer_];
  streaming_ = false;
  next_seq_ = 0;

  if (!buf.empty())
  {
    playing_ = true;

    const int16_t *samples = reinterpret_cast<const int16_t *>(buf.data());
    size_t sample_len = buf.size() / sizeof(int16_t);
    bool stereo = channels_ > 1;
    if (!mouth_timeline_started_)
    {
      mouth_playback_started_ms_ = millis();
      mouth_timeline_started_ = true;
    }
    appendMouthEnvelope(samples, sample_len);
    const bool accepted = M5.Speaker.playRaw(samples, sample_len, sample_rate_, stereo, 1, 0);
    const uint32_t frames = stereo ? sample_len / 2 : sample_len;
    const uint32_t expected_ms = sample_rate_ > 0
                                     ? static_cast<uint32_t>((static_cast<uint64_t>(frames) * 1000) / sample_rate_)
                                     : 0;
    playback_deadline_ms_ = millis() + expected_ms + 5000;
    if (!accepted)
    {
      log_e("TTS playRaw rejected");
    }
  }
}

uint8_t Speaking::mouthLevel() const
{
  if (!mouth_timeline_started_ || !M5.Speaker.isPlaying())
  {
    return 0;
  }

  const size_t frame = (millis() - mouth_playback_started_ms_) / kMouthFrameMs;
  return frame < mouth_envelope_.size() ? mouth_envelope_[frame] : 0;
}

void Speaking::appendMouthEnvelope(const int16_t *samples, size_t sampleLen)
{
  if (!samples || sampleLen == 0)
  {
    return;
  }

  const size_t samples_per_frame = std::max<size_t>(
      1,
      (static_cast<size_t>(sample_rate_) * std::max<uint16_t>(channels_, 1) * kMouthFrameMs) /
          1000);
  for (size_t offset = 0; offset < sampleLen; offset += samples_per_frame)
  {
    const size_t end = std::min(sampleLen, offset + samples_per_frame);
    uint64_t magnitude_sum = 0;
    for (size_t index = offset; index < end; ++index)
    {
      const int32_t sample = samples[index];
      magnitude_sum += static_cast<uint32_t>(sample < 0 ? -sample : sample);
    }

    const uint32_t average = static_cast<uint32_t>(magnitude_sum / (end - offset));
    uint8_t level = 0;
    if (average > kMouthMediumThreshold)
    {
      level = 3;
    }
    else if (average > kMouthSmallThreshold)
    {
      level = 2;
    }
    else if (average > kMouthClosedThreshold)
    {
      level = 1;
    }
    mouth_envelope_.push_back(level);
  }
}

void Speaking::loop()
{
  const bool timed_out = playing_ && playback_deadline_ms_ != 0 &&
                         static_cast<int32_t>(millis() - playback_deadline_ms_) >= 0;
  if (playing_ && (!M5.Speaker.isPlaying() || timed_out))
  {
    if (timed_out)
    {
      log_w("TTS playback watchdog forced recovery");
      M5.Speaker.stop();
    }
    else
    {
      log_i("TTS play done");
    }
    playing_ = false;
    playback_deadline_ms_ = 0;
    if (on_speak_finished_)
    {
      on_speak_finished_();
    }
    delay(10);
    state_.setState(StateMachine::Idle);
  }
}

void Speaking::setSpeakFinishedCallback(std::function<void()> cb)
{
  on_speak_finished_ = std::move(cb);
}
