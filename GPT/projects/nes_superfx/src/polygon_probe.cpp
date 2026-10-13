#include "BitmapBoard.hpp"
#include <fstream>
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <stdexcept>
int main(int argc,char** argv) {
    try {
        if(argc<2)return 2;
        std::string root=argv[1];
        std::ifstream f(root+"/payload.bin",std::ios::binary);
        std::vector<uint8_t> payload{std::istreambuf_iterator<char>(f),{}};
        if(payload.size()!=8192)throw std::runtime_error("payload size");
        nesfx::BitmapBoard b;b.CpuClock();b.CpuClock();
        std::copy(payload.begin(),payload.end(),b.memory.begin()+32768);
        unsigned flags=argc>3?std::stoi(argv[3]):0;
        b.CpuWrite(0x5034,0x70);b.CpuWrite(0x5037,flags&1?0xa0:0x80);b.CpuWrite(0x5039,flags&2?1:0);
        b.CpuWrite(0x503A,0x18);b.mode=3;
        auto word=[&](unsigned a){return b.memory[a]|(b.memory[a+1]<<8);};
        unsigned maximum=0;uint64_t total=0;
        std::cout<<"{\"frames\":[";
        for(unsigned phase=0;phase<64;++phase) {
            unsigned back=b.front^1;b.memory[0x8004]=phase;b.memory[0x8006]=0;b.memory[0x8007]=back?0x40:0;
            b.CpuWrite(0x5038,back?0x10:0);b.CpuWrite(0x501E,0);b.CpuWrite(0x501F,0x94);
            auto start=b.gsu.GetState().CycleCount;
            std::map<unsigned,uint64_t> regions;
            while(b.Busy() && b.gsu.GetState().CycleCount-start<25000000) {
                auto before=b.gsu.GetState().CycleCount;
                b.gsu.RunUntil(before+1);
                unsigned pc=b.gsu.DebugGetProgramCounter()&65535;
                regions[pc&0xfe00]+=b.gsu.GetState().CycleCount-before;
            }
            if(b.Busy()||b.faults)throw std::runtime_error("timeout/fault");
            auto elapsed=b.gsu.GetState().CycleCount-start;
            b.targetClock=b.gsu.GetState().CycleCount;
            maximum=std::max(maximum,static_cast<unsigned>(elapsed));total+=elapsed;
            if(phase)std::cout<<",";
            std::cout<<"{\"phase\":"<<phase<<",\"clocks\":"<<elapsed<<",\"vertices\":"<<word(0x8010)
                     <<",\"submitted\":"<<word(0x8012)<<",\"visible\":"<<word(0x8014)
                     <<",\"near_rejected\":"<<word(0x8016)<<",\"regions\":{";
            bool first=true;for(auto [pc,ticks]:regions){if(!first)std::cout<<",";first=false;std::cout<<"\""<<pc<<"\":"<<ticks;}
            std::cout<<"}}";
            if(argc>2){
                std::ofstream out(root+"/native_"+std::to_string(phase)+".bin",std::ios::binary);
                out.write(reinterpret_cast<const char*>(b.memory.data()+back*16384),16384);
                std::ofstream work(root+"/work_"+std::to_string(phase)+".bin",std::ios::binary);
                work.write(reinterpret_cast<const char*>(b.memory.data()+32768),8192);
            }
            b.CpuWrite(0x5FE2,back);
        }
        std::cout<<"],\"max_clocks\":"<<maximum<<",\"mean_clocks\":"<<total/64<<"}\n";
        return 0;
    }catch(const std::exception&e){std::cerr<<e.what()<<"\n";return 1;}
}
