#include "Board.hpp"
#include <iostream>
#include <vector>
#include <fstream>
#include <stdexcept>

namespace {
void check(bool value,const char* what) { if(!value) throw std::runtime_error(what); }
void ready(nesfx::Board& b) { for(int i=0;i<2;++i) b.CpuClock(); }
void upload(nesfx::Board& b,const std::vector<uint8_t>& program) {
    b.CpuWrite(0x5034,0); b.CpuWrite(0x5039,0); b.CpuWrite(0x5038,0);
    b.CpuWrite(0x5037,0x80); b.CpuWrite(0x503A,0x18);
    for(unsigned i=0;i<program.size();++i) b.CpuWrite(static_cast<uint16_t>(0x5100+i),program[i]);
}
void start(nesfx::Board& b) { b.CpuWrite(0x501E,0); b.CpuWrite(0x501F,0); }
void finish(nesfx::Board& b) {
    for(unsigned i=0;i<10000 && b.Busy();++i) b.CpuClock();
    check(!b.Busy(),"GSU timeout");
    b.CpuRead(0x5030); b.CpuRead(0x5030);
}
void result(nesfx::Board& b,uint16_t sum=0x1336,uint16_t product=63) {
    check(b.CpuRead(0x500A)==(product&255) && b.CpuRead(0x500B)==(product>>8),"MULT result");
    check(b.CpuRead(0x6200)==(sum&255) && b.CpuRead(0x6201)==(sum>>8),"ADD/STW result");
    check(b.CpuRead(0x6000)==255 && b.CpuRead(0x6001)==255,"PLOT/RPIX result");
    check(b.gsu.GetState().R[2]==0,"R2 reused as PLOT y");
}
struct Snapshot {
    std::vector<uint8_t> bytes; size_t offset=0; bool loading=false;
    template<class T> void Stream(T& value,const char*) {
        if(loading) { check(offset+sizeof(T)<=bytes.size(),"snapshot overflow");
            std::memcpy(&value,bytes.data()+offset,sizeof(T)); offset+=sizeof(T); }
        else { auto p=reinterpret_cast<const uint8_t*>(&value); bytes.insert(bytes.end(),p,p+sizeof(T)); }
    }
    template<class T> void StreamArray(T* data,uint32_t count,const char* name) {
        for(uint32_t i=0;i<count;++i) Stream(data[i],name);
    }
};
}
int main(int argc,char** argv) {
    try {
        std::ifstream file(argc>1?argv[1]:"fixtures/program.hex");
        check(file.good(),"program.hex missing");
        std::vector<uint8_t> program; unsigned byte;
        while(file>>std::hex>>byte) { check(byte<=255,"bad program byte"); program.push_back(static_cast<uint8_t>(byte)); }
        check(program.size()==64,"program must contain 64 bytes");
        nesfx::Board board;
        check(board.CpuRead(0x5FF1)==0x53 && board.CpuRead(0x5FF2)==1,"ID/ABI");
        check(board.CpuRead(0x5FF0)==0,"power reset asserted"); ready(board);
        check(board.CpuRead(0x5FF0)==1 && board.CpuRead(0x503B)==4,"reset/version");
        upload(board,program);
        check(board.CpuRead(0x5101)==0x34,"cache readback");
        start(board); check(board.Busy(),"GO must be visible before completion");
        board.CpuWrite(0x6000,0xAA); check(board.blockedRamAccesses==1 && board.ram[0]==0,"RAM ownership");
        board.CpuClock(); Snapshot snapshot; board.Serialize(snapshot);
        finish(board); result(board);
        check(board.gsu.GetState().SFR.Irq,"STOP internal IRQ, even masked");
        auto finalRam=board.ram; auto finalClock=board.targetClock;
        check(board.CpuPeek(0x5031)&0x80,"peek IRQ flag");
        check(board.gsu.GetState().SFR.Irq,"peek must not acknowledge");
        check(board.CpuRead(0x5031)&0x80,"IRQ status");
        check(!board.gsu.GetState().SFR.Irq,"CPU read acknowledges");
        snapshot.loading=true; board.Serialize(snapshot); finish(board); result(board);
        check(board.ram==finalRam && board.targetClock==finalClock,"snapshot replay");
        board.CpuWrite(0x5FF0,0xA4); check(board.CpuRead(0x5FF0)==1,"reset magic");
        board.CpuWrite(0x5FF0,0xA5); check(board.CpuRead(0x5FF0)==0,"reset asserted");
        check(board.ram==finalRam,"RAM survives reset"); ready(board);
        for(auto reg:board.gsu.GetState().R) check(reg==0,"R0..15 reset");
        board.CpuWrite(0x5000,0xAA); board.CpuWrite(0x5002,0x55); board.CpuWrite(0x5001,0x12);
        check(board.CpuRead(0x5000)==0x55 && board.CpuRead(0x5001)==0x12,"common low-byte latch");
        board.GsuWrite(0x712345,0xAB); check(board.ram[0x345]==0xAB,"8KiB RAM folding");
        check(board.GsuRead(0x008000)==0,"GSU ROM input is zero");
        board.CpuWrite(0x5FF0,0xA5); ready(board); upload(board,program);
        board.CpuWrite(0x5034,0); start(board); finish(board);
        check(board.gsu.GetState().R[5]==0,"PBR invalidates uploaded cache");
        nesfx::Board partial; ready(partial); upload(partial,program);
        partial.CpuWrite(0x5034,0);
        for(int i=0;i<15;++i) partial.CpuWrite(static_cast<uint16_t>(0x5100+i),program[i]);
        start(partial); finish(partial); check(partial.gsu.GetState().R[5]==0,"partial cache line remains invalid");
        program[1]=255; program[2]=255; program[10]=0xF9; program[11]=255;
        nesfx::Board signedTest; ready(signedTest); upload(signedTest,program); start(signedTest); finish(signedTest);
        result(signedTest,0x0101,0xFFC1);
        nesfx::Board timing;
        for(int i=0;i<1000;++i) timing.CpuClock();
        check(timing.targetClock==300000000000ULL/21477272,"rational board clock");
        std::cout << "{\"status\":\"pass\",\"board\":\"n8pro-gsu-abi1\",\"timing\":\"functional\","
                     "\"tests\":[\"diagnostic_program\",\"ownership\",\"internal_irq\",\"peek\",\"snapshot\","
                     "\"reset\",\"shared_latch\",\"ram_fold\",\"zero_rom\",\"cache_invalidation\","
                     "\"cache_line_validity\",\"signed_multiply\",\"add_wrap\",\"rational_clock\"]}\n";
        return 0;
    } catch(const std::exception& e) { std::cerr<<"FAIL: "<<e.what()<<'\n'; return 1; }
}
