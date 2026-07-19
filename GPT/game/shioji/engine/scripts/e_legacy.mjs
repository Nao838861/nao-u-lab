import { runFlowIslandAudit } from "../src/audit.js";

const audit = runFlowIslandAudit();
console.log(JSON.stringify(audit, null, 2));

// §0.2以後は旧 flow_island 数値との同値を受け入れゲートにしない。
// 終了コードは診断結果にかかわらず0とし、結果の比較材料だけを残す。
