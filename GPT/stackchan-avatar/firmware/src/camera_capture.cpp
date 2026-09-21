#include "camera_capture.hpp"

#include <M5Unified.h>
#include <algorithm>
#include <cstdlib>
#include <cstring>
#include <esp_camera.h>
#include <img_converters.h>
#include <vector>

#include "protocols.hpp"

namespace
{
constexpr size_t kImageChunkBytes = 4096;

bool sendMessage(WebSocketsClient &ws, const stackchan_websocket_v1_WebSocketMessage &message)
{
  if (!ws.isConnected())
  {
    return false;
  }
  std::vector<uint8_t> packet;
  if (!encodeWebSocketMessage(message, packet))
  {
    return false;
  }
  ws.sendBIN(packet.data(), packet.size());
  return true;
}
} // namespace

bool CameraCapture::initialize()
{
#if !defined(ARDUINO_M5STACK_CORES3)
  return false;
#else
  if (initialized_)
  {
    return true;
  }

  camera_config_t config = {};
  config.pin_pwdn = -1;
  config.pin_reset = -1;
  config.pin_xclk = -1;
  config.pin_sccb_sda = 12;
  config.pin_sccb_scl = 11;
  config.pin_d7 = 47;
  config.pin_d6 = 48;
  config.pin_d5 = 16;
  config.pin_d4 = 15;
  config.pin_d3 = 42;
  config.pin_d2 = 41;
  config.pin_d1 = 40;
  config.pin_d0 = 39;
  config.pin_vsync = 46;
  config.pin_href = 38;
  config.pin_pclk = 45;
  config.xclk_freq_hz = 20000000;
  config.ledc_timer = LEDC_TIMER_0;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.pixel_format = PIXFORMAT_RGB565;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.sccb_i2c_port = -1;

  M5.In_I2C.release();
  initialized_ = esp_camera_init(&config) == ESP_OK;
  if (initialized_)
  {
    sensor_t *sensor = esp_camera_sensor_get();
    if (sensor)
    {
      sensor->set_framesize(sensor, FRAMESIZE_QVGA);
    }
  }
  else
  {
    // The camera and the internal audio devices share the CoreS3 I2C bus.
    // Restore M5Unified ownership even when camera initialization fails.
    M5.In_I2C.begin();
  }
  return initialized_;
#endif
}

void CameraCapture::shutdown()
{
#if defined(ARDUINO_M5STACK_CORES3)
  if (initialized_)
  {
    esp_camera_deinit();
    initialized_ = false;
  }
  M5.In_I2C.begin();
#endif
}

bool CameraCapture::captureAndSend(uint32_t requestId)
{
  if (!initialize())
  {
    sendEnd(requestId, false, "camera initialization failed");
    return false;
  }

  camera_fb_t *frame = esp_camera_fb_get();
  if (!frame)
  {
    shutdown();
    sendEnd(requestId, false, "camera capture failed");
    return false;
  }

  uint8_t *jpeg = nullptr;
  size_t jpeg_length = 0;
  bool converted = frame2jpg(frame, 70, &jpeg, &jpeg_length);
  const uint32_t width = frame->width;
  const uint32_t height = frame->height;
  esp_camera_fb_return(frame);
  shutdown();

  if (!converted || !jpeg || jpeg_length == 0)
  {
    if (jpeg)
    {
      free(jpeg);
    }
    sendEnd(requestId, false, "jpeg conversion failed");
    return false;
  }

  bool ok = sendStart(requestId, width, height, jpeg_length);
  for (size_t offset = 0; ok && offset < jpeg_length; offset += kImageChunkBytes)
  {
    const size_t length = std::min(kImageChunkBytes, jpeg_length - offset);
    ok = sendData(requestId, jpeg + offset, length);
    delay(1);
  }
  free(jpeg);
  sendEnd(requestId, ok, ok ? "" : "camera transfer failed");
  return ok;
}

bool CameraCapture::sendStart(
    uint32_t requestId,
    uint32_t width,
    uint32_t height,
    size_t totalBytes)
{
  stackchan_websocket_v1_WebSocketMessage message =
      stackchan_websocket_v1_WebSocketMessage_init_zero;
  message.kind = stackchan_websocket_v1_MessageKind_MESSAGE_KIND_CAMERA_IMAGE;
  message.message_type = stackchan_websocket_v1_MessageType_MESSAGE_TYPE_START;
  message.seq = requestId;
  message.which_body = stackchan_websocket_v1_WebSocketMessage_camera_image_start_tag;
  message.body.camera_image_start.request_id = requestId;
  message.body.camera_image_start.width = width;
  message.body.camera_image_start.height = height;
  message.body.camera_image_start.total_bytes = totalBytes;
  strncpy(message.body.camera_image_start.mime_type, "image/jpeg", 31);
  return sendMessage(ws_, message);
}

bool CameraCapture::sendData(uint32_t requestId, const uint8_t *data, size_t length)
{
  stackchan_websocket_v1_WebSocketMessage message =
      stackchan_websocket_v1_WebSocketMessage_init_zero;
  message.kind = stackchan_websocket_v1_MessageKind_MESSAGE_KIND_CAMERA_IMAGE;
  message.message_type = stackchan_websocket_v1_MessageType_MESSAGE_TYPE_DATA;
  message.seq = requestId;
  message.which_body = stackchan_websocket_v1_WebSocketMessage_camera_image_data_tag;
  message.body.camera_image_data.request_id = requestId;
  message.body.camera_image_data.image_bytes.size = length;
  memcpy(message.body.camera_image_data.image_bytes.bytes, data, length);
  return sendMessage(ws_, message);
}

bool CameraCapture::sendEnd(uint32_t requestId, bool success, const char *error)
{
  stackchan_websocket_v1_WebSocketMessage message =
      stackchan_websocket_v1_WebSocketMessage_init_zero;
  message.kind = stackchan_websocket_v1_MessageKind_MESSAGE_KIND_CAMERA_IMAGE;
  message.message_type = stackchan_websocket_v1_MessageType_MESSAGE_TYPE_END;
  message.seq = requestId;
  message.which_body = stackchan_websocket_v1_WebSocketMessage_camera_image_end_tag;
  message.body.camera_image_end.request_id = requestId;
  message.body.camera_image_end.success = success;
  strncpy(message.body.camera_image_end.error, error, 127);
  return sendMessage(ws_, message);
}
