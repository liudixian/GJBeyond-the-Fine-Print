/* Deterministic game rules. No DOM, network, or real-time timers. */
(function (root) {
'use strict';
const ACHIEVEMENTS = {
 qualified:['合格租客','连续 7 天遵守已知规则'], model:['模范租户','连续 30 天无异常'], silent:['沉默是金','连续 5 天正确回应敲门'], diary:['房东的日记','阅读卧室 3 的隐藏日记'], shortcuts:['捷径之王','解锁 5 条秘密通道'], hidden:['规则之外','验证一条未写在守则中的规则'], mirror:['镜中世界','进入镜后空间'], cat:['那是冰箱吗？','在午夜的冰箱中发现活猫'], curious:['好奇害死猫','违反同一条规则 3 次并存活'], loophole:['规则漏洞','隔着合上的窗帘驱逐访客'], midnight:['午夜狂欢','午夜同时反转牛奶、拖鞋与窗三项约束'], landlord:['鬼房东','违规后仍选择与王姨对话'], eyes:['不要睁眼','在地下室连续 10 次闭眼度过熄灯'], checkout:['退租','获得自由且不再返回'], infinite:['无限租约','解锁全部区域与通道后仍被困'], admin:['新管理员','推导规则起源并通过管理员考核']
};
const ENDINGS = {
 safe:['体面退租','普通而幸福的生活','一份录用通知，一本完好归位的须知。三十天的平静结束后，王姨签下退租单。七天后，三倍押金到账。城市的早晨终于只属于你。'],
 relay:['传火者','契约还会继续','新租客签下协议。你交出规则纸，独自离开。二楼的窗户里，另一个你正向新人微笑。你走出了公寓，却把循环留给了别人。'],
 breaker:['规则破解者','细则之外','午夜，鞋尖、牛奶与窗同时背离规定。你将这组矛盾交给原初契约，规则失去了约束对象。影子消散，镜子成为普通玻璃。'],
 truth:['房东的真相','自由是唯一的遗产','照片拼合，日记在午夜的仪式中翻到最后一页。王姨承认她也是曾经的租客。你叫出她的名字，解除代代转移的契约。你们一起走向黎明。'],
 guardian:['自愿留下','温柔的循环','一百天，你从未试图退租，也未违背规约。你接过了钥匙，成为规则的守护者。下一个租客来临时，你只轻声提醒：“拖鞋要摆正哦。”'],
 admin:['周目二：新管理员','现在，由你书写','你找到了规则的起源，完成了终端考核。屏幕不再称呼你为租客。你获得了管理权，也承担起镇压古老实体的责任。'],
 lost:['迷失','楼梯再也没有尽头','3:33 的水声已经停止，你还留在地下室。返回的楼梯将你送到另一段相同的楼梯。204 室从平面图上消失了。'],
 trap:['陷阱','不存在的接替者','你相信了“签字就能离开”的承诺。协议上没有新租客，只有你的名字被写了两遍。你成为契约的第二个担保人。'],
 trapped:['永远租客','房间记住了你','异常吞没了房间。门外响起你的声音，礼貌地请求入住。你终于明白，公寓从未打算让任何一个名字离开。']
};
const RULES = [
 '夜间不可从入户门离开；内部楼梯不属于入户门。', '家具不可随意移动；可以寻找无需搬动的通路。', '晚餐与早餐相同必须退回；早餐空奶瓶放回餐盘。', '卧室 3 是王姨的私人物品间，禁止进入。', '听见敲窗声不可拉帘或回应；午夜 0:00–1:00 不可开窗。', '镜子须洁净，用玄关柜里的蓝瓶与布擦拭。', '3:33–3:36 水龙头自动出水，不要进入厕所。', '植物不需要浇水。', '时钟停止时不要反复确认钟面。', '镜中出现你未做的动作，请停止模仿。', '拖鞋鞋尖朝外。矛盾时优先遵守前排规则。', '退租：须知原样放回鞋柜抽屉，完成检查后离开。'
];
function initial(){return {version:3, floor:'safe',x:120,y:520,facing:0, time:1100, anomaly:0,suspicion:0,attention:0,milk:2,milkTaken:false,drank:0,plantPours:0,plantUntil:0,windowOpen:false,curtainOpen:false,mirrorClean:false,shoesIn:false,flashlight:false,battery:3,cleaner:false,rulesRead:false,returned:false,bottle:false,meal:false,key:false,photo:false,diary:false,runes:false,origin:false,job:false,ad:false,ritual:false,broken:false,basementEver:false,basementDeadline:null,visited:['safe'],clues:[],hypotheses:[],achievements:[],shortcuts:[],violations:{},violationsTotal:0,cleanDays:0,silentDays:0,lastKnockDay:0,knockStreak:0,eyes:0,exam:0,attemptedExit:false,interactions:0,ending:null,logs:[{time:1100,text:'王姨留下钥匙：“先看门上的守则。屋里有楼梯，但地下室请留到深夜。”'}]};}
function minute(s){return s.time%1440;} function day(s){return Math.floor(s.time/1440)+1;} function midnight(s){return minute(s)<60;} function night(s){return minute(s)>=1080||minute(s)<360;}
function log(s,text){s.logs.unshift({time:s.time,text});s.logs=s.logs.slice(0,70);return text;}
function clue(s,id,text){if(!s.clues.includes(id)){s.clues.push(id);log(s,text);} }
function award(s,id){if(!s.achievements.includes(id))s.achievements.push(id);}
function finish(s,id){if(s.ending)return;s.ending=id;if(['safe','breaker','truth'].includes(id))award(s,'checkout');if(id==='admin')award(s,'admin');if(['lost','trap','trapped'].includes(id)&&s.visited.length===4&&s.shortcuts.length===5)award(s,'infinite');log(s,'结局：'+ENDINGS[id][0]);}
function violate(s,id,text,n=1){s.violations[id]=(s.violations[id]||0)+1;s.violationsTotal++;s.cleanDays=0;s.anomaly=Math.min(8,s.anomaly+n);s.suspicion=Math.min(6,s.suspicion+1);log(s,text);if(s.anomaly>=8)finish(s,'trapped');else if(s.violations[id]>=3)award(s,'curious');}
function advance(s,amount){if(s.ending)return;const old=s.time;s.time+=amount;if(s.floor==='basement'&&s.basementDeadline!==null&&s.time>=s.basementDeadline){finish(s,'lost');return;}const start=Math.floor(old/1440),end=Math.floor(s.time/1440);for(let d=start;d<=end;d++){if(old<d*1440+213&&s.time>=d*1440+213)log(s,'3:33，厕所开始出水。水声将在 3:36 停止。');if(old<d*1440+480&&s.time>=d*1440+480){const traces=(s.plantUntil>s.time?1:0)+(s.windowOpen?1:0)+(s.shoesIn?1:0);if(traces){s.suspicion=Math.min(6,s.suspicion+traces);log(s,'王姨晨检：她发现了 '+traces+' 处现场痕迹。');}}}}
function shortcut(s,id){if(!s.shortcuts.includes(id)){s.shortcuts.push(id);log(s,'秘密通道已解锁：'+id);if(s.shortcuts.length===5)award(s,'shortcuts');}}
function travel(s,floor,via){if(floor==='basement'){if(!s.key)return '仓库钥匙可以打开地下室。';if(!(minute(s)>=1380||minute(s)<213))return '地下室只在 23:00–次日 3:33 开放；可在时钟处等待。';}advance(s,2);if(s.ending)return '楼梯变了。';if(floor==='basement'){if(!(minute(s)>=1380||minute(s)<213))return '你到达楼梯时已经过了开放时间。';s.basementEver=true;s.basementDeadline=(Math.floor(s.time/1440)+(minute(s)>=1380?1:0))*1440+213;}else s.basementDeadline=null;s.floor=floor;const spawns={safe:[540,330],attic:[110,455],basement:[112,455],mirror:[165,320]};[s.x,s.y]=spawns[floor];if(!s.visited.includes(floor))s.visited.push(floor);if(floor==='mirror')award(s,'mirror');if(via)shortcut(s,via);return '你沿着通道来到'+{safe:'安全屋',attic:'阁楼',basement:'地下室',mirror:'镜后空间'}[floor]+'。';}
function safeSetup(s){const missing=[];if(!s.rulesRead)missing.push('阅读入住须知');if(!s.mirrorClean)missing.push('擦净镜子');if(s.shoesIn)missing.push('拖鞋朝外');if(s.windowOpen||s.curtainOpen)missing.push('关窗并合上窗帘');if(!s.bottle)missing.push('喝完或处理牛奶并归还空瓶');if(!s.meal)missing.push('退回重复晚餐');if(s.plantUntil>s.time)missing.push('等植物恢复');if(s.anomaly)missing.push('静坐降低异常');return missing;}
function normalExitMissing(s){return [...safeSetup(s),...(!s.job?['在书桌寻找工作']:[]),...(s.cleanDays<30?['累计 30 天合规生活']:[]),...(s.basementEver?['本周目已进入地下室，请改走破解或真相路线']:[]),...(!s.returned?['须知放回鞋柜']:[]),...(night(s)?['等到白天']:[])];}
function options(s,id){const a=(key,label,desc='',enabled=true)=>({key,label,desc,enabled});switch(id){
 case 'door':return [a('read','阅读并取下入住须知','获得守则，露出猫眼'),a('peek','通过猫眼观察','观察本日敲门节奏',s.rulesRead),a('knock','按听见的节奏回应','每天最多记录一次'),a('talk','隔门与王姨说话'),a('checkout','申请正常退租','查看条件；会记录为一次退租尝试'),a('handoff','把协议交给新租客','需要发布招租信息',s.ad),a('openDoor','夜间试着开门','夜间违反首条规则')];
 case 'cabinet':return [a('supplies','取蓝瓶清洁剂与布'),a('return','把须知原样放回','需要先阅读',s.rulesRead)];
 case 'fridge':return [a('milk','取牛奶并看瓶底','每周目两口，不会重复补充',!s.milkTaken),a('drink','喝一口','剩余 '+s.milk+' 口',s.milkTaken&&s.milk>0),a('fridgeLook','看冰箱深处','灯闪三次时再看一眼')];
 case 'tray':return [a('meal','退回重复晚餐','早晚都是同一碗粥'),a('bottle','归还空奶瓶','牛奶必须用完',s.milkTaken&&s.milk===0)];
 case 'plant':return [a('plantLook','观察叶片方向'),a('pour','倒一口牛奶','第一口无变化；第二口留下痕迹',s.milkTaken&&s.milk>0)];
 case 'window':return [a('windowLook','听窗外的敲击'),a('curtain',s.curtainOpen?'合上窗帘':'拉开窗帘'),a('window',s.windowOpen?'关窗':'打开窗户'),a('flash','隔着窗帘照手电','电量 '+s.battery+' 次',s.flashlight&&s.battery>0)];
 case 'mirror':return [a('clean','用蓝瓶与布擦镜子','清洁工具可重复使用',s.cleaner),a('reflection','观察倒影'),a('imitate','模仿镜中动作','会留下异常'),a('mirrorGate','进入镜后空间','镜面洁净 + 原初法则',s.mirrorClean&&s.runes)];
 case 'tap':return [a('tap','检查水龙头','3:33–3:36 靠近水源会触发异常')];
 case 'shoes':return [a('shoeNote','看鞋底纸条'),a('shoes',s.shoesIn?'把鞋尖朝外':'把鞋尖朝内')];
 case 'bed':return [a('rest','静坐 20 分钟','异常 −1，警觉 −1'),a('days7','按已验证流程生活 7 天','需完整整理现场；按日结算'),a('days30','按已验证流程生活 30 天','保留原策划天数，压缩重复生活'),a('days100','按已验证流程生活 100 天','用于长期守护者路线'),a('guardian','自愿留下','100 天合规、从未违规或尝试退租')];
 case 'desk':return [a('notes','整理观察与假设'),a('origin','关联规则起源','日记 + 半张照片 + 原初法则',s.diary&&s.photo&&s.runes),a('job','查看招聘并接受工作'),a('ad','发布招租信息','需要探索表层秘密',s.rulesRead&&s.photo&&s.clues.includes('milk')&&s.clues.includes('reflection'))];
 case 'clock':case 'atticClock':return [a('wait10','等待 10 分钟'),a('waitMidnight','等待下一个 00:00','只推进时间，不改变物品'),a('waitMorning','等待下一个 08:00'),a('sync','在午夜同步反向规则','原初法则 + 起源推导 + 喝光牛奶 + 鞋尖朝内 + 窗打开')];
 case 'store':return [a('store','查看储物柜','取得半张照片、一把旧钥匙与手电筒')];
 case 'bedroom3':return [a('diary','用旧钥匙打开日记抽屉','违反卧室禁令；获得重要线索',s.key),a('wallPass','打开墙后窄梯','秘密通道 → 阁楼',s.diary)];
 case 'rug':return [a('rugLook','掀开地毯','发现跳房子格线'),a('hopWrong','按 1 → 2 → 3 踩格','错误会增加异常',s.clues.includes('rug')),a('hop','按 2 → 0 → 4 踩格','从门牌与照片推导',s.photo&&s.clues.includes('rug')),a('rugPass','进入地毯下通道','地下室；仍须遵守返程时间',s.shortcuts.includes('地毯暗道'))];
 case 'up':return [a('up','走楼梯去阁楼','旧钥匙打开顶层门',s.key)];case 'down':return [a('down','走楼梯去地下室','23:00–3:33；需要旧钥匙',s.key)];
 case 'back':return [a('back','沿楼梯返回安全屋')];
 case 'graffiti':return [a('runes','读墙上涂鸦','原初契约与午夜仪式')];
 case 'altar':return [a('altarLook','检查仪式台'),a('ritual','午夜呼唤房东的名字','日记 + 照片 + 起源推导；0:00–1:00'),a('truth','与房东一起解除契约','需完成仪式',s.ritual)];
 case 'hatch':return [a('hatch','解开阁楼检修梯','秘密通道 → 安全屋')];
 case 'archive':return [a('archive','读地下室巡检簿','确认 3:33 返程时限与密室入口')];
 case 'fuse':return [a('eyes','灯灭时闭眼数到十','每次耗时 2 分钟；连续 10 次获成就'),a('stare','睁眼看黑暗','中断闭眼连续次数')];
 case 'contract':return [a('contract','读没有署名的协议'),a('sign','相信承诺并签字','将立即结束本周目')];
 case 'lift':return [a('lift','修复货梯并回安全屋','第 4 条秘密通道')];
 case 'terminal':return [a('terminalRead','阅读管理员终端'),a('examWrong','回答：规则只是为了收租','错误推断会重置考核'),a('exam','回答：规则用于镇压实体','需完成起源推导',s.origin),a('exam2','回答：管理员也受契约约束','第二项考核',s.exam===1),a('exam3','回答：接管而非转嫁给下一位租客','通过考核并结束本周目',s.exam===2)];
 case 'mirrorBack':return [a('mirrorBack','穿过镜面回安全屋')];
 default:return [];
}}
function describe(s,id){const texts={door:'猫眼上盖着入住须知。门外偶尔传来敲击：短、短、长。墙上的 204 门牌有一道旧划痕。',cabinet:'玄关柜第二层是一瓶蓝色液体和一块布。最下方抽屉留着一张过塑纸的压痕。',fridge:'冰箱里是一瓶牛奶。便利贴要求归还空瓶；瓶底写着：第二次浇灌后，叶片会显出隐藏箭头。',tray:'早餐是白粥，晚餐仍然是白粥。餐盘上有一个空瓶的圆形凹槽。',plant:s.plantUntil>s.time?'叶片整齐地指着窗外。土里的奶渍尚未干。':'叶片静止，土壤干燥。旁边的标签写着“植物不需要浇水”。',window:'帘外三下敲击。守则禁止回应和拉帘，但没有禁止隔着帘布照光。',mirror:s.mirrorClean?'镜面洁净。你的倒影似乎知道房间另一侧有什么。':'镜面浮着污渍，用普通手掌擦不掉。',tap:'管道贴着时间牌：3:33–3:36。声音来临前可以返回走廊。',shoes:'鞋底纸片：“归途朝外，反向朝内。午夜三件物品同时背离约定，契约将失去对象。”',bed:'移动与阅读不会走时；每次实际行动消耗游戏分钟。可在这里恢复，或模拟已经掌握的每日生活。',desk:'旧电脑连着招聘与招租网站。桌上还有一本用于关联证据的心理笔记。',clock:'这是等待点，不是时间机器。等待会跨过每日事件，地下室里等待也会消耗返程余量。',store:'锁孔没有上锁。柜里有半张写着“204”的合影、一把旧钥匙和手电筒。',bedroom3:'门牌写着“卧室 3”。王姨说里面都是她的私人物品。旧钥匙似乎能打开门。',rug:'地毯压住了一组跳房子数字。柜子挡住了通道，格线却从下面穿过。',up:'木楼梯通向阁楼。门上挂着与仓库钥匙同样形状的铜锁。',down:'楼梯向下伸进黑暗。告示：23:00 开放，务必在 3:33 前回到安全屋。',back:'这是可返回的楼梯。每次楼层移动耗时 2 分钟。',graffiti:'墙上涂鸦：“规则并非自然规律。它们是管理员用于镇压实体的契约；照片为锚，名字为钥，午夜为门。”',atticClock:'钟摆摆到十二的位置。仪式在 0:00–1:00 生效，移动与阅读不会消耗窗口。',altar:'圆形仪式台中央留着照片的轮廓。三处凹槽分别刻着：记忆、姓名、起源。',hatch:'木板下藏着检修梯，可以直接回到安全屋。',archive:'巡检簿：入口每天关闭于 3:33，不论你走楼梯、暗道还是货梯。镜面是另一种门，先擦净它，再读原初法则。',fuse:'灯每两分钟熄灭一次。闭上眼睛数到十，走廊里的东西就会错过你。',contract:'“我已经替你找好新租客。只需在此签字。”签名栏下面还有一个写着你名字的担保栏。',lift:'废弃货梯上只有“204”一个按钮。接回保险丝即可恢复通行。',terminal:'管理员终端。考核需要知道：谁创造规则、规则镇压什么、接管者承担什么。',mirrorBack:'镜面另一侧是熟悉的客厅。返回不会清除已经发生的违规。'};return texts[id]||'这里仍有线索。';}
function execute(s,object,key){if(s.ending)return {ok:false,text:'本周目已结束。'};const op=options(s,object).find(o=>o.key===key);if(!op||!op.enabled)return {ok:false,text:'当前条件未满足。'};const before=s.achievements.length;s.interactions++;let text='',cost=2,sound='paper';switch(key){
 case 'read':s.rulesRead=true;clue(s,'rules','你完整读过守则，猫眼露了出来。');text=RULES.join('\n');break;
 case 'peek':text='王姨走向楼梯。今日敲门节奏：短、短、长。';sound='knock';break;
 case 'knock':if(s.lastKnockDay!==day(s)){s.knockStreak=s.lastKnockDay===day(s)-1?s.knockStreak+1:1;s.lastKnockDay=day(s);s.silentDays=Math.max(s.silentDays,s.knockStreak);}if(s.silentDays>=5)award(s,'silent');clue(s,'knock','门外脚步离去。敲门与敲窗属于不同来访者。');text='你在门内复刻“短、短、长”，没有先开口。';sound='knock';break;
 case 'talk':if(s.violationsTotal)award(s,'landlord');s.suspicion=Math.max(0,s.suspicion-1);text=s.diary?'王姨低声说：“把照片带去阁楼，在午夜叫我的名字。”':'“卧室 3 是我的房间。别碰那本日记。”';break;
 case 'supplies':s.cleaner=true;text='取到蓝瓶与布，可重复使用。';break;
 case 'return':s.returned=true;text='须知原样放回鞋柜抽屉。';break;
 case 'checkout':s.attemptedExit=true;{const missing=normalExitMissing(s);if(missing.length)text='尚未满足：'+missing.join('；');else {finish(s,'safe');text='王姨接受退租申请。';}}break;
 case 'handoff':finish(s,'relay');text='新租客签下协议。';break;
 case 'openDoor':s.attemptedExit=true;if(night(s))violate(s,'door','夜间开门，门外的东西记住了你的脚步。',2);text=night(s)?'你重新关上门。':'白天街道很正常；离开公寓仍需办理退租。';sound='door';break;
 case 'milk':s.milkTaken=true;clue(s,'milk','瓶底：第二次牛奶浇灌会使植物显出方向，半小时后恢复。');text='取出两口牛奶。';sound='water';break;
 case 'drink':s.milk--;s.drank++;text='你喝掉一口牛奶，剩 '+s.milk+' 口。';sound='water';break;
 case 'fridgeLook':if(midnight(s)){award(s,'cat');text='一只活猫蹲在冰箱里，冲你叫了一声，然后穿过冰箱背板。';sound='cat';}else text='灯闪三次。冷藏室内留着一根猫毛。午夜再看也许不同。';break;
 case 'meal':s.meal=true;text='你退回重复晚餐，王姨换来一份面条。';break;
 case 'bottle':s.bottle=true;text='空瓶归还餐盘。';break;
 case 'plantLook':text=s.plantUntil>s.time?'叶片指着窗户，奶渍会在 '+(s.plantUntil-s.time)+' 分钟后干掉。':'植物没有动作。';if(s.plantUntil>s.time){clue(s,'plant','观察证据：第二次浇奶让植物指向窗户。');s.hypotheses.includes('plant')||s.hypotheses.push('plant');award(s,'hidden');}break;
 case 'pour':s.milk--;s.plantPours++;sound='water';if(s.plantPours===2){s.plantUntil=s.time+30;violate(s,'plant','第二口奶让叶片突然扭向窗户，地上留下湿痕。');text='植物发生变化。现在可以观察它。';}else text='第一口牛奶消失在土里，暂时没有变化。';break;
 case 'windowLook':text=s.plantUntil>s.time?'窗外敲击与叶片颤动同步。':'敲击来自帘布的另一侧。';clue(s,'window','敲窗时不拉帘，但可以隔帘照光。');sound='knock';break;
 case 'curtain':s.curtainOpen=!s.curtainOpen;if(s.curtainOpen)violate(s,'curtain','你拉开帘布，窗外确认了屋内的人。');text=s.curtainOpen?'帘布拉开。':'帘布合上。';sound='cloth';break;
 case 'window':s.windowOpen=!s.windowOpen;if(s.windowOpen&&midnight(s))violate(s,'window','你在午夜开窗，屋子开始回声。');text=s.windowOpen?'窗打开了。':'窗关闭了。';sound='door';break;
 case 'flash':s.battery--;s.attention=Math.max(0,s.attention-1);s.anomaly=Math.max(0,s.anomaly-1);if(!s.curtainOpen)award(s,'loophole');text='光穿过帘布，敲击停止。电量剩 '+s.battery+' 次。';sound='magic';break;
 case 'clean':s.mirrorClean=true;text='蓝瓶液体抹去污渍，镜面恢复平整。';sound='cloth';break;
 case 'reflection':clue(s,'reflection',s.mirrorClean?'干净的倒影映出另一道门：需要阁楼原初法则。':'污渍遮住了倒影，先找到蓝瓶。');text=s.mirrorClean?'倒影慢半拍，门在镜面后。':'镜面需要清洁。';break;
 case 'imitate':violate(s,'mirror','你模仿了倒影，镜子多出一张脸。',2);text='你停止了模仿。';sound='danger';break;
 case 'mirrorGate':text=travel(s,'mirror','镜面入口');cost=0;sound='magic';break;
 case 'tap':if(minute(s)>=213&&minute(s)<216)violate(s,'tap','你在禁止时段触碰流水，水声进入耳内。',2);text='水牌上写着：3:33–3:36，不要入内。';sound='water';break;
 case 'shoeNote':clue(s,'shoes','午夜反向条件：亲自喝光两口奶、鞋尖朝内、窗打开，然后在时钟同步。');text='鞋底纸片已记入笔记。';break;
 case 'shoes':s.shoesIn=!s.shoesIn;if(s.shoesIn)violate(s,'shoes','鞋尖朝内，走廊传来一声吸气。');text=s.shoesIn?'鞋尖已朝内。':'鞋尖已朝外。';break;
 case 'rest':s.anomaly=Math.max(0,s.anomaly-1);s.suspicion=Math.max(0,s.suspicion-1);cost=20;text='你静坐片刻，恢复了一分平静。违规历史仍被保留。';sound='rest';break;
 case 'days7':case 'days30':case 'days100':{const missing=safeSetup(s);cost=0;if(missing.length){text='无法开始生活模拟：'+missing.join('；');break;}const n=Number(key.slice(4));for(let i=0;i<n;i++){advance(s,1440);s.cleanDays++;s.knockStreak++;s.lastKnockDay=day(s);s.silentDays=Math.max(s.silentDays,s.knockStreak);s.suspicion=Math.max(0,s.suspicion-1);}if(s.cleanDays>=7)award(s,'qualified');if(s.cleanDays>=30)award(s,'model');if(s.silentDays>=5)award(s,'silent');text='按已验证流程逐日回应敲门、归还空瓶、检查晚餐与家具，完成 '+n+' 天合规生活。';sound='rest';break;}
 case 'guardian':if(s.cleanDays>=100&&!s.attemptedExit&&!s.violationsTotal)finish(s,'guardian');else text='需 100 天合规生活，且整个周目从未违规或尝试退租。';break;
 case 'notes':text='记录：'+(s.clues.join('、')||'尚无')+'。起源推导需要：日记、照片、原初法则。';break;
 case 'origin':s.origin=true;s.hypotheses.includes('origin')||s.hypotheses.push('origin');award(s,'hidden');text='你推导出：王姨创造规则是为了镇压实体，她本人也被契约束缚。';break;
 case 'job':s.job=true;text='你接受了一份远程工作。录用通知已放进口袋。';break;
 case 'ad':s.ad=true;text='新租客回应了广告。在入户门确认交接将结束本周目。';break;
 case 'wait10':cost=10;text='你等待十分钟。';sound='clock';break;
 case 'waitMidnight':cost=1440-minute(s);text='你等待下一个午夜。';sound='clock';break;
 case 'waitMorning':cost=(480-minute(s)+1440)%1440||1440;text='你等待下一个清晨。';sound='clock';break;
 case 'sync':if(midnight(s)&&s.runes&&s.origin&&s.drank===2&&s.shoesIn&&s.windowOpen){s.broken=true;s.anomaly=0;award(s,'midnight');finish(s,'breaker');text='三项反向状态同时成立。契约被解除。';sound='ending';}else text='还缺少同步条件：午夜、原初法则、起源推导、亲自喝光两口奶、鞋尖朝内、窗打开。';break;
 case 'store':s.key=true;s.photo=true;s.flashlight=true;clue(s,'photo','照片背面写着 204，正面是一位年轻的王姨。');text='取得照片、钥匙和三格电量的手电筒。';break;
 case 'diary':if(!s.diary)violate(s,'bedroom','你进入了卧室 3，打破房东的禁令。');s.diary=true;award(s,'diary');clue(s,'diary','王姨日记：“我曾是租客。我叫王秀兰。契约在阁楼，终端在镜后。”');text='日记中的名字是王秀兰。';break;
 case 'wallPass':text=travel(s,'attic','卧室墙梯');cost=0;sound='door';break;
 case 'rugLook':clue(s,'rug','地毯格线对应三个数字，照片和门牌都指向同一房号。');text='格线露出，家具没有移动。';break;
 case 'hopWrong':violate(s,'rug','错误的脚步让格线倒转。');text='入口没有打开。';sound='danger';break;
 case 'hop':shortcut(s,'地毯暗道');award(s,'loophole');text='2、0、4。家具保持原位，地毯下出现暗道。';sound='magic';break;
 case 'rugPass':text=travel(s,'basement');cost=0;sound='door';break;
 case 'up':text=travel(s,'attic');cost=0;sound='door';break;
 case 'down':text=travel(s,'basement');cost=0;sound='door';break;
 case 'back':case 'mirrorBack':text=travel(s,'safe');cost=0;sound='door';break;
 case 'runes':s.runes=true;clue(s,'runes','原初法则：记忆、姓名、起源，午夜相遇；反向状态能解除契约。');text='原初法则已抄入笔记。';break;
 case 'altarLook':text='需要照片、房东日记、在安全屋书桌完成起源推导，最后于午夜呼唤姓名。';break;
 case 'ritual':if(midnight(s)&&s.diary&&s.photo&&s.origin){s.ritual=true;text='你叫出王秀兰的名字，她出现在仪式边缘。现在可以选择帮助她解脱。';sound='magic';}else text='仪式未响应：需要午夜 0:00–1:00、日记、照片与起源推导。';break;
 case 'truth':finish(s,'truth');text='你和王姨一起撕下了契约的最后一页。';sound='ending';break;
 case 'hatch':text=travel(s,'safe','阁楼检修梯');cost=0;sound='door';break;
 case 'archive':clue(s,'archive','地下室返程截止 3:33；镜后终端需要起源推导。');text='巡检簿已记入笔记，务必留出两分钟返程。';break;
 case 'eyes':s.eyes++;if(s.eyes>=10)award(s,'eyes');text='灯灭，闭眼数到十。平安度过 '+s.eyes+' 次。';sound='rest';break;
 case 'stare':s.eyes=0;violate(s,'dark','你在灯灭后睁眼，黑暗中的东西看见了你。');text='连续闭眼计数清零。';sound='danger';break;
 case 'contract':clue(s,'contract','地下室接替协议的担保人还是你，这是一场骗局。');text='没有新租客签名，只有你的名字。';break;
 case 'sign':finish(s,'trap');text='签名落下，楼梯消失。';sound='danger';break;
 case 'lift':text=travel(s,'safe','地下货梯');cost=0;sound='door';break;
 case 'terminalRead':clue(s,'terminal','管理员必须理解镇压对象、契约约束和接管责任。');text='考核分三项，答案藏在日记与原初法则里。';break;
 case 'examWrong':s.exam=0;text='终端拒绝了答案：日记记录的恐惧并非来自租金。考核重置，请先关联证据。';sound='danger';break;
 case 'exam':s.exam=1;text='第一项通过：规则镇压实体。';sound='magic';break;
 case 'exam2':s.exam=2;text='第二项通过：管理员也受约束。';sound='magic';break;
 case 'exam3':s.exam=3;finish(s,'admin');text='考核完成，管理权转移。';sound='ending';break;
 }
 if(text)log(s,text);advance(s,cost);return {ok:true,text,sound,earned:s.achievements.slice(before)};
}
const API={initial,options,describe,execute,minute,day,midnight,night,advance,travel,safeSetup,normalExitMissing,ACHIEVEMENTS,ENDINGS,RULES};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.Tenant=API;
})(typeof globalThis!=='undefined'?globalThis:this);
