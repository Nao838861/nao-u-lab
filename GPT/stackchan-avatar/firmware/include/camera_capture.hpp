#pragma once

#include <WebSocketsClient.h>
#include <cstddef>
#include <cstdint>

class Display;

class CameraCapture
{
public:
  CameraCapture(WebSocketsClient &ws, Display &display) : ws_(ws), display_(display) {}

  bool captureAndSend(uint32_t requestId, bool holdUntilCommentEnds);

private:
  bool initialize();
  void shutdown();
  bool sendStart(uint32_t requestId, uint32_t width, uint32_t height, size_t totalBytes);
  bool sendData(uint32_t requestId, const uint8_t *data, size_t length);
  bool sendEnd(uint32_t requestId, bool success, const char *error);

  WebSocketsClient &ws_;
  Display &display_;
  bool initialized_ = false;
};
