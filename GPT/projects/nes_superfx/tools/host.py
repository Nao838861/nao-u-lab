"""専用DLLを使う小さなWindowsホスト。通常のMesenと設定・プロセスを共有しない。"""
import ctypes as C
import threading
from pathlib import Path


class Surface(C.Structure):
    _fields_=[('buffer',C.c_void_p),('width',C.c_uint32),('height',C.c_uint32),('dirty',C.c_bool)]


class Timing(C.Structure):
    _fields_=[('fps',C.c_double),('clock',C.c_uint64),('rate',C.c_uint32),
              ('frame',C.c_uint32),('lines',C.c_uint32),('first_line',C.c_int32),('cycles',C.c_uint32)]


class Host:
    def __init__(self,dll,home):
        self.dll=C.WinDLL(str(Path(dll).resolve()))
        self.latest=None
        self.lock=threading.Lock()
        self.closed=False
        callback=C.WINFUNCTYPE(None,C.c_int32,C.c_void_p)
        self.callback=callback(self._notification)
        def bind(name,result,*args):
            fn=getattr(self.dll,name); fn.restype=result; fn.argtypes=list(args)
        for name in ('InitDll','InitializeNesFxHost','InitializeDebugger','Pause','Resume','Stop','Release'):
            bind(name,None)
        bind('GetMesenVersion',C.c_uint32)
        bind('InitializeEmu',None,C.c_char_p,C.c_void_p,C.c_void_p,C.c_bool,C.c_bool,C.c_bool,C.c_bool)
        bind('RegisterNotificationCallback',C.c_void_p,callback)
        bind('UnregisterNotificationCallback',None,C.c_void_p)
        bind('LoadRom',C.c_bool,C.c_char_p,C.c_char_p)
        bind('GetMemoryValue',C.c_uint8,C.c_int32,C.c_uint32)
        bind('GetTimingInfo',Timing,C.c_uint8)
        bind('GetLog',None,C.c_void_p,C.c_int32)
        bind('IsPaused',C.c_bool)
        bind('SetDebuggerFlag',None,C.c_uint32,C.c_bool)
        bind('Step',None,C.c_uint8,C.c_uint32,C.c_int32)
        bind('IsExecutionStopped',C.c_bool)
        bind('SaveStateFile',None,C.c_char_p)
        bind('LoadStateFile',None,C.c_char_p)
        if self.dll.GetMesenVersion()!=0x020101:
            raise RuntimeError('このホストの対象は固定版Mesen2.1.1')
        self.dll.InitDll()
        self.dll.InitializeNesFxHost()
        self.listener=self.dll.RegisterNotificationCallback(self.callback)
        Path(home).mkdir(parents=True,exist_ok=True)
        # SoftwareRenderer does not access HWND; audio/input devices are disabled.
        self.dll.InitializeEmu(str(Path(home).resolve()).encode(),1,1,True,True,False,True)

    def _notification(self,kind,pointer):
        if kind==23 and pointer: # RefreshSoftwareRenderer; first member is frame Surface.
            s=C.cast(pointer,C.POINTER(Surface)).contents
            if s.buffer and 0<s.width<=2048 and 0<s.height<=2048:
                data=C.string_at(s.buffer,s.width*s.height*4)
                with self.lock: self.latest=(s.width,s.height,data)

    def load(self,path):
        if not self.dll.LoadRom(str(Path(path).resolve()).encode(),None):
            raise RuntimeError('ROM load failed: '+self.log())
        self.dll.InitializeDebugger()
        self.dll.SetDebuggerFlag(256,True)

    def read(self,address,memory=8):
        return self.dll.GetMemoryValue(memory,address)

    def timing(self):
        return self.dll.GetTimingInfo(8)

    def frame(self):
        with self.lock: return self.latest

    def log(self):
        buf=C.create_string_buffer(100000); self.dll.GetLog(buf,len(buf))
        return buf.value.decode('utf-8',errors='replace')

    def close(self):
        if not self.closed:
            self.dll.Stop(); self.dll.UnregisterNotificationCallback(self.listener)
            self.dll.Release(); self.closed=True
