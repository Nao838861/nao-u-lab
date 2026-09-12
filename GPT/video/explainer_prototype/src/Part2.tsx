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
import manifest from "../narration/part2-cuts.json";
import data from "./part2Data.json";
import alignment from "./part2Alignment.json";

type Cut = (typeof manifest.cuts)[number];
const ink = "#070b13",
  white = "#f4f6fb",
  cyan = "#53dcff",
  gold = "#ffbd60",
  green = "#81efa9",
  pink = "#ff699f";
const font = '"Yu Gothic UI", sans-serif';
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
const Label: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  color?: string;
  size?: number;
}> = ({ x, y, children, color = white, size = 25 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      color,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.45,
    }}
  >
    {children}
  </div>
);
const Sprite: React.FC<{
  x: number;
  y: number;
  size?: number;
  enemy?: boolean;
  variant?: number;
  opacity?: number;
  tint?: string;
}> = ({ x, y, size = 110, enemy = false, variant = 0, opacity = 1, tint }) => (
  <Img
    src={staticFile(
      enemy
        ? "enemy_em0_explain.png"
        : `tree/Tree0_${String(variant).padStart(2, "0")}.png`,
    )}
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size,
      width: size,
      height: size,
      objectFit: "contain",
      imageRendering: "pixelated",
      opacity,
      filter:
        tint === "cyan"
          ? "sepia(1) saturate(4) hue-rotate(140deg)"
          : tint === "gold"
            ? "sepia(1) saturate(4)"
            : "",
    }}
  />
);
const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  children?: React.ReactNode;
  color?: string;
}> = ({ x, y, w, h, children, color = cyan }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      border: `1px solid ${color}66`,
      borderRadius: 12,
      background: "#111b2a",
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);
const Demo: React.FC<{ start?: number }> = ({ start = 13 }) => {
  const { fps } = useVideoConfig();
  return (
    <Loop durationInFrames={fps * 18}>
      <OffthreadVideo
        src={staticFile("game_CSCD.mp4")}
        startFrom={start * fps}
        muted
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
function beat(c: Cut, seconds: number) {
  const actual = (alignment as Record<string, { starts: number[] }>)[c.id]
    ?.starts;
  const weights = c.sentences.map((s) => s.length);
  const total = weights.reduce((a, b) => a + b, 0);
  let sum = 0;
  const starts =
    actual ??
    weights.map((w) => {
      const v =
        (sum / total) * (c.measuredDurationSeconds ?? c.durationFrames / 60);
      sum += w;
      return v;
    });
  let index = 0;
  starts.forEach((s, i) => {
    if (seconds >= s) index = i;
  });
  return { index, local: seconds - (starts[index] ?? 0) };
}
const Horizon = ({ center = 640 }: { center?: number }) => (
  <svg width="1280" height="720" style={{ position: "absolute", inset: 0 }}>
    <line x1="45" y1="270" x2="1235" y2="270" stroke="#49748b" />
    {[80, 280, 480, 800, 1000, 1200].map((x) => (
      <line key={x} x1={center} y1="270" x2={x} y2="590" stroke="#24364a" />
    ))}
    {[325, 405, 520, 590].map((y) => (
      <line key={y} x1="45" y1={y} x2="1235" y2={y} stroke="#24364a" />
    ))}
  </svg>
);

const Projection: React.FC<{ kind: string; b: number; t: number }> = ({
  kind,
  b,
  t,
}) => {
  const cycle = (1 - Math.cos(t * 0.8)) / 2;
  const z = Math.round(cycle * 55);
  const sc = data.scale[z] / 256;
  const x = kind === "C04" ? 640 + 330 * (1 - cycle * 0.86) : 430 + 160 * sc;
  const y =
    kind === "C04" ? 540 - cycle * 245 : 270 + (data.groundY[z] - 60) * 8;
  const size =
    kind === "C04" ? 155 - cycle * 125 : Math.max(30, 135 * (1 - cycle));
  const center = kind === "C04" ? 640 : 430;
  return (
    <>
      <Horizon center={center} />
      <Label x={center - 90} y={215} size={19} color={cyan}>
        消失点
      </Label>
      <svg width="1280" height="720" style={{ position: "absolute" }}>
        <circle cx={center} cy="270" r="6" fill={cyan} />
        <path
          d={`M ${center + 330} 540 L ${center} 270`}
          stroke={gold}
          strokeWidth="2"
          strokeDasharray="6 8"
          fill="none"
        />
      </svg>
      <Sprite
        x={x}
        y={y}
        size={size}
        variant={kind === "C06" ? data.size[z] : 0}
      />
      <Label x={64} y={155} size={23} color={gold}>
        Z = {z}　{z > 35 ? "奥" : z < 20 ? "手前" : "中間"}
      </Label>
      {kind === "C04" ? (
        <>
          <Label x={70} y={340}>
            横位置 → 中央へ
          </Label>
          <Label x={70} y={395}>
            縦位置 → 地平線へ
          </Label>
          <Label x={70} y={450}>
            絵 → 小さく
          </Label>
        </>
      ) : (
        <Panel x={835} y={160} w={390} h={360}>
          <Label x={23} y={20} size={21} color={cyan}>
            奥行きから選ぶ値
          </Label>
          {[Math.max(0, z - 1), z, Math.min(55, z + 1)].map((v, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 20,
                top: 85 + i * 61,
                width: 345,
                padding: 10,
                boxSizing: "border-box",
                background: i === 1 ? "#23445b" : "transparent",
                fontSize: 20,
                color: i === 1 ? white : "#72859a",
              }}
            >
              Z {String(v).padStart(2, "0")}　
              {kind === "C06"
                ? `画像 ${data.size[v]}`
                : `倍率 ${data.scale[v]}/256 · Y ${data.groundY[v]}`}
            </div>
          ))}
          <Label x={23} y={292} size={20} color={gold}>
            {kind === "C06"
              ? "56段階 → 16種類の画像"
              : "倍率と地面の高さを取り出す"}
          </Label>
        </Panel>
      )}
      {kind === "C06" && (
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 555,
            display: "flex",
            gap: 9,
          }}
        >
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 61,
                height: 53,
                border: `2px solid ${i === data.size[z] ? gold : "#263345"}`,
                background: "#101b28",
                position: "relative",
              }}
            >
              <Img
                src={staticFile(`tree/Tree0_${String(i).padStart(2, "0")}.png`)}
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "contain",
                  imageRendering: "pixelated",
                }}
              />
              <span style={{ fontSize: 12 }}>{i}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const Bucket: React.FC<{ t: number; collision?: boolean }> = ({
  t,
  collision = false,
}) => {
  const phase = t % 10;
  const active = 6 - Math.min(6, Math.floor(Math.max(0, phase - 3) * 1.2));
  const bulletZ = 20 + Math.floor((phase / 10) * 18);
  const bucket = Math.floor(bulletZ / 8);
  return (
    <>
      <Label x={60} y={148} color={gold}>
        {collision ? "弾が通過した奥行きだけ調べる" : "Zを8段階ずつまとめる"}
      </Label>
      {Array.from({ length: 7 }, (_, i) => {
        const hi = collision
          ? i === bucket || i === Math.floor((bulletZ - 4) / 8)
          : phase > 3 && i === active;
        return (
          <Panel
            key={i}
            x={60 + i * 167}
            y={242}
            w={153}
            h={230}
            color={hi ? gold : cyan}
          >
            <div
              style={{
                height: "100%",
                background: hi ? "#61452988" : "transparent",
              }}
            >
              <Label x={12} y={10} size={21} color={hi ? gold : cyan}>
                {i * 8}〜{i * 8 + 7}
              </Label>
              {(i === 2 ? [22, 18] : [i * 8 + 4]).map((z, j) => (
                <div
                  key={z}
                  style={{
                    opacity: phase > j * 0.35 + i * 0.2 ? 1 : 0.1,
                    position: "absolute",
                    top: 75 + j * 66,
                    left: 12,
                    right: 12,
                    height: 54,
                    background: hi ? "#bb8242" : "#23384e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  <Img
                    src={staticFile("enemy_em0_explain.png")}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "contain",
                      imageRendering: "pixelated",
                    }}
                  />
                  <span>Z {z}</span>
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
      <Label x={60} y={492} color={cyan}>
        手前
      </Label>
      <Label x={1120} y={492} color={cyan}>
        奥
      </Label>
      {collision ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 75 + (bulletZ / 8) * 167,
              top: 530,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: gold,
              boxShadow: `0 0 20px ${gold}`,
            }}
          />
          <Label x={60} y={578} size={23}>
            候補を絞る → Zの範囲と2Dの矩形を確認
          </Label>
        </>
      ) : (
        <>
          <Label x={400} y={523} size={32} color={gold}>
            ← 奥のバケツから描画
          </Label>
          <Label x={340} y={580} size={21} color="#91a0b4">
            同じバケツ内の細かなZ順は省略
          </Label>
        </>
      )}
    </>
  );
};

const EnemyTable: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.floor(t * 12) % data.enemy.sx.length;
  const e = data.enemy;
  const x = 90 + e.sx[n] * 2.3,
    y = 170 + e.bot[n] * 1.6;
  return (
    <>
      <Panel x={55} y={155} w={680} h={440}>
        <svg width="680" height="440">
          <path
            d={e.sx
              .map(
                (v, i) =>
                  `${i ? "L" : "M"} ${35 + v * 2.3} ${Math.max(20, e.bot[i] * 1.6 + 15)}`,
              )
              .join(" ")}
            fill="none"
            stroke="#45647a"
            strokeDasharray="3 5"
          />
        </svg>
      </Panel>
      <Sprite x={x} y={Math.min(560, y)} enemy size={50 + (15 - e.sz[n]) * 4} />
      <Panel x={765} y={155} w={455} h={440}>
        <Label x={25} y={20} color={cyan}>
          実際の軌跡テーブル
        </Label>
        {[
          ["フレーム", n],
          ["画面 X / 下端 Y", `${e.sx[n]} / ${e.bot[n]}`],
          ["サイズ番号", e.sz[n]],
          ["Z（56段階に換算）", Math.floor(e.wz[n] / 4)],
          ["バケツ番号", e.zb[n]],
        ].map(([key, val], i) => (
          <div
            key={key}
            style={{
              position: "absolute",
              left: 25,
              right: 25,
              top: 80 + i * 58,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 23,
              borderBottom: "1px solid #345",
              paddingBottom: 10,
            }}
          >
            <span>{key}</span>
            <span style={{ color: gold }}>{val}</span>
          </div>
        ))}
      </Panel>
      <Label x={80} y={605} size={17} color="#90a6b8">
        通常編隊の実データ。Zは前の図と同じ単位に換算。地平線の補正は別。
      </Label>
    </>
  );
};

const Hit: React.FC<{ t: number }> = ({ t }) => {
  const phase = t % 8;
  const near = phase > 4;
  const bx = 200 + clamp(phase / 3) * 530;
  return (
    <>
      <Panel x={65} y={150} w={1145} h={438} />
      <Label x={95} y={180} color={gold}>
        {near
          ? "Zも近い → 矩形で命中判定"
          : "画面で重なっても、Zが遠ければ当たらない"}
      </Label>
      <Sprite x={750} y={455} size={175} enemy />
      <div
        style={{
          position: "absolute",
          left: 660,
          top: 285,
          width: 180,
          height: 170,
          border: `3px solid ${near ? green : cyan}`,
          background: near ? "#81efa919" : "transparent",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: bx,
          top: 365,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: gold,
        }}
      />
      <Label x={900} y={320} color={cyan}>
        敵 Z = 22
      </Label>
      <Label x={900} y={380} color={gold}>
        弾 Z = {near ? 22 : 40}
      </Label>
      <Label x={95} y={520} size={23}>
        画面位置 ＋ サイズ別の幅・高さ → 2Dの矩形（模式図）
      </Label>
    </>
  );
};

const Timeline: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  const step = b < 2 ? 0 : b === 2 ? 1 : b === 3 ? 2 : b < 5 ? 3 : 4;
  return (
    <>
      <Label x={62} y={150} color={cyan}>
        約16.7ms × 2フレーム → 毎秒30回更新
      </Label>
      {[0, 1].map((i) => (
        <Panel
          key={i}
          x={65 + i * 345}
          y={214}
          w={315}
          h={355}
          color={i === 0 ? green : pink}
        >
          <Label x={20} y={16} color={i === 0 ? green : pink}>
            {i + 1}フレーム目
          </Label>
          {(i === 0
            ? [
                ["上半分を消去", 50],
                ["地面・遠景", 65],
                ["ゲーム更新", 145],
              ]
            : [["キャラを描画", 270]]
          ).map(([s, h], j) => (
            <div
              key={s}
              style={{
                position: "absolute",
                left: 15,
                right: 15,
                top: 65 + (i === 0 ? [0, 60, 135][j] : 0),
                height: Number(h),
                background:
                  i === 0 && j === 2
                    ? `rgba(80,220,140,${0.22 + 0.2 * Math.sin(t * 3) ** 2})`
                    : "#28384e",
                padding: 12,
                boxSizing: "border-box",
                fontSize: 22,
              }}
            >
              {s}
              {i === 0 && j === 2 && (
                <div style={{ fontSize: 35, color: green, marginTop: 10 }}>
                  最大 約8ms
                </div>
              )}
            </div>
          ))}
        </Panel>
      ))}
      <Panel x={785} y={214} w={425} h={300}>
        <Img
          src={staticFile(
            step >= 3
              ? "frame_background_player_bg.png"
              : step === 2
                ? "frame_background.png"
                : "frame_background_player_bg.png",
          )}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
        {step === 1 && (
          <>
            <div
              style={{
                position: "absolute",
                inset: "0 0 36%",
                background: "#000",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "64% 0 0",
                background: "#6666",
              }}
            />
          </>
        )}
      </Panel>
      <Label x={805} y={532} size={20}>
        仮想フレームバッファの途中状態
      </Label>
      {step === 4 && (
        <Label x={80} y={595} size={23} color={gold}>
          計算を減らす → 順序と候補を絞る → 時間内に配分する
        </Label>
      )}
    </>
  );
};

const Flow: React.FC<{ b: number; t: number }> = ({ b, t }) => (
  <>
    {["C言語で試す", "AIで変換", "アセンブリで実行"].map((s, i) => (
      <Panel
        key={s}
        x={65 + i * 397}
        y={240}
        w={355}
        h={230}
        color={[cyan, pink, gold][i]}
      >
        <Label x={25} y={26} color={[cyan, pink, gold][i]}>
          {s}
        </Label>
        <Label x={25} y={95} size={23}>
          {
            [
              "移動・投影・当たり判定",
              "固まった処理を置き換える",
              "C版と動作を比較",
            ][i]
          }
        </Label>
        {i !== 1 && (
          <Label x={25} y={159} size={19} color="#91a6be">
            {i === 0 ? "Cソースを残して改善する" : "同一動作を検証する"}
          </Label>
        )}
      </Panel>
    ))}
    <div
      style={{
        position: "absolute",
        left: 100 + ((t % 5) / 5) * 1020,
        top: 210,
        width: 18,
        height: 18,
        borderRadius: 9,
        background: cyan,
      }}
    />
    <svg width="1280" height="720" style={{ position: "absolute" }}>
      <path
        d="M 1110 490 L 1110 555 L 230 555 L 230 490"
        fill="none"
        stroke={green}
        strokeWidth="3"
        strokeDasharray="12 9"
      />
    </svg>
    <Label x={370} y={565} color={green}>
      処理の手順を見直すときはCへ戻る
    </Label>
  </>
);

const Precision: React.FC<{ t: number }> = ({ t }) => {
  const value = 248 + (Math.floor(t * 2) % 20);
  return (
    <>
      <Label x={60} y={155} color={gold}>
        符号なし整数の場合
      </Label>
      {[8, 16].map((n, j) => (
        <Panel
          key={n}
          x={60 + j * 600}
          y={220}
          w={555}
          h={345}
          color={j ? gold : cyan}
        >
          <Label x={25} y={15} size={51} color={j ? gold : cyan}>
            {n}bit
          </Label>
          <Label x={230} y={35} size={29}>
            0〜{j ? "65,535" : "255"}
          </Label>
          <div
            style={{
              position: "absolute",
              left: 25,
              top: 140,
              display: "flex",
              gap: 5,
            }}
          >
            {Array.from({ length: n }, (_, i) => {
              const on = (value >> (n - 1 - i)) & 1;
              return (
                <div
                  key={i}
                  style={{
                    width: j ? 26 : 53,
                    height: 58,
                    background: on ? (j ? gold : cyan) : "#26384b",
                    color: on ? ink : white,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 22,
                  }}
                >
                  {on}
                </div>
              );
            })}
          </div>
          <Label x={25} y={240} color={j ? gold : cyan}>
            {j ? "上位バイトへ桁上がり" : "8bitで足りる値は1バイトへ"}
          </Label>
        </Panel>
      ))}
      <Label x={250} y={590} size={24}>
        必要な範囲と精度に合わせて、計算を小さくする
      </Label>
    </>
  );
};

const Background: React.FC<{ t: number }> = ({ t }) => {
  const move = Math.sin(t * 0.65) * 100;
  return (
    <>
      <Horizon />
      <Label x={65} y={150} color={gold}>
        模式図：背景の左右追従
      </Label>
      <Sprite x={620 + move * 0.5} y={330} size={65} />
      <Sprite x={930 + move * 1.5} y={540} size={155} />
      <Label x={62} y={345} size={23}>
        内部 X：16bitで保持
      </Label>
      <Label x={62} y={405} size={23}>
        ↓ 奥行きの倍率を適用
      </Label>
      <Label x={62} y={465} size={23} color={cyan}>
        描画 X：8bitへ
      </Label>
      <Label x={720} y={590} size={19} color={gold}>
        左右入力の比較録画に差し替え予定
      </Label>
    </>
  );
};

const Houdini: React.FC<{ t: number; b: number }> = ({ t, b }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 45,
          top: 145,
          width: b >= 3 ? 760 : 1190,
          height: 455,
          overflow: "hidden",
          borderRadius: 12,
        }}
      >
        <Loop durationInFrames={Math.floor(5.8 * fps)}>
          <OffthreadVideo
            src={staticFile("houdini_enemy_trajectory.mp4")}
            muted
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Loop>
      </div>
      {b >= 3 && (
        <Panel x={835} y={195} w={365} h={350} color={gold}>
          <Label x={25} y={30} color={gold}>
            Houdiniの軌跡
          </Label>
          <Label x={160} y={95}>
            ↓
          </Label>
          <Label x={25} y={155}>
            位置・サイズの表
          </Label>
          <Label x={160} y={220}>
            ↓
          </Label>
          <Label x={25} y={275} color={green}>
            ゲームへ組み込む
          </Label>
        </Panel>
      )}
    </>
  );
};
const Tracking: React.FC<{ t: number }> = ({ t }) => {
  const x = 450 + Math.sin(t) * 120;
  return (
    <>
      <Panel x={60} y={160} w={1155} h={400} />
      <Label x={85} y={185} color={gold}>
        模式図：重なると、追う相手を取り違える
      </Label>
      <Sprite x={x} y={460} size={170} enemy />
      <Sprite x={740 - Math.sin(t) * 150} y={460} size={145} enemy />
      <div
        style={{
          position: "absolute",
          left: (Math.floor(t / 3) % 2 ? 740 - Math.sin(t) * 150 : x) - 90,
          top: 285,
          width: 180,
          height: 175,
          border: `3px dashed ${pink}`,
        }}
      />
      <Label x={870} y={330} color={pink}>
        追跡対象が曖昧に
      </Label>
      <Label x={85} y={505} size={21}>
        実際の解析失敗映像・結果に差し替え予定
      </Label>
      <Label x={190} y={590} size={24}>
        全自動では難しい → 人が要所を教える方法へ
      </Label>
    </>
  );
};

const AssistedTrajectory: React.FC<{ b: number; t: number }> = ({ b, t }) => {
  const points = [
    { x: 175, y: 340 },
    { x: 627.5, y: 182.5 },
    { x: 1080, y: 405 },
  ];
  const progress = clamp((t % 9) / 6);
  const pos = (v: number) => ({
    x: 175 + 905 * v,
    y: 340 - 190 * Math.sin(v * Math.PI) + 65 * v,
  });
  const moving = pos(progress);
  return (
    <>
      <Label x={60} y={145} color={gold}>
        制作手順の模式再現：同じ敵に目印を付ける
      </Label>
      <svg width="1280" height="720" style={{ position: "absolute" }}>
        <path
          d={Array.from({ length: 25 }, (_, i) => {
            const p = pos(i / 24);
            return `${i ? "L" : "M"}${p.x} ${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="#385267"
          strokeWidth="2"
          strokeDasharray="6 8"
        />
        {b >= 2 &&
          Array.from({ length: 25 }, (_, i) => {
            const p = pos(i / 24);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill={cyan}
                opacity={i / 24 <= progress ? 1 : 0.15}
              />
            );
          })}
      </svg>
      {points.map((p, i) => (
        <React.Fragment key={i}>
          <Sprite x={p.x} y={p.y + 45} size={85} enemy opacity={0.65} />
          <div
            style={{
              position: "absolute",
              left: p.x - 15,
              top: p.y - 15,
              width: 30,
              height: 30,
              border: `3px solid ${gold}`,
              borderRadius: "50%",
            }}
          />
          <Label x={p.x - 50} y={460} size={21} color={gold}>
            目印 {i + 1}
          </Label>
        </React.Fragment>
      ))}
      {b >= 2 && <Sprite x={moving.x} y={moving.y + 45} size={75} enemy />}
      <Panel x={65} y={530} w={1145} h={80}>
        <Label x={25} y={20} size={24} color={b >= 3 ? green : cyan}>
          {b < 2
            ? "人：追う敵を指定する"
            : b === 2
              ? "AI：座標抽出 → 補間 → 移動テーブル"
              : "人：原作と比較 → 速度感・距離感を調整"}
        </Label>
      </Panel>
    </>
  );
};

const AiDevelopment: React.FC<{ b: number; t: number }> = ({ b, t }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 495,
        top: 160,
        width: 725,
        height: 420,
        overflow: "hidden",
        borderRadius: 12,
      }}
    >
      <Demo start={17} />
    </div>
    {[
      ["初期", "変換・アセンブラ化"],
      ["中期", "座標抽出・表の生成"],
      ["終盤", "絵と仕様から実装"],
    ].map(([era, label], i) => (
      <Panel
        key={era}
        x={60}
        y={165 + i * 126}
        w={405}
        h={108}
        color={i === Math.min(2, Math.max(0, b - 1)) ? gold : cyan}
      >
        <Label x={18} y={12} size={18} color={gold}>
          {era}
        </Label>
        <Label x={18} y={47} size={25}>
          {label}
        </Label>
      </Panel>
    ))}
    <Label x={95} y={593} size={25} color={green}>
      画面を見て判断 → 指示 → AIが実装 → 再確認
    </Label>
  </>
);

const Ending: React.FC<{ b: number }> = ({ b }) => (
  <>
    <Demo start={13} />
    <AbsoluteFill
      style={{ background: "linear-gradient(90deg,#070b13e8,#070b1350)" }}
    />
    {b < 2 ? (
      <>
        <Label x={70} y={210} size={34} color={cyan}>
          計算を事前準備へ
        </Label>
        {b >= 1 && (
          <Label x={70} y={420} size={34} color={green}>
            AIで事前作業と試行錯誤を支える
          </Label>
        )}
      </>
    ) : (
      <AbsoluteFill
        style={{
          background: ink,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 46, fontWeight: 700 }}>
          ご視聴ありがとうございました
        </div>
        <div style={{ fontSize: 25, color: cyan, marginTop: 30 }}>
          ファミコンでスペースハリアーを動かすには？
        </div>
        <div style={{ fontSize: 23, color: "#a2b4c8", marginTop: 12 }}>
          その2：CPUの最適化
        </div>
      </AbsoluteFill>
    )}
  </>
);

const Scene: React.FC<{ cut: Cut }> = ({ cut }) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = f / fps;
  const { index: b, local } = beat(cut, t);
  const k = cut.sourceCut;
  let content: React.ReactNode;
  if (k === "C01")
    content = (
      <>
        <Demo />
        <AbsoluteFill
          style={{
            background: "linear-gradient(0deg,#070b13ee,transparent 90%)",
          }}
        />
        <Label x={70} y={300} size={45}>
          ファミコンで
          <br />
          スペースハリアーを動かすには？
        </Label>
        <Label x={75} y={465} size={35} color={cyan}>
          その2：CPUの最適化
        </Label>
      </>
    );
  else if (k === "C02")
    content = (
      <>
        <div
          style={{
            position: "absolute",
            left: 460,
            top: 150,
            width: 765,
            height: 440,
            overflow: "hidden",
          }}
        >
          <Demo start={17} />
        </div>
        <Panel x={55} y={150} w={370} h={440} color={green}>
          <Label x={25} y={20} color={green}>
            ゲームの更新
          </Label>
          {["敵 最大8体", "敵弾 最大6個", "背景 最大16個"].map((s, i) => (
            <Label key={s} x={25} y={85 + i * 51} size={27}>
              {s}
            </Label>
          ))}
          <Label x={25} y={280} size={53} color={green}>
            約8ms
          </Label>
          <Label x={25} y={362} size={19}>
            今回の処理配分での予算
          </Label>
        </Panel>
      </>
    );
  else if (k === "C03")
    content = (
      <>
        <Panel x={60} y={180} w={1155} h={370} />
        <Label x={90} y={207} color={pink} size={32}>
          乗算・除算の専用命令がない
        </Label>
        <Label x={90} y={300} size={32}>
          13 × 6 = 13 × (4 + 2)
        </Label>
        <Label x={90} y={392} size={34} color={cyan}>
          シフト → 足し算 → 78
        </Label>
        <div
          style={{
            position: "absolute",
            left: 760,
            top: 270,
            display: "flex",
            gap: 12,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: 78,
                height: 100,
                background: t % 4 > i - 1 ? cyan : "#24364b",
                color: ink,
                display: "grid",
                placeItems: "center",
                fontSize: 25,
              }}
            >
              {["ASL", "ASL", "ADC", "結果"][i - 1]}
            </div>
          ))}
        </div>
        <Label x={85} y={580} size={23}>
          基本命令を組み合わせるほど、時間がかかる（模式例）
        </Label>
      </>
    );
  else if (k === "C05")
    content =
      b === 0 ? (
        <>
          <Demo start={17} />
          <AbsoluteFill style={{ background: "#070b13bd" }} />
          <Label x={85} y={240} size={40} color={pink}>
            乗算・除算の命令がない
          </Label>
          <Label x={85} y={340} size={31}>
            基本命令を組み合わせる → 時間がかかる
          </Label>
        </>
      ) : (
        <Projection
          kind={b === 1 ? "C04" : b >= 4 ? "C06" : "C05"}
          b={b}
          t={t}
        />
      );
  else if (["C04", "C06"].includes(k))
    content = <Projection kind={k} b={b} t={t} />;
  else if (k === "C07") {
    const correct = t % 8 > 4;
    content = (
      <>
        <Horizon />
        <Label x={60} y={160} color={correct ? green : pink} size={33}>
          {correct ? "奥 → 手前：自然な重なり" : "手前 → 奥：重なりが逆になる"}
        </Label>
        {correct ? (
          <>
            <Sprite x={660} y={440} size={160} tint="cyan" />
            <Sprite x={700} y={530} size={240} tint="gold" />
          </>
        ) : (
          <>
            <Sprite x={700} y={530} size={240} tint="gold" />
            <Sprite x={660} y={440} size={160} tint="cyan" />
          </>
        )}
        <Label x={60} y={580}>
          位置が同じでも、描く順番で見え方が変わる
        </Label>
      </>
    );
  } else if (k === "C08")
    content =
      b === 0 ? (
        <>
          <Horizon />
          <Sprite x={660} y={440} size={160} tint="cyan" />
          <Sprite x={700} y={530} size={240} tint="gold" />
          <Label x={65} y={180} size={34} color={green}>
            奥 → 手前の順に描く
          </Label>
        </>
      ) : (
        <Bucket t={t} />
      );
  else if (k === "C08a") content = <EnemyTable t={t} />;
  else if (k === "C08b")
    content = b < 2 ? <Bucket t={t} collision /> : <Hit t={t} />;
  else if (k === "C09")
    content = (
      <Timeline
        b={b === 0 ? 0 : b === 1 ? (local < 2.3 ? 2 : local < 4.8 ? 3 : 4) : 5}
        t={t}
      />
    );
  else if (k === "C10") content = <Flow b={b} t={t} />;
  else if (k === "C11")
    content = b < 2 ? <Precision t={t} /> : <Background t={t} />;
  else if (k === "C12") content = <Background t={t} />;
  else if (k === "C14") content = <Houdini t={t} b={b === 0 ? 0 : 3} />;
  else if (k === "C16")
    content =
      b < 2 ? (
        <Tracking t={t} />
      ) : (
        <AssistedTrajectory t={local} b={b === 2 ? (local < 3.5 ? 1 : 2) : 3} />
      );
  else if (k === "C17")
    content = (
      <>
        <div
          style={{
            position: "absolute",
            left: 560,
            top: 155,
            width: 660,
            height: 430,
            overflow: "hidden",
          }}
        >
          <Demo start={17} />
        </div>
        {["絵と動作の仕様", "AIが実装", "動いた画面で判断", "修正を伝える"].map(
          (s, i) => (
            <Panel
              key={s}
              x={60}
              y={170 + i * 100}
              w={455}
              h={78}
              color={
                i ===
                (b === 0 ? Math.min(1, Math.floor(local / 3)) : b === 1 ? 2 : 3)
                  ? green
                  : cyan
              }
            >
              <Label x={22} y={20} size={27}>
                {s}
              </Label>
            </Panel>
          ),
        )}
        <Label x={580} y={598} size={23} color={green}>
          指示 → 実装 → 確認 → 修正
        </Label>
      </>
    );
  else if (k === "C18") content = <Ending b={b} />;
  else content = <Tracking t={t} />;
  return (
    <AbsoluteFill
      style={{
        background: ink,
        color: white,
        fontFamily: font,
        opacity: Math.min(1, f / 10, (cut.durationFrames - f) / 10),
      }}
    >
      {content}
      {k !== "C01" && !(k === "C18" && b >= 2) && (
        <>
          <Label x={55} y={28} size={17} color={cyan}>
            その2 ／{" "}
            {["C10", "C11", "C12", "C14", "C15", "C16", "C17", "C18"].includes(
              k,
            )
              ? "後半：作り方と最適化"
              : "前半：30fpsを支える仕組み"}
          </Label>
          <Label x={55} y={65} size={36}>
            {cut.title.replace("後半：", "")}
          </Label>
        </>
      )}
      <div
        style={{
          position: "absolute",
          left: 55,
          right: 55,
          top: 642,
          height: 2,
          background: "#213047",
        }}
      >
        <div
          style={{
            width: `${clamp(f / cut.durationFrames) * 100}%`,
            height: 2,
            background: cyan,
          }}
        />
      </div>
      <Audio
        src={staticFile(`${manifest.outputDirectory}/${cut.id}.wav`)}
        volume={0.95}
      />
    </AbsoluteFill>
  );
};
export const part2Duration = manifest.cuts.reduce(
  (m, c) => Math.max(m, c.startFrame + c.durationFrames),
  0,
);
export const Part2: React.FC = () => (
  <AbsoluteFill style={{ background: ink }}>
    {manifest.cuts.map((c) => (
      <Sequence
        key={c.id}
        from={c.startFrame}
        durationInFrames={c.durationFrames}
      >
        <Scene cut={c} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
