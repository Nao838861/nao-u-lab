#include "BitmapBoard.hpp"
#include <fstream>
#include <iostream>
#include <vector>
#include <array>
int main(int argc,char**argv){
 if(argc!=3)return 2;
 nesfx::BitmapBoard b;b.gsuClockHz=50000000;
 b.CpuClock();b.CpuClock();b.CpuClock();
 std::ifstream in(argv[1],std::ios::binary);in.read((char*)b.memory.data(),b.memory.size());if(!in)return 3;
 unsigned back=b.memory[0x8005]/64;b.front=back^1;
 b.CpuWrite(0x5034,0x70);b.CpuWrite(0x5037,0xa0);b.CpuWrite(0x5039,1);b.CpuWrite(0x503a,0x18);b.CpuWrite(0x5fe0,4);b.CpuWrite(0x5038,back?0x10:0);
 b.CpuWrite(0x501e,0);b.CpuWrite(0x501f,0x90);
 std::array<uint64_t,65536> clocks{};auto start=b.gsu.GetState().CycleCount;
 while(b.Busy()&&b.gsu.GetState().CycleCount-start<30000000){
  auto before=b.gsu.GetState().CycleCount;unsigned pc=b.gsu.DebugGetProgramCounter()&65535;
  b.gsu.RunUntil(before+1);clocks[pc]+=b.gsu.GetState().CycleCount-before;
 }
 if(b.Busy()||b.faults)return 4;
 std::string out=argv[2];std::ofstream p(out+".clocks",std::ios::binary);p.write((const char*)clocks.data(),sizeof(clocks));
 std::ofstream frame(out+".frame",std::ios::binary);frame.write((const char*)b.memory.data()+back*16384,16384);
 std::cout<<b.gsu.GetState().CycleCount-start<<"\n";
}
