#pragma once
#include "NesFxGsu.hpp"
#include <array>

namespace nesfx {
// Functional ABI1 model of development/superfx-lab/rtl/nes_gsu.vhd.
// No PRG->GSU ROM path, no PPU->GSU RAM path, no NES CPU IRQ wiring.
class Board : public Bus {
public:
    std::array<uint8_t,8192> ram{}; // Deterministic fixture; hardware power-on is unspecified.
    Gsu gsu;
    uint64_t targetClock = 0;
    uint64_t clockRemainder = 0;
    uint8_t resetRemaining = 15;
    bool hostOwnsRam = true;
    uint64_t blockedRamAccesses = 0;
    Board() : gsu(*this) {}
    void Reset() {
        gsu.Reset(); gsu.GetState().CycleCount = targetClock;
        resetRemaining = 15; hostOwnsRam = true;
        // Preserve the shared RAM on soft and NES reset.
    }
    void CpuClock() {
        // 25MHz reference / NTSC 21.477272MHz NES master; CPU = master/12.
        clockRemainder += 300000000;
        auto clocks = clockRemainder / 21477272;
        clockRemainder %= 21477272;
        targetClock += clocks;
        if(resetRemaining) {
            auto spent = std::min<uint64_t>(clocks, resetRemaining);
            resetRemaining -= static_cast<uint8_t>(spent);
            gsu.GetState().CycleCount += spent;
            if(resetRemaining) return;
        }
        gsu.RunUntil(targetClock);
    }
    bool Busy() { return gsu.GetState().SFR.Running; }
    bool Selected(uint16_t address) const {
        return (address>=0x5000 && address<=0x52FF) ||
               (address>=0x6000 && address<=0x7FFF) ||
               (address>=0x5FF0 && address<=0x5FF2);
    }
    uint8_t CpuRead(uint16_t address) {
        // STOP releases RAM at a subsequent host strobe in the RTL.
        if(!Busy()) hostOwnsRam=true;
        if(address==0x5FF0) return resetRemaining ? 0 : 1;
        if(address==0x5FF1) return 0x53;
        if(address==0x5FF2) return 1;
        if(resetRemaining) return 0;
        if(address>=0x5000 && address<=0x52FF) return gsu.Read(address-0x2000);
        if(address>=0x6000 && address<=0x7FFF) {
            if(!hostOwnsRam && gsu.GetState().GsuRamAccess) {
                ++blockedRamAccesses; return 0;
            }
            return ram[address&8191];
        }
        return 0;
    }
    uint8_t CpuPeek(uint16_t address) {
        if(address==0x5FF0) return resetRemaining ? 0 : 1;
        if(address==0x5FF1) return 0x53;
        if(address==0x5FF2) return 1;
        if(address>=0x6000 && address<=0x7FFF) return ram[address&8191];
        if(address>=0x5000 && address<=0x52FF) return gsu.Peek(address-0x2000);
        return 0;
    }
    void CpuWrite(uint16_t address, uint8_t value) {
        if(address==0x5FF0 && value==0xA5) { Reset(); return; }
        if(resetRemaining) return;
        if(!Busy()) hostOwnsRam=true;
        if(address>=0x5000 && address<=0x52FF) {
            gsu.Write(address-0x2000,value);
            if(Busy()) hostOwnsRam=false;
            return;
        }
        if(address>=0x6000 && address<=0x7FFF) {
            if(!hostOwnsRam && gsu.GetState().GsuRamAccess) { ++blockedRamAccesses; return; }
            ram[address&8191]=value;
        }
    }
    uint8_t GsuRead(uint32_t address) override {
        if(((address>>16)&0x7E)==0x70) return ram[address&8191];
        return 0; // ROM_DI is wired to $00, including invalid cache fills.
    }
    void GsuWrite(uint32_t address,uint8_t value) override {
        if(((address>>16)&0x7E)==0x70) ram[address&8191]=value;
    }
    template<class S> void Serialize(S& s) {
        s.Stream(targetClock,"fxClock"); s.Stream(clockRemainder,"fxClockRemainder");
        s.Stream(resetRemaining,"fxResetRemaining"); s.Stream(hostOwnsRam,"fxHostOwnsRam");
        s.Stream(blockedRamAccesses,"fxBlockedRamAccesses");
        s.StreamArray(ram.data(),static_cast<uint32_t>(ram.size()),"fxRam");
        gsu.Serialize(s);
    }
};
}
