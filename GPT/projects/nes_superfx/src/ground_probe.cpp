#include "BitmapBoard.hpp"
#include <fstream>
#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
#include <array>
static std::vector<uint8_t> read(const std::string& path) {
    std::ifstream f(path,std::ios::binary);
    if(!f)throw std::runtime_error("missing "+path);
    return {std::istreambuf_iterator<char>(f),{}};
}
class GroundBoard : public nesfx::BitmapBoard {
public:
    void GsuWrite(uint32_t a,uint8_t v) override {
        unsigned off=a&0x3fff;
        if(mode==4 && (a&0xffff)<0x8000 && ((off>=0x2800 && off<0x3000)||off>=0x3800)) {
            std::cerr<<"hidden write PC="<<std::hex<<gsu.DebugGetProgramCounter()<<" address="<<a<<"\n";
            for(unsigned i=0;i<16;++i)std::cerr<<"r"<<i<<"="<<gsu.GetState().R[i]<<" ";std::cerr<<"\n";
            auto&s=gsu.GetState();std::cerr<<"primary="<<unsigned(s.PrimaryCache.X)<<","<<unsigned(s.PrimaryCache.Y)<<" secondary="<<unsigned(s.SecondaryCache.X)<<","<<unsigned(s.SecondaryCache.Y)<<"\n";
            throw std::runtime_error("hidden framebuffer write");
        }
        BitmapBoard::GsuWrite(a,v);
    }
};
int main(int argc,char**argv) {
    try {
        if(argc<2)return 2;
        std::string root=argv[1];unsigned mhz=argc>2?std::stoi(argv[2]):50;
        unsigned phases=argc>3?std::stoi(argv[3]):64;
        auto payload=read(root+"/payload.bin"),texture=read(root+"/texture.bin");
        GroundBoard b;b.gsuClockHz=mhz*1000000;b.CpuClock();b.CpuClock();b.CpuClock();
        if(payload.size()!=8192 || texture.size()!=4096)throw std::runtime_error("data sizes");
        std::copy(payload.begin(),payload.end(),b.memory.begin()+32768);
        for(unsigned bank=0;bank<2;++bank) {
            std::copy(texture.begin(),texture.begin()+2048,b.memory.begin()+bank*16384+0x2800);
            std::copy(texture.begin()+2048,texture.end(),b.memory.begin()+bank*16384+0x3800);
        }
        b.CpuWrite(0x5034,0x70);b.CpuWrite(0x5037,0xa0);b.CpuWrite(0x5039,1);
        b.CpuWrite(0x503a,0x18);b.CpuWrite(0x5fe0,4);
        auto word=[&](unsigned a){return b.memory[a]|b.memory[a+1]<<8;};
        auto set=[&](unsigned a,unsigned v){b.memory[a]=v&255;b.memory[a+1]=(v>>8)&255;};
        std::cout<<"{\"mhz\":"<<mhz<<",\"frames\":[";bool first=true;
        for(unsigned view=0;view<4;++view) {
            auto poses=read(root+"/poses_"+std::to_string(view)+".bin");
            auto rows=read(root+"/rows_"+std::to_string(view)+".bin");
            auto fills=read(root+"/fills_"+std::to_string(view)+".bin");
            std::copy(rows.begin(),rows.end(),b.memory.begin()+0x8c00);
            for(unsigned mode=0;mode<2;++mode)for(unsigned phase=0;phase<phases;++phase) {
                auto back=b.front^1;set(0x8000,mode);set(0x8002,phase);set(0x8004,back*16384);set(0x8006,view);
                std::copy(poses.begin()+phase*22,poses.begin()+(phase+1)*22,b.memory.begin()+0x8008);
                b.CpuWrite(0x5038,back?0x10:0);
                auto fillStart=b.gsu.GetState().CycleCount;uint64_t fillClocks=0;
                for(unsigned i=0;i<fills[0];++i) {
                    auto p=fills.data()+1+6*i;unsigned addr=(p[0]|p[1]<<8)+back*16384;
                    b.CpuWrite(0x5fe8,addr&255);b.CpuWrite(0x5fe9,addr>>8);
                    b.CpuWrite(0x5fea,p[2]);b.CpuWrite(0x5feb,p[3]);
                    b.CpuWrite(0x5fec,p[4]);b.CpuWrite(0x5fed,p[5]);b.CpuWrite(0x5fee,1);
                    while(b.fillBusy)b.CpuClock();fillClocks+=b.lastFillClocks;
                }
                auto fillWait=b.gsu.GetState().CycleCount-fillStart;
                b.CpuWrite(0x501e,0);b.CpuWrite(0x501f,0x90);
                auto start=b.gsu.GetState().CycleCount;
                std::array<uint64_t,8> regions{};
                while(b.Busy() && b.gsu.GetState().CycleCount-start<25000000) {
                    auto before=b.gsu.GetState().CycleCount;
                    unsigned pc=b.gsu.DebugGetProgramCounter()&65535;
                    b.gsu.RunUntil(before+1);
                    if(pc>=0x9000 && pc<0xa000)regions[(pc-0x9000)/512]+=b.gsu.GetState().CycleCount-before;
                }
                auto cycles=b.gsu.GetState().CycleCount-start;
                if(b.Busy()||b.faults) {
                    std::ofstream debug(root+"/debug.bin",std::ios::binary);
                    debug.write((const char*)b.memory.data(),b.memory.size());
                    std::cerr<<"view="<<view<<" mode="<<mode<<" phase="<<phase<<" PC="<<std::hex<<b.gsu.DebugGetProgramCounter()<<" faults="<<unsigned(b.faults)<<"\n";
                    throw std::runtime_error("GSU timeout/fault");
                }
                b.targetClock=b.gsu.GetState().CycleCount;
                if(!std::equal(rows.begin(),rows.end(),b.memory.begin()+0x8c00))throw std::runtime_error("row table damaged");
                for(unsigned j=0;j<4096;++j) {
                    unsigned a=back*16384+0x2800+j+(j>=2048?0x800:0);
                    if(b.memory[a]!=texture[j]) {
                        std::ofstream debug(root+"/debug.bin",std::ios::binary);
                        debug.write((const char*)b.memory.data(),b.memory.size());
                        std::cerr<<"texture address="<<std::hex<<a<<" value="<<unsigned(b.memory[a])<<" expected="<<unsigned(texture[j])<<"\n";
                        throw std::runtime_error("texture damaged");
                    }
                }
                auto stem=root+"/native_"+std::to_string(mhz)+"_"+std::to_string(view)+"_"+std::to_string(mode)+"_"+std::to_string(phase);
                std::ofstream frame(stem+".bin",std::ios::binary);
                frame.write((const char*)b.memory.data()+back*16384,16384);
                std::ofstream work(stem+".work",std::ios::binary);
                work.write((const char*)b.memory.data()+32768,8192);
                if(!first)std::cout<<",";first=false;
                std::cout<<"{\"view\":"<<view<<",\"mode\":"<<mode<<",\"phase\":"<<phase<<",\"gsu_clocks\":"<<cycles
                         <<",\"fill_clocks\":"<<fillClocks<<",\"fill_wait_clocks\":"<<fillWait<<",\"visible_quads\":"<<word(0x8024)<<",\"regions\":[";
                for(unsigned i=0;i<8;++i){if(i)std::cout<<",";std::cout<<regions[i];}std::cout<<"]}";
                b.CpuWrite(0x5fe2,back);
            }
        }
        std::cout<<"]}\n";return 0;
    }catch(const std::exception&e){std::cerr<<e.what()<<"\n";return 1;}
}
