from __future__ import annotations

import os
import threading
import webbrowser

from stackchan_avatar.__main__ import main

if __name__ == "__main__":
    if os.name == "nt":
        from stackchan_avatar.windows_resident import main as resident_main

        raise SystemExit(resident_main(open_browser=True))
    threading.Timer(1.2, webbrowser.open, args=("http://127.0.0.1:8000/",)).start()
    main()
