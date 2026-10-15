"""元の道路画像・中央ルートとGSU比較用コースの形状を照合する。"""
import json,math
from pathlib import Path
from PIL import Image,ImageDraw
from build_ground import ROOT,inside
from mmc5_course import distance,source_data

def verify(directory):
    directory=Path(directory);config=json.loads((directory/'config.json').read_text())
    data=source_data();points=data['source_centerline'];scale=data['world_scale'];rings=config['road_rings']
    source=Image.open(ROOT/'demos/ground/v002/course_reference.png').convert('1')
    mesh=Image.new('1',(640,640));draw=ImageDraw.Draw(mesh)
    coords=lambda ring:[(x/128*scale+320,z/128*scale+320) for x,_,z in ring]
    draw.polygon(coords(rings[3]),fill=1);draw.polygon(coords(rings[0]),fill=0)
    a,b=list(source.get_flattened_data()),list(mesh.get_flattened_data());inter=sum(bool(x and y) for x,y in zip(a,b));union=sum(bool(x or y) for x,y in zip(a,b))
    source_count=sum(bool(x) for x in a)
    iou=inter/union
    assert iou>=.94,('road footprint IoU',iou)
    deviations=[]
    for phase,p in enumerate(config['views'][0]['poses']):
        x,z=p[7]/128,p[8]/128;sx,sz=x*scale+320,z*scale+320
        dev=min(distance((sx,sz),a,b) for a,b in zip(points,points[1:]+points[:1]));deviations.append(dev)
        assert dev<=.04,(phase,'off source route',dev)
        assert inside(x,z,rings[2]) and not inside(x,z,rings[1]),(phase,'outside asphalt')
        assert source.getpixel((round(sx),round(sz))),(phase,'outside source road')
        for view in config['views']:
            assert view['poses'][phase][7:]==p[7:],(phase,'view changed car pose')
    for f in config['faces'][:config['ground_face_count']]:
        poly=[config['vertices'][i] for i in f[2:]];crosses=[]
        for j in range(4):
            a,b,c=poly[j],poly[(j+1)%4],poly[(j+2)%4]
            cross=(b[0]-a[0])*(c[2]-b[2])-(b[2]-a[2])*(c[0]-b[0]);crosses.append(cross)
        assert all(x>=0 for x in crosses) or all(x<=0 for x in crosses),('concave road quad',f)
    report={'status':'pass','source_world_size':640,'source_road_bounds':source.getbbox(),'mesh_road_bounds':mesh.getbbox(),
            'source_road_pixels':source_count,'road_footprint_iou':iou,
            'centerline_max_error_source_px':config['course']['centerline_max_error_source_px'],
            'route_max_error_source_px':max(deviations),'route_poses':64,'all_poses_on_asphalt':True,
            'cross_sections':len(rings[0]),'ground_quads':config['ground_face_count'],'vertices':len(config['vertices']),
            'source_revision':data['source_revision'],'source_files':data['source_files']}
    # Overlay: source road gray, mesh boundary white, common auto route cyan.
    image=Image.new('RGB',(640,640),(12,80,12));image.paste((90,90,90),mask=source);d=ImageDraw.Draw(image)
    for ring in [rings[0],rings[3]]:
        xy=coords(ring);d.line(xy+xy[:1],fill=(255,255,255),width=2)
    d.line([tuple(p) for p in points]+[tuple(points[0])],fill=(72,205,222),width=2)
    d.ellipse((562,386,574,398),fill=(255,100,100))
    tex=Image.new('RGB',(64,64));tex.putdata([tuple(config['palette'][c]) for c in config['texture']]);tex=tex.resize((640,640),Image.Resampling.NEAREST)
    combined=Image.new('RGB',(1280,640));combined.paste(image);combined.paste(tex,(640,0));combined.save(directory/'course_overview.png')
    (directory/'course_validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report));return report

if __name__=='__main__':verify(ROOT/'build/ground/v002')
