#include "Mode7Ground.hpp"
#include <cmath>
#include <iostream>
#include <stdexcept>
using nesfx::Mode7Ground;
void check(bool ok,const char* message){if(!ok){std::cerr<<message<<std::endl;std::exit(1);}}
int main(){
    unsigned comparisons=0,projected=0;
    for(unsigned f0=0;f0<256;++f0)for(unsigned f1=0;f1<256;++f1)for(unsigned background=0;background<4;++background){
        uint8_t b0=background&1?0xa5:0x5a,b1=background&2?0x3c:0xc3;
        auto result=Mode7Ground::Composite(b0,b1,uint8_t(f0),uint8_t(f1),background&1);
        for(unsigned x=0;x<8;++x){
            unsigned bit=7-x,fx=((f0>>bit)&1)|(((f1>>bit)&1)<<1),bg=((b0>>bit)&1)|(((b1>>bit)&1)<<1);
            unsigned actual=((result.low>>bit)&1)|(((result.high>>bit)&1)<<1);
            check(actual==(fx?fx:bg),"transparent pixel lost original background");++comparisons;
        }
        check(result.palette==(background&1)+((f0|f1)?2:0),"block palette selection");
    }
    unsigned adaptivePixels=0,fallbackBlocks=0;
    const unsigned palettes[4][4]={{0,1,2,3},{0,1,2,4},{0,1,3,4},{0,3,2,4}};
    for(unsigned f0=0;f0<256;++f0)for(unsigned f1=0;f1<256;++f1){
        const bool overflow=(f0|f1)!=255 && (f0&~f1) && (f1&~f0) && (f0&f1);
        if(overflow)++fallbackBlocks;
        for(unsigned sky=0;sky<2;++sky){
            auto r=Mode7Ground::CompositeAdaptive(0xa5,0x3c,uint8_t(f0),uint8_t(f1),sky);
            for(unsigned bit=0;bit<8;++bit){
                unsigned fx=((f0>>bit)&1)|(((f1>>bit)&1)<<1);
                unsigned bg=((0xa5>>bit)&1)|(((0x3c>>bit)&1)<<1);
                unsigned index=((r.low>>bit)&1)|(((r.high>>bit)&1)<<1);
                unsigned expected=sky ? (!fx || (overflow && fx==3) ? 4 : fx) : (fx?fx:bg);
                check(palettes[r.palette][index]==expected,"adaptive physical color mismatch");
                check(sky || r.palette==0,"ground palette changed");++adaptivePixels;
            }
        }
    }
    std::cout<<"adaptive_pixels="<<adaptivePixels<<" fallback_blocks="<<fallbackBlocks<<"/65536\n";
    double maxError=0;
    for(unsigned angle=0;angle<64;++angle)for(unsigned view=0;view<4;++view){
        double yaw=angle*6.283185307179586/64;
        double pitches[]={.05,.14,.30,.75},heights[]={2.5,6,12,36};
        std::array<int16_t,7> c={-900,1700,int16_t(heights[view]*128),int16_t(std::round(std::cos(yaw)*256)),int16_t(std::round(std::sin(yaw)*256)),int16_t(std::round(std::cos(pitches[view])*256)),int16_t(std::round(std::sin(pitches[view])*256))};
        for(unsigned y=0;y<192;++y){auto r=Mode7Ground::MakeRow(c,y);if(!r.valid)continue;
            for(unsigned x: {0u,64u,128u,255u}){
                double wx=(double(int64_t(r.u)+int64_t(x)*r.du)/65536-320)/5, wz=(double(int64_t(r.v)+int64_t(x)*r.dv)/65536-320)/5;
                double dx=wx-c[0]/128.0,dz=wz-c[1]/128.0,h=c[2]/128.0;
                double right=(-c[3]*dx+c[4]*dz)/256,forward=(c[4]*dx+c[3]*dz)/256;
                double depth=(forward*c[5]+h*c[6])/256,down=(h*c[5]-forward*c[6])/256;
                double err=std::max(std::abs(128+128*right/depth-x),std::abs(96+128*down/depth-y));
                maxError=std::max(err,maxError);check(err<.1,"camera/table projection mismatch");++projected;
            }
        }
    }
    Mode7Ground unit;std::array<int16_t,7> c={0,0,768,256,0,253,36};
    check(unit.Start(c,1,123,false),"start");c[0]=10000;
    check(!unit.Commit(1),"incomplete table became visible");
    check(unit.camera[0]==0 && unit.front==0 && !unit.active,"input/front latch");
    unit.Tick(Mode7Ground::Height*Mode7Ground::RowClocks-1);check(unit.busy && !unit.ready,"early completion");
    unit.Tick(1);check(unit.ready && !unit.busy && unit.Commit(1),"completion/commit");
    check(unit.generation[unit.front]==123,"generation");
    check(!unit.Start(c,1,124,false),"overwrote displayed table");
    auto row=unit.rows[1][191];check(unit.Start(c,0,124,true),"second start");unit.Tick(1000);
    check(unit.rows[1][191].u==row.u,"front changed during generation");
    unit.Reset();check(!unit.active && !unit.ready && !unit.busy,"reset");
    c[2]=0;check(!unit.Start(c,1,0,false),"zero height accepted");
    std::cout<<"{\"status\":\"pass\",\"composite_pixels\":"<<comparisons<<",\"projected_points\":"<<projected<<",\"max_projection_error_px\":"<<maxError<<",\"table_model_ms\":7.86432}\n";
}
