// 正解データを参照せず、利用者が置いた位置だけで配置を決める。
export function placementAt(rect,x,y,currentLayout='lr'){
  if(!rect||![rect.left,rect.top,rect.width,rect.height,x,y].every(Number.isFinite)||rect.width<=0||rect.height<=0)return null;
  const nx=(x-rect.left)/rect.width,ny=(y-rect.top)/rect.height;
  if(nx<0||nx>1||ny<0||ny>1)return null;
  const dx=Math.abs(nx-.5),dy=Math.abs(ny-.5);
  const layout=Math.abs(dx-dy)<.035?currentLayout:dx>dy?'lr':'tb';
  return {layout,slot:(layout==='lr'?nx:ny)<.5?0:1};
}
