#pragma once
#include "NES/BaseMapper.h"
#include "NES/NesConsole.h"
#include "NES/BaseNesPpu.h"
#include "Utilities/Serializer.h"
#include "BitmapBoard.hpp"
#include <cstdlib>

// Development CPU-side MMC5 banking/multiplier + relocated GSU bitmap model.
// Not a complete MMC5 PPU/audio implementation or a finalized hardware ABI.
class NesRacingFx : public BaseMapper {
    nesfx::BitmapBoard _fx;
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
        AddRegisterRange(0x4fd0,0x4ff5);AddRegisterRange(0x5113,0x5117);
        AddRegisterRange(0x5205,0x5206);AddRegisterRange(0x6000,0x7fff);
        _emu->RegisterMemory(MemoryType::NesMapperRam,_fx.memory.data(),_fx.memory.size());
    }
    uint8_t ReadRegister(uint16_t a) override {
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
        if(a==0x4ff4){_pendingSkyRows=std::min<uint8_t>(v,192)&0xf8;_paletteEnabled=true;return;}
        if(a==0x4ff5)return;
        if(a>=0x5113 && a<=0x5117){_banks[a-0x5113]=v;Map(a-0x5113,v);return;}
        if(a==0x5205){_mulA=v;return;}if(a==0x5206){_mulB=v;return;}
        if(a==0x4ff3){_gsuWindow=v&1;return;}
        if(a>=0x6000){if(_gsuWindow)_fx.CpuWrite(a,v);else _workRam[(_banks[0]&15)*8192+(a&8191)]=v;return;}
        if(a==0x4fe2) {
            int line=_console->GetPpu()->GetCurrentScanline();
            if(line<241 || line>260){_fx.faults|=8;return;}
            _skyRows=_pendingSkyRows;
        }
        _fx.CpuWrite(a+(a>=0x4fd0?0x1000:0x800),v);
    }
    void ProcessCpuClock() override {BaseProcessCpuClock();_fx.CpuClock();}
    uint8_t MapperReadVram(uint16_t a,MemoryOperationType) override {
        if(!_fx.mode)return InternalReadVram(a);
        if(a>=0x2000 && a<0x3000) {
            // Repeat the selected palette in all four attribute quadrants.
            // The preceding nametable fetch identifies the bitmap's 8px row.
            if((a&1023)>=960)return _fx.tileInside && _fx.tileY<_skyRows?0x55:0;
            return _fx.NameFetch(a);
        }
        if(a<0x1000) {
            if(_paletteEnabled) {
                if(_fx.mode==4 && !_fx.tileInside)return (a&8)?0xff:0;
            }
            return _fx.PatternFetch(a);
        }
        return InternalReadVram(a);
    }
    void Serialize(Serializer& s) override {
        BaseMapper::Serialize(s);_fx.Serialize(s);
        s.Stream(_skyRows,"skyRows");s.Stream(_pendingSkyRows,"pendingSkyRows");
        s.Stream(_paletteEnabled,"paletteEnabled");
        s.StreamArray(_banks,5,"banks");s.Stream(_mulA,"mulA");s.Stream(_mulB,"mulB");s.Stream(_gsuWindow,"gsuWindow");
        if(!s.IsSaving())for(unsigned i=0;i<5;++i)Map(i,_banks[i]);
    }
public:
    uint8_t PeekRam(uint16_t a) override {
        if((a>=0x4800 && a<=0x4aff)||(a>=0x4fd0 && a<=0x4ff5)||(a>=0x5113 && a<=0x5117)||a==0x5205||a==0x5206)
            return ReadRegister(a);
        if(a>=0x6000 && a<=0x7fff && _gsuWindow)return _fx.CpuPeek(a);
        return BaseMapper::PeekRam(a);
    }
    void Reset(bool) override {_fx.Reset();_gsuWindow=0;_skyRows=0;_pendingSkyRows=0;_paletteEnabled=false;}
};
