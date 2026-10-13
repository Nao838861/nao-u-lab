#include "Board.hpp"
#include <fstream>
#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
std::vector<uint8_t> read(const std::string& path) {
    std::ifstream f(path,std::ios::binary);
    if(!f) throw std::runtime_error(path);
    return {std::istreambuf_iterator<char>(f),std::istreambuf_iterator<char>()};
}
int run(int argc,char** argv) {
    if(argc!=2) return 2;
    const std::string root=argv[1];
    auto code=read(root+"/gsu.bin"); auto model=read(root+"/model.bin");
    auto edges=read(root+"/edges.bin"); auto matrices=read(root+"/matrices.bin");
    if(code.size()!=512 || model.size()!=48 || edges.size()!=72 || matrices.size()!=64*12)
        throw std::runtime_error("cube fixture sizes differ");
    nesfx::Board b; b.CpuClock(); b.CpuClock();
    b.CpuWrite(0x5034,0); b.CpuWrite(0x5037,0x80); b.CpuWrite(0x503A,0x18);
    for(unsigned i=0;i<code.size();++i) b.CpuWrite(0x5100+i,code[i]);
    std::copy(model.begin(),model.end(),b.ram.begin()+0x1000);
    std::copy(edges.begin(),edges.end(),b.ram.begin()+0x1300);
    for(unsigned phase=0;phase<64;++phase) {
        std::copy_n(matrices.begin()+phase*12,12,b.ram.begin()+0x1200);
        b.CpuWrite(0x501E,0); b.CpuWrite(0x501F,0);
        for(unsigned i=0;i<200000 && b.Busy();++i) b.CpuClock();
        auto& s=b.gsu.GetState();
        if(b.Busy()) {
            std::cerr<<"TIMEOUT phase "<<phase<<" PC "<<std::hex<<s.R[15]<<" opcode "<<unsigned(s.ProgramReadBuffer)<<'\n';
            for(int i=0;i<16;++i) std::cerr<<"r"<<std::dec<<i<<"="<<std::hex<<s.R[i]<<" ";
            std::cerr<<'\n';return 1;
        }
        b.CpuRead(0x5030);
        std::ofstream ram(root+"/probe_ram_"+std::to_string(phase)+".bin",std::ios::binary);
        ram.write(reinterpret_cast<char*>(b.ram.data()),b.ram.size());
    }
    std::cout<<"GSU cube completed 64 phases\n";
    return 0;
}
int main(int argc,char** argv) {
    try { return run(argc,argv); }
    catch(const std::exception& error) { std::cerr<<error.what()<<'\n'; return 1; }
}
