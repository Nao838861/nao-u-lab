"""元の物理状態を読み取り専用でGSU描画座標へ変換する参照実装。"""
import math, struct

SCALE = 5
ORIGIN = 320
HEADING_BINS = 1024
# Current GRIP art, without the cosmetic one-pixel shadow: x2..13, y2..14.
# Sprite rotation center (7.5,7.5); pixel areas, not just pixel centers.
CAR = {'source_mode':'GRIP', 'source_sprite_canvas':[16,16],
       'source_opaque_bounds_exclusive':[2,2,14,15],
       'source_width_px':12, 'source_length_px':13,
       'source_left_px':-6, 'source_right_px':6,
       'source_front_px':6, 'source_rear_px':-7,
       'source_height_px':4, 'height_is_provisional':True,
       'asphalt_width_px':64, 'road_with_shoulders_px':80,
       'width_to_asphalt':12/64, 'length_to_asphalt':13/64,
       'width_to_total_road':12/80, 'length_to_total_road':13/80,
       'world_source_px_per_unit':SCALE}

def truncdiv(n,d):return (abs(n)//d)*(-1 if n<0 else 1)

def position(raw):
    """signed16.8 source pixels -> signed Q9.7 render units, toward zero."""
    value=truncdiv(raw-ORIGIN*256,10)
    if not -32768<=value<=32767:raise ValueError('position outside render range')
    return value

def direction(heading):
    i=((heading+32)&65535)>>6
    angle=i*math.tau/HEADING_BINS
    # Original heading: 0 north, clockwise. Render +Z points south.
    return -round(math.cos(angle)*256),round(math.sin(angle)*256)

def snapshot(x,y,heading,camera_heading=None,tick=0):
    if camera_heading is None:camera_heading=heading
    return ((x&0xffffff).to_bytes(3,'little')+(y&0xffffff).to_bytes(3,'little')+
            struct.pack('<HHH',heading&65535,camera_heading&65535,tick&65535))

def unpack(data):
    return (int.from_bytes(data[:3],'little',signed=True),
            int.from_bytes(data[3:6],'little',signed=True),
            *struct.unpack('<HHH',data[6:12]))

def pose(data,view):
    x,y,heading,cam,tick=unpack(data)
    x,z=position(x),position(y)
    cs,sn=direction(cam);body_cs,body_sn=direction(heading)
    back,height,pitch=view;back=round(back*128)
    return [x-(back*sn//256),z-(back*cs//256),round(height*128),cs,sn,
            round(math.cos(pitch)*256),round(math.sin(pitch)*256),x,z,body_cs,body_sn]

def route_states(route):
    result=[]
    for phase,(x,y,sn,cs) in enumerate(route):
        h=round(math.atan2(sn,-cs)*65536/math.tau)&65535
        result.append(snapshot(round(x*256),round(y*256),h,tick=phase))
    return result

def geometry():
    return [(round((CAR['source_right_px'] if i&1 else CAR['source_left_px'])/SCALE*128),
             round((CAR['source_height_px'] if i&2 else .5)/SCALE*128),
             round((CAR['source_front_px'] if i&4 else CAR['source_rear_px'])/SCALE*128))
            for i in range(8)]
