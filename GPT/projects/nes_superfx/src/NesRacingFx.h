#pragma once
#include "NES/BaseMapper.h"
#include "NES/NesConsole.h"
#include "NES/BaseNesPpu.h"
#include "Utilities/Serializer.h"
#include "BitmapBoard.hpp"
#include "Mode7Ground.hpp"
#include <cstdlib>
#include <cstring>

// Development CPU-side MMC5 banking/multiplier + relocated GSU bitmap model.
// Not a complete MMC5 PPU/audio implementation or a finalized hardware ABI.
class NesRacingFx : public BaseMapper {
    nesfx::BitmapBoard _fx;
    nesfx::Mode7Ground _ground;
    std::array<uint8_t,24> _groundRegisters{};
    nesfx::Mode7Ground::Block _groundBlock;
    uint64_t _groundClockRemainder=0;
    bool _groundEnabled=false;
    bool HasGroundRom() const {
        return _prgSize==2097152 && std::memcmp(_prgRom+1048576,"M7R4",4)==0;
    }
    void FetchGroundBlock() {
        auto ppu=_console->GetPpu();
        int y=ppu->GetCurrentScanline();
        if(ppu->GetCurrentCycle()>=321)++y; // pre-render and previous-line prefetch
        if(y<0 || y>=240)y=0;
        unsigned x=_fx.tileX;
        uint8_t lo=0,hi=0;
        if(y<192) {
            auto at=_fx.front*16384+nesfx::BitmapBoard::PixelByte(x,unsigned(y),0);
            lo=_fx.memory[at];hi=_fx.memory[at+1];
        }
        _groundBlock=_ground.Fetch(x,unsigned(y),_prgRom+1048576+16,640,640,lo,hi);
    }
    uint8_t _banks[5]={0,0x80,0x80,0xfe,0x80};
    uint8_t _mulA=0,_mulB=0,_gsuWindow=0;
    uint8_t _skyRows=0,_pendingSkyRows=0;
    bool _paletteEnabled=false;
    void Map(unsigned slot,uint8_t v) {
        if(slot==0)SetCpuMemoryMapping(0x6000,0x7fff,v&15,PrgMemoryType::WorkRam);
        else SelectPrgPage(slot-1,v&127,(v&128)||slot==4?PrgMemoryType::PrgRom:PrgMemoryType::WorkRam);
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
        const char* clock=std::getenv("NES_GSU_CLOCK_HZ");
        if(clock && std::string(clock)=="50000000")_fx.gsuClockHz=50000000;
        SelectChrPage(0,0);
        for(unsigned i=0;i<5;++i)Map(i,_banks[i]);
        AddRegisterRange(0x4fa0,0x4ff5);AddRegisterRange(0x5113,0x5117);
        AddRegisterRange(0x5205,0x5206);AddRegisterRange(0x6000,0x7fff);
        _emu->RegisterMemory(MemoryType::NesMapperRam,_fx.memory.data(),_fx.memory.size());
    }
    uint8_t ReadRegister(uint16_t a) override {
        if(a>=0x4fa0 && a<=0x4fb7) {
            if(a==0x4fb0)return (_ground.busy?1:0)|(_ground.ready?2:0)|(_ground.error?4:0)|(_ground.active?8:0);
            if(a==0x4fb1)return HasGroundRom()?1:0;
            if(a==0x4fb4)return _ground.generation[_ground.front]&255;
            if(a==0x4fb5)return _ground.generation[_ground.front]>>8;
            return _groundRegisters[a-0x4fa0];
        }
        if(a==0x4ff4)return _skyRows;
        if(a==0x4ff5)return 1; // Sky-palette extension available.
        if(a>=0x5113 && a<=0x5117)return _banks[a-0x5113];
        if(a==0x5205)return (_mulA*_mulB)&255;
        if(a==0x5206)return (_mulA*_mulB)>>8;
        if(a==0x4ff3)return _gsuWindow;
        if(a>=0x6000)return _gsuWindow?_fx.CpuRead(a):InternalReadRam(a);
        return _fx.CpuRead(a+(a>=0x4fd0?0x1000:0x800));
    }
    void WriteRegister(uint16_t a,uint8_t v) override {
        if(a==0x4ff0 && v==0xa5){_ground.Reset();_groundEnabled=false;_groundClockRemainder=0;_groundRegisters.fill(0);}
        if(a>=0x4fa0 && a<=0x4fb7) {
            if(a==0x4fb0) {
                if(v!=1 || !HasGroundRom()){_ground.error=true;return;}
                std::array<int16_t,7> camera;
                for(unsigned i=0;i<7;++i)camera[i]=int16_t(_groundRegisters[2*i]|(_groundRegisters[2*i+1]<<8));
                if(_ground.Start(camera,_groundRegisters[14],uint16_t(_groundRegisters[18]|(_groundRegisters[19]<<8)),(_groundRegisters[22]&1)!=0))_groundEnabled=true;
            } else if(a!=0x4fb1 && a!=0x4fb4 && a!=0x4fb5) _groundRegisters[a-0x4fa0]=v;
            return;
        }
        if(a==0x4ff4){_pendingSkyRows=std::min<uint8_t>(v,192)&0xf8;_paletteEnabled=true;return;}
        if(a==0x4ff5)return;
        if(a>=0x5113 && a<=0x5117){_banks[a-0x5113]=v;Map(a-0x5113,v);return;}
        if(a==0x5205){_mulA=v;return;}if(a==0x5206){_mulB=v;return;}
        if(a==0x4ff3){_gsuWindow=v&1;return;}
        if(a>=0x6000){if(_gsuWindow)_fx.CpuWrite(a,v);else _workRam[(_banks[0]&15)*8192+(a&8191)]=v;return;}
        if(a==0x4fe2) {
            int line=_console->GetPpu()->GetCurrentScanline();
            if(line<241 || line>260){_fx.faults|=8;return;}
            if(_groundEnabled) {
                if(_fx.Busy() || _fx.fillBusy || !_ground.CanCommit(v)){_fx.faults|=2;return;}
                _ground.Commit(v);
            }
            _skyRows=_pendingSkyRows;
        }
        _fx.CpuWrite(a+(a>=0x4fd0?0x1000:0x800),v);
    }
    void ProcessCpuClock() override {
        BaseProcessCpuClock();_fx.CpuClock();
        _groundClockRemainder+=uint64_t(25000000)*12;
        _ground.Tick(_groundClockRemainder/21477272);_groundClockRemainder%=21477272;
    }
    uint8_t MapperReadVram(uint16_t a,MemoryOperationType) override {
        if(!_fx.mode)return InternalReadVram(a);
        if(a>=0x2000 && a<0x3000) {
            if(_ground.active) {
                if((a&1023)>=960)return _groundBlock.palette*0x55;
                auto tile=_fx.NameFetch(a);FetchGroundBlock();return tile;
            }
            // Repeat the selected palette in all four attribute quadrants.
            // The preceding nametable fetch identifies the bitmap's 8px row.
            if((a&1023)>=960)return _fx.tileInside && _fx.tileY<_skyRows?0x55:0;
            return _fx.NameFetch(a);
        }
        if(a<0x1000) {
            if(_ground.active)return (a&8)?_groundBlock.high:_groundBlock.low;
            if(_paletteEnabled) {
                if(_fx.mode==4 && !_fx.tileInside)return (a&8)?0xff:0;
            }
            return _fx.PatternFetch(a);
        }
        return InternalReadVram(a);
    }
    void Serialize(Serializer& s) override {
        BaseMapper::Serialize(s);_fx.Serialize(s);
        _ground.Serialize(s);s.StreamArray(_groundRegisters.data(),24,"m7Registers");
        s.Stream(_groundClockRemainder,"m7ClockRemainder");s.Stream(_groundEnabled,"m7Enabled");
        s.Stream(_groundBlock.low,"m7BlockLow");s.Stream(_groundBlock.high,"m7BlockHigh");s.Stream(_groundBlock.palette,"m7BlockPalette");
        s.Stream(_skyRows,"skyRows");s.Stream(_pendingSkyRows,"pendingSkyRows");
        s.Stream(_paletteEnabled,"paletteEnabled");
        s.StreamArray(_banks,5,"banks");s.Stream(_mulA,"mulA");s.Stream(_mulB,"mulB");s.Stream(_gsuWindow,"gsuWindow");
        if(!s.IsSaving())for(unsigned i=0;i<5;++i)Map(i,_banks[i]);
    }
public:
    uint8_t PeekRam(uint16_t a) override {
        if((a>=0x4800 && a<=0x4aff)||(a>=0x4fa0 && a<=0x4ff5)||(a>=0x5113 && a<=0x5117)||a==0x5205||a==0x5206)
            return ReadRegister(a);
        if(a>=0x6000 && a<=0x7fff && _gsuWindow)return _fx.CpuPeek(a);
        return BaseMapper::PeekRam(a);
    }
    void Reset(bool) override {_fx.Reset();_ground.Reset();_groundRegisters.fill(0);_groundEnabled=false;_groundClockRemainder=0;_gsuWindow=0;_skyRows=0;_pendingSkyRows=0;_paletteEnabled=false;}
};
