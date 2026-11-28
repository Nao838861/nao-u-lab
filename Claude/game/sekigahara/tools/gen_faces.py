"""武将の肖像をローカルの SD1.5 系写実モデル（Realistic Vision V5.1）で生成する（RTX 4070 Ti 想定）。
モデル: ~/.cache/sd_models/rv51_fp16.safetensors と ~/.cache/sd_models/vae/（stabilityai/sd-vae-ft-mse）。
使い方: python tools/gen_faces.py [--ids ishida,ieyasu] [--n 4] [--seed 0]
出力: tools/_faces_raw/<id>_<k>.png（候補。git 管理外）
選んだ候補は tools/pick_faces.py で img/faces/<id>.jpg に縮小して置く。
各武将の年齢は 1600 年時点の数え年の概数。容姿は伝来の肖像画・逸話に寄せた想像図であり、史料ではない。"""
import torch  # diffusers より先に読む（Windows で DLL 初期化に失敗するため）
import argparse, os
from diffusers import StableDiffusionPipeline, AutoencoderKL, DPMSolverMultistepScheduler

R = os.path.join(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(R, '_faces_raw')

# SD1.5 はプロンプト 77 トークンまでしか効かないので、武将ごとの外見を先頭に置く
STYLE = ('Japanese samurai lord, Sengoku period, head and shoulders portrait, '
         'semi-realistic digital oil painting, detailed face, dramatic lighting, dark background')
NEG = ('anime, manga, cartoon, chibi, 3d render, photo, text, letters, watermark, signature, frame, '
       'western knight, chinese, modern clothes, gun, multiple people, deformed face, extra fingers, blurry')

# id: (年齢, 外見)
P = {
  'ieyasu':     (58, 'plump round-faced older man, heavy jowls, thin mustache, calm shrewd eyes, black lacquered armor with gold trim, golden fan'),
  'ishida':     (41, 'lean intelligent man with a sharp narrow face, high cheekbones, stern focused eyes, short mustache, dark armor'),
  'sakon':      (61, 'grizzled veteran general with a fierce weathered face, grey beard, scar, battle-hardened, dark red armor'),
  'gamo':       (50, 'stern middle-aged samurai, tanned face, short beard, plain brown armor'),
  'shimazu':    (66, 'old fierce warrior with a white beard and white eyebrows, deeply lined face, indomitable glare, black armor'),
  'toyohisa':   (31, 'young bold samurai, strong jaw, determined eyes, black armor with a cross-in-circle crest'),
  'konishi':    (43, 'refined merchant-born general, thin mustache, intelligent gentle face, small silver christian cross pendant, ornate armor'),
  'ukita':      (29, 'handsome young lord with noble features, elegant, proud expression, purple and gold ornate armor'),
  'otani':      (42, 'samurai whose face is covered by a white cloth hood leaving only the eyes visible, sick but resolute, seated in a palanquin, white robe over armor'),
  'otani2':     (25, 'young samurai, earnest face, blue-laced armor'),
  'hiratsuka':  (50, 'loyal middle-aged samurai, firm expression, short beard, blue-laced armor'),
  'wakisaka':   (47, 'middle-aged general with a cunning wary expression, mustache, olive green armor'),
  'kutsuki':    (52, 'middle-aged lord, cautious expression, thin beard, plain armor'),
  'ogawa':      (52, 'middle-aged lord with an uneasy expression, beard, plain armor'),
  'akaza':      (40, 'samurai with a nervous expression, mustache, plain armor'),
  'kobayakawa': (19, 'very young pale lord barely out of his teens, soft face, anxious hesitant eyes, orange and red ornate armor'),
  'mori':       (22, 'young lord with a serious face, dark blue armor'),
  'kikkawa':    (40, 'calculating middle-aged general, narrow eyes, thin mustache, grey blue armor'),
  'ankokuji':   (62, 'elderly buddhist monk with a shaved head, wearing monk robes over light armor, shrewd face'),
  'natsuka':    (40, 'bureaucratic official with a careful face, thin mustache, simple armor'),
  'chosokabe':  (26, 'young lord from Tosa, brooding intense eyes, dark green armor'),
  'fukushima':  (40, 'fierce hot-tempered warrior with a thick beard and bulging eyes, broad face, teal armor'),
  'ii':         (40, 'handsome stern general, piercing eyes, crimson red lacquered armor, red helmet with tall golden horns'),
  'tadayoshi':  (21, 'young noble lord, clean-shaven, earnest face, white and silver armor'),
  'honda':      (53, 'imposing legendary warrior with a weathered face and short beard, black armor, black helmet with large deer antlers'),
  'kuroda':     (33, 'clever confident general, mustache, black armor, tall flat helmet shaped like a cliff'),
  'takenaka':   (28, 'young scholarly samurai, calm face, brown armor'),
  'hosokawa':   (38, 'cultured but severe general, sharp face, thin mustache, grey armor, helmet with long pheasant tail plume'),
  'kato':       (38, 'tough seasoned general, square jaw, beard, steel blue armor'),
  'tanaka':     (53, 'sturdy middle-aged general, kind but firm face, beard, tan armor'),
  'tsutsui':    (39, 'middle-aged lord, composed expression, lavender laced armor'),
  'ikoma':      (46, 'middle-aged lord, steady expression, mustache, green laced armor'),
  'kanamori':   (77, 'very old wiry veteran with long white beard, sharp eyes, old fashioned armor'),
  'furuta':     (40, 'middle-aged samurai, mustache, plain reddish armor'),
  'oda':        (54, 'refined older tea master in armor, gentle cultured face, thin beard'),
  'todo':       (45, 'very tall broad-shouldered general, rugged face, scars, dark blue armor'),
  'kyogoku':    (29, 'young noble lord, aristocratic face, light blue armor'),
  'terazawa':   (38, 'middle-aged lord, shrewd face, mustache, plain armor'),
  'ikeda':      (37, 'strong handsome general, confident, orange laced armor'),
  'asano':      (25, 'young energetic lord, bold face, green laced armor'),
  'yamauchi':   (56, 'kindly older samurai, gentle face, grey mustache, lavender armor'),
  'arima':      (32, 'samurai lord, calm face, beige armor'),
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ids', default='')
    ap.add_argument('--n', type=int, default=4)
    ap.add_argument('--seed', type=int, default=0)
    ap.add_argument('--steps', type=int, default=30)
    ap.add_argument('--out', default=OUT)
    a = ap.parse_args()
    out = a.out
    ids = a.ids.split('|') if '|' in a.ids else (a.ids.split(',') if a.ids else list(P))
    os.makedirs(out, exist_ok=True)
    M = os.path.expanduser('~/.cache/sd_models')
    vae = AutoencoderKL.from_pretrained(os.path.join(M, 'vae'), torch_dtype=torch.float16)  # sd-vae-ft-mse
    pipe = StableDiffusionPipeline.from_single_file(os.path.join(M, 'rv51_fp16.safetensors'),
        config='SG161222/Realistic_Vision_V5.1_noVAE', vae=vae, torch_dtype=torch.float16, safety_checker=None)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True)
    pipe = pipe.to('cuda')
    pipe.set_progress_bar_config(disable=True)
    for uid in ids:
        age, look = P[uid]
        prompt = f'{look}, {age} years old, {STYLE}'
        for k in range(a.n):
            g = torch.Generator('cuda').manual_seed(a.seed * 1000 + k)
            img = pipe(prompt, negative_prompt=NEG, num_inference_steps=a.steps, guidance_scale=6.0,
                       width=512, height=640, generator=g).images[0]
            img.save(os.path.join(out, f'{uid}_{a.seed * 1000 + k}.png'))
        print(uid, flush=True)

if __name__ == '__main__':
    main()
