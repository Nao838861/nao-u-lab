"""8×8の録画画素に、PPUで使う4色組を割り当てる。"""
import numpy as np

# Mesen default NES RGB. Index zero in each group is the shared backdrop.
RGB = {0x0f:(0,0,0), 0x2d:(79,79,79), 0x00:(102,102,102),
       0x10:(173,173,173), 0x37:(247,216,165), 0x16:(181,49,32),
       0x11:(21,95,217), 0x3c:(181,235,242), 0x07:(86,29,0),
       0x19:(56,135,0), 0x26:(254,129,112), 0x30:(255,254,255)}
LASER = (0x16,0x11,0x3c)
METAL = (0x0f,0x10,0x37)
FITTING = (0x16,0x37,0x30)
SKIN = (0x07,0x16,0x26)
IRIS = (0x19,0x16,0x37)

def colors(backdrop, entries):
    return np.array([RGB[n] for n in (backdrop,*entries)],dtype=np.int32)

def match(tile, choices, weights, allowed=None):
    # Keep narrow saturated marks from disappearing among the neutral pixels.
    best_error = float('inf')
    for palette, inks in choices:
        d = tile[:,:,None,:] - inks
        # Compare brightness and channel differences separately. A gray at
        # the correct brightness still incurs a cost on an olive or red pixel.
        error = (d*d).sum(3) + (d[:,:,:,0]-d[:,:,:,1])**2 + (d[:,:,:,1]-d[:,:,:,2])**2
        if allowed and palette in allowed:
            index,mask=allowed[palette]
            error[:,:,index]=np.where(mask,error[:,:,index],1e7)
        ids = error.argmin(2)
        cost = (np.take_along_axis(error,ids[:,:,None],2)[:,:,0]*weights).sum()
        if cost < best_error:
            best_error = cost
            best = palette, ids.astype('u1')
    return best

def world_descriptor(attr):
    # The CPU shadow uses bit 7 for occupied terrain, even when the
    # palette in the real ExRAM attribute has both high bits clear.
    if not attr:
        return 0
    assert (attr & 63) in (1,62,63)
    return 128 + (attr >> 6)*4 + (1,62,63).index(attr & 63)
