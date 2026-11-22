const $=s=>document.querySelector(s);
const cv=$('#cv'),cx=cv.getContext('2d'),V=document.createElement('video');
V.playsInline=true;V.preload='auto';
const TW=$('#tw'),TH={},OVV={};let us=0,lastSet=0,foc=null,tbm='main',pickMode='main',muteAll=false;const vl=c=>muteAll?0:(c.vol==null?1:c.vol);const FILES={},IM={},OC=document.createElement('canvas'),ox=OC.getContext('2d',{willReadFrequently:true}),hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const PRE={Asli:[100,100,100],Cerah:[110,105,130],Sinematik:[95,120,85],'Hitam putih':[100,110,0],Pudar:[105,85,70]};let BG='#000000',ovs=[],W=1280,H=720,AS=[],undo=[],redo=[],clips=[],texts=[],sel=null,t=0,playing=false,cur=null,last=0,uid=1,PX=50,ac=null,dest=null,rec=null,chunks=[],mime='';
const fmt=s=>{s=Math.max(0,s);return Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0')};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const len=c=>(c.out-c.in)/c.speed;
const total=()=>clips.reduce((a,c)=>a+len(c),0);
function loc(x){let a=0;for(const c of clips){const l=len(c);if(x<a+l)return{c,off:x-a};a+=l}const c=clips[clips.length-1];return c?{c,off:len(c)}:null}
function seekTo(c,off){
  if(c.photo){cur=c;V.pause();return}const tt=c.in+off*c.speed;V.volume=vl(c);
  if(cur&&cur!==c&&cur.url===c.url){cur=c;V.playbackRate=c.speed;V.currentTime=tt;return}
  if(cur!==c){cur=c;V.src=c.url;V.onloadedmetadata=()=>{V.playbackRate=c.speed;V.currentTime=tt;if(playing)V.play().catch(()=>{})}}
  else{V.playbackRate=c.speed;V.currentTime=tt}
}
function sync(){const L=loc(t);if(L)seekTo(L.c,L.off);syncA()}
const aEnd=r=>r.start+((r.out==null?r.inn+1:r.out)-r.inn)/r.rate;
function syncOne(r){const a=r.a,w=(t-r.start)*r.rate+r.inn;if(t>=r.start&&t<aEnd(r)&&a.duration){a.currentTime=Math.min(Math.max(w,0),a.duration-.05);if(playing&&a.paused)a.play().catch(()=>{})}else a.pause()}
function syncA(){AS.forEach(syncOne)}
function tickA(){for(const r of AS){const inr=t>=r.start&&t<aEnd(r);if(inr&&r.a.paused)syncOne(r);else if(!inr&&!r.a.paused)r.a.pause()}}
function mkA(u,name,key,st,inn,out,rate,vol){const a=new Audio(u);a.preload='auto';a.volume=vol;a.playbackRate=rate;const r={id:uid++,a,name,key,start:st,inn,out,rate,vol};a.onloadedmetadata=()=>{if(r.out==null||r.out>a.duration)r.out=a.duration;renderTL();renderIn();if(!playing)syncOne(r)};AS.push(r);if(ac)audio();return r}
function audio(){
  if(!ac){ac=new AudioContext();const s=ac.createMediaElementSource(V);dest=ac.createMediaStreamDestination();s.connect(dest);s.connect(ac.destination)}
  for(const r of AS)if(!r.s){r.s=ac.createMediaElementSource(r.a);r.s.connect(dest);r.s.connect(ac.destination)}
  if(ac.state==='suspended')ac.resume();
}
function play(){if(!clips.length)return;audio();if(t>=total()-.05)t=0;playing=true;last=performance.now();sync();{const L0=loc(t);if(L0&&!L0.c.photo)V.play().catch(()=>{})}$('#pl').textContent='❚❚'}
function pause(){playing=false;V.pause();AS.forEach(r=>r.a.pause());$('#pl').textContent='▶'}
$('#pl').onclick=()=>playing?pause():play();
function tick(ts){
  if(playing){
    t+=(ts-last)/1000;const T=total();
    if(t>=T){t=T;pause();if(rec&&rec.state==='recording')rec.stop()}
    else{
      const L=loc(t);
      if(L.c!==cur)seekTo(L.c,L.off);
      else if(!L.c.photo&&Math.abs(V.currentTime-(L.c.in+L.off*L.c.speed))>.4)V.currentTime=L.c.in+L.off*L.c.speed;
      if(!L.c.photo){if(V.paused)V.play().catch(()=>{});V.volume=vl(L.c)}tickA();
    }
  }
  last=ts;draw();requestAnimationFrame(tick);
}
function pimg(c){const k='p'+c.id;if(!IM[k]){const i=new Image();i.src=c.url;IM[k]=i}return IM[k]}
async function thumbs(key,url,dur){
  if(TH[key])return;const step=Math.max(1,Math.ceil(dur/100)),arr=TH[key]={step,u:[]},v=document.createElement('video');
  v.muted=true;v.preload='auto';v.src=url;
  try{
    await new Promise((ok,no)=>{v.onloadeddata=ok;v.onerror=no;setTimeout(ok,4000)});
    const c=document.createElement('canvas');c.width=c.height=112;const x=c.getContext('2d');
    for(let s=0;s<=dur;s+=step){
      await new Promise(ok=>{let d=0;const f=()=>{if(!d){d=1;ok()}};v.onseeked=f;setTimeout(f,1500);v.currentTime=Math.max(.05,Math.min(s,dur-.05))});
      if(!v.videoWidth)break;
      const r=Math.max(112/v.videoWidth,112/v.videoHeight),w=v.videoWidth*r,h=v.videoHeight*r;
      x.drawImage(v,(112-w)/2,(112-h)/2,w,h);arr.u.push(c.toDataURL('image/jpeg',.6));
      if(arr.u.length%5===0)renderTL();
    }
  }catch(e){}
  renderTL();
}
function img(o){if(!IM[o.id]){const i=new Image();i.src=o.url;IM[o.id]=i}return IM[o.id]}
function ovsrc(o){
  if(!o.vid){const i=img(o);return i.complete&&i.naturalWidth?[i,i.naturalWidth,i.naturalHeight]:null}
  let v=OVV[o.id];if(!v){v=OVV[o.id]=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=o.url}
  const want=t-o.s+(o.in||0);
  if(playing){if(v.paused)v.play().catch(()=>{});if(Math.abs(v.currentTime-want)>.35)v.currentTime=want}
  else{if(!v.paused)v.pause();if(Math.abs(v.currentTime-want)>.05)v.currentTime=want}
  return v.videoWidth?[v,v.videoWidth,v.videoHeight]:null}
function ovbox(o){const s=ovsrc(o);if(!s)return null;const w=o.w*W;return{w,h:w*s[2]/s[1],x:o.x*W,y:o.y*H,s}}
function drawOv(back){for(const o of ovs){if(t<o.s||t>=o.s+o.d){if(o.vid&&OVV[o.id]&&!OVV[o.id].paused)OVV[o.id].pause();continue}if(!!o.back!==back)continue;const b=ovbox(o);if(!b)continue;cx.globalAlpha=o.o;cx.drawImage(b.s[0],b.x-b.w/2,b.y-b.h/2,b.w,b.h);cx.globalAlpha=1}}
function trf(c,off){const d=c.tdur||.6,p=Math.min(1,off/d),e=1-(1-p)*(1-p),q=1-e;switch(c.tin){case'fade':cx.globalAlpha*=e;break;case'kanan':cx.translate(q*W,0);break;case'kiri':cx.translate(-q*W,0);break;case'zoom':cx.translate(W/2,H/2);cx.scale(1+q*.6,1+q*.6);cx.translate(-W/2,-H/2);cx.globalAlpha*=e;break;case'putar':cx.translate(W/2,H/2);cx.rotate(-q*.6);cx.scale(.4+.6*e,.4+.6*e);cx.translate(-W/2,-H/2);cx.globalAlpha*=e}}
function keyed(c,w,h,S,pw,ph){const k=c.ck,sc=Math.min(1,640/pw),ow=Math.max(2,pw*sc|0),oh=Math.max(2,ph*sc|0);if(OC.width!==ow||OC.height!==oh){OC.width=ow;OC.height=oh}ox.drawImage(S,0,0,ow,oh);const id=ox.getImageData(0,0,ow,oh),d=id.data,kc=hex(k.col),tol=k.tol*4.4,so=k.soft*4.4+1;for(let i=0;i<d.length;i+=4){const a=d[i]-kc[0],b=d[i+1]-kc[1],e=d[i+2]-kc[2],q=Math.sqrt(a*a+b*b+e*e);if(q<tol)d[i+3]=0;else if(q<tol+so)d[i+3]=255*(q-tol)/so}ox.putImageData(id,0,0);cx.drawImage(OC,(W-w)/2,(H-h)/2,w,h)}
function draw(){
  cx.filter='none';cx.fillStyle=BG;cx.fillRect(0,0,W,H);drawOv(true);
  const L=loc(t);
  const PS=L&&L.c.photo?pimg(L.c):V,pw=PS===V?V.videoWidth:PS.naturalWidth,ph=PS===V?V.videoHeight:PS.naturalHeight;
  if(L&&pw){
    const c=L.c,f=c.f,k=c.fill?Math.max:Math.min,r=k(W/pw,H/ph),w=pw*r,h=ph*r,fd=c.fade||0,l=len(c);cx.globalAlpha=fd?Math.max(0,Math.min(1,L.off/fd,(l-L.off)/fd)):1;cx.save();if(c.flip){cx.translate(W,0);cx.scale(-1,1)}trf(c,L.off);
    cx.filter=`brightness(${f.b}%) contrast(${f.c}%) saturate(${f.s}%)`;
    if(c.ck&&c.ck.on)keyed(c,w,h,PS,pw,ph);else cx.drawImage(PS,(W-w)/2,(H-h)/2,w,h);cx.restore();cx.globalAlpha=1;cx.filter='none';
  }
  drawOv(false);for(const x of texts)if(t>=x.s&&t<x.s+x.d){
    cx.font=`700 ${x.z*W/1280}px "Trebuchet MS",sans-serif`;cx.textAlign='center';
    cx.lineWidth=x.z/8;cx.strokeStyle='#000';cx.fillStyle=x.col;
    const tx=(x.px==null?.5:x.px)*W,ty=(x.py==null?.86:x.py)*H;cx.strokeText(x.tx,tx,ty);cx.fillText(x.tx,tx,ty);
  }
  $('#tm').textContent=fmt(t)+' / '+fmt(total());
  if(performance.now()-us>250&&Math.abs(TW.scrollLeft-t*PX)>1.5){TW.scrollLeft=t*PX;lastSet=TW.scrollLeft}updSB();
}
$('#imp').onclick=()=>openPick('main');
function importFiles(fl){
  if(fl.length)snap();
  for(const f of fl){
    const key='f'+Date.now()+Math.random().toString(36).slice(2,6),u=URL.createObjectURL(f),v=document.createElement('video');FILES[key]=f;
    if(f.type.startsWith('image/')){const c={id:uid++,key,name:f.name,url:u,photo:true,in:0,out:5,dur:60,speed:1,vol:1,fade:0,fill:false,flip:false,f:{b:100,c:100,s:100}};clips.push(c);sel=c;renderTL();renderIn();if(clips.length===1)sync();continue}
    v.preload='metadata';v.src=u;
    v.onloadedmetadata=()=>{
      thumbs(key,u,v.duration);const c={id:uid++,key,name:f.name,url:u,in:0,out:v.duration,dur:v.duration,speed:1,vol:1,fade:0,fill:false,flip:false,f:{b:100,c:100,s:100}};
      clips.push(c);sel=c;renderTL();renderIn();if(clips.length===1)sync();
    };
  }
  if(fl.length)toast(fl.length+' berkas ditambahkan',true);
}
function renderTL(){
  const rw=$('#rw'),half=TW.clientWidth/2,TWd=56;
  if(!clips.length){rw.style.marginLeft=half+'px';rw.style.width='240px';rw.innerHTML='<div class="em" style="position:absolute;left:8px;top:22px;padding:0;white-space:nowrap">Tekan + untuk menambah video atau foto</div>';return}
  let a=0,h='';
  for(const c of clips){const l=len(c),w=Math.max(l*PX,24),th=TH[c.key];let tl='';for(let i=0,n=Math.ceil(w/TWd);i<n;i++){let u='';if(c.photo)u=c.url;else if(th&&th.u.length)u=th.u[Math.min(th.u.length-1,Math.round((c.in+(i*TWd/PX)*c.speed)/th.step))];tl+=`<i style="background-image:url('${u}')"></i>`}h+=`<div class="cl${isF('c',c.id)?' on':''}" data-c="${c.id}" style="left:${a*PX}px;width:${w}px">${tl}${isF('c',c.id)?'<span class="hd l" data-h="l"></span><span class="hd r" data-h="r"></span>':''}<b>${l.toFixed(1)} dtk</b></div>`;a+=l}
  for(const r of AS)h+=`<div class="tx au${isF('a',r.id)?' on':''}" data-aid="${r.id}" style="top:130px;height:22px;left:${r.start*PX}px;width:${Math.max((aEnd(r)-r.start)*PX,24)}px">${esc(r.name)}</div>`;for(const o of ovs)h+=`<div class="tx ov${isF('o',o.id)?' on':''}" data-oid="${o.id}" style="top:74px;height:22px;left:${o.s*PX}px;width:${Math.max(o.d*PX,24)}px">${esc(o.name)}</div>`;for(const x of texts)h+=`<div class="tx${isF('x',x.id)?' on':''}" data-t="${x.id}" style="left:${x.s*PX}px;width:${Math.max(x.d*PX,24)}px">${esc(x.tx)}</div>`;
  if(!AS.length)h+='<div class="ph" data-add="audio" style="top:130px">+ Tambah audio</div>';if(!texts.length)h+='<div class="ph" data-add="teks" style="top:100px">+ Tambah teks</div>';rw.style.marginLeft=half+'px';rw.style.width=(a*PX+half+120)+'px';rw.innerHTML=h;
}
const isF=(k,id)=>foc&&foc.k===k&&foc.id===id;
function setFoc(k,id){foc=k?{k,id}:null;if(k==='c')sel=clips.find(c=>c.id==id)||sel;renderTL();renderTB();if(k==='c')renderIn()}
function dragWin(mv,up){const m=e=>mv(e),u=()=>{removeEventListener('pointermove',m);removeEventListener('pointerup',u);removeEventListener('pointercancel',u);if(up)up()};addEventListener('pointermove',m);addEventListener('pointerup',u);addEventListener('pointercancel',u)}
$('#rw').addEventListener('pointerdown',e=>{
  const hd=e.target.closest('.hd');
  if(hd&&sel){const c=sel,side=hd.dataset.h,x0=e.clientX,i0=c.in,o0=c.out;e.preventDefault();snap();
    dragWin(ev=>{const d=(ev.clientX-x0)/PX*c.speed;if(side==='l'){if(c.photo)c.out=Math.max(.5,o0-d);else c.in=Math.min(Math.max(0,i0+d),c.out-.2)}else c.out=Math.min(Math.max(o0+d,c.in+.2),c.dur);renderTL();if(!playing)sync()},renderIn);return}
  const b=e.target.closest('[data-oid],[data-t],[data-aid]');if(!b)return;
  let k,obj,sk='s',dk='d';
  if(b.dataset.oid){k='o';obj=ovs.find(o=>o.id==b.dataset.oid)}
  else if(b.dataset.t){k='x';obj=texts.find(o=>o.id==b.dataset.t)}
  else{k='a';obj=AS.find(o=>o.id==b.dataset.aid);sk='start';dk=''}
  if(!obj)return;
  const r=b.getBoundingClientRect(),z=dk?(e.clientX-r.left<16?'l':(r.right-e.clientX<16?'r':'m')):'m',x0=e.clientX,s0=obj[sk],d0=dk?obj[dk]:0;
  e.preventDefault();snap();setFoc(k,obj.id);
  dragWin(ev=>{const dt=(ev.clientX-x0)/PX;if(z==='m')obj[sk]=Math.max(0,s0+dt);else if(z==='l'){const ns=Math.min(Math.max(0,s0+dt),s0+d0-.2);obj[dk]=d0-(ns-s0);obj[sk]=ns}else obj[dk]=Math.max(.2,d0+dt);renderTL();if(k==='a'&&!playing)syncOne(obj)},renderIn)});
$('#rw').addEventListener('click',e=>{const ad=e.target.closest('[data-add]');if(ad){if(ad.dataset.add==='audio')$('#mf').click();else addText();return}const c=e.target.closest('.cl');if(c&&!e.target.closest('.hd'))setFoc('c',+c.dataset.c)});
TW.addEventListener('scroll',()=>{if(Math.abs(TW.scrollLeft-lastSet)<1.5)return;us=performance.now();lastSet=TW.scrollLeft;t=Math.min(Math.max(TW.scrollLeft/PX,0),total());if(!playing)sync()});
TW.addEventListener('pointerdown',()=>{if(playing)pause()});
function slider(label,k,min,max,step,val){return `<label>${label}<input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`}
function renderIn(){
  let h='<section data-sec="edit">';
  if(sel){
    h+=(sel.photo?'':slider('Mulai potong','in',0,sel.dur,.1,sel.in))+slider(sel.photo?'Durasi foto (detik)':'Akhir potong','out',sel.photo?1:0,sel.dur,.1,sel.out);
    h+=`<label>Kecepatan<select data-k="speed">${[.5,.75,1,1.5,2].map(v=>`<option value="${v}"${v===sel.speed?' selected':''}>${v}x</option>`).join('')}</select></label>`;
    h+='</section><section data-sec="filter">';h+='<div class="g">'+Object.keys(PRE).map(n=>`<button data-pre="${n}">${n}</button>`).join('')+'</div>';h+=slider('Kecerahan','fb',50,150,1,sel.f.b)+slider('Kontras','fc',50,150,1,sel.f.c)+slider('Saturasi','fs',0,200,1,sel.f.s);h+='</section><section data-sec="edit">';h+=slider('Volume klip','vol',0,1,.05,sel.vol==null?1:sel.vol)+slider('Memudar di awal dan akhir (detik)','fade',0,1.5,.1,sel.fade||0);h+='</section><section data-sec="efek">';h+=`<label><input type="checkbox" data-b="fill"${sel.fill?' checked':''}> Isi layar penuh</label><label><input type="checkbox" data-b="flip"${sel.flip?' checked':''}> Cermin</label>`;h+=`<label>Transisi masuk<select data-k="tin">${[['','Tidak ada'],['fade','Memudar'],['kanan','Geser dari kanan'],['kiri','Geser dari kiri'],['zoom','Zoom masuk'],['putar','Putar masuk']].map(o=>`<option value="${o[0]}"${(sel.tin||'')===o[0]?' selected':''}>${o[1]}</option>`).join('')}</select></label>`+slider('Durasi transisi (detik)','tdur',.2,2,.1,sel.tdur||.6);const ck=sel.ck||{on:false,col:'#00ff00',tol:40,soft:20};h+=`<label><input type="checkbox" data-b="ckon"${ck.on?' checked':''}> Hapus latar warna (chroma key)</label><label>Warna latar yang dihapus<input type="color" data-ckc value="${ck.col}"></label>`+slider('Toleransi','ckt',0,100,1,ck.tol)+slider('Kehalusan tepi','cks',0,60,1,ck.soft);
    h+='</section><section data-sec="edit">';h+='<div class="g"><button id="sp">Pisah di playhead</button><button id="sa">Pisahkan audio</button><button id="lf">Geser kiri</button><button id="rt">Geser kanan</button><button id="dl">Hapus</button></div>';
  }else h+='<div class="em">Pilih klip di linimasa.</div>';
  h+='</section><section data-sec="overlay">';h+='<div class="tr"><h2>Overlay gambar</h2><button id="ao">Tambah gambar</button><label>Warna latar<input type="color" id="bg" value="'+BG+'"></label>';
  for(const o of ovs)h+=`<div class="tr" data-oid="${o.id}"><div>${esc(o.name)}</div><div class="g"><input type="number" data-o="s" step=".1" value="${o.s.toFixed(1)}" title="Mulai (detik)" style="width:70px"><input type="number" data-o="d" step=".1" value="${o.d}" title="Durasi (detik)" style="width:70px"><button data-o="del">Hapus</button></div><label>Ukuran<input type="range" data-o="w" min=".05" max="1" step=".01" value="${o.w}"></label><label>Posisi horizontal<input type="range" data-o="x" min="0" max="1" step=".01" value="${o.x}"></label><label>Posisi vertikal<input type="range" data-o="y" min="0" max="1" step=".01" value="${o.y}"></label><label>Transparansi<input type="range" data-o="o" min=".1" max="1" step=".05" value="${o.o}"></label><label><input type="checkbox" data-o="back"${o.back?' checked':''}> Di belakang video</label></div>`;
  h+='</div>';
  h+='</section><section data-sec="audio">';h+='<div class="tr"><h2>Audio dan musik</h2><button id="mu">Tambah musik</button>';
  for(const r of AS)h+=`<div class="tr" data-aid="${r.id}"><div>${esc(r.name)}</div><label>Volume<input type="range" data-a="vol" min="0" max="1" step=".05" value="${r.vol}"></label><div class="g"><input type="number" data-a="start" step=".1" min="0" value="${r.start.toFixed(1)}" title="Mulai di linimasa (detik)" style="width:76px"><input type="number" data-a="inn" step=".1" min="0" value="${r.inn.toFixed(1)}" title="Potong awal (detik)" style="width:76px"><input type="number" data-a="out" step=".1" min="0" value="${(r.out==null?0:r.out).toFixed(1)}" title="Potong akhir (detik)" style="width:76px"><button data-a="del">Hapus</button></div><label>Kiri ke kanan: mulai di linimasa, potong awal, potong akhir (detik)</label></div>`;
  h+='</div>';h+='</section><section data-sec="teks">';h+='<div class="tr"><h2>Teks</h2><button id="at">Tambah teks di playhead</button>';
  for(const x of texts)h+=`<div class="tr" data-id="${x.id}"><input type="text" data-x="tx" value="${esc(x.tx)}"><div class="g"><input type="number" data-x="s" step=".1" value="${x.s.toFixed(1)}" title="Mulai (detik)" style="width:70px"><input type="number" data-x="d" step=".1" value="${x.d}" title="Durasi (detik)" style="width:70px"><input type="number" data-x="z" value="${x.z}" title="Ukuran" style="width:70px"><input type="color" data-x="col" value="${x.col}"><button data-x="del">Hapus</button></div><label>Posisi horizontal<input type="range" data-x="px" min="0" max="1" step=".01" value="${x.px==null?.5:x.px}"></label><label>Posisi vertikal<input type="range" data-x="py" min="0" max="1" step=".01" value="${x.py==null?.86:x.py}"></label></div>`;
  h+='</div>';
  h+='</section>';const el=$('#in');el.innerHTML=h;
  el.querySelectorAll('[data-k]').forEach(e=>e.oninput=()=>{
    const k=e.dataset.k,v=+e.value;
    if(k.length===2&&k[0]==='f')sel.f[k[1]]=v;
    else if(k==='in')sel.in=Math.min(v,sel.out-.1);
    else if(k==='out')sel.out=Math.max(v,sel.in+.1);
    else if(k==='ckt'||k==='cks'){sel.ck=sel.ck||{on:false,col:'#00ff00',tol:40,soft:20};sel.ck[k==='ckt'?'tol':'soft']=v}else sel[k]=k==='tin'?e.value:v;
    if(k==='in'||k==='out')e.value=sel[k];
    renderTL();if(!playing)sync();
  });
  el.querySelectorAll('[data-x]').forEach(e=>e.oninput=()=>{
    const x=texts.find(a=>a.id==e.closest('[data-id]').dataset.id),k=e.dataset.x;
    if(k==='del'){texts=texts.filter(a=>a!==x);renderIn()}
    else x[k]=(k==='tx'||k==='col')?e.value:+e.value;
    renderTL();
  });
  el.querySelectorAll('button[data-x]').forEach(b=>b.onclick=()=>b.oninput());
  const on=(id,f)=>{const b=$(id);if(b)b.onclick=f};
  el.querySelectorAll('[data-k],[data-x]').forEach(e=>{e.addEventListener('focus',snap);e.addEventListener('pointerdown',snap)});
  el.querySelectorAll('[data-ckc]').forEach(e=>e.oninput=()=>{sel.ck=sel.ck||{on:false,col:'#00ff00',tol:40,soft:20};sel.ck.col=e.value});
  el.querySelectorAll('[data-pre]').forEach(b=>b.onclick=()=>{snap();const p=PRE[b.dataset.pre];sel.f={b:p[0],c:p[1],s:p[2]};renderIn();if(!playing)sync()});
  el.querySelectorAll('[data-b]').forEach(e=>e.onchange=()=>{snap();{const b=e.dataset.b;if(b==='ckon'){sel.ck=sel.ck||{on:false,col:'#00ff00',tol:40,soft:20};sel.ck.on=e.checked}else sel[b]=e.checked}});
  on('#mu',()=>$('#mf').click());on('#sa',()=>{if(sel.photo)return;snap();let a=0;for(const c of clips){if(c===sel)break;a+=len(c)}mkA(sel.url,sel.name+' (audio)',sel.key,a,sel.in,sel.out,sel.speed,1);sel.vol=0;renderIn();sync()});
  el.querySelectorAll('[data-a]').forEach(e=>{const f=()=>{const r=AS.find(x=>x.id==e.closest('[data-aid]').dataset.aid),k=e.dataset.a;if(k==='del'){r.a.pause();AS=AS.filter(x=>x!==r);renderIn();renderTL();return}const v=+e.value;if(k==='vol'){r.vol=v;r.a.volume=v}else if(k==='start')r.start=Math.max(0,v);else if(k==='inn')r.inn=Math.max(0,Math.min(v,(r.out==null?v+.1:r.out)-.1));else if(k==='out')r.out=Math.min(Math.max(v,r.inn+.1),r.a.duration||v);if(k!=='vol')e.value=r[k];renderTL();if(!playing)syncOne(r)};e.onchange=f;if(e.type==='range')e.oninput=f;if(e.tagName==='BUTTON')e.onclick=f;e.addEventListener('pointerdown',snap)});
  on('#ao',()=>openPick('ov'));
  const bgc=$('#bg');if(bgc)bgc.oninput=()=>{BG=bgc.value};
  el.querySelectorAll('[data-o]').forEach(e=>{const f=()=>{const o=ovs.find(a=>a.id==e.closest('[data-oid]').dataset.oid),k=e.dataset.o;if(k==='del'){ovs=ovs.filter(a=>a!==o);renderIn()}else o[k]=k==='back'?e.checked:+e.value;renderTL()};if(e.tagName==='BUTTON')e.onclick=f;else e.oninput=f;e.addEventListener('pointerdown',snap)});
  on('#sp',()=>{snap();
    const L=loc(t);if(!L||L.off<.2||L.off>len(L.c)-.2)return;
    const c=L.c,src=c.in+L.off*c.speed,n={...c,id:uid++,f:{...c.f},in:src};
    c.out=src;clips.splice(clips.indexOf(c)+1,0,n);renderTL();renderIn();
  });
  const mv=d=>{snap();const i=clips.indexOf(sel),j=i+d;if(j<0||j>=clips.length)return;[clips[i],clips[j]]=[clips[j],clips[i]];renderTL()};
  on('#lf',()=>mv(-1));on('#rt',()=>mv(1));
  on('#dl',()=>{snap();clips=clips.filter(c=>c!==sel);sel=clips[0]||null;cur=null;t=Math.min(t,total());renderTL();renderIn();sync()});
  on('#at',()=>{snap();texts.push({id:uid++,tx:'Teks baru',s:t,d:3,z:64,px:.5,py:.86,col:'#ffffff'});renderTL();renderIn()});
}
function snap(){const s=JSON.stringify({clips,texts,ovs});if(undo[undo.length-1]===s)return;undo.push(s);if(undo.length>60)undo.shift();redo=[]}
function restore(s){const o=JSON.parse(s);clips=o.clips;texts=o.texts;ovs=o.ovs||[];sel=clips.find(c=>sel&&c.id===sel.id)||clips[0]||null;cur=null;t=Math.min(t,total());renderTL();renderIn();sync()}
$('#un').onclick=()=>{if(!undo.length)return;redo.push(JSON.stringify({clips,texts,ovs}));restore(undo.pop())};
$('#re').onclick=()=>{if(!redo.length)return;undo.push(JSON.stringify({clips,texts,ovs}));restore(redo.pop())};
function setSize(){const[b,h]=$('#ar').value.split('x').map(Number),m=+$('#ql').value;W=Math.round(b*m/2)*2;H=Math.round(h*m/2)*2;cv.width=W;cv.height=H}
$('#ar').onchange=()=>{if(!rec)setSize()};$('#ql').onchange=()=>{if(!rec)setSize()};
$('#mf').onchange=e=>{for(const f of e.target.files){const key='f'+Date.now()+Math.random().toString(36).slice(2,6);FILES[key]=f;mkA(URL.createObjectURL(f),f.name,key,t,0,null,1,.6)}renderIn();renderTL();e.target.value=''};

const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('klipku',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function kvSet(k,v){const d=await idb();return new Promise((ok,no)=>{const q=d.transaction('kv','readwrite').objectStore('kv').put(v,k);q.onsuccess=ok;q.onerror=()=>no(q.error)})}
async function kvGet(k){const d=await idb();return new Promise((ok,no)=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})}
$('#sv').onclick=async()=>{
  const b=$('#sv'),used=new Set(clips.map(c=>c.key)),files={};
  for(const r of AS)used.add(r.key);for(const o of ovs)used.add(o.key);
  for(const k of used)if(FILES[k])files[k]=FILES[k];
  try{
    await kvSet('proj',{clips:clips.map(c=>({...c,url:''})),texts,ovs:ovs.map(o=>({...o,url:''})),BG,ar:$('#ar').value,ql:$('#ql').value,muteAll,uid,files,aud:AS.map(r=>({key:r.key,name:r.name,start:r.start,inn:r.inn,out:r.out,rate:r.rate,vol:r.vol}))});
    b.textContent='Tersimpan';
  }catch(e){alert('Gagal menyimpan. Penyimpanan browser mungkin penuh atau diblokir. '+(e.message||e))}
  setTimeout(()=>b.textContent='Simpan',1500);
};
$('#ld').onclick=async()=>{
  try{
    const p=await kvGet('proj');
    if(!p){alert('Belum ada proyek tersimpan.');return}
    pause();Object.assign(FILES,p.files);
    const U={},url=k=>U[k]||(U[k]=URL.createObjectURL(FILES[k]));
    clips=p.clips.map(c=>({...c,url:url(c.key)}));for(const k of new Set(p.clips.map(c=>c.key))){const c0=p.clips.find(c=>c.key===k);if(!c0.photo&&!TH[k])thumbs(k,url(k),c0.dur)}texts=p.texts;ovs=(p.ovs||[]).map(o=>({...o,url:url(o.key)}));BG=p.BG||'#000000';for(const k in IM)delete IM[k];for(const k in OVV)delete OVV[k];uid=p.uid;
    $('#ar').value=p.ar||'1280x720';$('#ql').value=p.ql||'1';muteAll=!!p.muteAll;setSize();updMt();
    AS.forEach(r=>r.a.pause());AS=[];for(const r of [].concat(p.aud||[]))mkA(url(r.key),r.name||'Audio',r.key,r.start,r.inn,r.out!=null?r.out:(r.end>=0?r.inn+(r.end-r.start)*r.rate:null),r.rate,r.vol!=null?r.vol:.6);
    sel=clips[0]||null;cur=null;t=0;undo=[];redo=[];foc=null;tbm='main';renderTB();renderTL();renderIn();sync();
  }catch(e){alert('Gagal membuka proyek: '+(e.message||e))}
};
$('#exp').onclick=async()=>{
  if(!clips.length||rec)return;
  if(!window.MediaRecorder){alert('Browser ini belum mendukung perekaman.');return}
  mime=['video/webm;codecs=vp9,opus','video/webm','video/mp4'].find(m=>MediaRecorder.isTypeSupported(m))||'';
  audio();
  const st=cv.captureStream(30);dest.stream.getAudioTracks().forEach(a=>st.addTrack(a));
  chunks=[];rec=new MediaRecorder(st,mime?{mimeType:mime,videoBitsPerSecond:Math.round(6e6*W*H/921600)}:{});
  rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  rec.onstop=async()=>{
    rec=null;$('#exp').textContent='Ekspor';
    const blob=new Blob(chunks,{type:mime||'video/webm'}),ext=mime.includes('mp4')?'mp4':'webm';
    await saveBlob(blob,'klipku.'+ext);
  };
  $('#exp').textContent='Merekam…';t=0;rec.start();play();
};
const SH=$('#sheet'),IN=$('#in'),NM={edit:'Edit',filter:'Filter',efek:'Efek',audio:'Audio',teks:'Teks',overlay:'Overlay'};
function openTab(k){if(SH.classList.contains('open')&&IN.dataset.tab===k){SH.classList.remove('open');return}IN.dataset.tab=k;$('#stt').textContent=NM[k];SH.classList.add('open')}
function renderTB(){
  const B=(a,i,l)=>`<button data-a="${a}"><span>${i}</span>${l}</button>`,back=B('back','‹','Kembali'),f=foc&&foc.k;
  let h;
  if(f==='c')h=back+B('split','✂','Potong')+B('tab:edit','✎','Edit')+B('tab:filter','◐','Filter')+B('tab:efek','✦','Animasi')+B('del','✖','Hapus');
  else if(f==='o')h=back+B('addov','＋','Overlay')+B('split','✂','Potong')+B('dup','⧉','Duplikat')+B('tab:overlay','✎','Edit')+B('del','✖','Hapus');
  else if(f==='x')h=back+B('addtx','＋','Teks')+B('dup','⧉','Duplikat')+B('tab:teks','✎','Edit')+B('del','✖','Hapus');
  else if(f==='a')h=back+B('tab:audio','✎','Edit')+B('del','✖','Hapus');
  else if(tbm==='ov')h=back+B('addov','＋','Tambah overlay')+B('tab:overlay','✎','Pengaturan');
  else h=B('split','✂','Potong')+B('tab:edit','✎','Edit')+B('tab:audio','♪','Audio')+B('tab:teks','T','Teks')+B('tab:efek','✦','Efek')+B('tab:filter','◐','Filter')+B('ovm','▣','Overlay');
  const tb=$('#tb');tb.innerHTML=h;tb.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));
}
function act(a){
  if(a==='back'){foc=null;tbm='main';SH.classList.remove('open');renderTL();renderTB();return}
  if(a==='ovm'){tbm='ov';renderTB();return}
  if(a==='addov'){openPick('ov');return}
  if(a==='addtx'){addText();return}
  if(a.startsWith('tab:')){openTab(a.slice(4));return}
  if(a==='split')splitFoc();else if(a==='del')delFoc();else if(a==='dup')dupFoc();
}
function addText(){snap();const x={id:uid++,tx:'Teks baru',s:t,d:3,z:64,px:.5,py:.86,col:'#ffffff'};texts.push(x);setFoc('x',x.id);renderIn()}
function splitFoc(){
  if(foc&&foc.k==='o'){const o=ovs.find(a=>a.id===foc.id);if(o&&t>o.s+.2&&t<o.s+o.d-.2){snap();const n={...o,id:uid++,s:t,d:o.s+o.d-t,in:(o.in||0)+(t-o.s)};o.d=t-o.s;ovs.push(n);setFoc('o',n.id);renderIn()}return}
  const b=$('#sp');if(b)b.click();
}
function delFoc(){
  if(!foc||foc.k==='c'){const b=$('#dl');if(b)b.click();foc=null;renderTL();renderTB();return}
  snap();
  if(foc.k==='o')ovs=ovs.filter(o=>o.id!==foc.id);
  else if(foc.k==='x')texts=texts.filter(o=>o.id!==foc.id);
  else if(foc.k==='a'){const r=AS.find(o=>o.id===foc.id);if(r)r.a.pause();AS=AS.filter(o=>o.id!==foc.id)}
  foc=null;renderTL();renderTB();renderIn();
}
function dupFoc(){
  if(!foc)return;snap();
  if(foc.k==='o'){const o=ovs.find(a=>a.id===foc.id);if(!o)return;const n={...o,id:uid++,x:Math.min(.95,o.x+.06),y:Math.min(.95,o.y+.06)};ovs.push(n);setFoc('o',n.id)}
  else if(foc.k==='x'){const o=texts.find(a=>a.id===foc.id);if(!o)return;const n={...o,id:uid++,px:Math.min(.95,(o.px==null?.5:o.px)+.05),py:Math.min(.95,(o.py==null?.86:o.py)-.06)};texts.push(n);setFoc('x',n.id)}
  renderIn();
}
let PK=[],tt0=0;
function openPick(m){pickMode=m;PK=[];$('#pkt').textContent=m==='ov'?'Tambah overlay':'Tambah ke linimasa';renderPick();$('#pick').hidden=false}
function renderPick(){
  $('#pkg').innerHTML=PK.map((x,i)=>{const m=x.f.type.startsWith('video/')?`<video src="${x.u}#t=0.1" muted playsinline preload="metadata"></video>`:`<img src="${x.u}" alt="">`;return `<div class="pi">${m}<button data-r="${i}" aria-label="Buang">−</button></div>`}).join('');
  const b=$('#pka');b.textContent='Tambah ('+PK.length+')';b.disabled=!PK.length;
}
$('#pkg').onclick=e=>{const b=e.target.closest('[data-r]');if(b){PK.splice(+b.dataset.r,1);renderPick()}};
$('#pkx').onclick=()=>$('#pick').hidden=true;
$('#pkv').onclick=()=>{$('#file').accept='video/*';$('#file').click()};
$('#pkf').onclick=()=>{$('#file').accept='image/*';$('#file').click()};
$('#file').onchange=e=>{for(const f of e.target.files)PK.push({f,u:URL.createObjectURL(f)});e.target.value='';renderPick()};
$('#pka').onclick=()=>{if(!PK.length)return;const fs=PK.map(x=>x.f);PK=[];$('#pick').hidden=true;if(pickMode==='ov')addOvFiles(fs);else importFiles(fs)};
function toast(m,undoable){const el=$('#toast');el.innerHTML=esc(m)+(undoable?' <button id="tu">Urungkan</button>':'');el.hidden=false;clearTimeout(tt0);tt0=setTimeout(()=>{el.hidden=true},4000);if(undoable)$('#tu').onclick=()=>{$('#un').click();el.hidden=true}}
async function saveBlob(blob,name){try{const d=(window.claude&&claude.use)?await claude.use('downloads'):null;if(d)await d.save({filename:name,data:blob});else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove()}}catch(err){if(!err||err.code!=='declined')alert('Gagal menyimpan: '+((err&&err.message)||err))}}
function updMt(){const b=$('#mt');b.classList.toggle('off',muteAll);b.lastChild.textContent=muteAll?'Bisu':'Suara'}
$('#mt').onclick=()=>{muteAll=!muteAll;const L=loc(t);if(L&&!L.c.photo)V.volume=vl(L.c);updMt()};
$('#cvb').onclick=()=>{draw();cv.toBlob(async b=>{await saveBlob(b,'sampul-klipku.jpg');toast('Sampul disimpan')},'image/jpeg',.92)};
function addOvFiles(fl){
  for(const f of fl){
    snap();const key='f'+Date.now()+Math.random().toString(36).slice(2,6),url=URL.createObjectURL(f);FILES[key]=f;
    const base={id:uid++,key,url,name:f.name,s:t,x:.5,y:.5,w:.4,o:1,back:false};
    if(f.type.startsWith('video/')){const v=document.createElement('video');v.preload='metadata';v.src=url;v.onloadedmetadata=()=>{const o={...base,vid:true,in:0,d:Math.min(v.duration,30)};ovs.push(o);setFoc('o',o.id);renderIn()}}
    else{const o={...base,d:3};ovs.push(o);setFoc('o',o.id);renderIn()}
  }
}
const SB=$('#sb');
function xbox(x){const z=x.z*W/1280;cx.font=`700 ${z}px "Trebuchet MS",sans-serif`;return{w:cx.measureText(x.tx).width+z*.3,h:z*1.3,x:(x.px==null?.5:x.px)*W,y:(x.py==null?.86:x.py)*H-z*.4}}
function boxOf(k,id){
  if(k==='o'){const o=ovs.find(a=>a.id===id);return o&&t>=o.s&&t<o.s+o.d?ovbox(o):null}
  if(k==='x'){const x=texts.find(a=>a.id===id);return x&&t>=x.s&&t<x.s+x.d?xbox(x):null}
  return null;
}
function cvPt(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
function hit(px,py){
  for(let i=texts.length-1;i>=0;i--){const x=texts[i];if(t<x.s||t>=x.s+x.d)continue;const b=xbox(x);if(Math.abs(px-b.x)<=b.w/2&&Math.abs(py-b.y)<=b.h/2)return{k:'x',o:x}}
  for(const back of [false,true])for(let i=ovs.length-1;i>=0;i--){const o=ovs[i];if(!!o.back!==back||t<o.s||t>=o.s+o.d)continue;const b=ovbox(o);if(b&&Math.abs(px-b.x)<=b.w/2&&Math.abs(py-b.y)<=b.h/2)return{k:'o',o}}
  return null;
}
function updSB(){
  const b=foc&&(foc.k==='o'||foc.k==='x')?boxOf(foc.k,foc.id):null;
  if(!b){SB.hidden=true;return}
  const s=cv.clientWidth/W;SB.hidden=false;
  SB.style.left=(cv.offsetLeft+(b.x-b.w/2)*s)+'px';SB.style.top=(cv.offsetTop+(b.y-b.h/2)*s)+'px';SB.style.width=b.w*s+'px';SB.style.height=b.h*s+'px';
}
cv.addEventListener('pointerdown',e=>{
  const[p,q]=cvPt(e),h=hit(p,q);
  if(!h){if(foc&&(foc.k==='o'||foc.k==='x')){foc=null;renderTL();renderTB()}return}
  e.preventDefault();snap();setFoc(h.k,h.o.id);cv.setPointerCapture(e.pointerId);
  const o=h.o,isT=h.k==='x',ox0=isT?(o.px==null?.5:o.px):o.x,oy0=isT?(o.py==null?.86:o.py):o.y;
  const mv=ev=>{const[a,b]=cvPt(ev),nx=Math.min(1,Math.max(0,ox0+(a-p)/W)),ny=Math.min(1,Math.max(0,oy0+(b-q)/H));if(isT){o.px=nx;o.py=ny}else{o.x=nx;o.y=ny}};
  const up=()=>{cv.removeEventListener('pointermove',mv);cv.removeEventListener('pointerup',up);renderIn()};
  cv.addEventListener('pointermove',mv);cv.addEventListener('pointerup',up);
});
SB.querySelectorAll('.bx').forEach(b=>b.addEventListener('pointerdown',e=>{
  e.stopPropagation();e.preventDefault();const a=b.dataset.h;
  if(a==='x'){delFoc();return}
  if(a==='d'){dupFoc();return}
  const bx=boxOf(foc.k,foc.id);if(!bx)return;snap();
  const o=foc.k==='o'?ovs.find(i=>i.id===foc.id):texts.find(i=>i.id===foc.id),w0=o.w,z0=o.z,[c0,d0]=cvPt(e),r0=Math.hypot(c0-bx.x,d0-bx.y)||1;
  b.setPointerCapture(e.pointerId);
  const mv=ev=>{const[a1,b1]=cvPt(ev),k=Math.hypot(a1-bx.x,b1-bx.y)/r0;if(foc.k==='o')o.w=Math.min(1.5,Math.max(.05,w0*k));else o.z=Math.min(300,Math.max(16,z0*k))};
  const up=()=>{b.removeEventListener('pointermove',mv);b.removeEventListener('pointerup',up);renderIn()};
  b.addEventListener('pointermove',mv);b.addEventListener('pointerup',up);
}));
$('#sx').onclick=()=>SH.classList.remove('open');


const zoom=f=>{PX=Math.min(300,Math.max(12,PX*f));renderTL();TW.scrollLeft=t*PX;lastSet=TW.scrollLeft};
$('#zo').onclick=()=>zoom(1/1.4);$('#zi').onclick=()=>zoom(1.4);
addEventListener('resize',renderTL);
renderTL();renderIn();renderTB();
requestAnimationFrame(tick);
