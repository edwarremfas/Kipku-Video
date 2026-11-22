const $=s=>document.querySelector(s);
const cv=$('#cv'),cx=cv.getContext('2d'),V=document.createElement('video');
V.playsInline=true;V.preload='auto';
const FILES={},IM={},OC=document.createElement('canvas'),ox=OC.getContext('2d',{willReadFrequently:true}),hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const PRE={Asli:[100,100,100],Cerah:[110,105,130],Sinematik:[95,120,85],'Hitam putih':[100,110,0],Pudar:[105,85,70]};let BG='#000000',ovs=[],W=1280,H=720,AS=[],undo=[],redo=[],clips=[],texts=[],sel=null,t=0,playing=false,cur=null,last=0,uid=1,PX=50,ac=null,dest=null,rec=null,chunks=[],mime='';
const fmt=s=>{s=Math.max(0,s);return Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0')};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const len=c=>(c.out-c.in)/c.speed;
const total=()=>clips.reduce((a,c)=>a+len(c),0);
function loc(x){let a=0;for(const c of clips){const l=len(c);if(x<a+l)return{c,off:x-a};a+=l}const c=clips[clips.length-1];return c?{c,off:len(c)}:null}
function seekTo(c,off){
  const tt=c.in+off*c.speed;V.volume=c.vol==null?1:c.vol;
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
function play(){if(!clips.length)return;audio();if(t>=total()-.05)t=0;playing=true;last=performance.now();sync();V.play().catch(()=>{});$('#pl').textContent='Jeda'}
function pause(){playing=false;V.pause();AS.forEach(r=>r.a.pause());$('#pl').textContent='Putar'}
$('#pl').onclick=()=>playing?pause():play();
function tick(ts){
  if(playing){
    t+=(ts-last)/1000;const T=total();
    if(t>=T){t=T;pause();if(rec&&rec.state==='recording')rec.stop()}
    else{
      const L=loc(t);
      if(L.c!==cur)seekTo(L.c,L.off);
      else if(Math.abs(V.currentTime-(L.c.in+L.off*L.c.speed))>.4)V.currentTime=L.c.in+L.off*L.c.speed;
      if(V.paused)V.play().catch(()=>{});V.volume=L.c.vol==null?1:L.c.vol;tickA();
    }
  }
  last=ts;draw();requestAnimationFrame(tick);
}
function img(o){if(!IM[o.id]){const i=new Image();i.src=o.url;IM[o.id]=i}return IM[o.id]}
function drawOv(back){for(const o of ovs){if(!!o.back!==back||t<o.s||t>=o.s+o.d)continue;const i=img(o);if(!i.complete||!i.naturalWidth)continue;const w=o.w*W,h=w*i.naturalHeight/i.naturalWidth;cx.globalAlpha=o.o;cx.drawImage(i,o.x*W-w/2,o.y*H-h/2,w,h);cx.globalAlpha=1}}
function trf(c,off){const d=c.tdur||.6,p=Math.min(1,off/d),e=1-(1-p)*(1-p),q=1-e;switch(c.tin){case'fade':cx.globalAlpha*=e;break;case'kanan':cx.translate(q*W,0);break;case'kiri':cx.translate(-q*W,0);break;case'zoom':cx.translate(W/2,H/2);cx.scale(1+q*.6,1+q*.6);cx.translate(-W/2,-H/2);cx.globalAlpha*=e;break;case'putar':cx.translate(W/2,H/2);cx.rotate(-q*.6);cx.scale(.4+.6*e,.4+.6*e);cx.translate(-W/2,-H/2);cx.globalAlpha*=e}}
function keyed(c,w,h){const k=c.ck,sc=Math.min(1,640/V.videoWidth),ow=Math.max(2,V.videoWidth*sc|0),oh=Math.max(2,V.videoHeight*sc|0);if(OC.width!==ow||OC.height!==oh){OC.width=ow;OC.height=oh}ox.drawImage(V,0,0,ow,oh);const id=ox.getImageData(0,0,ow,oh),d=id.data,kc=hex(k.col),tol=k.tol*4.4,so=k.soft*4.4+1;for(let i=0;i<d.length;i+=4){const a=d[i]-kc[0],b=d[i+1]-kc[1],e=d[i+2]-kc[2],q=Math.sqrt(a*a+b*b+e*e);if(q<tol)d[i+3]=0;else if(q<tol+so)d[i+3]=255*(q-tol)/so}ox.putImageData(id,0,0);cx.drawImage(OC,(W-w)/2,(H-h)/2,w,h)}
function draw(){
  cx.filter='none';cx.fillStyle=BG;cx.fillRect(0,0,W,H);drawOv(true);
  const L=loc(t);
  if(L&&V.videoWidth){
    const c=L.c,f=c.f,k=c.fill?Math.max:Math.min,r=k(W/V.videoWidth,H/V.videoHeight),w=V.videoWidth*r,h=V.videoHeight*r,fd=c.fade||0,l=len(c);cx.globalAlpha=fd?Math.max(0,Math.min(1,L.off/fd,(l-L.off)/fd)):1;cx.save();if(c.flip){cx.translate(W,0);cx.scale(-1,1)}trf(c,L.off);
    cx.filter=`brightness(${f.b}%) contrast(${f.c}%) saturate(${f.s}%)`;
    if(c.ck&&c.ck.on)keyed(c,w,h);else cx.drawImage(V,(W-w)/2,(H-h)/2,w,h);cx.restore();cx.globalAlpha=1;cx.filter='none';
  }
  drawOv(false);for(const x of texts)if(t>=x.s&&t<x.s+x.d){
    cx.font=`700 ${x.z*W/1280}px "Trebuchet MS",sans-serif`;cx.textAlign='center';
    cx.lineWidth=x.z/8;cx.strokeStyle='#000';cx.fillStyle=x.col;
    const tx=(x.px==null?.5:x.px)*W,ty=(x.py==null?.86:x.py)*H;cx.strokeText(x.tx,tx,ty);cx.fillText(x.tx,tx,ty);
  }
  $('#tm').textContent=fmt(t)+' / '+fmt(total());
  const ph=$('#ph');if(ph)ph.style.left=t*PX+'px';
}
$('#imp').onclick=()=>$('#file').click();
$('#file').onchange=e=>{
  for(const f of e.target.files){
    const key='f'+Date.now()+Math.random().toString(36).slice(2,6),u=URL.createObjectURL(f),v=document.createElement('video');FILES[key]=f;
    v.preload='metadata';v.src=u;
    v.onloadedmetadata=()=>{
      const c={id:uid++,key,name:f.name,url:u,in:0,out:v.duration,dur:v.duration,speed:1,vol:1,fade:0,fill:false,flip:false,f:{b:100,c:100,s:100}};
      clips.push(c);sel=c;renderTL();renderIn();if(clips.length===1)sync();
    };
  }
  e.target.value='';
};
function renderTL(){
  const rw=$('#rw');
  if(!clips.length){rw.innerHTML='<div class="em">Linimasa kosong. Pilih "Tambah video".</div>';return}
  let a=0,h=`<div id="ph"></div>`;
  for(const c of clips){const l=len(c);h+=`<div class="cl${c===sel?' on':''}" data-c="${c.id}" style="left:${a*PX}px;width:${Math.max(l*PX,24)}px">${esc(c.name)}</div>`;a+=l}
  for(const r of AS)h+=`<div class="tx au" style="top:122px;height:22px;left:${r.start*PX}px;width:${Math.max((aEnd(r)-r.start)*PX,24)}px">${esc(r.name)}</div>`;for(const o of ovs)h+=`<div class="tx ov" style="top:96px;height:22px;left:${o.s*PX}px;width:${Math.max(o.d*PX,24)}px">${esc(o.name)}</div>`;for(const x of texts)h+=`<div class="tx" data-t="${x.id}" style="left:${x.s*PX}px;width:${Math.max(x.d*PX,24)}px">${esc(x.tx)}</div>`;
  rw.style.width=Math.max(a*PX+60,300)+'px';rw.innerHTML=h;
}
$('#rw').onpointerdown=e=>{
  if(!clips.length)return;
  const r=$('#rw').getBoundingClientRect();
  t=Math.min(Math.max((e.clientX-r.left)/PX,0),total());
  const c=e.target.closest('.cl');
  if(c){sel=clips.find(x=>x.id==c.dataset.c);renderTL();renderIn()}
  if(!playing)sync();
};
function slider(label,k,min,max,step,val){return `<label>${label}<input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`}
function renderIn(){
  let h='<h2>Klip terpilih</h2>';
  if(sel){
    h+=slider('Mulai potong','in',0,sel.dur,.1,sel.in)+slider('Akhir potong','out',0,sel.dur,.1,sel.out);
    h+=`<label>Kecepatan<select data-k="speed">${[.5,.75,1,1.5,2].map(v=>`<option value="${v}"${v===sel.speed?' selected':''}>${v}x</option>`).join('')}</select></label>`;
    h+='<div class="g">'+Object.keys(PRE).map(n=>`<button data-pre="${n}">${n}</button>`).join('')+'</div>';h+=slider('Kecerahan','fb',50,150,1,sel.f.b)+slider('Kontras','fc',50,150,1,sel.f.c)+slider('Saturasi','fs',0,200,1,sel.f.s);h+=slider('Volume klip','vol',0,1,.05,sel.vol==null?1:sel.vol)+slider('Memudar di awal dan akhir (detik)','fade',0,1.5,.1,sel.fade||0);h+=`<label><input type="checkbox" data-b="fill"${sel.fill?' checked':''}> Isi layar penuh</label><label><input type="checkbox" data-b="flip"${sel.flip?' checked':''}> Cermin</label>`;h+=`<label>Transisi masuk<select data-k="tin">${[['','Tidak ada'],['fade','Memudar'],['kanan','Geser dari kanan'],['kiri','Geser dari kiri'],['zoom','Zoom masuk'],['putar','Putar masuk']].map(o=>`<option value="${o[0]}"${(sel.tin||'')===o[0]?' selected':''}>${o[1]}</option>`).join('')}</select></label>`+slider('Durasi transisi (detik)','tdur',.2,2,.1,sel.tdur||.6);const ck=sel.ck||{on:false,col:'#00ff00',tol:40,soft:20};h+=`<label><input type="checkbox" data-b="ckon"${ck.on?' checked':''}> Hapus latar warna (chroma key)</label><label>Warna latar yang dihapus<input type="color" data-ckc value="${ck.col}"></label>`+slider('Toleransi','ckt',0,100,1,ck.tol)+slider('Kehalusan tepi','cks',0,60,1,ck.soft);
    h+='<div class="g"><button id="sp">Pisah di playhead</button><button id="sa">Pisahkan audio</button><button id="lf">Geser kiri</button><button id="rt">Geser kanan</button><button id="dl">Hapus</button></div>';
  }else h+='<div class="em">Pilih klip di linimasa.</div>';
  h+='<div class="tr"><h2>Overlay gambar</h2><button id="ao">Tambah gambar</button><label>Warna latar<input type="color" id="bg" value="'+BG+'"></label>';
  for(const o of ovs)h+=`<div class="tr" data-oid="${o.id}"><div>${esc(o.name)}</div><div class="g"><input type="number" data-o="s" step=".1" value="${o.s.toFixed(1)}" title="Mulai (detik)" style="width:70px"><input type="number" data-o="d" step=".1" value="${o.d}" title="Durasi (detik)" style="width:70px"><button data-o="del">Hapus</button></div><label>Ukuran<input type="range" data-o="w" min=".05" max="1" step=".01" value="${o.w}"></label><label>Posisi horizontal<input type="range" data-o="x" min="0" max="1" step=".01" value="${o.x}"></label><label>Posisi vertikal<input type="range" data-o="y" min="0" max="1" step=".01" value="${o.y}"></label><label>Transparansi<input type="range" data-o="o" min=".1" max="1" step=".05" value="${o.o}"></label><label><input type="checkbox" data-o="back"${o.back?' checked':''}> Di belakang video</label></div>`;
  h+='</div>';
  h+='<div class="tr"><h2>Audio dan musik</h2><button id="mu">Tambah musik</button>';
  for(const r of AS)h+=`<div class="tr" data-aid="${r.id}"><div>${esc(r.name)}</div><label>Volume<input type="range" data-a="vol" min="0" max="1" step=".05" value="${r.vol}"></label><div class="g"><input type="number" data-a="start" step=".1" min="0" value="${r.start.toFixed(1)}" title="Mulai di linimasa (detik)" style="width:76px"><input type="number" data-a="inn" step=".1" min="0" value="${r.inn.toFixed(1)}" title="Potong awal (detik)" style="width:76px"><input type="number" data-a="out" step=".1" min="0" value="${(r.out==null?0:r.out).toFixed(1)}" title="Potong akhir (detik)" style="width:76px"><button data-a="del">Hapus</button></div><label>Kiri ke kanan: mulai di linimasa, potong awal, potong akhir (detik)</label></div>`;
  h+='</div>';h+='<div class="tr"><h2>Teks</h2><button id="at">Tambah teks di playhead</button>';
  for(const x of texts)h+=`<div class="tr" data-id="${x.id}"><input type="text" data-x="tx" value="${esc(x.tx)}"><div class="g"><input type="number" data-x="s" step=".1" value="${x.s.toFixed(1)}" title="Mulai (detik)" style="width:70px"><input type="number" data-x="d" step=".1" value="${x.d}" title="Durasi (detik)" style="width:70px"><input type="number" data-x="z" value="${x.z}" title="Ukuran" style="width:70px"><input type="color" data-x="col" value="${x.col}"><button data-x="del">Hapus</button></div><label>Posisi horizontal<input type="range" data-x="px" min="0" max="1" step=".01" value="${x.px==null?.5:x.px}"></label><label>Posisi vertikal<input type="range" data-x="py" min="0" max="1" step=".01" value="${x.py==null?.86:x.py}"></label></div>`;
  h+='</div>';
  const el=$('#in');el.innerHTML=h;
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
  on('#mu',()=>$('#mf').click());on('#sa',()=>{snap();let a=0;for(const c of clips){if(c===sel)break;a+=len(c)}mkA(sel.url,sel.name+' (audio)',sel.key,a,sel.in,sel.out,sel.speed,1);sel.vol=0;renderIn();sync()});
  el.querySelectorAll('[data-a]').forEach(e=>{const f=()=>{const r=AS.find(x=>x.id==e.closest('[data-aid]').dataset.aid),k=e.dataset.a;if(k==='del'){r.a.pause();AS=AS.filter(x=>x!==r);renderIn();renderTL();return}const v=+e.value;if(k==='vol'){r.vol=v;r.a.volume=v}else if(k==='start')r.start=Math.max(0,v);else if(k==='inn')r.inn=Math.max(0,Math.min(v,(r.out==null?v+.1:r.out)-.1));else if(k==='out')r.out=Math.min(Math.max(v,r.inn+.1),r.a.duration||v);if(k!=='vol')e.value=r[k];renderTL();if(!playing)syncOne(r)};e.onchange=f;if(e.type==='range')e.oninput=f;if(e.tagName==='BUTTON')e.onclick=f;e.addEventListener('pointerdown',snap)});
  on('#ao',()=>$('#of').click());
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
$('#ar').onchange=e=>{if(rec)return;[W,H]=e.target.value.split('x').map(Number);cv.width=W;cv.height=H};
$('#mf').onchange=e=>{for(const f of e.target.files){const key='f'+Date.now()+Math.random().toString(36).slice(2,6);FILES[key]=f;mkA(URL.createObjectURL(f),f.name,key,t,0,null,1,.6)}renderIn();renderTL();e.target.value=''};
$('#of').onchange=e=>{const f=e.target.files[0];if(!f)return;snap();const key='f'+Date.now()+Math.random().toString(36).slice(2,6);FILES[key]=f;ovs.push({id:uid++,key,url:URL.createObjectURL(f),name:f.name,s:t,d:5,x:.5,y:.5,w:.3,o:1,back:false});renderTL();renderIn();e.target.value=''};
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('klipku',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function kvSet(k,v){const d=await idb();return new Promise((ok,no)=>{const q=d.transaction('kv','readwrite').objectStore('kv').put(v,k);q.onsuccess=ok;q.onerror=()=>no(q.error)})}
async function kvGet(k){const d=await idb();return new Promise((ok,no)=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})}
$('#sv').onclick=async()=>{
  const b=$('#sv'),used=new Set(clips.map(c=>c.key)),files={};
  for(const r of AS)used.add(r.key);for(const o of ovs)used.add(o.key);
  for(const k of used)if(FILES[k])files[k]=FILES[k];
  try{
    await kvSet('proj',{clips:clips.map(c=>({...c,url:''})),texts,ovs:ovs.map(o=>({...o,url:''})),BG,W,H,uid,files,aud:AS.map(r=>({key:r.key,name:r.name,start:r.start,inn:r.inn,out:r.out,rate:r.rate,vol:r.vol}))});
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
    clips=p.clips.map(c=>({...c,url:url(c.key)}));texts=p.texts;ovs=(p.ovs||[]).map(o=>({...o,url:url(o.key)}));BG=p.BG||'#000000';for(const k in IM)delete IM[k];uid=p.uid;W=p.W;H=p.H;
    cv.width=W;cv.height=H;$('#ar').value=W+'x'+H;
    AS.forEach(r=>r.a.pause());AS=[];for(const r of [].concat(p.aud||[]))mkA(url(r.key),r.name||'Audio',r.key,r.start,r.inn,r.out!=null?r.out:(r.end>=0?r.inn+(r.end-r.start)*r.rate:null),r.rate,r.vol!=null?r.vol:.6);
    sel=clips[0]||null;cur=null;t=0;undo=[];redo=[];renderTL();renderIn();sync();
  }catch(e){alert('Gagal membuka proyek: '+(e.message||e))}
};
$('#exp').onclick=async()=>{
  if(!clips.length||rec)return;
  if(!window.MediaRecorder){alert('Browser ini belum mendukung perekaman.');return}
  mime=['video/webm;codecs=vp9,opus','video/webm','video/mp4'].find(m=>MediaRecorder.isTypeSupported(m))||'';
  audio();
  const st=cv.captureStream(30);dest.stream.getAudioTracks().forEach(a=>st.addTrack(a));
  chunks=[];rec=new MediaRecorder(st,mime?{mimeType:mime,videoBitsPerSecond:6e6}:{});
  rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  rec.onstop=async()=>{
    rec=null;$('#exp').textContent='Ekspor';
    const blob=new Blob(chunks,{type:mime||'video/webm'}),ext=mime.includes('mp4')?'mp4':'webm';
    try{
      const d=(window.claude&&claude.use)?await claude.use('downloads'):null;
      if(d){await d.save({filename:'klipku.'+ext,data:blob})}
      else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='klipku.'+ext;document.body.appendChild(a);a.click();a.remove()}
    }catch(err){if(!err||err.code!=='declined')alert('Gagal menyimpan: '+((err&&err.message)||err))}
  };
  $('#exp').textContent='Merekam…';t=0;rec.start();play();
};
requestAnimationFrame(tick);
