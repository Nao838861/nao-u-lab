import React from 'react';
import {Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FPS, SceneTitle, Tag, cueEnd, cueOf, useIn} from './common';
import {Big, Box2, Card, HArrow, MONO, Nes, Txt, ramp} from './parts';

const K = (id: string) => (i: number) => cueOf(id, i);

// ---------------- F1 メモリマップとゴースト ----------------
const WRAM: [string, string][] = [['ゲーム', C.amber], ['型', C.cyan], ['型', C.cyan], ['型', C.cyan], ['型', C.cyan], ['型', C.cyan], ['型', C.cyan], ['—', '#2c3b63'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['—', '#2c3b63'], ['ゲーム', C.amber]];
export const F1: React.FC = () => {
  const f = useCurrentFrame(), k = K('F1');
  const c = [0, 1, 2, 3].map(k);
  return (
    <Bg>
      <SceneTitle label="4　メモリマップとゴースト" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[0] + 60, c[0] + 70))} size={84}>第4章　メモリと開発環境</Big>
      <div style={{opacity: ramp(f, c[0] + 66, c[0] + 80)}}>
        {[['PRG 1MB', '辞書61・ネームテーブル18・準備処理25・物理/ゲーム/音/固定など', C.amber], ['CHR 1MB', '256KB × 4組（向きの下位2bitで切替）', C.violet], ['WRAM 128KB', '8KB × 16バンク（バッテリー付き）', C.cyan]].map(([t, s, col], i) => (
          <Card key={t} x={80} y={150 + i * 120} w={900} color={col}><div style={{fontSize: 32, fontWeight: 900}}>{t}<span style={{fontSize: 24, color: C.sub, marginLeft: 16}}>{s}</span></div></Card>
        ))}
      </div>
      <div style={{position: 'absolute', left: 1040, top: 160, display: 'grid', gridTemplateColumns: 'repeat(4, 196px)', gap: 8, opacity: ramp(f, c[1], c[1] + 14)}}>
        {WRAM.map(([t, col], i) => <div key={i} style={{height: 74, borderRadius: 8, border: `3px solid ${col}`, background: `${col}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800}}>
          <span style={{fontFamily: MONO, color: C.sub, fontSize: 18}}>{`bank${i}`}</span><span style={{color: col}}>{t}</span></div>)}
      </div>
      <Card x={80} y={540} w={900} color="#ff9de1" o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 28, fontWeight: 800}}>ゴースト：保存済みベスト／記録中の候補、各3バンク</div>
      </Card>
      <div style={{position: 'absolute', left: 1040, top: 540, opacity: ramp(f, c[3], c[3] + 14)}}>
        <div style={{display: 'flex'}}>
          {[['Δx', 5, C.cyan], ['Δy', 5, C.green], ['向き', 6, C.amber]].map(([t, n, col]) => <div key={t as string} style={{width: (n as number) * 48, height: 70, border: `3px solid ${col}`, marginRight: -3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: col as string}}>{`${t} ${n}bit`}</div>)}
        </div>
        <Txt x={0} y={86} size={28}>1コマ＝2バイト × 10,800コマ（180秒）</Txt>
      </div>
    </Bg>
  );
};

// ---------------- F2 AIが確かめる仕組み ----------------
export const F2: React.FC = () => {
  const f = useCurrentFrame(), k = K('F2');
  const c = [0, 1, 2].map(k);
  return (
    <Bg>
      <SceneTitle label="4　AIが自分で確かめる仕組み" />
      {[['Mesen（画面なし）＋ Lua', '毎フレームのサイクル・画素を計測'], ['6502 エミュレーター（py65）', 'same-PRE の同値照合'], ['全窓スキャン', '2,437,120通りの転送サイクル'], ['Web版と同じコア', 'リプレイを入力だけから再現（この動画の走行映像）']].map(([t, s], i) => (
        <Box2 key={t} x={80 + (i % 2) * 900} y={170 + Math.floor(i / 2) * 230} w={860} h={190} color={[C.cyan, C.amber, C.violet, C.green][i]} title={t} sub={s} fs={34} o={ramp(f, c[i < 2 ? 1 : 2] + (i % 2) * 15, c[i < 2 ? 1 : 2] + (i % 2) * 15 + 14)} />
      ))}
      <Txt x={80} y={700} size={34} o={useIn(c[0])}>人が遊んで見つけた問題を、AIが網羅的な検査で確かめる</Txt>
    </Bg>
  );
};

// ---------------- F3 Webカメラで実機を見る ----------------
// Webカメラで撮った実機（N8 Pro）のテレビ画面。メニュー→起動→固定入力で走行→GAME OVER→メニュー復帰（public/video/webcam.mp4、README の再生成手順）。
export const F3: React.FC = () => {
  const f = useCurrentFrame(), k = K('F3');
  const c = [0, 1, 2].map(k);
  const steps = ['Mesenで入力を確認', 'USBでN8 ProへROMを送って起動', 'ROMの固定入力で走行', '画面に診断値を表示', 'Webカメラで撮影・保存', 'メニュー復帰を確認'];
  return (
    <Bg>
      <SceneTitle label="4　Webカメラで実機を見る" />
      {steps.map((t, i) => (
        <Box2 key={t} x={80} y={140 + i * 96} w={740} h={80} color={C.cyan} title={`${i + 1}. ${t}`} fs={28} o={ramp(f, c[0] + i * 12, c[0] + i * 12 + 12)} />
      ))}
      <div style={{position: 'absolute', left: 1000, top: 130, width: 760, height: 570, borderRadius: 12, overflow: 'hidden', background: '#000', opacity: ramp(f, c[0] + 20, c[0] + 36), boxShadow: '0 12px 44px rgba(0,0,0,.6)'}}>
        <Sequence from={c[0] + 20}><OffthreadVideo src={staticFile('video/webcam.mp4')} muted style={{width: 760, height: 570}} /></Sequence>
      </div>
      <Txt x={1000} y={705} size={22} color={C.sub} w={760}>Webカメラで撮った実機の画面（メニュー → 起動 → 固定入力で走行 → GAME OVER → メニューへ）</Txt>
      <Card x={80} y={730} w={740} color={C.amber} o={ramp(f, c[1], c[1] + 14)}>
        <div style={{fontSize: 26, fontWeight: 800, lineHeight: 1.6}}>AIがリアルタイムに操作したのではない<br />リセット・カメラの向き・操作感の確認は人</div>
      </Card>
      <div style={{position: 'absolute', left: 1000, top: 770, width: 860, display: 'flex', flexWrap: 'wrap', gap: 14, opacity: ramp(f, c[2], c[2] + 14)}}>
        {['エミュレーターで動く', '実機で絵が出る', 'メニューへ戻る'].map((t) => <Tag key={t} color={C.green}>{`✓ ${t}`}</Tag>)}
        <Tag color={C.sub}>＝それぞれ別の合格条件</Tag>
      </div>
    </Bg>
  );
};

// ---------------- Z9 おわりに ----------------
export const Z9: React.FC = () => (
  <Bg>
    <Nes src="drift1" from={1500} x={580} y={60} w={760} volume={0.5} />
    <Txt x={0} y={800} w={1920} align="center" size={34} color={C.sub}>走行：keitoushi（Web版ランキング DRIFT 1位）</Txt>
  </Bg>
);
