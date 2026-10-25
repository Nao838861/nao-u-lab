import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, SceneTitle, Tag, cueOf, useIn} from './common';
import {Big, Box2, Card, Code, G, HArrow, MONO, Nes, Txt, at, fmt, idx, ramp} from './parts';
import probe from './data/oam_probe.json';

const K = (id: string) => (i: number) => cueOf(id, i);
const show = (f: number, a: number, b?: number) => ramp(f, a - 4, a + 12) * (b === undefined ? 1 : 1 - ramp(f, b - 10, b));

// ---------------- C5 実機でだけ欠けた黒帯 ----------------
export const C5: React.FC = () => {
  const f = useCurrentFrame(), k = K('C5');
  const c = [0, 1, 2, 3].map(k);
  const exps = ['白帯に差し替え', '黒パレットで表示', 'OAMの位置・順番', 'DMAの時期', '停止を216ドット遅らせる'];
  return (
    <Bg>
      <SceneTitle label="2　実機でだけ欠けた黒帯" color={C.red} />
      <div style={{position: 'absolute', left: 80, top: 150, opacity: useIn(c[0])}}>
        <Img src={staticFile('gen/central-stop-phase-camera.png')} style={{width: 720, height: 690, imageRendering: 'auto', borderRadius: 10}} />
      </div>
      <Txt x={80} y={850} size={24} color={C.sub} o={useIn(c[0])}>実機のWebカメラ録画からの切り抜き（左：早い停止、右：スプライト取得後の停止）</Txt>
      <div style={{position: 'absolute', left: 880, top: 160, display: 'flex', flexDirection: 'column', gap: 14}}>
        {exps.map((t, i) => <div key={t} style={{opacity: ramp(f, c[1] + i * 18, c[1] + i * 18 + 12)}}><Tag color={i === 4 ? C.amber : C.sub}>{`${i + 1}. ${t}`}</Tag></div>)}
      </div>
      <Card x={880} y={500} w={980} color={C.amber} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{display: 'flex', gap: 30, fontSize: 30, fontWeight: 800}}>
          <div><span style={{color: C.red}}>早い停止</span>：2回とも再発</div>
          <div><span style={{color: C.green}}>取得後に停止</span>：2回・計1,652時点で再発なし</div>
        </div>
      </Card>
      <Card x={880} y={660} w={980} color={C.line} o={ramp(f, c[3], c[3] + 14)}>
        <div style={{fontSize: 28, fontWeight: 800}}>停止の位相が引き金。回路内の原因（OAM破損・取得状態など）は未確定</div>
      </Card>
    </Bg>
  );
};

// ---------------- C6 スプライトの割り当て ----------------
type OP = {oam: number[][]};
const P600 = (probe as Record<string, OP>)['600'];
const ROLE = (s: number): [string, string] => {
  if ([0, 7, 14, 18, 20, 21, 22, 26, 28, 30, 32, 35].includes(s)) return ['黒帯', '#ff5b6e'];
  if (s >= 48 && s <= 53) return ['自車', C.amber];
  if (s >= 40 && s <= 45) return ['CPU車', C.violet];
  if (s >= 56) return ['摩擦円', C.green];
  if ([15, 19, 23, 27].includes(s)) return ['円の点', C.green];
  if (s === 37 || s === 38) return ['ゴースト', '#ff9de1'];
  if (s === 4 || s === 11) return ['順位', C.cyan];
  if (s === 24) return ['地図', C.cyan];
  if (s === 34 || s === 36) return ['予約', '#5d6b8f'];
  return ['時計・表示', '#3fb5ff'];
};
export const C6: React.FC = () => {
  const f = useCurrentFrame(), k = K('C6');
  const c = [0, 1, 2].map(k);
  const dot = Math.floor(f / 6) % 15;
  return (
    <Bg>
      <SceneTitle label="2　スプライトの割り当て（OAM 64枚）" />
      <div style={{position: 'absolute', left: 80, top: 150, display: 'grid', gridTemplateColumns: 'repeat(8, 104px)', gap: 8, opacity: useIn(c[0])}}>
        {Array.from({length: 64}).map((_, s) => { const [n, col] = ROLE(s); const vis = P600.oam[s][0] < 239; return (
          <div key={s} style={{width: 104, height: 70, borderRadius: 8, border: `3px solid ${col}`, background: vis ? `${col}33` : '#131b31', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800}}>
            <span style={{fontFamily: MONO, color: C.sub}}>{s}</span><span style={{color: col}}>{n}</span>
          </div>); })}
      </div>
      <Txt x={80} y={790} size={24} color={C.sub} o={useIn(c[0])}>DRIFT 1位の走りのあるコマで OAM バッファ（$0200〜）を読んだもの。塗りつぶし＝そのコマで表示中</Txt>
      <Card x={1020} y={160} w={840} color={C.green} o={ramp(f, c[1], c[1] + 14)}>
        <div style={{fontSize: 30, fontWeight: 900}}>摩擦円の点：15種類のCHRから選ぶ</div>
        <div style={{display: 'flex', gap: 10, marginTop: 14}}>
          {Array.from({length: 15}).map((_, i) => <div key={i} style={{width: 44, height: 70, background: '#000', border: `2px solid ${i === dot ? C.amber : '#2c3b63'}`, position: 'relative'}}>
            <div style={{position: 'absolute', left: 18, top: 4 + i * 4, width: 8, height: 8, background: C.text}} /></div>)}
        </div>
        <div style={{fontSize: 24, color: C.sub, marginTop: 10}}>スプライトのYは動かさない → 他の行の「1ライン8枚」に影響しない</div>
      </Card>
      <Card x={1020} y={470} w={840} color={C.cyan} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 28, fontWeight: 800, lineHeight: 1.6}}>時計：分とコロンを1枚の8×16に、変わった行だけ書き直す<br />順位：英字2文字を8ドットに詰めて2枚</div>
      </Card>
    </Bg>
  );
};

// ---------------- C7 1フレームの流れ ----------------
export const C7: React.FC = () => {
  const f = useCurrentFrame(), k = K('C7');
  const c = [0, 1, 2, 3].map(k);
  const H = 640, Y0 = 170, px = H / 262;
  const beam = (f * 3) % 262;
  const seg = (a: number, b: number, col: string, label: string, o: number) => (
    <div style={{position: 'absolute', left: 0, top: a * px, width: 300, height: (b - a) * px, background: col, opacity: o, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#0a0f1e', borderBottom: '2px solid #0a0f1e'}}>{label}</div>
  );
  return (
    <Bg>
      <SceneTitle label="2　1フレームの流れ" />
      <div style={{position: 'absolute', left: 120, top: Y0, width: 300, height: H, opacity: useIn(c[0])}}>
        {seg(0, 32, C.amber, '強制ブランク（転送の続き）', 1)}
        {seg(32, 216, '#3b6c2c', '', 1)}
        <div style={{position: 'absolute', left: 300 * 0.53, top: 32 * px, width: 300 * 0.47, height: 184 * px, background: '#3a2a63'}} />
        <div style={{position: 'absolute', left: 10, top: 110 * px, fontSize: 22, fontWeight: 800}}>コース</div>
        <div style={{position: 'absolute', left: 170, top: 110 * px, fontSize: 22, fontWeight: 800, color: C.violet}}>縦分割</div>
        {seg(216, 240, C.amber, '強制ブランク（転送）', 1)}
        {seg(240, 262, '#5d6b8f', 'VBlank', 1)}
        <div style={{position: 'absolute', left: -20, top: beam * px, width: 340, height: 3, background: '#fff', boxShadow: '0 0 12px #fff'}} />
      </div>
      {[[32, '上部IRQ：コースの表示を開始', C.cyan, c[1]], [216, '下部IRQ：表示を止め、完成画面を採用して転送開始', C.amber, c[2]], [241, 'NMI：時計・入力・音・ゴースト点滅のみ', C.violet, c[3]]].map(([line, t, col, cue], i) => (
        <div key={i} style={{position: 'absolute', left: 440, top: Y0 + (line as number) * px - 20, opacity: ramp(f, cue as number, (cue as number) + 14), display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 60, height: 4, background: col as string}} />
          <span style={{fontSize: 30, fontWeight: 800, color: col as string}}>{`y=${line}　${t}`}</span>
        </div>
      ))}
      <Card x={440} y={720} w={1400} color={C.violet} o={ramp(f, c[3] + 40, c[3] + 54)}>
        <div style={{fontSize: 26, fontWeight: 800}}>転送中に NMI が割り込んでも、A/X/Y・描画用ゼロページ・$5114〜5116・PPUアドレスラッチを壊さずに戻る</div>
      </Card>
    </Bg>
  );
};

// ---------------- C8 結果画面 ----------------
export const C8: React.FC = () => {
  const f = useCurrentFrame(), k = K('C8');
  const c = [0, 1].map(k);
  return (
    <Bg>
      <SceneTitle label="2　結果画面も縦分割" />
      <Nes src="drift1" from={2140} x={80} y={140} w={760} />
      <Card x={900} y={160} w={940} color={C.violet} o={useIn(c[0])}>
        <div style={{fontSize: 30, fontWeight: 800, lineHeight: 1.6}}>右の128ドットを分割のBGに広げて結果を表示<br />左のコースは coarse X を0に詰め直し、fine X を0に</div>
      </Card>
      <Card x={900} y={420} w={940} color={C.red} o={ramp(f, c[1], c[1] + 14)}>
        <div style={{fontSize: 28, fontWeight: 800, lineHeight: 1.6}}>不具合：結果画面用NMIと走行用の下部IRQの処理が混ざって明滅<br /><span style={{color: C.green}}>→ 処理を分けて修正</span></div>
      </Card>
    </Bg>
  );
};

// ---------------- D1 物理の流れ ----------------
export const D1: React.FC = () => {
  const f = useCurrentFrame(), k = K('D1');
  const c = [0, 1, 2].map(k);
  const steps = [['入力', C.sub], ['4輪の前後・横の\n力の要求', C.cyan], ['摩擦円で制限', C.green], ['合力・モーメント', C.amber], ['速度・角速度を積分', C.amber], ['ばね（ピッチ・ロール）', C.violet], ['4輪の荷重', C.violet]];
  return (
    <Bg>
      <SceneTitle label="3　物理と最適化" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[1] - 10, c[1]))} size={84}>第3章　物理と最適化</Big>
      <div style={{opacity: ramp(f, c[1] - 4, c[1] + 12)}}>
        {steps.map(([t, col], i) => (
          <React.Fragment key={i}>
            <Box2 x={70 + (i % 4) * 460} y={170 + Math.floor(i / 4) * 230} w={370} h={130} color={col} title={t} fs={30} o={ramp(f, c[1] + i * 10, c[1] + i * 10 + 12)} />
            {i < steps.length - 1 && i % 4 !== 3 ? <HArrow x={445 + (i % 4) * 460} y={235 + Math.floor(i / 4) * 230} w={80} o={ramp(f, c[1] + i * 10 + 8, c[1] + i * 10 + 16)} /> : null}
          </React.Fragment>
        ))}
        <Txt x={70} y={680} size={30} color={C.violet} o={ramp(f, c[1] + 70, c[1] + 84)}>荷重は次の更新で、摩擦円の大きさになる（1コマごとにループ）</Txt>
      </div>
      <Card x={70} y={760} w={1780} color={C.green} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 34, fontWeight: 900, fontFamily: MONO}}>上限 C<sub>i</sub> ＝ μ × N<sub>i</sub>　　HUDの円 ＝ C<sub>i</sub>、点 ＝ 制限前の要求 (F<sub>x</sub>, F<sub>y</sub>)</div>
      </Card>
    </Bg>
  );
};

// ---------------- D2 荷重を決めるばね ----------------
export const D2: React.FC = () => {
  const f = useCurrentFrame(), k = K('D2');
  const c = [0, 1, 2, 3].map(k);
  const i = idx(1200, f, 2200);
  const cap = at(G.cap, i);
  return (
    <Bg>
      <SceneTitle label="3　荷重を決める2つのばね" />
      <Card x={70} y={150} w={1100} color={C.violet} o={useIn(c[0])}>
        <div style={{fontSize: 28, color: C.sub, fontWeight: 700}}>ピッチ（前後）とロール（左右）を同じ式で（F＝前後／横の力）</div>
        <div style={{fontFamily: MONO, fontSize: 38, lineHeight: 1.7, marginTop: 10, opacity: ramp(f, c[1], c[1] + 14)}}>
          T ← 表(|F|) × sign(F)<br />
          v ← v ＋ ⌊(T·256 − p) / 32⌋₀ − ⌊v / 4⌋₀<br />
          p ← p ＋ v　　（|p| を上限で止め、静止付近は0へ）
        </div>
      </Card>
      <Card x={70} y={520} w={1100} color={C.amber} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 28, fontWeight: 800}}>⌊ ⌋₀ ＝ 0方向への切り捨て</div>
        <div style={{fontFamily: MONO, fontSize: 28, marginTop: 8, color: C.amber}}>負の数は +31（/32）、+3（/4）してから算術シフト → 元の丸めを1ビットも変えない</div>
      </Card>
      <Card x={70} y={700} w={1100} color={C.green} o={ramp(f, c[3], c[3] + 14)}>
        <div style={{fontFamily: MONO, fontSize: 32, fontWeight: 800}}>(N<sub>左前</sub>, N<sub>右前</sub>, N<sub>左後</sub>, N<sub>右後</sub>) ＝ 表32×32×4[⌊p<sub>pitch</sub>/512⌋₀][⌊p<sub>roll</sub>/512⌋₀]</div>
      </Card>
      <div style={{opacity: ramp(f, c[3], c[3] + 14)}}>
        <Nes src="grip1" from={1200} loop={2200} x={1230} y={150} w={620} />
        <div style={{position: 'absolute', left: 1300, top: 760, display: 'grid', gridTemplateColumns: 'repeat(2, 230px)', gap: 12}}>
          {['左前', '右前', '左後', '右後'].map((n, w) => <div key={n} style={{fontSize: 30, fontWeight: 900, fontFamily: MONO}}>{`${n} N=`}<span style={{color: C.amber}}>{cap[w]}</span></div>)}
        </div>
      </div>
    </Bg>
  );
};

// ---------------- D3 タイヤの力と乗算器 ----------------
export const D3: React.FC = () => {
  const f = useCurrentFrame(), k = K('D3');
  const c = [0, 1, 2, 3].map(k);
  return (
    <Bg>
      <SceneTitle label="3　タイヤの力とMMC5の乗算器" />
      <Code x={70} y={150} w={960} size={28} o={useIn(c[0])} color={C.cyan} title="タイヤの力（実際のコードの冒頭）"
        lines={[{s: 'STA $5205      ; 滑りの索引 0〜127', c: C.amber}, {s: 'LDA $7D        ; ゲイン'}, {s: 'STA $5206      ; → すぐに 16bit の積', c: C.amber},
          {s: 'LDX $5205      ; 積の下位', c: C.amber}, {s: 'LDA $BB00,X    ; 表で非線形カーブへ'}, {s: 'AND #15 / STA $92'}, {s: 'LDX $5206      ; 積の上位', c: C.amber}, {s: 'LDA $BA00,X / ORA $92'}, {s: '…（127で飽和）'}]} />
      <Card x={1080} y={160} w={780} color={C.amber} o={ramp(f, c[1], c[1] + 14)}>
        <div style={{fontSize: 30, fontWeight: 900}}>6502 には掛け算命令がない</div>
        <div style={{fontSize: 26, marginTop: 8, fontFamily: MONO}}>$5205 × $5206 → 16bit（MMC5）</div>
      </Card>
      <Card x={1080} y={330} w={780} color={C.cyan} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 30, fontWeight: 900}}>曲がる計算のコードだけで</div>
        <div style={{fontSize: 44, fontWeight: 900, color: C.cyan}}>乗算器の読み書き 51か所</div>
      </Card>
      <div style={{position: 'absolute', left: 70, top: 700, display: 'flex', flexWrap: 'wrap', gap: 12, width: 1790, opacity: ramp(f, c[3], c[3] + 14)}}>
        <Tag color={C.amber}>DRIFTだけの補正：</Tag>
        {['後輪のグリップ低下', '追加の舵角', 'カウンター保持', 'ブースト', 'アクセルOFF時の回転補助'].map((t) => <Tag key={t} color={C.sub}>{t}</Tag>)}
        <Tag color={C.green}>GRIP：すべて外し、計算だけ</Tag>
      </div>
    </Bg>
  );
};

// ---------------- D4 物理の重さ ----------------
export const D4: React.FC = () => {
  const f = useCurrentFrame(), k = K('D4');
  const c = [0, 1].map(k);
  const S = 0.17;
  return (
    <Bg>
      <SceneTitle label="3　物理の重さ" />
      <Txt x={80} y={160} size={30} color={C.sub} o={useIn(c[0])}>ある重い場面の物理 9,602サイクル（開発途中の計測）の内訳</Txt>
      <div style={{position: 'absolute', left: 80, top: 220, display: 'flex', height: 90, opacity: useIn(c[0])}}>
        {[[2548, '4輪の評価', C.cyan], [1766, '曲がる計算の補正', C.amber], [1429, 'エネルギー補正', C.violet], [3859, 'その他', '#5d6b8f']].map(([v, t, col], i) => (
          <div key={i} style={{width: (v as number) * S * ramp(f, c[0] + i * 10, c[0] + i * 10 + 20), background: col as string, borderRight: '3px solid #0a0f1e', fontSize: 24, fontWeight: 900, color: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', whiteSpace: 'nowrap'}}>{`${t} ${fmt(v as number)}`}</div>
        ))}
      </div>
      <div style={{opacity: ramp(f, c[1], c[1] + 14)}}>
        <Txt x={80} y={420} size={30} color={C.sub}>開発途中のメイン処理（画面更新に間に合わせる上限との比較）</Txt>
        <div style={{position: 'absolute', left: 80, top: 480, width: 24959 * 0.065, height: 90, background: C.red, borderRadius: 10}} />
        <div style={{position: 'absolute', left: 80 + 20843 * 0.065, top: 460, width: 6, height: 130, background: C.amber}} />
        <Txt x={80} y={600} size={46}>{'24,959 / 上限 20,843　'}<span style={{color: C.red}}>約4,100はみ出し</span></Txt>
      </div>
    </Bg>
  );
};

// ---------------- D5 1ビットも変えない最適化 ----------------
export const D5: React.FC = () => {
  const f = useCurrentFrame(), k = K('D5');
  const c = [0, 1, 2, 3, 4].map(k);
  return (
    <Bg>
      <SceneTitle label="3　1ビットも変えない最適化" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[1] - 10, c[1]))} size={76} color={C.amber}>結果を1ビットも変えない</Big>
      <div style={{opacity: show(f, c[1], c[3])}}>
        <Box2 x={80} y={170} w={340} h={130} color={C.sub} title="同じ直前状態" sub="（保存した実フレーム）" />
        <HArrow x={430} y={200} w={160} color={C.sub} />
        <HArrow x={430} y={270} w={160} color={C.sub} />
        <Box2 x={600} y={150} w={300} h={80} color={C.red} title="旧コード" fs={28} />
        <Box2 x={600} y={250} w={300} h={80} color={C.green} title="新コード" fs={28} />
        <HArrow x={910} y={235} w={160} color={C.sub} />
        <Box2 x={1080} y={170} w={760} h={130} color={C.amber} title="物理の作業領域・WRAM全体・マッパー" sub="すべて一致するか（same-PRE）" />
        <Card x={80} y={400} w={880} color={C.violet} o={ramp(f, c[2], c[2] + 14)}>
          <div style={{fontSize: 28, color: C.sub, fontWeight: 700}}>例：荷重の計算</div>
          <div style={{fontSize: 44, fontWeight: 900}}>871 → <span style={{color: C.green}}>548</span> サイクル</div>
          <div style={{fontSize: 24, color: C.sub}}>ばねの割り算をバイト分解の表に、4輪の分配を32×32の表に</div>
        </Card>
        <Card x={1000} y={400} w={840} color={C.cyan} o={ramp(f, c[2] + 40, c[2] + 54)}>
          <div style={{fontSize: 28, color: C.sub, fontWeight: 700}}>後輪の正規化</div>
          <div style={{fontSize: 44, fontWeight: 900}}>入力 <span style={{color: C.cyan}}>65,536通り</span> を全数確認</div>
        </Card>
      </div>
      <div style={{opacity: ramp(f, c[3] - 4, c[3] + 12)}}>
        <div style={{position: 'absolute', left: 200, top: 170, width: 400, height: 560}}>
          <div style={{position: 'absolute', left: 120, top: 40, width: 160, height: 480, borderRadius: 50, background: '#c63b3b', border: '5px solid #fff'}} />
          {[0, 1, 2, 3].map((n) => <div key={n} style={{position: 'absolute', left: n % 2 ? 300 : 0, top: n < 2 ? 80 : 380, width: 100, height: 100, borderRadius: 50, border: `5px solid ${C.text}`}} />)}
          {[130, 430].map((y) => <div key={y} style={{position: 'absolute', left: 50, top: y, width: 300, height: 6, background: C.cyan, boxShadow: `0 0 18px ${C.cyan}`}} />)}
        </div>
        <Txt x={760} y={200} size={44} w={1080}>唯一の近似：同じ車軸の左右で接地点の速度を共有</Txt>
        <Txt x={760} y={320} size={34} color={C.sub} w={1080}>4輪それぞれの荷重・力・摩擦円・飽和は残す</Txt>
        <Txt x={760} y={400} size={48} color={C.cyan}>約1,000サイクル減</Txt>
        <Txt x={760} y={480} size={32} color={C.sub}>同じ入力での走行半径の差：最大 0.16m</Txt>
        <div style={{position: 'absolute', left: 760, top: 580, opacity: ramp(f, c[4], c[4] + 14)}}><Tag color={C.red}>撤回：GRIPの摩擦円を約1.3倍にする調整（操作感が違う）</Tag></div>
      </div>
    </Bg>
  );
};
