(function initBatallaMision(global) {
  const BATALLA_MISION_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>SHINOBI EVOLUTION</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background: #050308;
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; overflow: hidden;
  font-family: 'Arial Black', Impact, sans-serif;
}
#wrapper {
  position: relative; width: 460px; height: 360px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255,120,0,0.25),
    0 0 30px rgba(255,80,0,0.3),
    0 0 80px rgba(120,0,255,0.15);
}
canvas { position:absolute; top:0; left:0; display:block; }
#veil {
  position: absolute; top:0; left:0; width:100%; height:100%;
  pointer-events: none; z-index: 8;
  background: rgba(0,0,0,0);
  transition: background 0.2s ease;
}
#winner-screen {
  position: absolute; top:0; left:0; width:100%; height:100%;
  display: none; flex-direction: column;
  justify-content: center; align-items: center;
  z-index: 20;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%);
}
#win-banner {
  border-top: 1px solid rgba(255,200,0,0.4);
  border-bottom: 1px solid rgba(255,200,0,0.4);
  padding: 12px 40px;
  text-align: center;
  animation: winPulse 0.8s ease-in-out infinite alternate;
}
#win-label { font-size: 10px; letter-spacing: 6px; color: #AA8800; margin-bottom: 4px; }
#win-name {
  font-size: 42px; font-weight: 900; letter-spacing: 5px;
  text-transform: uppercase;
  -webkit-text-stroke: 1px rgba(255,200,0,0.5);
}
#win-sub { font-size: 11px; letter-spacing: 4px; color: #888; margin-top: 6px; }
#btn-restart {
  margin-top: 22px; padding: 9px 28px;
  background: transparent;
  border: 1px solid rgba(255,180,0,0.5);
  color: #FFD700; font-size: 11px; letter-spacing: 3px;
  cursor: pointer; text-transform: uppercase;
  transition: all 0.2s;
}
#btn-restart:hover {
  background: rgba(255,180,0,0.15);
  border-color: rgba(255,180,0,0.9);
}
@keyframes winPulse {
  from { filter: drop-shadow(0 0 8px rgba(255,200,0,0.3)); }
  to   { filter: drop-shadow(0 0 25px rgba(255,200,0,0.7)); }
}
</style>
</head>
<body>
<div id="wrapper">
  <canvas id="canvas" width="460" height="360" style="z-index:2;"></canvas>
  <div id="veil"></div>
  <div id="winner-screen">
    <div id="win-banner">
      <div id="win-label">VENCEDOR</div>
      <div id="win-name" style="color:#FFD700;">UZUMAKI</div>
      <div id="win-sub">★ &nbsp; VICTORIA &nbsp; ★</div>
    </div>
    <button id="btn-restart" onclick="startGame()">▶ &nbsp; NUEVA BATALLA</button>
  </div>
</div>

<script>
// ═══════════════════════════════════════════════════
//  SHINOBI EVOLUTION — Complete Combat Engine
// ═══════════════════════════════════════════════════
const W = 460, H = 360;
const GROUND = H - 50;          // ground Y level
const G = 0.44;                  // gravity per frame
const SC = 0.70;                 // sprite scale
const NW = Math.round(30 * SC); // ninja width  ≈21
const NH = Math.round(50 * SC); // ninja height ≈35

const canvas   = document.getElementById('canvas');
const ctx      = canvas.getContext('2d');
const veil     = document.getElementById('veil');
const winScreen= document.getElementById('winner-screen');
const winName  = document.getElementById('win-name');

let particles  = [];
let damageNums = [];
let jutsus     = [];
let fighters   = [];
let hitStop    = 0;
let slowMo     = 1;
let frameN     = 0;
let gameOver   = false;

let shakeX=0, shakeY=0, shakeDur=0, shakeAmp=0;
let critFlash  = 0;
let jutsuVeil  = 0;
let bgMountains, bgTrees, bgStars;

class Particle { constructor(x,y,vx,vy,color,life,size,type){ this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.color=color; this.life=life; this.maxLife=life; this.size=size; this.type=type; this.alpha=1; this.rot=Math.random()*Math.PI*2; this.rotS=(Math.random()-.5)*.15; this.grav = (type==='spark'||type==='dust') ? G*.45 : 0; } update(dt){ this.x+=this.vx*dt; this.y+=this.vy*dt; this.vy+=this.grav*dt; if(this.type==='smoke'){this.vx*=.97;this.vy*=.97;this.size+=.35*dt;} if(this.type==='leaf'){ this.vx=Math.sin(frameN*.025+this.x*.08)*.7; this.vy+=.025*dt; this.rot+=this.rotS*dt; } this.life-=dt; this.alpha=Math.max(0,this.life/this.maxLife);} draw(ctx){ if(this.alpha<=0||this.size<=0) return; ctx.save(); ctx.globalAlpha=this.alpha; ctx.fillStyle=this.color; if(this.type==='leaf'){ ctx.translate(this.x,this.y); ctx.rotate(this.rot); ctx.fillRect(-this.size,-this.size*.4,this.size*2,this.size*.8);} else { ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); } ctx.restore(); } isDead(){ return this.life<=0||(this.type==='smoke'&&this.size>45); } }
class DamageNum { constructor(x,y,val,crit){ this.x=x; this.y=y; this.val=Math.round(val); this.crit=crit; this.vx=(Math.random()-.5)*2.5; this.vy=-4.5; this.life=60; this.maxLife=60;} update(dt){ this.x+=this.vx*dt; this.vy+=.18*dt; this.y+=this.vy*dt; this.life-=dt; } isDead(){ return this.life<=0; } draw(ctx){ const a=Math.max(0,this.life/this.maxLife); const sz=this.crit?15:11; ctx.save(); ctx.globalAlpha=a; ctx.font=\`bold \${sz}px Arial Black\`; ctx.textAlign='center'; ctx.strokeStyle='#000'; ctx.lineWidth=3.5; ctx.strokeText(this.val,this.x,this.y); ctx.fillStyle=this.crit?'#FFE040':'#FF6644'; ctx.fillText(this.val,this.x,this.y); if(this.crit){ ctx.font='bold 7px Arial'; ctx.fillStyle='#FFFACC'; ctx.fillText('CRÍTICO!',this.x,this.y-13); } ctx.restore(); } }
class Jutsu { constructor(x,y,vx,vy,owner){ this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.owner=owner; this.color=owner.glowColor; this.size=9; this.life=200; this.dead=false; this.trail=[]; this.id=Math.random();} update(dt){ this.trail.unshift({x:this.x,y:this.y}); if(this.trail.length>12) this.trail.pop(); this.x+=this.vx*dt; this.y+=this.vy*dt; this.life-=dt; if(this.x<-12||this.x>W+12||this.y<-12||this.y>H+12||this.life<=0) this.dead=true; if(Math.random()<.35) particles.push(new Particle(this.x,this.y,(Math.random()-.5)*1.5,(Math.random()-.5)*1.5,this.color,10,2,'spark')); } draw(ctx){ for(let i=0;i<this.trail.length;i++){ const t=this.trail[i]; const r=this.size*(1-i/this.trail.length)*.9; if(r<=0) continue; ctx.save(); ctx.globalAlpha=(1-i/this.trail.length)*.55; ctx.fillStyle=this.color; ctx.beginPath(); ctx.arc(t.x,t.y,r,0,Math.PI*2); ctx.fill(); ctx.restore(); } const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size*2.2); g.addColorStop(0,'#FFFFFF'); g.addColorStop(.35,this.color); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.save(); ctx.globalAlpha=.92; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(this.x,this.y,this.size*2.2,0,Math.PI*2); ctx.fill(); ctx.restore(); } }
class Fighter { constructor(x,id){ this.id=id; this.x=x; this.y=GROUND-NH; this.vx=0; this.vy=0; this.onGround=true; this.facingRight=(id===0); this.name=id===0?'UZUMAKI':'UCHIHA'; this.color=id===0?'#E8A030':'#6855CC'; this.glowColor=id===0?'#FF8C00':'#9932CC'; this.skinColor=id===0?'#F5C09A':'#D8C8E8'; this.hp=100; this.maxHp=100; this.dashTimer=0; this.dashInterval=800; this.tX=x; this.tY=GROUND-NH; this.atkCD=0; this.jutsuCD=0; this.shieldTime=0; this.shieldBroken=false; this.shieldBreakTimer=0; this.dmgBurst=0; this.dmgBurstTimer=0; this.defBreak=false; this.defBreakTimer=0; this.stunTimer=0; this.invincible=false; this.invTimer=0; this.flashTimer=0; this.animF=0; this.animT=0; this.trail=[]; this.isDead=false; this.deathT=0; this.deathSmoke=0; this.winnerFlag=false; }
get cx(){ return this.x+NW/2; } get cy(){ return this.y+NH/2; }
receiveHit(rawDmg, fromX, attacker){ if(this.isDead||this.invincible) return; if(Math.random()<.15&&this.stunTimer<=0){ this.doKawarimi(attacker); return; } let dmg=rawDmg; const canShield=!this.shieldBroken&&!this.defBreak&&this.shieldTime<2000; if(canShield&&Math.random()<.30){ dmg=rawDmg*.30; this.shieldTime+=500; spawnSparks(this.cx,this.cy,6,'#88CCFF'); if(this.shieldTime>=2000){ this.shieldBroken=true; this.shieldBreakTimer=90; this.shieldTime=0; this.stunTimer=35; spawnSparks(this.cx,this.cy,12,'#44AAFF'); } } this.dmgBurst+=rawDmg; if(this.dmgBurst>=this.maxHp*.15){ this.defBreak=true; this.defBreakTimer=90; this.dmgBurst=0; for(let i=0;i<8;i++) particles.push(new Particle(this.cx,this.cy-NH*.5,(Math.random()-.5)*4,-3-Math.random()*2,'#FF0000',28,3,'spark')); } this.hp=Math.max(0,this.hp-dmg); const isCrit=rawDmg>=14; damageNums.push(new DamageNum(this.cx+(Math.random()-.5)*8,this.y-5,dmg,isCrit)); const dir=(fromX<this.cx)?1:-1; const clr=isCrit?'#FFD700':'#FF4422'; for(let i=0;i<(isCrit?16:9);i++){ const ang=(Math.random()-.5)*Math.PI*.85+(dir>0?0:Math.PI); const spd=2+Math.random()*5; particles.push(new Particle(this.cx,this.cy,Math.cos(ang)*spd,Math.sin(ang)*spd-1,clr,18+Math.random()*10,2+Math.random()*2,'spark')); } this.vx+=dir*11; this.flashTimer=18; this.stunTimer=22; hitStop=3; triggerShake(isCrit?6:2, isCrit?20:9); if(isCrit) critFlash=2; if(this.hp<=0&&!this.isDead) this.die(); }
doKawarimi(attacker){ const behind=attacker.facingRight?attacker.x-NW-28:attacker.x+NW+28; const nx=Math.max(5,Math.min(W-NW-5,behind)); spawnSmoke(this.cx,this.cy,18); this.x=nx; this.y=GROUND-NH; this.vx=0; this.vy=0; this.onGround=true; this.invincible=true; this.invTimer=35; spawnSmoke(this.cx,this.cy,12); triggerShake(2,6); }
launchJutsu(target){ if(this.jutsuCD>0) return; this.jutsuCD=90; const dx=target.cx-this.cx, dy=target.cy-this.cy; const d=Math.sqrt(dx*dx+dy*dy); const spd=5; jutsus.push(new Jutsu(this.cx,this.cy,(dx/d)*spd,(dy/d)*spd,this)); spawnSparks(this.cx,this.cy,14,this.glowColor); jutsuVeil=30; veil.style.background='rgba(0,0,0,0.22)'; triggerShake(6,14); this.flashTimer=8; }
die(){ this.isDead=true; slowMo=0.16; gameOver=true; const winner=fighters.find(f=>!f.isDead); setTimeout(()=>showWinner(winner?winner.name:'???'),2600); }
update(dt,dms,enemy){ if(this.isDead){ this.deathT+=dt; this.deathSmoke=Math.min(1,this.deathT*.09); if(this.deathT%6<1) spawnSmoke(this.cx+(Math.random()-.5)*NW,this.cy+(Math.random()-.5)*NH,3); return; } if(hitStop>0) return; if(this.flashTimer>0) this.flashTimer-=dt; if(this.stunTimer>0) this.stunTimer-=dt; if(this.atkCD>0) this.atkCD-=dt; if(this.jutsuCD>0) this.jutsuCD-=dt; if(this.invTimer>0){ this.invTimer-=dt; if(this.invTimer<=0) this.invincible=false; } if(this.defBreakTimer>0){ this.defBreakTimer-=dt; if(this.defBreakTimer<=0) this.defBreak=false; } if(this.shieldBreakTimer>0){ this.shieldBreakTimer-=dt; if(this.shieldBreakTimer<=0) this.shieldBroken=false; } if(this.shieldTime>0) this.shieldTime=Math.max(0,this.shieldTime-dms); this.dmgBurstTimer+=dms; if(this.dmgBurstTimer>=2000){ this.dmgBurstTimer=0; this.dmgBurst=0; } if(!this.onGround) this.vy+=G*dt; this.x+=this.vx*dt; this.y+=this.vy*dt; this.vx*=.87; if(this.y>=GROUND-NH){ this.y=GROUND-NH; this.vy=0; this.onGround=true; } else this.onGround=false; if(this.y<4){ this.y=4; this.vy=0; } if(this.x<=3){ this.x=3; this.vx=4.5; if(this.onGround){this.vy=-9;this.onGround=false;} } if(this.x>=W-NW-3){ this.x=W-NW-3; this.vx=-4.5; if(this.onGround){this.vy=-9;this.onGround=false;} } this.facingRight=enemy.cx>this.cx; if(this.stunTimer>0) return; this.dashTimer+=dms; if(this.dashTimer>=this.dashInterval){ this.dashTimer=0; const aerial=Math.random()<.38; this.tX=22+Math.random()*(W-44-NW); this.tY=aerial ? GROUND-NH-55-Math.random()*130 : GROUND-NH; } const tdx=this.tX-this.x, tdy=this.tY-this.y; const tLen=Math.sqrt(tdx*tdx+tdy*tdy); if(tLen>8){ this.vx+=(tdx/tLen)*5*.26; if(tdy<-22&&this.onGround){ this.vy=-11; this.onGround=false; } } this.animT+=dt; if(this.animT>3){ this.animT=0; this.animF=(this.animF+1)%4; const spd=Math.abs(this.vx)+Math.abs(this.vy); if(spd>3.5){ this.trail.unshift({x:this.cx,y:this.cy,a:.5}); if(this.trail.length>6) this.trail.pop(); } } for(let t of this.trail) t.a-=.04*dt; this.trail=this.trail.filter(t=>t.a>0); if(!enemy.isDead){ const dist=Math.hypot(this.cx-enemy.cx,this.cy-enemy.cy); if(dist<50&&this.atkCD<=0){ const dmg=8+Math.random()*7; enemy.receiveHit(dmg,this.cx,this); this.atkCD=42; } else if(dist>150&&this.jutsuCD<=0){ this.launchJutsu(enemy); } } }
draw(ctx){ for(const t of this.trail){ ctx.save(); ctx.globalAlpha=t.a*.45; ctx.fillStyle=this.glowColor; ctx.beginPath(); ctx.ellipse(t.x,t.y,NW*.38,NH*.38,0,0,Math.PI*2); ctx.fill(); ctx.restore(); } const deadAlpha=this.isDead ? Math.max(0,1-this.deathSmoke) : 1; if(deadAlpha<=0) return; const flashOn=this.flashTimer>0&&Math.sin(this.flashTimer*1.6)>0; const bC=flashOn?'#FF3333':this.color; const sC=flashOn?'#FF8866':this.skinColor; ctx.save(); ctx.globalAlpha=deadAlpha; if(!this.facingRight){ ctx.translate(this.x+NW/2,0); ctx.scale(-1,1); ctx.translate(-(this.x+NW/2),0);} const x=this.x, y=this.y; const lA=Math.sin(this.animF*Math.PI/2)*3; const jumping=!this.onGround; const sAlpha=Math.max(0,.4-(GROUND-NH-this.y)*.006); ctx.globalAlpha=deadAlpha*sAlpha; ctx.fillStyle='rgba(0,0,0,.5)'; ctx.beginPath(); ctx.ellipse(x+NW/2,GROUND-1,NW*.7,4,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=deadAlpha; ctx.fillStyle='#222'; ctx.fillRect(x+1,y+NH-5,NW*.42,5); ctx.fillRect(x+NW*.55,y+NH-5,NW*.42,5); ctx.fillStyle=bC; ctx.fillRect(x+2,y+NH*.62,NW*.4,NH*.36+(jumping?-lA:lA)); ctx.fillRect(x+NW*.55,y+NH*.62,NW*.4,NH*.36+(jumping?lA:-lA)); ctx.fillStyle='#333'; ctx.fillRect(x+1,y+NH*.60,NW-2,3); ctx.fillStyle=bC; ctx.fillRect(x+2,y+NH*.30,NW-4,NH*.32); if(this.id===0){ ctx.fillStyle='#CC5500'; ctx.fillRect(x+NW*.32,y+NH*.28,NW*.36,NH*.12);} else { ctx.fillStyle='#3322AA'; ctx.fillRect(x+NW*.32,y+NH*.28,NW*.36,NH*.12);} const aS=Math.cos(this.animF*Math.PI/2)*2; ctx.fillStyle=bC; ctx.fillRect(x-4,y+NH*.32+aS,5,NH*.25); ctx.fillRect(x+NW-1,y+NH*.32-aS,5,NH*.25); ctx.fillStyle='#5A4030'; ctx.fillRect(x-4,y+NH*.50+aS,5,NH*.09); ctx.fillRect(x+NW-1,y+NH*.50-aS,5,NH*.09); ctx.fillStyle=sC; ctx.fillRect(x+NW*.36,y+NH*.27,NW*.28,NH*.06); const hR=NW*.40; ctx.fillStyle=sC; ctx.beginPath(); ctx.arc(x+NW/2,y+NH*.155,hR,0,Math.PI*2); ctx.fill(); if(this.id===0){ ctx.fillStyle='#FFD020'; ctx.beginPath(); ctx.arc(x+NW/2,y+NH*.10,hR,Math.PI,Math.PI*2); ctx.fill(); ctx.fillStyle='#FFD020'; const spikes=[[-.4,-7],[-.1,-9],[.2,-8],[.5,-6]]; for(const[ox,oy] of spikes){ ctx.beginPath(); ctx.moveTo(x+NW*.25+ox*NW*.5,y+NH*.08); ctx.lineTo(x+NW*.5+ox*NW*.3,y+NH*.05+oy); ctx.lineTo(x+NW*.65+ox*NW*.3,y+NH*.09); ctx.closePath(); ctx.fill(); }} else { ctx.fillStyle='#111118'; ctx.beginPath(); ctx.arc(x+NW/2,y+NH*.10,hR,Math.PI,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x+NW*.15,y+NH*.07); ctx.quadraticCurveTo(x+NW*.75,y-6,x+NW*.92,y+NH*.12); ctx.lineTo(x+NW/2,y+NH*.07); ctx.closePath(); ctx.fill(); } const hbCol=this.stunTimer>0||this.shieldBroken?'#CC2222':(this.id===0?'#FF6600':'#2233AA'); ctx.fillStyle=hbCol; ctx.fillRect(x+NW*.10,y+NH*.07,NW*.80,4); ctx.fillStyle='#C8C8C8'; ctx.fillRect(x+NW*.28,y+NH*.07,NW*.44,4); ctx.strokeStyle='#888'; ctx.lineWidth=.6; ctx.strokeRect(x+NW*.28,y+NH*.07,NW*.44,4); ctx.strokeStyle='#999'; ctx.lineWidth=.5; ctx.beginPath(); ctx.moveTo(x+NW*.35,y+NH*.09); ctx.lineTo(x+NW*.65,y+NH*.09); ctx.stroke(); ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+NW*.62,y+NH*.155,2,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#FFF'; ctx.beginPath(); ctx.arc(x+NW*.635,y+NH*.150,.85,0,Math.PI*2); ctx.fill(); if(this.id===1&&this.jutsuCD<25){ ctx.strokeStyle='rgba(220,0,0,.8)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(x+NW*.62,y+NH*.155,2.3,0,Math.PI*2); ctx.stroke(); } if(this.id===0){ ctx.strokeStyle='#C07848'; ctx.lineWidth=.8; for(let j=0;j<3;j++){ ctx.beginPath(); ctx.moveTo(x+NW*.54,y+NH*.155+j*2.4); ctx.lineTo(x+NW*.76,y+NH*.145+j*2.4-1); ctx.stroke(); }} if(this.stunTimer>8){ for(let i=0;i<3;i++){ const ang=frameN*.1+i*Math.PI*2/3; const sx=x+NW/2+Math.cos(ang)*(NW*.55+2); const sy=y-4+Math.sin(ang)*4; ctx.fillStyle='#FFD700'; ctx.font='8px Arial'; ctx.textAlign='center'; ctx.fillText('★',sx,sy); }} if(this.defBreak){ ctx.globalAlpha=deadAlpha*.25; ctx.fillStyle='#FF0000'; ctx.beginPath(); ctx.arc(x+NW/2,y+NH/2,NW*1.1,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=deadAlpha; } ctx.restore(); this.drawHPBar(ctx,deadAlpha); }
drawHPBar(ctx,alpha=1){ const bW=30, bH=4; const bx=this.x+NW/2-bW/2; const by=this.y-12; ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(bx-1,by-1,bW+2,bH+2); const r=this.hp/this.maxHp; ctx.fillStyle=r>.5?'#44EE44':r>.25?'#FFAA00':'#FF2222'; ctx.fillRect(bx,by,bW*r,bH); ctx.font='bold 7px Arial'; ctx.textAlign='center'; ctx.fillStyle=this.isDead?'#666':(this.id===0?'#FFD700':'#AA88FF'); ctx.fillText(this.name,this.x+NW/2,by-3); ctx.restore(); }}
function triggerShake(amp,dur){ shakeAmp=Math.max(shakeAmp,amp); shakeDur=Math.max(shakeDur,dur);} function spawnSparks(x,y,n,color){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, spd=1.5+Math.random()*3.5; particles.push(new Particle(x,y,Math.cos(a)*spd,Math.sin(a)*spd,color,18+Math.random()*10,2+Math.random()*1.5,'spark')); }} function spawnSmoke(x,y,count){ const layers=[['#FFFFFF',.8],['#BBBBBB',.5],['#777777',.35]]; for(let i=0;i<count;i++){ const [col,spd]=layers[i%3]; particles.push(new Particle(x+(Math.random()-.5)*NW,y+(Math.random()-.5)*NH,(Math.random()-.5)*spd*2,-spd-.5-Math.random(),col,32+Math.random()*20,4+Math.random()*4+(i%3)*1.5,'smoke')); }} function showWinner(name){ winName.textContent=name; winName.style.color=name==='UZUMAKI'?'#FFD700':'#CC88FF'; winScreen.style.display='flex'; }
function genBG(){ bgMountains=[]; for(let x=0;x<=W;x+=18){ bgMountains.push({x, y: 95+Math.sin(x*.018)*65+Math.sin(x*.055)*28+Math.cos(x*.03+1.2)*20}); } bgTrees=[]; for(let i=0;i<14;i++){ bgTrees.push({x:15+Math.random()*(W-30),y:GROUND-35-Math.random()*55,h:38+Math.random()*55,w:10+Math.random()*14}); } bgStars=[]; for(let i=0;i<50;i++){ bgStars.push({x:(i*97+13)%W, y:(i*53+7)%(H*.52), s:(Math.random()<.1)?1.5:1, ph:Math.random()*Math.PI*2}); }}
function drawBG(parallaxX){ const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#060412'); sky.addColorStop(.5,'#150A30'); sky.addColorStop(1,'#200C08'); ctx.fillStyle=sky; ctx.fillRect(0,0,W,H); for(const st of bgStars){ const f=.5+.5*Math.sin(frameN*.04+st.ph); ctx.globalAlpha=f*.75; ctx.fillStyle='#FFFFFF'; ctx.fillRect(st.x,st.y,st.s,st.s);} ctx.globalAlpha=1; ctx.save(); ctx.shadowColor='#FFFFDD'; ctx.shadowBlur=18; ctx.fillStyle='#FFFEE8'; ctx.beginPath(); ctx.arc(375,38,20,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0; ctx.fillStyle='rgba(0,0,0,.09)'; ctx.beginPath(); ctx.arc(370,34,5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(382,44,3.5,0,Math.PI*2); ctx.fill(); ctx.restore(); ctx.fillStyle='#12091E'; ctx.beginPath(); ctx.moveTo(0,H); for(const p of bgMountains) ctx.lineTo(p.x,p.y); ctx.lineTo(W,H); ctx.closePath(); ctx.fill(); ctx.fillStyle='#1A0E2A'; ctx.beginPath(); ctx.moveTo(0,H); for(const p of bgMountains) ctx.lineTo(p.x+25,p.y+38); ctx.lineTo(W,H); ctx.closePath(); ctx.fill(); ctx.save(); ctx.translate(-parallaxX,0); for(const t of bgTrees){ ctx.fillStyle='#120C1C'; ctx.fillRect(t.x-2.5,t.y+t.h*.12,5,t.h*.35); ctx.fillStyle='#0C1614'; ctx.beginPath(); ctx.arc(t.x,t.y,t.w/2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(t.x-t.w*.3,t.y+t.h*.12,t.w*.4,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(t.x+t.w*.3,t.y+t.h*.12,t.w*.4,0,Math.PI*2); ctx.fill(); } ctx.restore(); const grd=ctx.createLinearGradient(0,GROUND,0,H); grd.addColorStop(0,'#253A15'); grd.addColorStop(.12,'#182810'); grd.addColorStop(1,'#0A1408'); ctx.fillStyle=grd; ctx.fillRect(0,GROUND,W,H-GROUND); ctx.fillStyle='#3A6022'; ctx.fillRect(0,GROUND,W,3); ctx.fillStyle='#1A1010'; const rockX=[40,110,190,265,340,400]; const rockW=[14,10,18,12,16,11]; for(let i=0;i<rockX.length;i++){ ctx.beginPath(); ctx.ellipse(rockX[i],GROUND+8,rockW[i],4,0,0,Math.PI*2); ctx.fill(); } const mist=ctx.createLinearGradient(0,GROUND-18,0,GROUND+12); mist.addColorStop(0,'rgba(20,50,30,0)'); mist.addColorStop(1,'rgba(20,50,30,.35)'); ctx.fillStyle=mist; ctx.fillRect(0,GROUND-18,W,30); }
function checkJutsuClash(){ for(let i=0;i<jutsus.length;i++){ for(let j=i+1;j<jutsus.length;j++){ const a=jutsus[i], b=jutsus[j]; if(a.owner===b.owner||a.dead||b.dead) continue; if(Math.hypot(a.x-b.x,a.y-b.y)<a.size+b.size+6){ const ex=(a.x+b.x)/2, ey=(a.y+b.y)/2; for(let k=0;k<22;k++){ const ang=Math.random()*Math.PI*2, spd=3+Math.random()*5; particles.push(new Particle(ex,ey,Math.cos(ang)*spd,Math.sin(ang)*spd-1,'#FFFFFF',22,3,'spark')); particles.push(new Particle(ex,ey,Math.cos(ang)*spd*.5,Math.sin(ang)*spd*.5,'#FFD700',32,2.5,'spark')); } critFlash=2; triggerShake(6,18); a.dead=true; b.dead=true; for(const f of fighters){ f.vx+=(f.cx>ex?4.5:-4.5); } } } } }
function update(dt,dms){ frameN++; if(frameN%50===0){ particles.push(new Particle(Math.random()*W,-5,0,.4+Math.random()*.6,Math.random()<.5?'#2A4A1A':'#386020',180+Math.random()*100,2+Math.random()*1.5,'leaf')); } if(critFlash>0) critFlash-=dt; if(shakeDur>0){ shakeDur-=dt; const f=shakeDur/10; shakeX=(Math.random()-.5)*shakeAmp*f; shakeY=(Math.random()-.5)*shakeAmp*f; if(shakeDur<=0){ shakeX=0; shakeY=0; shakeAmp=0; }} if(jutsuVeil>0){ jutsuVeil-=dt; if(jutsuVeil<=0){ jutsuVeil=0; veil.style.background='rgba(0,0,0,0)'; } } if(hitStop>0){ hitStop-=dt; particles.forEach(p=>p.update(dt)); particles=particles.filter(p=>!p.isDead()); damageNums.forEach(d=>d.update(dt)); damageNums=damageNums.filter(d=>!d.isDead()); return; } const [f0,f1]=fighters; f0.update(dt,dms,f1); f1.update(dt,dms,f0); for(const j of jutsus) j.update(dt); for(const j of jutsus){ if(j.dead) continue; for(const f of fighters){ if(f===j.owner||f.isDead||f.invincible) continue; if(Math.hypot(j.x-f.cx,j.y-f.cy)<j.size+NW/2){ const dmg=10+Math.random()*10; f.receiveHit(dmg,j.x,j.owner); for(let i=0;i<16;i++){ const ang=Math.random()*Math.PI*2, spd=2+Math.random()*4; particles.push(new Particle(j.x,j.y,Math.cos(ang)*spd,Math.sin(ang)*spd,j.color,20,3,'spark')); } j.dead=true; } } } checkJutsuClash(); jutsus=jutsus.filter(j=>!j.dead); particles.forEach(p=>p.update(dt)); particles=particles.filter(p=>!p.isDead()); damageNums.forEach(d=>d.update(dt)); damageNums=damageNums.filter(d=>!d.isDead()); }
function render(){ ctx.save(); ctx.translate(shakeX,shakeY); if(critFlash>1){ ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillRect(-shakeX,-shakeY,W,H); ctx.restore(); return; } const avgX=fighters.reduce((s,f)=>s+f.cx,0)/fighters.length; const parallaxX=(avgX-W/2)*.10; drawBG(parallaxX); for(const j of jutsus) j.draw(ctx); for(const f of fighters) f.draw(ctx); for(const p of particles){ if(p.type==='leaf') p.x-=parallaxX*.2; p.draw(ctx); } for(const d of damageNums) d.draw(ctx); if(gameOver&&slowMo<1){ ctx.save(); ctx.fillStyle='rgba(255,220,0,.22)'; ctx.font='bold 14px Arial Black'; ctx.textAlign='center'; ctx.letterSpacing='6px'; ctx.fillText('K.O.',W/2,28); ctx.restore(); } ctx.restore(); }
function startGame(){ particles=[]; damageNums=[]; jutsus=[]; hitStop=0; slowMo=1; frameN=0; gameOver=false; shakeX=0; shakeY=0; shakeDur=0; shakeAmp=0; critFlash=0; jutsuVeil=0; veil.style.background='rgba(0,0,0,0)'; winScreen.style.display='none'; fighters=[new Fighter(70,0), new Fighter(360,1)]; fighters[0].tX=120+Math.random()*80; fighters[1].tX=250+Math.random()*80; }
let lastTs=0; function loop(ts){ const rawDt=Math.min((ts-lastTs)/16.667,3); lastTs=ts; const dt=rawDt*slowMo; const dms=rawDt*16.667*slowMo; update(dt,dms); render(); requestAnimationFrame(loop); }
genBG(); startGame(); requestAnimationFrame(ts=>{ lastTs=ts; requestAnimationFrame(loop); });
<\/script>
</body>
</html>`;

  function renderBatallaMissionPanel(container) {
    if (!container) return;
    const missions = ['Bosque Prohibido', 'Prueba de Kunais', 'Patrulla Nocturna'];
    container.classList.add('mission-box--full');
    container.innerHTML = `
      <section class="mission-selector" aria-label="Misiones rango D">
        <h3>MISIONES RANGO D</h3>
        <div class="mission-selector__actions">
          ${missions.map((m, i) => `<button type="button" class="mission-selector__btn" data-mission-rd="${i}">${m}</button>`).join('')}
        </div>
      </section>
      <section class="mission-arena" id="mission-arena"></section>
    `;

    const arena = container.querySelector('#mission-arena');
    const mountBattle = () => {
      arena.innerHTML = `<iframe class="mission-battle-frame" title="Batalla misión" srcdoc="${BATALLA_MISION_HTML.replace(/"/g, '&quot;')}"></iframe>`;
    };

    container.querySelectorAll('[data-mission-rd]').forEach((btn) => {
      btn.addEventListener('click', mountBattle);
    });
  }

  global.BatallaMision = { renderBatallaMissionPanel };
})(window);
