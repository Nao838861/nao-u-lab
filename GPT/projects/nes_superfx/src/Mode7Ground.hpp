#pragma once
#include <array>
#include <cstdint>
#include <algorithm>

namespace nesfx {
// Fixed-function camera-to-row-table unit. No DSP-1 instruction compatibility.
// Time is a provisional 25 MHz, 1024 clocks/row model, not measured FPGA timing.
class Mode7Ground {
public:
    static constexpr unsigned Height=192, RowClocks=1024;
    struct Row { int32_t u=0,v=0,du=0,dv=0; uint8_t bg=1,valid=0; };
    struct Block { uint8_t low=0,high=0,palette=0; };
    std::array<std::array<Row,Height>,2> rows{};
    std::array<int16_t,7> camera{}; // x,z,height Q7; yaw cos/sin, pitch cos/sin Q8
    std::array<uint16_t,2> generation{};
    std::array<bool,2> hideFx{};
    uint8_t front=0,target=1;
    uint16_t cursor=0;
    uint64_t remainder=0;
    bool busy=false,ready=false,error=false,active=false;

    void Reset() { *this=Mode7Ground{}; }
    bool Start(const std::array<int16_t,7>& input,uint8_t back,uint16_t gen,bool hide) {
        int64_t norm=int64_t(input[3])*input[3]+int64_t(input[4])*input[4];
        if(busy || ready || back>1 || back==front || input[2]<=0 || input[2]>16384 ||
           norm<32768 || norm>131072 || input[5]<0 || input[5]>256 || input[6]<0 || input[6]>256) {
            error=true;return false;
        }
        camera=input;target=back;generation[back]=gen;hideFx[back]=hide;
        cursor=0;remainder=0;busy=true;error=false;return true;
    }
    static Row MakeRow(const std::array<int16_t,7>& c,unsigned y) {
        Row row;
        const int64_t cs=c[3],sn=c[4],pc=c[5],ps=c[6],dy=int(y)-96;
        const int64_t denominator=ps*128+dy*pc, norm=cs*cs+sn*sn;
        if(denominator<=0 || norm==0)return row;
        row.bg=0;
        const int64_t height=int64_t(c[2])*512;
        const int64_t forward=height*(pc*128-dy*ps)/denominator;
        const int64_t depth=(forward*pc+height*ps)/256;
        if(depth<=0 || depth>int64_t(144)*65536)return row; // far region stays grass
        const int64_t du=-depth*cs*256*5/(norm*128);
        const int64_t dv= depth*sn*256*5/(norm*128);
        const int64_t u=(int64_t(c[0])*512+forward*sn*256/norm)*5+int64_t(320)*65536-128*du;
        const int64_t v=(int64_t(c[1])*512+forward*cs*256/norm)*5+int64_t(320)*65536-128*dv;
        constexpr int64_t Limit=int64_t(1)<<30;
        if(u<=-Limit || u>=Limit || v<=-Limit || v>=Limit || du<=-Limit/256 || du>=Limit/256 || dv<=-Limit/256 || dv>=Limit/256)return row;
        row.u=int32_t(u);row.v=int32_t(v);row.du=int32_t(du);row.dv=int32_t(dv);row.valid=1;
        return row;
    }
    void Tick(uint64_t clocks) {
        if(!busy)return;
        remainder+=clocks;
        while(busy && remainder>=RowClocks) {
            remainder-=RowClocks;rows[target][cursor]=MakeRow(camera,cursor);++cursor;
            if(cursor==Height){busy=false;ready=true;}
        }
    }
    bool CanCommit(uint8_t back) const { return ready && !busy && back==target && back!=front; }
    bool Commit(uint8_t back) {
        if(!CanCommit(back)){error=true;return false;}
        front=back;ready=false;active=true;return true;
    }
    static Block Composite(uint8_t bgLow,uint8_t bgHigh,uint8_t fxLow,uint8_t fxHigh,uint8_t bg) {
        const uint8_t mask=fxLow|fxHigh;
        // Color zero is transparent only in the FX source. Background zero is preserved.
        return {uint8_t((bgLow&uint8_t(~mask))|fxLow),
                uint8_t((bgHigh&uint8_t(~mask))|fxHigh),uint8_t(bg+(mask?2:0))};
    }
    static Block CompositeAdaptive(uint8_t bgLow,uint8_t bgHigh,uint8_t fxLow,uint8_t fxHigh,uint8_t bg) {
        const uint8_t mask=fxLow|fxHigh;
        if(!bg) {
            auto result=Composite(bgLow,bgHigh,fxLow,fxHigh,0);
            result.palette=0; // Ground keeps white/red/green/gray, including source zero.
            return result;
        }
        if(mask==255)return {fxLow,fxHigh,0}; // No sky holes: all three opaque FX colors fit.
        const uint8_t red=fxLow&uint8_t(~fxHigh),green=fxHigh&uint8_t(~fxLow);
        const uint8_t gray=fxLow&fxHigh,sky=uint8_t(~mask);
        if(gray && !green)return {uint8_t(red|sky),uint8_t(gray|sky),2};
        if(gray && !red)return {uint8_t(gray|sky),uint8_t(green|sky),3};
        // All four non-backdrop colors cannot fit in one NES palette.
        // Keep red/green/sky exact and map gray to blue only in that block.
        return {uint8_t(fxLow|sky),uint8_t(fxHigh|sky),1};
    }
    Block Fetch(unsigned x,unsigned y,const uint8_t* texture,unsigned width,unsigned height,uint8_t fxLow,uint8_t fxHigh,bool adaptive=false) const {
        if(y>=Height)return {0xff,0xff,0}; // gray HUD backdrop (color 3)
        const Row& row=rows[front][y];
        uint8_t low=0,high=0;
        for(unsigned bit=0;bit<8;++bit) {
            uint8_t color=row.bg?3:2; // sky blue / out-of-map grass
            if(row.valid && texture) {
                int64_t u=int64_t(row.u)+int64_t(x+bit)*row.du;
                int64_t v=int64_t(row.v)+int64_t(x+bit)*row.dv;
                if(u>=0 && v>=0 && u<int64_t(width)*65536 && v<int64_t(height)*65536) {
                    unsigned index=unsigned(v>>16)*width+unsigned(u>>16);
                    color=(texture[index>>2]>>(6-2*(index&3)))&3;
                }
            }
            low|=(color&1)<<(7-bit);high|=((color>>1)&1)<<(7-bit);
        }
        if(hideFx[front])fxLow=fxHigh=0;
        return adaptive?CompositeAdaptive(low,high,fxLow,fxHigh,row.bg):Composite(low,high,fxLow,fxHigh,row.bg);
    }
    template<class S> void Serialize(S& s) {
        s.StreamArray(camera.data(),camera.size(),"m7Camera");
        s.StreamArray(generation.data(),generation.size(),"m7Generation");
        for(unsigned b=0;b<2;++b) {
            s.Stream(hideFx[b],"m7HideFx",b);
            for(unsigned y=0;y<Height;++y) {
                auto& r=rows[b][y];unsigned index=b*Height+y;
                s.Stream(r.u,"m7U",index);s.Stream(r.v,"m7V",index);
                s.Stream(r.du,"m7Du",index);s.Stream(r.dv,"m7Dv",index);
                s.Stream(r.bg,"m7Bg",index);s.Stream(r.valid,"m7Valid",index);
            }
        }
        s.Stream(front,"m7Front");s.Stream(target,"m7Target");s.Stream(cursor,"m7Cursor");
        s.Stream(remainder,"m7Remainder");s.Stream(busy,"m7Busy");s.Stream(ready,"m7Ready");
        s.Stream(error,"m7Error");s.Stream(active,"m7Active");
    }
};
}
