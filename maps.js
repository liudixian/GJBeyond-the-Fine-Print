(function(root){
'use strict';
const obj=(id,name,x,y,w=48,h=36,kind='furniture')=>({id,name,x,y,w,h,kind});
const room=(name,x,y,w,h,tone=0)=>({name,x,y,w,h,tone});
const walls=[[24,24,952,12],[24,604,952,12],[24,24,12,592],[964,24,12,592]];
const MAPS={
 safe:{name:'204 室 · 安全屋',code:'F2 / RESIDENCE',color:'#33443a',rooms:[room('客厅',36,36,348,258),room('厨房',398,36,218,258,1),room('主卧',630,36,334,258,2),room('走廊',36,294,928,64,3),room('玄关',36,370,244,234,2),room('仓库',294,370,220,234,1),room('卫生间',528,370,200,234,1),room('卧室 3',742,370,222,234)],
 walls:[...walls,[36,288,110,12],[226,288,240,12],[546,288,200,12],[826,288,138,12],[384,36,12,252],[616,36,12,252],[36,358,100,12],[216,358,134,12],[430,358,135,12],[645,358,125,12],[850,358,114,12],[280,370,12,234],[514,370,12,234],[728,370,12,234]],
 objects:[obj('door','入户门',52,550,68,28,'door'),obj('cabinet','鞋柜',48,400,70,40,'cabinet'),obj('desk','书桌 / 心理笔记',200,170,90,48,'desk'),obj('window','窗与窗帘',65,57,92,25,'window'),obj('plant','盆栽',302,87,38,38,'plant'),obj('clock','等待时钟',305,206,36,36,'clock'),obj('fridge','冰箱',430,65,54,64,'fridge'),obj('tray','餐盘',544,164,45,40,'tray'),obj('bed','床 / 休息',680,80,100,95,'bed'),obj('shoes','拖鞋',848,197,48,28,'shoes'),obj('up','↑ 阁楼',880,68,62,60,'stairs'),obj('store','储物柜',334,480,78,48,'cabinet'),obj('rug','地毯',412,314,88,26,'rug'),obj('mirror','镜子',566,417,60,28,'mirror'),obj('tap','水龙头',657,520,44,42,'tap'),obj('bedroom3','锁住的日记',785,484,62,46,'desk'),obj('down','↓ 地下室',879,531,63,55,'stairs')],spawn:[120,520]},
 attic:{name:'阁楼 · 记忆与契约',code:'F3 / ATTIC',color:'#4a4336',rooms:[room('旧木楼梯',36,36,310,568,2),room('涂鸦墙',360,36,604,270),room('仪式间',360,322,604,282,2)],walls:[...walls,[346,36,12,200],[346,316,12,288],[358,308,155,12],[598,308,366,12]],objects:[obj('back','↓ 安全屋',62,493,63,64,'stairs'),obj('graffiti','墙上涂鸦',475,72,112,42,'runes'),obj('atticClock','阁楼钟表',825,176,45,45,'clock'),obj('altar','午夜仪式台',600,435,105,95,'altar'),obj('hatch','检修梯',215,92,65,52,'stairs')],spawn:[110,455]},
 basement:{name:'地下室 · 回声档案',code:'B1 / BASEMENT',color:'#283c40',rooms:[room('返程楼梯',36,36,268,568,1),room('巡检档案',316,36,310,268,2),room('配电走廊',316,318,310,286,1),room('契约室',640,36,324,568,0)],walls:[...walls,[304,36,12,204],[304,320,12,284],[626,36,12,260],[626,380,12,224],[316,304,106,12],[502,304,124,12]],objects:[obj('back','↑ 安全屋',65,495,65,62,'stairs'),obj('archive','巡检档案',412,90,108,55,'desk'),obj('fuse','熄灯开关',404,438,60,48,'fuse'),obj('contract','无名协议',772,126,82,52,'desk'),obj('lift','货梯',815,492,70,64,'stairs')],spawn:[112,455]},
 mirror:{name:'镜后空间 · 管理室',code:'F? / BETWEEN',color:'#31483f',rooms:[room('镜面回廊',36,36,300,568,1),room('管理员终端',350,36,614,568,0)],walls:[...walls,[336,36,12,240],[336,356,12,248]],objects:[obj('mirrorBack','返回镜面',62,278,55,84,'mirror'),obj('terminal','管理员终端',689,263,120,90,'terminal')],spawn:[165,320]}
};
const RADIUS=12;
function circleRect(x,y,r,o){const xx=Math.max(o.x,Math.min(x,o.x+o.w)),yy=Math.max(o.y,Math.min(y,o.y+o.h));return (x-xx)**2+(y-yy)**2<r*r;}
function blockers(floor){const m=MAPS[floor];return m.walls.map(([x,y,w,h])=>({x,y,w,h})).concat(m.objects.filter(o=>o.kind!=='rug'));}
function canStand(floor,x,y){return x>=RADIUS&&y>=RADIUS&&x<=1000-RADIUS&&y<=640-RADIUS&&!blockers(floor).some(o=>circleRect(x,y,RADIUS,o));}
function visible(floor,x,y,o){const tx=o.x+o.w/2,ty=o.y+o.h/2,n=Math.ceil(Math.hypot(tx-x,ty-y)/4);for(let i=1;i<n;i++){const px=x+(tx-x)*i/n,py=y+(ty-y)*i/n;if(MAPS[floor].walls.some(([wx,wy,w,h])=>px>wx&&px<wx+w&&py>wy&&py<wy+h))return false;}return true;}
function distance(x,y,o){return Math.hypot(x-Math.max(o.x,Math.min(x,o.x+o.w)),y-Math.max(o.y,Math.min(y,o.y+o.h)));}
function nearby(s){return MAPS[s.floor].objects.filter(o=>distance(s.x,s.y,o)<=55&&visible(s.floor,s.x,s.y,o)).sort((a,b)=>distance(s.x,s.y,a)-distance(s.x,s.y,b))[0]||null;}
function move(s,dx,dy){if(canStand(s.floor,s.x+dx,s.y))s.x+=dx;if(canStand(s.floor,s.x,s.y+dy))s.y+=dy;}
const api={MAPS,RADIUS,canStand,nearby,move,distance,visible};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TenantMaps=api;
})(typeof globalThis!=='undefined'?globalThis:this);
