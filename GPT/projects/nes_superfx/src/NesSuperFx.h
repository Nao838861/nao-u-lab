#pragma once
#include "NES/BaseMapper.h"
#include "Utilities/Serializer.h"
#include "Board.hpp"

class NesSuperFx : public BaseMapper {
    nesfx::Board _fx;
protected:
    uint16_t GetPrgPageSize() override { return 0x4000; }
    uint16_t GetChrPageSize() override { return 0x2000; }
    uint32_t GetSaveRamSize() override { return 0; }
    uint32_t GetWorkRamSize() override { return 0; }
    uint16_t RegisterStartAddress() override { return 0x5000; }
    uint16_t RegisterEndAddress() override { return 0x52FF; }
    bool AllowRegisterRead() override { return true; }
    bool EnableCpuClockHook() override { return true; }
    void InitMapper() override {
        SelectPrgPage(0,0); SelectPrgPage(1,1); SelectChrPage(0,0);
        AddRegisterRange(0x5FF0,0x5FF2); AddRegisterRange(0x6000,0x7FFF);
    }
    uint8_t ReadRegister(uint16_t address) override { return _fx.CpuRead(address); }
    void WriteRegister(uint16_t address,uint8_t value) override { _fx.CpuWrite(address,value); }
    void ProcessCpuClock() override { BaseProcessCpuClock(); _fx.CpuClock(); }
    void Serialize(Serializer& s) override { BaseMapper::Serialize(s); _fx.Serialize(s); }
public:
    uint8_t PeekRam(uint16_t address) override {
        return _fx.Selected(address) ? _fx.CpuPeek(address) : BaseMapper::PeekRam(address);
    }
    void Reset(bool) override { _fx.Reset(); }
};
