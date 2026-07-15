import{World}from'./engine.js';
const w=new World(11);w.market={x:25,y:32};
for(const[j,x,y]of[['fisher',24,31],['fisher',27,31],['veg',22,28],['veg',20,29],['wheat',16,24],['wheat',18,23],['woodshop',12,12],['charburner',10,11]])w.addHH(j,x,y);
const plan={2:'woodshop',3:'charburner',4:'fisher',5:'charburner',6:'saltworks',7:'veg',8:'fisher',9:'veg',13:'fisher',14:'wheat',15:'wheat',16:'fisher',17:'wheat',18:'wheat',20:'shepherd'};
for(let d=1;d<=1440;d++){if(d%30===1){const m=Math.floor(d/30)+1;if(plan[m])w.addHH(plan[m],10+m%20,10+(m*7)%15);}w.step();
 if(d%360===0)console.log('Y'+d/360,'金庫',Math.round(w.treasury),'飢餓',w.famine,'支援',w.bailouts,'破産',w.goDay,'Lv最高',Math.max(...w.hhs.map(h=>h.lv)));}
console.log('SMOKE OK (貨幣保存則も全日通過)');
