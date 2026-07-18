export const VERSION = "v001";
export const SAVE_KEY = "shioji-v001-save";
export const SAVE_SCHEMA = 1;

export const MAP_W = 30;
export const MAP_H = 20;
export const SHIP_INTERVAL = 45;
export const MARKET_FEE = 0.04;
export const MERCHANT_SEAL_TARGET = 10;

export const GOODS = {
  grain: { name: "穀物", icon: "●", group: "food", color: "#e9b949", basePrice: 2.2, shape: "sack" },
  fish: { name: "魚", icon: "◆", group: "food", color: "#52b7d8", basePrice: 3.4, shape: "fish" },
  logs: { name: "丸太", icon: "━", group: "material", color: "#7d9b53", basePrice: 2.8, shape: "log" },
  lumber: { name: "材木", icon: "▰", group: "material", color: "#c18455", basePrice: 6.2, shape: "plank" },
  tools: { name: "道具", icon: "✦", group: "tool", color: "#758da3", basePrice: 14, shape: "gear" }
};

export const GOOD_KEYS = Object.keys(GOODS);

export const BUILDINGS = {
  port: {
    name: "商館港",
    icon: "⚓",
    cost: 0,
    days: 0,
    unlock: 0,
    terrain: ["coast"],
    color: "#34526f",
    civic: true,
    description: "船契約と島の外部境界"
  },
  market: {
    name: "市場",
    icon: "◆",
    cost: 210,
    days: 6,
    unlock: 3,
    terrain: ["grass", "fertile", "coast"],
    color: "#d65f45",
    civic: true,
    description: "近隣世帯の注文と価格が集まる"
  },
  fishery: {
    name: "魚屋",
    icon: "ϟ",
    cost: 90,
    days: 4,
    unlock: 1,
    terrain: ["coast"],
    color: "#3a9fba",
    output: "fish",
    description: "魚を獲る。新鮮だが日持ちしない"
  },
  farm: {
    name: "畑区画",
    icon: "〰",
    cost: 95,
    days: 4,
    unlock: 1,
    terrain: ["fertile", "grass"],
    color: "#d6a83b",
    output: "grain",
    description: "穀物を作る。肥沃地なら多く実る"
  },
  logger: {
    name: "木こり小屋",
    icon: "♠",
    cost: 110,
    days: 5,
    unlock: 2,
    terrain: ["forest", "grass"],
    color: "#527b4b",
    output: "logs",
    description: "森から丸太を切り出す"
  },
  sawmill: {
    name: "製材所",
    icon: "▥",
    cost: 145,
    days: 6,
    unlock: 2,
    terrain: ["grass", "fertile"],
    color: "#a86842",
    input: "logs",
    output: "lumber",
    description: "丸太を建築用の材木へ加工する"
  },
  warehouse: {
    name: "蔵",
    icon: "▤",
    cost: 130,
    days: 5,
    unlock: 2,
    terrain: ["grass", "fertile", "coast"],
    color: "#766550",
    civic: true,
    description: "穀物・丸太・材木・道具を保管する"
  },
  workshop: {
    name: "道具工房",
    icon: "✦",
    cost: 175,
    days: 7,
    unlock: 3,
    terrain: ["grass", "fertile"],
    color: "#64788b",
    input: "lumber",
    output: "tools",
    description: "材木から生産を助ける道具を作る"
  },
  tradehouse: {
    name: "商家",
    icon: "⚑",
    cost: 165,
    days: 6,
    unlock: 3,
    terrain: ["grass", "fertile", "coast"],
    color: "#8b5aa5",
    merchant: true,
    description: "自分の荷馬車で二つの市場を結ぶ"
  }
};

export const BUILD_ORDER = ["farm", "fishery", "logger", "sawmill", "warehouse", "market", "tradehouse", "workshop"];

export const CONTRACTS = {
  first_grain: {
    id: "first_grain",
    title: "最初の食卓",
    subtitle: "穀物を積み、島に食の流れを作る",
    goods: ["grain"],
    target: 18,
    reward: 300,
    seal: "life",
    badge: "食"
  },
  grain_relief: {
    id: "grain_relief",
    title: "食糧便",
    subtitle: "確実な現金で次の建設を支える",
    goods: ["grain", "fish"],
    target: 24,
    reward: 320,
    badge: "食"
  },
  timber_charter: {
    id: "timber_charter",
    title: "造船材の勅許",
    subtitle: "森から港まで材木を通す",
    goods: ["lumber"],
    target: 12,
    reward: 440,
    seal: "timber",
    badge: "材"
  },
  tool_charter: {
    id: "tool_charter",
    title: "道具の見本市",
    subtitle: "島の職人仕事を本土へ示す",
    goods: ["tools"],
    target: 6,
    reward: 520,
    badge: "具"
  }
};

export const STARTING_PRICES = Object.fromEntries(GOOD_KEYS.map((good) => [good, GOODS[good].basePrice]));

export const emptyGoods = () => Object.fromEntries(GOOD_KEYS.map((good) => [good, 0]));

export function terrainAt(x, y) {
  if (x < 3) return "water";
  if (x === 3 || (x === 4 && (y < 4 || y > 15))) return "coast";
  if ((x >= 7 && x <= 14 && y >= 11 && y <= 17) || (x >= 20 && x <= 26 && y >= 12 && y <= 17)) return "fertile";
  if ((x >= 18 && x <= 26 && y >= 2 && y <= 9) || (x >= 23 && x <= 28 && y >= 8 && y <= 12)) return "forest";
  if (x >= 27 && y <= 7) return "ridge";
  return "grass";
}

export const isLand = (x, y) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && terrainAt(x, y) !== "water";
