#pragma once
#include "NES/BaseMapper.h"
#include "NES/NesConsole.h"
#include "NES/BaseNesPpu.h"
#include "Utilities/Serializer.h"
#include "BitmapBoard.hpp"

class NesBitmapFx : public BaseMapper {
    nesfx::BitmapBoard _fx;
protected:
    uint16_t GetPrgPageSize() override { return 0x4000; }
    uint16_t GetChrPageSize() override { return 0x2000; }
    uint32_t GetSaveRamSize() override { return 0; }
    uint32_t GetWorkRamSize() override { return 0; }
    uint16_t RegisterStartAddress() override { return 0x5000; }
    uint16_t RegisterEndAddress() override { return 0x52FF; }
    bool AllowRegisterRead() override { return true; }
    bool EnableCpuClockHook() override { return true; }
    bool EnableCustomVramRead() override { return true; }
    void InitMapper() override {
        SelectPrgPage(0,0);SelectPrgPage(1,1);SelectChrPage(0,0);
        AddRegisterRange(0x5FD0,0x5FF2);AddRegisterRange(0x6000,0x7FFF);
        _emu->RegisterMemory(MemoryType::NesMapperRam,_fx.memory.data(),static_cast<uint32_t>(_fx.memory.size()));
    }
    uint8_t ReadRegister(uint16_t a) override { return _fx.CpuRead(a); }
    void WriteRegister(uint16_t a,uint8_t v) override {
        if(a==0x5FE2) {
            int line=_console->GetPpu()->GetCurrentScanline();
            if(line<241 || line>260) { _fx.faults|=8;return; }
        }
        _fx.CpuWrite(a,v);
    }
    void ProcessCpuClock() override { BaseProcessCpuClock();_fx.CpuClock(); }
    uint8_t MapperReadVram(uint16_t a,MemoryOperationType type) override {
        if(!_fx.mode) return InternalReadVram(a);
        if(a>=0x2000 && a<0x3000) {
            if((a&1023)>=960) return 0;
            return _fx.NameFetch(a);
        }
        // Background uses table $0000; retain table $1000 for fixed-CHR sprite HUD.
        if(a>=0x1000 && a<0x2000) return InternalReadVram(a);
        if(a<0x1000) return _fx.PatternFetch(a);
        return InternalReadVram(a);
    }
    void Serialize(Serializer& s) override { BaseMapper::Serialize(s);_fx.Serialize(s); }
public:
    uint8_t PeekRam(uint16_t a) override { return _fx.Selected(a)?_fx.CpuPeek(a):BaseMapper::PeekRam(a); }
    void Reset(bool) override { _fx.Reset(); }
};
