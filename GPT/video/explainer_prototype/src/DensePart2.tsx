import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Loop,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  LaterNarrationPreview,
  WorkflowNarrationPreview,
} from "../restored_cpu/src/ExplainerPrototype";
import manifest from "../narration/part2-cuts.json";
import alignment from "./part2Alignment.json";
import data from "./denseData.json";
import restoredManifest from '../restored_cpu/narration/later-cuts.json';

const white = "#f7f4f8",
  cyan = "#53dcff",
  gold = "#ffba57",
  green = "#75df91",
  pink = "#f062cb",
  bg = "#050507";
const Text = ({
  x,
  y,
  children,
  size = 23,
  color = white,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      fontSize: size,
      color,
      lineHeight: 1.4,
      whiteSpace: "pre-line",
    }}
  >
    {children}
  </div>
);
const Box = ({
  x,
  y,
  w,
  h,
  children,
  color = cyan,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  children?: React.ReactNode;
  color?: string;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      border: `1px solid ${color}70`,
      background: "#111017",
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const oldCuts=restoredManifest.cuts.filter(c=>c.id!=='C17');
const oldStart=oldCuts[0].startFrame;
const oldIntroFrames=oldCuts.slice(0,2).reduce((n,c)=>n+c.durationFrames,0);
const oldWorkFrames=oldCuts.slice(2).reduce((n,c)=>n+c.durationFrames,0);
export const restoredFrames = oldIntroFrames+oldWorkFrames;
const titleFrames = manifest.cuts[0].durationFrames;
export const denseDuration =
  manifest.cuts.reduce((a, c) => a + c.durationFrames, 0) + restoredFrames;
export const denseChapters = [
  { id: "title", title: "タイトル", start: 0, duration: titleFrames },
  {
    id: "old18",
    title: "30fpsのフレームワーク",
    start: titleFrames,
    duration: 199,
  },
  {
    id: "old19",
    title: "2フレームへの処理配分",
    start: titleFrames + 199,
    duration: 1060,
  },
  ...[765, 809, 686, 1102].map((duration, i) => ({
    id: `old${20 + i}`,
    title: [
      "ゲームロジック",
      "3D座標変換",
      "CとAIによるアセンブラ化",
      "8bitと16bit",
    ][i],
    start: titleFrames + 1259 + [0, 765, 1574, 2260][i],
    duration,
  })),
  ...manifest.cuts.slice(1).map((c) => ({
    id: c.id,
    title: c.title,
    start: c.startFrame + restoredFrames,
    duration: c.durationFrames,
  })),
];

function Beat({ cut }: { cut: (typeof manifest.cuts)[number] }) {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = f / fps;
  const times = (alignment as Record<string, { starts: number[] }>)[cut.id]
    ?.starts ?? [0];
  let b = 0;
  times.forEach((s, i) => {
    if (t >= s) b = i;
  });
  const local = t - (times[b] ?? 0);
  const ending = cut.sourceCut === "C18" && b === 2;
  let body: React.ReactNode;
  if (cut.sourceCut === "C01")
    body = (
      <>
        <GameVideo />
        <AbsoluteFill
          style={{ background: "linear-gradient(0deg,#050507f5,transparent)" }}
        />
        <Text x={65} y={350} size={42}>
          ファミコンでスペースハリアーを動かすには？
        </Text>
        <Text x={65} y={425} size={34} color={cyan}>
          その2：CPUの最適化
        </Text>
      </>
    );
  else if (cut.sourceCut === "C30") body = <SortScene b={b} local={local} />;
  else if (cut.sourceCut === "C31") body = <EnemyScene b={b} local={local} />;
  else if (cut.sourceCut === "C32") body = <RectangleScene t={t} />;
  else if (cut.sourceCut === "C33")
    body = <CollisionScene b={b} local={local} />;
  else if (cut.sourceCut === "C34")
    body = <AuthoringScene b={b} local={local} />;
  else
    body = ending ? (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontSize: 44 }}>ご視聴ありがとうございました</div>
        <div style={{ fontSize: 25, color: cyan, marginTop: 25 }}>
          その2：CPUの最適化
        </div>
      </AbsoluteFill>
    ) : (
      <>
        <GameVideo />
        <AbsoluteFill style={{ background: "#050507b0" }} />
        <Text x={65} y={250} size={36}>
          動き・大きさ・判定を表から取り出す
        </Text>
        <Text x={65} y={355} size={36} color={cyan}>
          奥行きで、順序と相手を決める
        </Text>
        {b >= 1 && (
          <Text x={65} y={470} size={30} color={gold}>
            制作と検証をAIで支える
          </Text>
        )}
      </>
    );
  return (
    <AbsoluteFill
      style={{
        background: bg,
        color: white,
        fontFamily: '"Yu Gothic UI",sans-serif',
      }}
    >
      {body}
      {cut.sourceCut !== "C01" && !ending && (
        <>
          <Text x={42} y={24} size={34}>
            {cut.title}
          </Text>
          <div
            style={{
              position: "absolute",
              left: 42,
              right: 42,
              top: 87,
              height: 2,
              background: "#44404b",
            }}
          />
        </>
      )}
      <Audio
        src={staticFile(`${manifest.outputDirectory}/${cut.id}.wav`)}
        volume={0.95}
      />
    </AbsoluteFill>
  );
}
const GameVideo = () => {
  const { fps } = useVideoConfig();
  return (
    <Loop durationInFrames={18 * fps}>
      <OffthreadVideo
        muted
        src={staticFile("game_CSCD.mp4")}
        startFrom={13 * fps}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          imageRendering: "pixelated",
        }}
      />
    </Loop>
  );
};

// 単独画像の引き伸ばしを廃止。サイズ番号に対応するPNGを原寸比で描く。
export function row(n: number) {
  const e = data.enemy,
    s = e.sz[n],
    im = data.images[s];
  return {
    n,
    cx: e.sx[n],
    bot: e.bot[n],
    z: e.wz[n],
    bucket: e.zb[n],
    s,
    im,
    left: e.sx[n] - im.halfW - 64,
    top: Math.floor((e.bot[n] - 31) / 2) - im.h + 1,
    rectLeft: e.sx[n] - im.halfW - 64,
    rectTop: (e.bot[n] - im.h * 2 - 31) / 2,
    rectW: im.halfW * 2,
    rectH: im.h,
  };
}
const NativeEnemy = ({
  n,
  scale = 4,
  originX = 0,
  originY = 0,
}: {
  n: number;
  scale?: number;
  originX?: number;
  originY?: number;
}) => {
  const r = row(n);
  return (
    <Img
      src={staticFile(r.im.file)}
      style={{
        position: "absolute",
        left: (r.left - originX) * scale,
        top: (r.top - originY) * scale,
        width: r.im.w * scale,
        height: r.im.h * scale,
        imageRendering: "pixelated",
      }}
    />
  );
};
function GamePlane({
  n,
  rectangle = false,
  rectColor = green,
}: {
  n: number;
  rectangle?: boolean;
  rectColor?: string;
}) {
  const r = row(n);
  return (
    <Box x={45} y={176} w={576} h={432}>
      <div style={{ position: "absolute", inset: 0, background: "#000" }} />
      <svg width={576} height={432} style={{ position: "absolute" }}>
        {[144, 288, 432].map((v) => (
          <React.Fragment key={v}>
            <line x1={0} x2={576} y1={v} y2={v} stroke="#16141b" />
            <line x1={v} x2={v} y1={0} y2={432} stroke="#16141b" />
          </React.Fragment>
        ))}
      </svg>
      <NativeEnemy n={n} scale={4.5} />
      {rectangle && (
        <div
          style={{
            position: "absolute",
            left: r.rectLeft * 4.5,
            top: r.rectTop * 4.5,
            width: r.rectW * 4.5,
            height: r.rectH * 4.5,
            border: `2px solid ${rectColor}`,
            boxSizing: "border-box",
          }}
        />
      )}
    </Box>
  );
}
const RowTable = ({
  n,
  x = 670,
  y = 174,
}: {
  n: number;
  x?: number;
  y?: number;
}) => (
  <>
    <Box x={x} y={y} w={565} h={216}>
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: 12,
          display: "grid",
          gridTemplateColumns: "80px 80px 95px 90px 85px 85px",
          fontSize: 20,
          color: cyan,
        }}
      >
        {["frame", "X", "下端Y", "サイズ", "Z※", "バケツ"].map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      {[-1, 0, 1].map((delta, i) => {
        const a = row(Math.max(0, Math.min(122, n + delta)));
        return (
          <div
            key={delta}
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              top: 57 + i * 49,
              height: 43,
              background: delta === 0 ? "#393043" : "transparent",
              fontFamily: "monospace",
              fontSize: 22,
              paddingLeft: 4,
              display: "grid",
              gridTemplateColumns: "80px 80px 95px 90px 85px 85px",
              alignItems: "center",
              color: delta === 0 ? gold : "#958c9c",
            }}
          >
            {[a.n, a.cx, a.bot, a.s, a.z, a.bucket].map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
        );
      })}
    </Box>
    <Text x={x + 10} y={y + 219} size={16} color="#b8aebe">
      ※敵のZは4倍精度：{row(n).z} → 背景の単位では {row(n).z / 4}
    </Text>
  </>
);
function EnemyScene({ b, local }: { b: number; local: number }) {
  const n =
    b === 0
      ? Math.min(50, 10 + Math.floor(local * 4))
      : b === 1
        ? Math.min(113, 76 + Math.floor(local * 4))
        : b === 2
          ? Math.min(113, 94 + Math.floor(local * 1.5))
          : Math.floor(local * 30) % 123;
  const r = row(n);
  return (
    <>
      <Text x={45} y={122} color={gold}>
        {b === 3
          ? "ゲームと同じ30回／秒"
          : b === 2
            ? "1フレームずつ確認"
            : b === 0
              ? "横移動の区間をスロー確認"
              : "近づく区間をスロー確認"}
        　f = {n}
      </Text>
      <GamePlane n={n} />
      <RowTable n={n} />
      <Box x={670} y={416} w={565} h={191}>
        <Text x={18} y={12} color={cyan}>
          サイズ {r.s} → Em0_{String(r.s).padStart(2, "0")}.png
        </Text>
        <Img
          src={staticFile(r.im.file)}
          style={{
            position: "absolute",
            left: 26,
            top: 69,
            width: r.im.w * 3,
            height: r.im.h * 3,
            imageRendering: "pixelated",
          }}
        />
        <Text x={222} y={76} size={22}>
          {r.im.w} × {r.im.h} 画素{`\n`}同じ画像を表示側へ
        </Text>
      </Box>
      <Text x={45} y={620} size={18} color="#b8aebe">
        128×96表示領域を同じ倍率で拡大。実データ／基準カメラ。画面外はクリップ。
      </Text>
    </>
  );
}
function RectangleScene({ t }: { t: number }) {
  const n = Math.min(113, 82 + Math.floor(t * 1.5)),
    r = row(n);
  return (
    <>
      <Text x={45} y={122} color={gold}>
        フレーム {n}　敵と判定矩形を同時に更新
      </Text>
      <GamePlane n={n} rectangle />
      <RowTable n={n} />
      <Box x={670} y={416} w={565} h={195} color={green}>
        <Text x={18} y={10} size={21} color={green}>
          サイズ {r.s} → 半幅 {r.im.halfW} ／ 高さ {r.im.h}
        </Text>
        <Text x={18} y={51} size={22}>
          左右：{r.cx} ± {r.im.halfW} → {r.cx - r.im.halfW}〜{r.cx + r.im.halfW}
          {`\n`}上下：{r.bot} − {r.im.h}×2 〜 {r.bot}
          {`\n`}　　　　{r.bot - r.im.h * 2}〜{r.bot}（Yは倍精度）
        </Text>
      </Box>
      <Text x={45} y={620} size={18} color={green}>
        各フレームの座標・サイズ ＋ サイズ別の幅・高さ → このフレームの矩形
      </Text>
    </>
  );
}
const crops = data.sortScreenshot.objects;
function Crop({
  index,
  x,
  y,
  scale,
}: {
  index: number;
  x: number;
  y: number;
  scale: number;
}) {
  const o = crops[index];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: o.w * scale,
        height: o.h * scale,
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile(data.sortScreenshot.file)}
        style={{
          position: "absolute",
          width: 1024 * scale,
          height: 960 * scale,
          left: -o.x * scale,
          top: -o.y * scale,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
function SortScene({ b, local }: { b: number; local: number }) {
  const stage = b < 2 ? 0 : b === 2 ? 1 : 2;
  const scan = b >= 4 ? 7 : b === 3 ? Math.min(7, Math.floor(local / 0.8)) : 0;
  return (
    <>
      <Text x={45} y={110} size={19} color={gold}>
        元映像の一画面。Z=21・37は説明用に設定（実測値ではありません）
      </Text>
      <Box x={45} y={165} w={440} h={413}>
        <Img
          src={staticFile(data.sortScreenshot.file)}
          style={{ width: 440, height: 412.5, imageRendering: "pixelated" }}
        />
        {crops.map((o, i) => (
          <div
            key={o.id}
            style={{
              position: "absolute",
              left: (o.x * 440) / 1024,
              top: (o.y * 440) / 1024,
              width: (o.w * 440) / 1024,
              height: (o.h * 440) / 1024,
              border: `2px solid ${i ? cyan : gold}`,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -26,
                left: 0,
                color: i ? cyan : gold,
                fontSize: 21,
              }}
            >
              {o.id}
            </span>
          </div>
        ))}
      </Box>
      <Text x={515} y={142} size={19} color={cyan}>
        奥 ↑　8段階ずつ
      </Text>
      {Array.from({ length: 8 }, (_, i) => {
        const bucket = 7 - i,
          chosen = stage === 2 && i === scan;
        return (
          <Box
            key={i}
            x={515}
            y={178 + i * 51}
            w={310}
            h={46}
            color={chosen ? gold : cyan}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: chosen ? "#5a3e24" : "transparent",
              }}
            />
            <Text
              x={8}
              y={9}
              size={18}
              color={bucket === 7 ? "#827b8c" : white}
            >
              {bucket === 7
                ? "7：予備"
                : `${bucket}：Z ${bucket * 8}〜${bucket * 8 + 7}`}
            </Text>
            {[2, 4].includes(bucket) && stage >= 1 ? (
              <Text x={182} y={6} size={22} color={bucket === 2 ? gold : cyan}>
                {bucket === 2 ? "A：21" : "B：37"}
              </Text>
            ) : (
              <Text x={238} y={11} size={17} color="#827b8c">
                空
              </Text>
            )}
          </Box>
        );
      })}
      <Text x={515} y={600} size={18} color={cyan}>
        手前 ↓　7区分＋予備＝配列8個
      </Text>
      <Box x={855} y={165} w={380} h={413}>
        <Text x={15} y={12} size={20} color={gold}>
          {stage === 2 ? "上から走査 → 描画" : "切り抜きを元の比率で保持"}
        </Text>
        {[1, 0].map((i) => {
          const o = crops[i],
            visible = stage < 2 || 7 - Math.floor(o.zExample / 8) <= scan;
          return visible ? (
            <React.Fragment key={i}>
              <Crop
                index={i}
                x={(o.x * 350) / 1024}
                y={42 + (o.y * 350) / 1024}
                scale={350 / 1024}
              />
              <Text
                x={15}
                y={300 + (1 - i) * 40}
                size={20}
                color={i ? cyan : gold}
              >
                {i ? "B：奥を先に描く" : "A：手前を後に描く"}
              </Text>
            </React.Fragment>
          ) : null;
        })}
      </Box>
      {stage === 1 &&
        crops.map((o, i) => {
          const p = clamp((local - i * 0.5) / 1.4),
            targetY = 178 + (7 - Math.floor(o.zExample / 8)) * 51;
          return (
            <Crop
              key={i}
              index={i}
              x={(45 + (o.x * 440) / 1024) * (1 - p) + 765 * p}
              y={(165 + (o.y * 440) / 1024) * (1 - p) + targetY * p}
              scale={0.14}
            />
          );
        })}
      <Text x={45} y={620} size={18}>
        固定サイズの区分に登録。空は通過。同じ区分内の細かな前後関係は省略。
      </Text>
    </>
  );
}
function CollisionScene({ b, local }: { b: number; local: number }) {
  const r = row(84);
  const bx =
    b === 0 || b >= 3
      ? r.cx
      : r.cx -
        r.im.halfW -
        8 +
        (b === 2 ? clamp(local / 3) * (r.im.halfW + 8) : 0);
  const by = r.bot - r.im.h;
  const zOk = b >= 1 && r.z >= 14 * 4 && r.z <= 18 * 4 + 3;
  const xyOk =
    bx >= r.cx - r.im.halfW &&
    bx <= r.cx + r.im.halfW &&
    by >= r.bot - r.im.h * 2 &&
    by <= r.bot;
  const hit = b >= 2 && zOk && xyOk;
  return (
    <>
      <Text x={45} y={117} size={22} color={gold}>
        {b === 0
          ? "弾：Z 40（敵とは別の奥行き）"
          : "弾の通過：Z 14 → 18（説明例）"}
        　敵：Z {r.z}/4 = {r.z / 4}
      </Text>
      <GamePlane n={84} rectangle rectColor={hit ? green : zOk ? cyan : pink} />
      <div
        style={{
          position: "absolute",
          left: 45 + (bx - 64) * 4.5,
          top: 176 + ((by - 31) / 2) * 4.5,
          width: 10,
          height: 10,
          borderRadius: 5,
          background: gold,
        }}
      />
      <Box x={670} y={176} w={565} h={263}>
        {[3, 2, 1, 0].map((k, i) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              top: 18 + i * 57,
              height: 48,
              border: `1px solid ${b >= 1 && [1, 2].includes(k) ? gold : "#4b4356"}`,
              background:
                b >= 1 && [1, 2].includes(k) ? "#3b3020" : "transparent",
              padding: "7px 14px",
              fontSize: 23,
            }}
          >
            Z {k * 8}〜{k * 8 + 7}　
            {b >= 1 && [1, 2].includes(k) ? "通過範囲に含まれる" : "対象外"}
          </div>
        ))}
      </Box>
      <Box x={670} y={462} w={565} h={145} color={hit ? green : cyan}>
        <Text x={18} y={10} size={24} color={hit ? green : gold}>
          {b < 2
            ? "先にZ範囲を確認"
            : hit
              ? "ZとXYが両方一致 → 命中"
              : "Zは範囲内 → XYを確認"}
        </Text>
        <Text x={18} y={54} size={20}>
          X：{Math.round(bx)} ／ {r.cx - r.im.halfW}〜{r.cx + r.im.halfW}
          {`\n`}Y：{by} ／ {r.bot - r.im.h * 2}〜{r.bot}
        </Text>
      </Box>
      <Text x={45} y={620} size={18}>
        描画と同じZ区分 ／ 衝突対象は専用リスト ／ 現在位置だけでなく通過範囲
      </Text>
    </>
  );
}
function AuthoringScene({ b, local }: { b: number; local: number }) {
  const { fps } = useVideoConfig();
  const n = Math.min(113, 82 + Math.floor(local * 2));
  if (b === 0)
    return (
      <>
        <Box x={45} y={154} w={735} h={450}>
          <Loop durationInFrames={Math.floor(5.8 * fps)}>
            <OffthreadVideo
              muted
              src={staticFile("houdini_enemy_trajectory.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Loop>
        </Box>
        <Box x={810} y={154} w={425} h={450}>
          <Text x={20} y={35} color={cyan}>
            Houdiniの軌跡{`\n\n`}位置・サイズ・Zを出力{`\n\n`}
            ゲーム用の移動テーブル
          </Text>
        </Box>
      </>
    );
  if (b === 1)
    return (
      <>
        <Box x={45} y={157} w={520} h={450}>
          <Img
            src={staticFile("dense/sort27.png")}
            style={{ width: 480, height: 450, objectFit: "contain" }}
          />
        </Box>
        <Text x={630} y={210} size={29}>
          映像だけでは{`\n`}追う敵を取り違える
        </Text>
        <Text x={630} y={345} color={gold}>
          どの敵かを人が指定する
        </Text>
        <Text x={45} y={620} size={18}>
          問題の説明用。実際の解析結果や検出枠ではありません。
        </Text>
      </>
    );
  return (
    <>
      <Text x={45} y={114} size={18} color={gold}>
        制作手順の再現。以下は出力形式を実データで示す例（原作からの抽出実録ではありません）
      </Text>
      {[82, 97, 112].map((a, i) => {
        const q = row(a);
        return (
          <Box key={a} x={45 + i * 207} y={173} w={190} h={190}>
            <Text x={12} y={9} size={18} color={gold}>
              目印 {i + 1}：f {a}
            </Text>
            <Img
              src={staticFile(q.im.file)}
              style={{
                position: "absolute",
                left: 95 - q.im.w * 2,
                top: 145 - q.im.h * 4,
                width: q.im.w * 4,
                height: q.im.h * 4,
                imageRendering: "pixelated",
              }}
            />
            <Text x={12} y={158} size={16}>
              X {q.cx} ／ Y {q.bot}
            </Text>
          </Box>
        );
      })}
      <Text x={45} y={390} size={25}>
        人の目印 → AIが座標抽出・補間 → 表を出力
      </Text>
      <Text x={45} y={459} size={23} color={cyan}>
        出力した表をゲームで再生して確認
      </Text>
      <Text x={45} y={528} size={23} color={green}>
        速度・距離感を原作と比較して修正
      </Text>
      <RowTable n={n} x={670} y={173} />
      <Box x={670} y={414} w={565} h={190}>
        <Text x={20} y={15} size={20} color={cyan}>
          出力の確認：サイズ番号 {row(n).s}
        </Text>
        <div style={{position:'absolute',left:180,top:46,width:192,height:144,overflow:'hidden',background:'#000'}}><NativeEnemy n={n} scale={1.5}/></div>
      </Box>
    </>
  );
}
export const DensePart2 = () => (
  <AbsoluteFill style={{ background: bg }}>
    {manifest.cuts.map((cut, i) => (
      <Sequence
        key={cut.id}
        from={cut.startFrame + (i ? restoredFrames : 0)}
        durationInFrames={cut.durationFrames}
      >
        <Beat cut={cut} />
      </Sequence>
    ))}
    <Sequence from={titleFrames} durationInFrames={oldIntroFrames}>
      <Sequence from={-oldStart}>
        <LaterNarrationPreview />
      </Sequence>
    </Sequence>
    <Sequence from={titleFrames + oldIntroFrames} durationInFrames={oldWorkFrames}>
      <WorkflowNarrationPreview />
    </Sequence>
  </AbsoluteFill>
);
