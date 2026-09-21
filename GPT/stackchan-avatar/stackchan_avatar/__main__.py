from __future__ import annotations

import uvicorn

from .app import create_application
from .config import Settings


def main() -> None:
    settings = Settings()
    runtime: dict[str, uvicorn.Server] = {}

    def stop() -> None:
        runtime["server"].should_exit = True

    application = create_application(settings=settings, stop_callback=stop)
    config = uvicorn.Config(application.fastapi, host=settings.host, port=settings.port)
    server = uvicorn.Server(config)
    runtime["server"] = server
    server.run()


if __name__ == "__main__":
    main()
