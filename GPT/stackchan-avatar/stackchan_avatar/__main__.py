from __future__ import annotations

import uvicorn

from .app import create_application
from .config import Settings


def main() -> None:
    settings = Settings()
    application = create_application(settings=settings)
    uvicorn.run(application.fastapi, host=settings.host, port=settings.port)


if __name__ == "__main__":
    main()
