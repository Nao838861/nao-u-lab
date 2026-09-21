#include <algorithm>

#include <Adafruit_NeoPixel.h>

#include "config.h"
#include "display.hpp"

#if USE_STACKCHAN_BSP
#define GFXModule M5StackChan.Display()
#else
#define GFXModule M5.Display
#endif

namespace
{
constexpr int kStackChanRgbLedCount = 12;
constexpr uint16_t kLedHueRed = 0;
constexpr uint16_t kLedHueOrange = 5461;
constexpr uint16_t kLedHueGreen = 21845;
constexpr uint16_t kLedHueBlue = 43690;
constexpr uint32_t kManualPhotoDisplayMs = 5000;
constexpr uint32_t kPhotoSafetyTimeoutMs = 60000;

uint8_t ledValueFromBrightness()
{
  const int brightness = std::clamp<int>(RGBLED_BRIGHTNESS, 0, 256);
  return static_cast<uint8_t>((brightness * 255 + 128) / 256);
}

void applyLedColor(uint32_t color)
{
#if USE_STACKCHAN_BSP
  for (int led_index = 0; led_index < kStackChanRgbLedCount; ++led_index)
  {
    M5StackChan.setRgbColor(
      led_index,
      static_cast<uint8_t>((color >> 16) & 0xFF),
      static_cast<uint8_t>((color >> 8) & 0xFF),
      static_cast<uint8_t>(color & 0xFF)
    );
  }
  M5StackChan.refreshRgb();
#elif USE_RGBLED
  static Adafruit_NeoPixel pixels(RGBLED_NUM_LEDS, RGBLED_PIN, NEO_GRB + NEO_KHZ800);
  static bool initialized = false;

  if (!initialized)
  {
    pixels.begin();
    pixels.clear();
    initialized = true;
  }

  for (uint16_t led_index = 0; led_index < pixels.numPixels(); ++led_index)
  {
    pixels.setPixelColor(led_index, color);
  }
  pixels.show();
#else
  (void)color;
#endif
}
} // namespace


Display::Display(StateMachine &stateMachine) : state_(stateMachine) {}

void Display::init()
{
  restoreStateScreen();
}

void Display::loop()
{
  StateMachine::State current = state_.getState();
  const bool state_changed = !has_prev_state_ || current != prev_state_;

  if (photo_visible_)
  {
    if (state_changed && current == StateMachine::Speaking)
    {
      photo_comment_started_ = true;
    }

    const uint32_t elapsed = millis() - photo_shown_at_ms_;
    const bool manual_timeout = !photo_hold_until_comment_ && elapsed >= kManualPhotoDisplayMs;
    const bool comment_finished = photo_hold_until_comment_ && photo_comment_started_ &&
                                  state_changed && current == StateMachine::Idle;
    const bool safety_timeout = elapsed >= kPhotoSafetyTimeoutMs;
    if (manual_timeout || comment_finished || safety_timeout)
    {
      restoreStateScreen();
      return;
    }

    if (state_changed)
    {
      drawForState(current);
    }
    prev_state_ = current;
    has_prev_state_ = true;
    return;
  }

  if (state_changed)
  {
    GFXModule.fillScreen(TFT_BLACK);
    drawForState(current);
    drawFace();
  }

  prev_state_ = current;
  has_prev_state_ = true;
}

void Display::showCameraNotice()
{
  photo_visible_ = false;
  GFXModule.fillRect(0, 0, GFXModule.width(), 24, TFT_RED);
  GFXModule.setFont(&fonts::Font2);
  GFXModule.setTextSize(1);
  GFXModule.setTextColor(TFT_WHITE, TFT_RED);
  GFXModule.setCursor(8, 4);
  GFXModule.print("CAMERA");
}

void Display::hideCameraNotice()
{
  restoreStateScreen();
}

bool Display::showPhoto(
    const uint8_t *jpeg,
    size_t length,
    uint32_t imageWidth,
    uint32_t imageHeight,
    bool holdUntilCommentEnds)
{
  if (!jpeg || length == 0 || imageWidth == 0 || imageHeight == 0)
  {
    return false;
  }

  const int32_t screen_width = GFXModule.width();
  const int32_t content_height = GFXModule.height() - statusBarHeight();
  const float scale_x = static_cast<float>(screen_width) / imageWidth;
  const float scale_y = static_cast<float>(content_height) / imageHeight;
  const float scale = std::min(scale_x, scale_y);
  const int32_t drawn_width = static_cast<int32_t>(imageWidth * scale);
  const int32_t drawn_height = static_cast<int32_t>(imageHeight * scale);
  const int32_t x = (screen_width - drawn_width) / 2;
  const int32_t y = (content_height - drawn_height) / 2;

  GFXModule.fillScreen(TFT_BLACK);
  const bool drawn = GFXModule.drawJpg(
      jpeg,
      static_cast<uint32_t>(length),
      x,
      y,
      screen_width,
      content_height,
      0,
      0,
      scale);
  if (!drawn)
  {
    restoreStateScreen();
    return false;
  }

  photo_visible_ = true;
  photo_hold_until_comment_ = holdUntilCommentEnds;
  photo_comment_started_ = false;
  photo_shown_at_ms_ = millis();
  drawForState(state_.getState());
  prev_state_ = state_.getState();
  has_prev_state_ = true;
  return true;
}

void Display::restoreStateScreen()
{
  photo_visible_ = false;
  photo_hold_until_comment_ = false;
  photo_comment_started_ = false;
  photo_shown_at_ms_ = 0;
  GFXModule.fillScreen(TFT_BLACK);
  drawForState(state_.getState());
  drawFace();
  prev_state_ = state_.getState();
  has_prev_state_ = true;
}

void Display::drawForState(StateMachine::State state)
{
  int32_t width = GFXModule.width();
  int32_t height = GFXModule.height();
  int32_t bar_height = statusBarHeight();
  int32_t bar_y = std::max<int32_t>(0, height - bar_height);

  uint16_t bg_color;
  uint16_t font_color;
  uint32_t led_color;

  switch (state)
  {
  case StateMachine::Idle:
    bg_color = TFT_DARKGRAY;
    font_color = TFT_WHITE;
    led_color = Adafruit_NeoPixel::ColorHSV(0, 0, 0);
    break;
  case StateMachine::Listening:
    bg_color = TFT_BLUE;
    font_color = TFT_WHITE;
    led_color = Adafruit_NeoPixel::ColorHSV(kLedHueBlue, 255, ledValueFromBrightness());
    break;
  case StateMachine::Thinking:
    bg_color = TFT_ORANGE;
    font_color = TFT_BLACK;
    led_color = Adafruit_NeoPixel::ColorHSV(kLedHueOrange, 255, ledValueFromBrightness());
    break;
  case StateMachine::Speaking:
    bg_color = TFT_GREEN;
    font_color = TFT_BLACK;
    led_color = Adafruit_NeoPixel::ColorHSV(kLedHueGreen, 255, ledValueFromBrightness());
    break;
  case StateMachine::Disconnected:
    bg_color = TFT_RED;
    font_color = TFT_WHITE;
    led_color = Adafruit_NeoPixel::ColorHSV(kLedHueRed, 255, ledValueFromBrightness());
    break;
  default:
    bg_color = TFT_DARKGRAY;
    font_color = TFT_WHITE;
    led_color = Adafruit_NeoPixel::ColorHSV(0, 0, 0);
    break;
  }

  GFXModule.fillRect(0, bar_y, width, bar_height, bg_color);
  applyLedColor(led_color);
  GFXModule.setFont(&fonts::Font2);
  GFXModule.setTextSize(1);
  GFXModule.setTextColor(font_color, bg_color);
  GFXModule.setCursor(isAtomS3R() ? 4 : 10, bar_y + (isAtomS3R() ? 6 : 2));
  GFXModule.printf("%s", stateToString(state));
}

void Display::drawFace()
{
  int32_t width = GFXModule.width();
  int32_t height = GFXModule.height() - statusBarHeight();
  int32_t center_x = width / 2;

  int32_t eye_y = height * (isAtomS3R() ? 42 : 46) / 100;
  int32_t eye_offset_x = width * (isAtomS3R() ? 18 : 21) / 100;
  int32_t eye_radius = std::max<int32_t>(4, std::min(width, height) / (isAtomS3R() ? 20 : 24));

  int32_t mouth_y = height * (isAtomS3R() ? 68 : 71) / 100;
  int32_t mouth_width = width * (isAtomS3R() ? 32 : 27) / 100;
  int32_t mouth_height = std::max<int32_t>(3, height / (isAtomS3R() ? 36 : 48));

  GFXModule.fillCircle(center_x - eye_offset_x, eye_y, eye_radius, TFT_WHITE);
  GFXModule.fillCircle(center_x + eye_offset_x, eye_y, eye_radius, TFT_WHITE);
  GFXModule.fillRect(center_x - mouth_width / 2, mouth_y, mouth_width, mouth_height, TFT_WHITE);
}

bool Display::isAtomS3R() const
{
#if defined(ARDUINO_M5STACK_ATOMS3R)
  return true;
#else
  return false;
#endif
}

int32_t Display::statusBarHeight() const
{
  return isAtomS3R() ? 28 : 20;
}
