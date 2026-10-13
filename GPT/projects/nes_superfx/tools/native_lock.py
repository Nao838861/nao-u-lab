"""標準Mesen UIの依存展開で、専用コアが標準DLLに戻るのを防ぐ。"""
import ctypes as C
from contextlib import contextmanager
from pathlib import Path


@contextmanager
def core_lock(path):
    kernel=C.WinDLL('kernel32',use_last_error=True)
    kernel.CreateFileW.argtypes=[C.c_wchar_p,C.c_uint32,C.c_uint32,C.c_void_p,C.c_uint32,C.c_uint32,C.c_void_p]
    kernel.CreateFileW.restype=C.c_void_p
    kernel.CloseHandle.argtypes=[C.c_void_p]
    handle=kernel.CreateFileW(str(Path(path).resolve()),0x80000000,1,None,3,0x80,None)
    if handle==C.c_void_p(-1).value: raise C.WinError(C.get_last_error())
    try: yield
    finally: kernel.CloseHandle(handle)
