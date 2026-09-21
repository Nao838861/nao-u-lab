#pragma once

#include <cstddef>
#include <cstdint>

#include "config.h"

#ifndef RGBLED_BRIGHTNESS
#define RGBLED_BRIGHTNESS 255
#endif

#if USE_STACKCHAN_BSP
#include <M5StackChan.h>
#else
#include <M5Unified.h>
#endif
#include "state_machine.hpp"

class Display
{
public:
  explicit Display(StateMachine &stateMachine);

  void init();
  void loop();
  void showCameraNotice();
  void hideCameraNotice();
  void setSpeechMouthLevel(uint8_t level);
  bool showPhoto(
      const uint8_t *jpeg,
      size_t length,
      uint32_t imageWidth,
      uint32_t imageHeight,
      bool holdUntilCommentEnds);

private:
  void restoreStateScreen();
  void drawForState(StateMachine::State state);
  void drawFace();
  void drawMouth(uint8_t level);
  bool isAtomS3R() const;
  int32_t statusBarHeight() const;

  StateMachine &state_;
  bool has_prev_state_ = false;
  StateMachine::State prev_state_ = StateMachine::Idle;
  bool photo_visible_ = false;
  bool photo_hold_until_comment_ = false;
  bool photo_comment_started_ = false;
  uint32_t photo_shown_at_ms_ = 0;
  uint8_t speech_mouth_level_ = 0;
  uint8_t drawn_mouth_level_ = 255;
};
