#pragma once
#include "NES/BaseMapper.h"
#include "NES/NesConsole.h"
#include "NES/BaseNesPpu.h"
#include "Utilities/Serializer.h"
#include "FxRacingBoard.hpp"
#include "Mode7Ground.hpp"

// PC functional adapter for the published 2026-10-25 ROM/RTL pair.
// CPU/GSU instructions execute normally. PSRAM copy/arbitration and the
// watchdog are functional approximations; this is not FPGA timing evidence.
class NesFxRacingPc : public BaseMapper {
    nesfx::FxRacingBoard _fx;
    nesfx::Mode7Ground _ground;
    std::array<uint8_t,24> _regs{};
    std::array<uint8_t,32768> _display{};
    nesfx::Mode7Ground::Block _block;
    uint8_t _banks[5]={0,0x80,0x80,0xfe,0x80};
    uint8_t _mulA=0,_mulB=0,_window=0;
    uint64_t _remainder=0;
    bool _title=false,_copied=false;
    unsigned _tileX=0,_tileY=0;
    void Map(unsigned slot,uint8_t value) {
        if(slot==0)SetCpuMemoryMapping(0x6000,0x7fff,value&15,PrgMemoryType::WorkRam);
        else SelectPrgPage(slot-1,value&127,(value&128)||slot==4?PrgMemoryType::PrgRom:PrgMemoryType::WorkRam);
    }
    uint8_t Font(uint16_t a) {
        unsigned offset=a&8191;
        if(_title && !(a&0x1000))offset=0x1f000+(a&4095);
        return offset<_chrRomSize?_chrRom[offset]:0;
    }
    void Fetch() {
        auto ppu=_console->GetPpu();
        int y=ppu->GetCurrentScanline();
        if(ppu->GetCurrentCycle()>=321)++y;
        if(y<0 || y>=240)y=0;
        uint8_t lo=0,hi=0;
        if(y<192) {
            unsigned at=_fx.front*16384+nesfx::BitmapBoard::PixelByte(_tileX,unsigned(y),0);
            lo=_display[at];hi=_display[at+1];
        }
        _block=_ground.Fetch(_tileX,unsigned(y),_chrRom+8192,640,640,lo,hi);
        // racing_display.vhd: ground palette remap and FX gray3 -> universal0.
        const auto &row=_ground.rows[_ground.front][y<192?y:0];
        auto bg=_ground.Fetch(_tileX,unsigned(y),_chrRom+8192,640,640,0,0);
        if(_ground.hideFx[_ground.front])lo=hi=0;
        uint8_t mask=lo|hi;
        uint8_t bl=row.bg?bg.low:uint8_t(~bg.high);
        uint8_t bh=row.bg?bg.high:uint8_t(~bg.low);
        _block.low=(bl&~mask)|(lo&~hi&mask);
        _block.high=(bh&~mask)|(hi&~lo&mask);
        _block.palette=row.bg+(mask?2:0);
    }
protected:
    uint16_t GetPrgPageSize() override {return 8192;}
    uint16_t GetChrPageSize() override {return 8192;}
    uint32_t GetSaveRamSize() override {return 0;}
    uint32_t GetWorkRamSize() override {return 131072;}
    bool ForceWorkRamSize() override {return true;}
    uint16_t RegisterStartAddress() override {return 0x4800;}
    uint16_t RegisterEndAddress() override {return 0x4aff;}
    bool AllowRegisterRead() override {return true;}
    bool EnableCpuClockHook() override {return true;}
    bool EnableCustomVramRead() override {return true;}
    void InitMapper() override {
        _fx.gsuClockHz=50000000;
        SelectChrPage(0,0);
        for(unsigned i=0;i<5;++i)Map(i,_banks[i]);
        AddRegisterRange(0x4fa0,0x4ff5);AddRegisterRange(0x5113,0x5117);
        AddRegisterRange(0x5205,0x5206);AddRegisterRange(0x6000,0x7fff);
        AddRegisterRange(0x40f0,0x40ff); // EverDrive bootstrap presence probe
        _emu->RegisterMemory(MemoryType::NesMapperRam,_fx.memory.data(),_fx.memory.size());
    }
    uint8_t ReadRegister(uint16_t a) override {
        if(a==0x40f1)return 0xc0;
        if(a==0x40ff)return 0xa1;
        if(a>=0x40f0 && a<=0x40ff)return 0;
        if(a>=0x4fa0 && a<=0x4fb7) {
            if(a==0x4fb0)return (_ground.busy?1:0)|(_ground.ready&&_copied?2:0)|(_ground.error?4:0)|(_ground.active?8:0);
            if(a==0x4fb1)return 1;
            if(a==0x4fb4)return _ground.generation[_ground.front]&255;
            if(a==0x4fb5)return _ground.generation[_ground.front]>>8;
            if(a==0x4fb7)return _ground.front|(_ground.hideFx[_ground.front]?2:0);
            return _regs[a-0x4fa0];
        }
        if(a>=0x5113 && a<=0x5117)return _banks[a-0x5113];
        if(a==0x5205)return (_mulA*_mulB)&255;
        if(a==0x5206)return (_mulA*_mulB)>>8;
        if(a==0x4ff3)return _window;
        if(a==0x4ff5)return 1;
        if(a==0x4fe6)return 25; // published wrapper reports the 25MHz host clock
        if(a==0x4fe0)return _title?5:_fx.mode;
        if(a==0x4fd4)return (_ground.error?64:0)|(_ground.busy?32:0)|(_ground.ready?16:0)|(_copied?8:0)|(_fx.Busy()?4:0)|(_ground.front?2:0)|(_fx.mode?1:0);
        if(a==0x4fd5)return (_fx.Busy()?0:8)|7;
        if(a==0x4fd8)return 0;
        if(a>=0x4fd6 && a<=0x4fdb)return 0;
        if(a>=0x6000)return _window?_fx.CpuRead(a):InternalReadRam(a);
        return _fx.CpuRead(a+(a>=0x4fd0?0x1000:0x800));
    }
    void WriteRegister(uint16_t a,uint8_t v) override {
        if(a>=0x40f0 && a<=0x40ff)return;
        if(a==0x4ff0 && v==0xa5)Reset(false);
        if(a>=0x4fa0 && a<=0x4fb7) {
            if(a==0x4fb0) {
                if(v!=1){_ground.error=true;return;}
                std::array<int16_t,7> camera;
                for(unsigned i=0;i<7;++i)camera[i]=int16_t(_regs[i*2]|(_regs[i*2+1]<<8));
                _ground.Start(camera,_regs[14],uint16_t(_regs[18]|(_regs[19]<<8)),(_regs[22]&1)!=0);
            }else if(a!=0x4fb1 && a!=0x4fb4 && a!=0x4fb5)_regs[a-0x4fa0]=v;
            return;
        }
        if(a>=0x5113 && a<=0x5117){_banks[a-0x5113]=v;Map(a-0x5113,v);return;}
        if(a==0x5205){_mulA=v;return;}if(a==0x5206){_mulB=v;return;}
        if(a==0x4ff3){_window=v&1;return;}
        if(a>=0x6000){if(_window)_fx.CpuWrite(a,v);else _workRam[(_banks[0]&15)*8192+(a&8191)]=v;return;}
        if(a==0x4fd8 || a==0x4ff4 || a==0x4ff5)return;
        if(a==0x4fe0){_title=v==5;if(_title){_fx.mode=0;return;}}
        if(a==0x4fe2) {
            if(!_copied || _fx.Busy() || !_ground.Commit(v)){_fx.faults|=2;return;}
            _copied=false;
        }
        _fx.CpuWrite(a+(a>=0x4fd0?0x1000:0x800),v);
    }
    void ProcessCpuClock() override {
        BaseProcessCpuClock();bool was=_fx.Busy();_fx.CpuClock();
        if(was && !_fx.Busy()) {
            std::copy_n(_fx.memory.data(),16384,_display.data()+(1-_fx.front)*16384);
            _copied=true;
        }
        _remainder+=uint64_t(25000000)*12;
        _ground.Tick(_remainder/21477272);_remainder%=21477272;
    }
    uint8_t MapperReadVram(uint16_t a,MemoryOperationType) override {
        if(!_fx.mode)return a<0x2000?Font(a):InternalReadVram(a);
        if(a>=0x2000 && a<0x3000) {
            if((a&1023)>=960)return _tileY<192?_block.palette*0x55:InternalReadVram(a);
            _tileX=(a&31)*8;_tileY=((a&1023)>>5)*8;
            if(_tileY>=192)return InternalReadVram(a);
            Fetch();return uint8_t(a);
        }
        if(a<0x1000 && _tileY<192 && _ground.active)return (a&8)?_block.high:_block.low;
        return a<0x2000?Font(a):InternalReadVram(a);
    }
    void Serialize(Serializer &s) override {
        BaseMapper::Serialize(s);_fx.Serialize(s);_ground.Serialize(s);
        s.StreamArray(_regs.data(),24,"racingRegs");s.StreamArray(_display.data(),32768,"racingDisplay");
        s.StreamArray(_banks,5,"racingBanks");s.Stream(_mulA,"racingMulA");s.Stream(_mulB,"racingMulB");
        s.Stream(_window,"racingWindow");s.Stream(_title,"racingTitle");s.Stream(_copied,"racingCopied");
        s.Stream(_remainder,"racingRemainder");s.Stream(_tileX,"racingTileX");s.Stream(_tileY,"racingTileY");
        s.Stream(_block.low,"racingLow");s.Stream(_block.high,"racingHigh");s.Stream(_block.palette,"racingPalette");
        if(!s.IsSaving())for(unsigned i=0;i<5;++i)Map(i,_banks[i]);
    }
public:
    uint8_t PeekRam(uint16_t a) override {
        if((a>=0x4800 && a<=0x4aff)||(a>=0x4fa0 && a<=0x4ff5)||(a>=0x5113 && a<=0x5117)||a==0x5205||a==0x5206)return ReadRegister(a);
        if(a>=0x6000 && a<=0x7fff && _window)return _fx.CpuRead(a);
        return BaseMapper::PeekRam(a);
    }
    void Reset(bool) override {
        _fx.Reset();_ground.Reset();_regs.fill(0);_remainder=0;
        _window=0;_title=false;_copied=false;
    }
};
