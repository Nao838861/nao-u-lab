#include "BitmapBoard.hpp"
#include <fstream>
#include <iostream>
#include <vector>
#include <string>
std::vector<uint8_t> file(const std::string& p) {
    std::ifstream f(p,std::ios::binary);if(!f)throw std::runtime_error(p);
    return {std::istreambuf_iterator<char>(f),std::istreambuf_iterator<char>()};
}
int run(int argc,char** argv) {
    if(argc<3)return 2;
    std::string root=argv[1],kind=argv[2];
    auto payload=file(root+"/payload.bin");auto matrices=file(root+"/matrices.bin");auto faces=file(root+"/faces.bin");
    nesfx::BitmapBoard b;b.CpuClock();b.CpuClock();
    std::copy(payload.begin(),payload.end(),b.memory.begin()+32768);
    b.CpuWrite(0x5034,0x70);b.CpuWrite(0x5037,0x80);b.CpuWrite(0x503A,0x18);
    b.mode=3;
    uint64_t maximum=0,total=0;
    std::cout<<"{\"clocks\":[";
    unsigned phases=kind=="solid"?64:1;
    for(unsigned p=0;p<phases;++p) {
        std::copy_n(matrices.begin()+p*12,12,b.memory.begin()+0x8080);
        std::copy_n(faces.begin()+p*54,54,b.memory.begin()+0x8140);
        unsigned back=b.front^1;
        b.memory[0x8102]=0;b.memory[0x8103]=back?0x40:0;
        b.CpuWrite(0x5038,back?0x10:0);
        if(kind!="solid") {
            b.CpuWrite(0x5010,0);b.CpuWrite(0x5011,1);
            b.CpuWrite(0x5012,240);b.CpuWrite(0x5013,0);
        }
        b.CpuWrite(0x501E,0);b.CpuWrite(0x501F,0x9C);
        for(unsigned i=0;i<1000000 && b.Busy();++i)b.CpuClock();
        if(b.Busy()) {
            auto&s=b.gsu.GetState();std::cerr<<"TIMEOUT p="<<p<<" PC="<<std::hex<<s.R[15]<<'\n';
            for(int i=0;i<16;++i)std::cerr<<"r"<<i<<"="<<s.R[i]<<" ";return 1;
        }
        if(b.faults)throw std::runtime_error("buffer hazard "+std::to_string(b.faults));
        maximum=std::max(maximum,b.lastRunClocks);total+=b.lastRunClocks;
        if(p)std::cout<<",";std::cout<<b.lastRunClocks;
        if(argc>3) {
            std::ofstream f(root+"/native_"+std::to_string(p)+".bin",std::ios::binary);
            f.write(reinterpret_cast<const char*>(b.memory.data()+back*16384),16384);
        }
        b.CpuWrite(0x5FE2,back);
    }
    std::cout<<"],\"max_clocks\":"<<maximum<<",\"mean_clocks\":"<<(total/phases)<<"}\n";return 0;
}
int main(int argc,char**argv) {
    try{return run(argc,argv);}catch(const std::exception&e){std::cerr<<e.what()<<'\n';return 1;}
}
