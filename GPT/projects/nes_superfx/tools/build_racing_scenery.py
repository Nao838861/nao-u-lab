"""v004の地面・音・物理を保持し、v005の車・木・家を生成する。"""
import argparse, hashlib, json, math, shutil, struct, subprocess
from pathlib import Path
from build_cube import CASFX_HASH

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'build/racing/v005'
TREES = [(160,170),(136,328),(280,436),(482,502),(500,320),(210,43),(168,470),(520,630)]
HOUSES = [(150,260),(620,245)]


class Mesh:
    def __init__(self): self.vertices, self.faces = [], []

    def vertices_add(self, points):
        first = len(self.vertices)
        self.vertices.extend(points)
        return first

    def face(self, material, indices, normal):
        ids = list(indices)
        a,b,c = [self.vertices[i] for i in ids[:3]]
        u,v = [b[k]-a[k] for k in range(3)], [c[k]-a[k] for k in range(3)]
        cross = [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
        assert sum(x*x for x in cross)>0
        if sum(x*y for x,y in zip(cross,normal))<0: ids.reverse()
        if len(ids)==3: ids.append(ids[-1])
        assert len(ids)==4 and material&3 and (material<16 or (material>>4)&3)
        self.faces.append((material,ids))

    def box(self, lo, hi, materials):
        first=self.vertices_add([tuple(hi[k] if i&(1<<k) else lo[k] for k in range(3)) for i in range(8)])
        for axis,side in [(0,0),(0,1),(1,1),(2,0),(2,1)]:
            other=[k for k in range(3) if k!=axis]
            ids=[first+(side<<axis)+(a<<other[0])+(b<<other[1]) for a,b in [(0,0),(1,0),(1,1),(0,1)]]
            normal=[0,0,0];normal[axis]=1 if side else -1
            self.face(materials.pop(0),ids,normal)
        return first

    def face_bytes(self, address, world=False, faces=None, planes=None):
        result=[]
        for index,(material,ids) in enumerate(self.faces if faces is None else faces):
            # Car body transform reflects X; world scenery has the other winding.
            if world: ids=list(reversed(ids[:3]))+[ids[0]] if ids[2]==ids[3] else list(reversed(ids))
            result.append(struct.pack('<6H',material,planes+index*12 if planes else 1,*[address+i*6 for i in ids]))
        return b''.join(result)

    def planes(self, slack=4):
        result=[]
        vertices=[tuple(round(c*128) for c in v) for v in self.vertices]
        for _,ids in self.faces:
            a,b,c=[vertices[i] for i in ids[:3]]
            u,v=[b[k]-a[k] for k in range(3)],[c[k]-a[k] for k in range(3)]
            n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
            gcd=math.gcd(*n);n=[x//gcd for x in n]
            assert all(-32768<x<32768 for x in n)
            # Four Q7 units of conservative slack cover world rounding.
            margin=slack*sum(abs(x) for x in n)
            d=sum(x*y for x,y in zip(n,a))-margin
            assert margin*2<65536
            result.append('.word '+','.join(str(x&65535) for x in [*n,d&65535,(d>>16)&65535,margin*2]))
        return '\n'.join(result)+'\n'

    def vertex_bytes(self, center=(320,320)):
        return b''.join(struct.pack('<3h',round((x+(center[0]-320)/5)*128),round(y*128),round((z+(center[1]-320)/5)*128)) for x,y,z in self.vertices)


def models():
    car=Mesh()
    car.box((-1.12,.22,-1.4),(1.12,.68,1.2),[0x31,1,1,0x31,1])
    # Trapezoidal cabin: hood and rear deck remain visible around its footprint.
    car.vertices_add([(-.94,.68,-.95),(.94,.68,-.95),(-.76,1.25,-.53),(.76,1.25,-.53),
                      (-.94,.68,.65),(.94,.68,.65),(-.76,1.25,.25),(.76,1.25,.25)])
    cabin=[(0x32,[8,10,14,12],(-1,0,0)),(3,[9,13,15,11],(1,0,0)),
           (1,[10,11,15,14],(0,1,0)),(0x32,[8,9,11,10],(0,0,-1)),(3,[12,14,15,13],(0,0,1))]
    # Wheels before cabin so the raised body remains in front when projected.
    for side in [-1,1]:
        for z in [-.87,.72]:
            f=car.vertices_add([(side*1.2,.06,z-.29),(side*1.2,.06,z+.29),(side*1.2,.5,z+.29),(side*1.2,.5,z-.29)])
            car.face(3,range(f,f+4),(side,0,0))
    for material,ids,normal in cabin:car.face(material,ids,normal)

    tree=Mesh();r=2.3
    tree.vertices_add([(-r,1.15,-r),(r,1.15,-r),(r,1.15,r),(-r,1.15,r),(0,5.4,0)])
    tree.vertices_add([(-.34,0,-.28),(.34,0,-.28),(0,0,.36),(-.34,1.7,-.28),(.34,1.7,-.28),(0,1.7,.36)])
    for a,b,normal in [(5,6,(0,0,-1)),(6,7,(1,0,1)),(7,5,(-1,0,1))]:tree.face(0x31,[a,b,b+3,a+3],normal)
    for a,b,mat,n in [(0,1,0x32,(0,0,-1)),(1,2,0x12,(1,0,0)),(2,3,0x32,(0,0,1)),(3,0,0x23,(-1,0,0))]:tree.face(mat,[a,b,4],n)

    house=Mesh()
    house.box((-4.2,0,-3),(4.2,2.2,3),[0x31,0x31,3,3,3])
    # Remove flat ceiling; gables and sloping roof cover the volume.
    del house.faces[2]
    house.vertices_add([(0,4.6,-3),(0,4.6,3)])
    # Independent roof extends 0.35 world beyond all four walls.
    house.vertices_add([(-4.55,2,-3.35),(4.55,2,-3.35),(-4.55,2,3.35),(4.55,2,3.35),
                        (0,4.6,-3.35),(0,4.6,3.35)])
    house.face(1,[10,14,15,12],(-1,1,0));house.face(1,[14,11,13,15],(1,1,0))
    house.face(3,[2,3,8],(0,0,-1));house.face(3,[6,9,7],(0,0,1))
    f=house.vertices_add([(-.7,0,-3.02),(.7,0,-3.02),(.7,1.7,-3.02),(-.7,1.7,-3.02)])
    house.face(1,range(f,f+4),(0,0,-1))
    f=house.vertices_add([(4.22,.8,-.8),(4.22,.8,.8),(4.22,1.7,.8),(4.22,1.7,-.8)])
    house.face(3,range(f,f+4),(1,0,0))
    return car,tree,house


def main():
    p=argparse.ArgumentParser();p.add_argument('--cc65-bin',type=Path,required=True);args=p.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    base=ROOT/'build/racing/v004';demo=ROOT/'demos/racing/v005'
    for name in ['camera.bin','physics_grip.bin','physics_drift.bin','cpu.cfg','gsu.cfg',*[f'fills_{i}.bin' for i in range(4)]]:shutil.copy2(base/name,OUT/name)
    include=ROOT/'.cache/casfx';assert hashlib.sha256((include/'casfx.inc').read_bytes()).hexdigest()==CASFX_HASH
    car,tree,house=models()
    (OUT/'planes.inc').write_text(tree.planes()+house.planes()+car.planes(slack=32))
    for unit in ['gsu','cpu']:
        source=demo/'gsu.s' if unit=='gsu' else ROOT/'demos/racing/v004/cpu.s'
        subprocess.run([str(args.cc65_bin/'ca65'),'-g','-I',str(include),'-I',str(OUT),'-I',str(demo),str(source),'-o',str(OUT/f'{unit}.o')],cwd=OUT,check=True)
        subprocess.run([str(args.cc65_bin/'ld65'),'-C',str(OUT/f'{unit}.cfg'),str(OUT/f'{unit}.o'),'-o',str(OUT/f'{unit}.bin'),'-Ln',str(OUT/f'{unit}.lbl')],check=True)
    original=(ROOT/'releases/GSU_MMC5Racing3D_v004.nes').read_bytes();rom=bytearray(original)
    assert (OUT/'cpu.bin').read_bytes()==original[16:8208], 'CPU/audio/physics must remain exact'
    mesh_report=[]
    for bank in [1,2]:
        at=16+bank*8192;mesh=bytearray(rom[at:at+8192]);mesh[0x100:0x1000]=bytes(0xf00)
        def put(address,data,limit):
            assert address+len(data)<=limit,(hex(address),len(data),hex(limit))
            mesh[address-0x8000:address-0x8000+len(data)]=data
        put(0x8100,car.vertex_bytes(),0x8200);put(0x8200,car.face_bytes(0x8600,planes=0x9e00+17*12),0x8300)
        struct.pack_into('<HH',mesh,0x1e,len(car.vertices),len(car.faces));struct.pack_into('<HH',mesh,0x28,0,0x8200)
        tree_faces=tree.face_bytes(0x8600,world=True,planes=0x9e00);house_faces=house.face_bytes(0x8600,world=True,planes=0x9e00+len(tree.faces)*12)
        put(0x8ca0,tree_faces,0x8d00);put(0x8d00,house_faces,0x8e00)
        # First tree fits after the car faces; remaining meshes fit below $8600.
        first_tree=0x8200+len(car.faces)*12
        assert first_tree+len(tree.vertices)*6<=0x8300
        cursor=0x8300
        for i,center in enumerate(TREES+HOUSES):
            is_tree=i<len(TREES);m=tree if is_tree else house;fptr=0x8ca0 if is_tree else 0x8d00
            radius=math.ceil(max(math.sqrt(x*x+y*y+z*z) for x,y,z in m.vertices)*128)+16
            address=first_tree if i==0 else cursor
            data=m.vertex_bytes(center);put(address,data,0x8300 if i==0 else 0x8600)
            descriptor=struct.pack('<8H',address,len(m.vertices),fptr,len(m.faces),fptr+(36 if is_tree else 0),4 if is_tree else len(m.faces),radius,5 if is_tree else len(m.vertices))
            put(0x8c00+i*16,descriptor,0x8ca0)
            put(0x8e00+i*6,struct.pack('<3h',round((center[0]-320)*128/5),0,round((center[1]-320)*128/5)),0x8e40)
            if bank==1:mesh_report.append({'kind':'tree' if is_tree else 'house','source_position':center,'vertices':len(m.vertices),'faces':len(m.faces),'far_vertices':5 if is_tree else len(m.vertices),'far_faces':4 if is_tree else len(m.faces),'radius_q7':radius})
            if i!=0:cursor+=len(data)
        put(0x9000,(OUT/'gsu.bin').read_bytes(),0xa000);rom[at:at+8192]=mesh
    assert rom[:16+8192]==original[:16+8192] and rom[16+3*8192:]==original[16+3*8192:]
    name='GSU_MMC5Racing3D_v005.nes';(ROOT/'releases'/name).write_bytes(rom);(OUT/name).write_bytes(rom)
    report={'version':'005','rom':name,'rom_sha256':hashlib.sha256(rom).hexdigest(),'base_sha256':hashlib.sha256(original).hexdigest(),
            'car':{'vertices':len(car.vertices),'faces':len(car.faces),'width_world':2.4,'length_world':2.6},'scenery':mesh_report,
            'far_lod_depth_world':{'tree':24,'house':None},'far_lod':'tree: identical world-space canopy without trunk; house: no LOD',
            'house_roof_overhang_world':0.35,'house_colors':'red roof; gray gables and wide walls; red/gray narrow walls',
            'gsu_mhz_target':50,'unchanged':'CPU, physics, audio, Mode7 texture, mapper core; v004 retained',
            'materials':'nonzero red/green/gray; 2-color native GSU checker; index 0 transparent'}
    (ROOT/'releases/racing_3d_v005.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))


if __name__=='__main__':main()
