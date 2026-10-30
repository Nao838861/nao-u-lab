(function(root){
 'use strict';
 const SIZE=9, BPM=128, BEAT=60/BPM, WINDOW=.19;
 const neighbors=i=>[i%9>0?i-1:-1,i%9<8?i+1:-1,i>=9?i-9:-1,i<72?i+9:-1].filter(v=>v>=0);
 function group(board,start){let cells=new Set([start]),libs=new Set(),todo=[start];while(todo.length){for(const n of neighbors(todo.pop())){if(!board[n])libs.add(n);else if(board[n]===board[start]&&!cells.has(n)){cells.add(n);todo.push(n);}}}return {cells:[...cells],liberties:libs.size};}
 function play(board,x,y,color,ko){let index=y*9+x;if(x<0||x>8||y<0||y>8||board[index])throw Error('occupied or outside');let next=board.slice();next[index]=color;let captured=[];for(const n of neighbors(index)){if(next[n]===3-color){const g=group(next,n);if(!g.liberties){captured.push(...g.cells);g.cells.forEach(i=>next[i]=0);}}}if(!group(next,index).liberties)throw Error('suicide');if(ko&&next.join('')===ko.join(''))throw Error('ko');return {board:next,captured};}
 const points=[[2,1],[2,2],[1,2],[6,6],[3,2],[6,5],[2,3],[5,6],[6,2],[5,2],[2,6],[7,2],[3,6],[6,1],[3,5],[6,3],
 [1,6],[7,6],[2,5],[7,5],[1,5],[5,5],[3,7],[5,7],[2,7],[6,7],[1,7],[7,7],[1,1],[7,1],[3,1],[5,1],[1,3],[7,3],[3,3],[5,3],[0,2],[8,2],[2,0],[6,0],[0,6],[8,6],[2,8],[6,8],[0,1],[8,1],[0,7],[8,7]];
 function makeChart(){let board=Array(81).fill(0),prior=null,beat=0;return points.map(([x,y],i)=>{const color=i%2+1,r=play(board,x,y,color,prior);prior=board;board=r.board;const move={x,y,color,time:beat*BEAT,beat,board:board.slice(),captured:r.captured};beat+=[2,2,4][i%3];return move;});}
 const chart=makeChart();
 class Run {
  constructor(){this.results=chart.map(()=>null);this.board=Array(81).fill(0);this.cursor=0;this.combo=0;this.best=0;this.score=0;this.events=[];}
  update(t){while(this.cursor<chart.length&&t>chart[this.cursor].time+WINDOW){if(!this.results[this.cursor])this.results[this.cursor]={kind:'assist',error:null};this.commit(this.cursor++);} }
  commit(i){this.board=chart[i].board.slice();const r=this.results[i];if(r.kind==='assist')this.combo=0;else {this.combo++;this.best=Math.max(this.best,this.combo);this.score+=r.kind==='perfect'?100:60;}this.events.push({i,...r,captured:chart[i].captured});}
  hit(t,x,y,mode){this.update(t);let i=this.cursor,m=chart[i];if(!m||this.results[i])return null;const error=t-m.time;if(Math.abs(error)>WINDOW)return null;if(mode==='direct'&&Math.hypot(x-m.x,y-m.y)>.48)return null;this.results[i]={kind:Math.abs(error)<=.085?'perfect':'good',error};this.commit(i);this.cursor++;return this.results[i];}
 }
 // ベートーヴェン「歓喜の歌」主題。音符長は四分音符を1とする。
 const phrases=[
 [[64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[64,1.5],[62,.5],[62,2]],
 [[64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[62,1.5],[60,.5],[60,2]],
 [[62,1],[62,1],[64,1],[60,1],[62,1],[64,.5],[65,.5],[64,1],[60,1],[62,1],[64,.5],[65,.5],[64,1],[62,1],[60,1],[62,1],[55,2]],
 [[64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[62,1.5],[60,.5],[60,2]]];
 const melody=phrases.flat();const api={SIZE,BPM,BEAT,WINDOW,chart,Run,play,group,melody,duration:128*BEAT};root.Kifu=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);
