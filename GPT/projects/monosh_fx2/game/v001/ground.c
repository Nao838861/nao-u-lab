#include "port.h"
/* Ordinary BG3 + HDMAで横の市松と奥行きの帯を合成する。 */
unsigned char fx_ground_color1[3][300], fx_ground_color3[3][300];
unsigned char fx_ground_far_x[3][10];
unsigned char *fx_ground_far_xptr;
extern unsigned int fx_far_u_acc, fx_far_d_acc;
unsigned char *fx_ground_vptr, *fx_ground_c1ptr, *fx_ground_c3ptr;
const unsigned char *fx_ground_bandptr;
unsigned int fx_ground_step, fx_ground_horizon;
int fx_ground_far_y;
extern const unsigned int fx_ground_steps[65];
void fx_ground_native(void);
static unsigned char slot;
extern const unsigned char fx_ground_bands[1316];
extern const unsigned int fx_ground_light[94], fx_ground_dark[94];
#if 0
static unsigned int color1_count, color3_count;

static void add_color(unsigned char *table, unsigned int *count,
                      unsigned char run, unsigned int color)
{
    unsigned int i = *count;
    table[i++] = run; table[i++] = color; table[i++] = color>>8;
    *count = i;
}

void fx_build_ground_reference(void)
{
    unsigned int step, v = 0, pos = 0, old1 = 65535u, old3 = 65535u;
    unsigned int c1, c3, bright, dark;
    unsigned char physical, source, run = 0;
    int logical, horizon = 118 + monosh_ground_offset;
    step = (93u<<8)/(212-horizon);
    color1_count = color3_count = 0;
    for (physical = 0; physical < 224; ++physical) {
        int scroll;
        logical = physical + 7;
        if (logical < horizon) source = 0;
        else {
            source = v>>8;
            if (source > 93) source = 93;
            v += step;
        }
        scroll = logical < horizon ? -physical : 118+source-physical;
        if (physical == 0) fx_ground_vscroll[pos++] = 255;
        if (physical == 127) fx_ground_vscroll[pos++] = 225;
        fx_ground_vscroll[pos++] = scroll;
        fx_ground_vscroll[pos++] = (unsigned int)scroll>>8;
        bright = fx_ground_light[source]; dark = fx_ground_dark[source];
        if (fx_ground_bands[(unsigned int)fx_ground_phase*94+source]) { c1 = dark; c3 = bright; }
        else { c1 = bright; c3 = dark; }
        if ((c1 != old1 || c3 != old3 || run == 127) && run) {
            add_color(fx_ground_color1,&color1_count,run,old1);
            add_color(fx_ground_color3,&color3_count,run,old3);
            run = 0;
        }
        old1 = c1; old3 = c3; ++run;
    }
    add_color(fx_ground_color1,&color1_count,run,old1);
    add_color(fx_ground_color3,&color3_count,run,old3);
    fx_ground_color1[color1_count] = fx_ground_color3[color3_count] = 0;
    fx_ground_vscroll[pos] = 0;
}
#endif

void fx_build_ground(void)
{
    if (++slot == 3) slot = 0;
    fx_ground_c1ptr = fx_ground_color1[slot];
    fx_ground_c3ptr = fx_ground_color3[slot];
    fx_ground_far_xptr = fx_ground_far_x[slot];
    fx_ground_bandptr = fx_ground_bands + (unsigned int)fx_ground_phase*94;
    fx_ground_step = fx_ground_steps[monosh_ground_offset];
    fx_ground_horizon = 118 + monosh_ground_offset;
    fx_ground_far_y = 7 - monosh_ground_offset;
    fx_ground_native();
}
