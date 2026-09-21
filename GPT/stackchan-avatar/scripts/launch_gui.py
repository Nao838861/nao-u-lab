from __future__ import annotations

import threading
import webbrowser

from stackchan_avatar.__main__ import main

if __name__ == "__main__":
    threading.Timer(1.2, webbrowser.open, args=("http://127.0.0.1:8000/",)).start()
    main()
