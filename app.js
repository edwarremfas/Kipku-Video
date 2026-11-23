'use strict';
const $=i=>document.getElementById(i),M={},B={},cv=$('cv'),cx=cv.getContext('2d');
const S={W:1280,H:720,main:[],ov:[],aud:[],t:0,z:60,play:0,mute:0,sel:null,end:null};
let U=[],R=[],nid=1,pend=[],pmode='m',last=0;
const id=()=>'i'+nid++,tt=m=>(m=Math.max(0,m),(m/60|0)+':'+(m%60).toFixed(1).padStart(4,'0')),ev=x=>Math.max(2,Math.round(x/2)*2);
const toast=(m,k)=>{const e=$('toast');e.textContent=m;e.hidden=0;clearTimeout(toast.h);if(!k)toast.h=setTimeout(()=>e.hidden=1,2400)};
const snap=()=>JSON.stringify({main:S.main,ov:S.ov,aud:S.aud,W:S.W,H:S.H});
const cm=()=>{U.push(snap());if(U.length>60)U.shift();R=[]};
const load=s=>{Object.assign(S,JSON.parse(s));S.sel=null;$('ar').value=S.W+'x'+S.H;cv.width=S.W;cv.height=S.H;ui()};
const ms=()=>{let s=0;return S.main.map(c=>{const r=s;s+=c.len;return r})};
const T=()=>Math.max(.1,S.main.reduce((a,c)=>a+c.len,0),...S.ov.map(o=>o.start+o.len),...S.aud.map(o=>o.start+o.len));
const dl=(b,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),9e3)};

/* ---------- media ---------- */
const lm=f=>new Promise(res=>{const u=URL.createObjectURL(f),m={id:id(),file:f,url:u,name:f.name},ty=f.type.split('/')[0];
 if(ty=='image'){const e=new Image();e.onload=()=>{m.el=e;m.type='i';m.dur=3;m.th=u;M[m.id]=m;res(m)};e.src=u}
 else if(ty=='audio'){const e=new Audio();e.preload='auto';e.onloadedmetadata=()=>{m.el=e;m.type='a';m.dur=e.duration;M[m.id]=m;res(m)};e.src=u}
 else{const e=document.createElement('video');e.playsInline=1;e.preload='auto';e.onloadeddata=()=>{m.el=e;m.type='v';m.dur=e.duration;
  e.onseeked=()=>{e.onseeked=null;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),k=Math.max(64/e.videoWidth,64/e.videoHeight);
   g.drawImage(e,(64-e.videoWidth*k)/2,(64-e.videoHeight*k)/2,e.videoWidth*k,e.videoHeight*k);m.th=c.toDataURL();M[m.id]=m;res(m)};e.currentTime=Math.min(.1,e.duration/2)};e.src=u}});

/* ---------- picker (seperti CapCut: Video/Foto, pilih, Tambah) ---------- */
function op(m){pmode=m;pend=[];$('pick').hidden=0;$('pkt').textContent=m=='m'?'Tambah ke linimasa':'Tambah overlay';pg()}
function pg(){const g=$('pkg');g.innerHTML='';pend.forEach(p=>{const d=document.createElement('button');d.className='pt'+(p.on?' on':'');
 if(p.m.th)d.style.backgroundImage='url('+p.m.th+')';d.textContent=p.m.type=='v'?tt(p.m.dur):'';d.onclick=()=>{p.on=!p.on;pg()};g.append(d)});
 const n=pend.filter(p=>p.on).length;$('pka').disabled=!n;$('pka').textContent='Tambah ('+n+')'}
$('imp').onclick=()=>op('m');
$('pkv').onclick=()=>{$('file').accept='video/*';$('file').click()};
$('pkf').onclick=()=>{$('file').accept='image/*';$('file').click()};
$('file').onchange=async e=>{toast('Memuat…',1);for(const f of e.target.files)pend.push({m:await lm(f),on:1});e.target.value='';$('toast').hidden=1;pg()};
$('pkx').onclick=()=>$('pick').hidden=1;
$('pka').onclick=()=>{cm();pend.filter(p=>p.on).forEach(p=>{const m=p.m;
 if(pmode=='m')S.main.push({id:id(),m:m.id,in:0,len:m.dur});
 else S.ov.push({id:id(),k:m.type,m:m.id,x:.5,y:.5,sc:1,start:S.t,len:m.dur,in:0})});$('pick').hidden=1;ui()};
$('mf').onchange=async e=>{cm();for(const f of e.target.files){const m=await lm(f);S.aud.push({id:id(),m:m.id,start:S.t,len:m.dur,in:0})}e.target.value='';ui()};
$('ar').onchange=e=>{cm();[S.W,S.H]=e.target.value.split('x').map(Number);cv.width=S.W;cv.height=S.H;ui()};

/* ---------- render ---------- */
function draw(g,t,k){const cw=g.canvas.width,ch=g.canvas.height;if(L.width!=cw||L.height!=ch){L.width=P.width=cw;L.height=P.height=ch}
 const l=L.getContext('2d'),s=ms();l.setTransform(k,0,0,k,0,0);l.fillStyle='#000';l.fillRect(0,0,S.W,S.H);let tr=null;
 S.main.forEach((c,i)=>{if(t<s[i]||t>=s[i]+c.len)return;const e=M[c.m].el,w=e.videoWidth||e.naturalWidth,h=e.videoHeight||e.naturalHeight,f=Math.min(S.W/w,S.H/h);
  const o=t-s[i],q=c.fx||'',p=Math.min(1,o/.3),z=q.includes('pop')?1+.25*(1-p):1,sk=q.includes('shake')&&o<.4?1-o/.4:0;
  l.save();l.translate(S.W/2+Math.sin(o*60)*18*sk,S.H/2+Math.cos(o*47)*12*sk);l.scale(z,z);l.translate(-S.W/2,-S.H/2);
  l.filter=[c.fl,q.includes('inv')&&o<.12?'invert(1)':''].filter(Boolean).join(' ')||'none';if(w)l.drawImage(e,(S.W-w*f)/2,(S.H-h*f)/2,w*f,h*f);l.filter='none';l.restore();
  if(q.includes('flash')&&o<.2){l.globalAlpha=.8*(1-o/.2);l.fillStyle='#fff';l.fillRect(0,0,S.W,S.H);l.globalAlpha=1}
  if(i&&c.tr&&c.tr.n&&t<s[i]+c.tr.d)tr=[c.tr,(t-s[i])/c.tr.d]});
 g.setTransform(k,0,0,k,0,0);g.fillStyle='#000';g.fillRect(0,0,S.W,S.H);
 if(tr)trn(g,tr[0].n,tr[1]);else{g.drawImage(L,0,0,S.W,S.H);P.getContext('2d').drawImage(L,0,0)}
 S.ov.forEach(o=>{if(t<o.start||t>=o.start+o.len)return;let w,h;
  if(o.k=='t'){g.font='700 '+S.W*.06*o.sc+'px sans-serif';g.textAlign='center';g.textBaseline='middle';w=g.measureText(o.text).width;h=S.W*.07*o.sc;
   g.lineWidth=h*.1;g.strokeStyle='#000';g.fillStyle='#fff';g.strokeText(o.text,o.x*S.W,o.y*S.H);g.fillText(o.text,o.x*S.W,o.y*S.H)}
  else{const e=M[o.m].el,iw=e.videoWidth||e.naturalWidth,ih=e.videoHeight||e.naturalHeight;w=S.W*.4*o.sc;h=w*ih/iw;g.globalAlpha=o.op==null?1:o.op;g.drawImage(o.bg?key(e,o):e,o.x*S.W-w/2,o.y*S.H-h/2,w,h);g.globalAlpha=1}
  B[o.id]={x:o.x*S.W,y:o.y*S.H,w,h}})}
function sync(){const t=S.t,s=ms(),W=new Map();
 S.main.forEach((c,i)=>{if(t>=s[i]&&t<s[i]+c.len&&M[c.m].type=='v')W.set(M[c.m].el,[c.in+(t-s[i])*(c.sp||1),S.mute,c.sp||1,c.vol==null?1:c.vol])});
 S.ov.forEach(o=>{if(o.k=='v'&&t>=o.start&&t<o.start+o.len&&!W.has(M[o.m].el))W.set(M[o.m].el,[o.in+(t-o.start)*(o.sp||1),1,o.sp||1,1])});
 S.aud.forEach(o=>{if(t>=o.start&&t<o.start+o.len)W.set(M[o.m].el,[o.in+(t-o.start)*(o.sp||1),0,o.sp||1,o.vol==null?1:o.vol])});
 Object.values(M).forEach(m=>{if(m.type=='i')return;const w=W.get(m.el),e=m.el;if(!w){if(!e.paused)e.pause();return}
  e.muted=!!w[1];e.volume=Math.min(1,w[3]);e.playbackRate=w[2];const d=Math.abs(e.currentTime-w[0]);
  if(S.play){if(e.paused){e.currentTime=w[0];e.play().catch(()=>{})}else if(d>.35)e.currentTime=w[0]}
  else{if(!e.paused)e.pause();if(d>.04)e.currentTime=w[0]}})}
function sb(){const e=$('sb'),o=S.sel&&S.sel.k=='o'&&S.ov.find(x=>x.id==S.sel.id),b=o&&B[o.id];
 if(!o||!b||S.t<o.start||S.t>=o.start+o.len){e.hidden=1;return}
 const r=cv.getBoundingClientRect(),p=cv.parentElement.getBoundingClientRect(),k=r.width/S.W;e.hidden=0;
 e.style.cssText=`left:${r.left-p.left+(b.x-b.w/2)*k}px;top:${r.top-p.top+(b.y-b.h/2)*k}px;width:${b.w*k}px;height:${b.h*k}px`}
function rf(){draw(cx,S.t,1);sync();$('tm').textContent=tt(S.t)+' / '+tt(T());sb()}
function setT(t){S.t=Math.max(0,Math.min(t,T()));$('tw').scrollLeft=S.t*S.z;rf()}
function pp(on){S.play=on;$('pl').textContent=on?'❚❚':'▶';if(on){if(S.t>=T()-.05)S.t=0;last=performance.now();requestAnimationFrame(tick)}sync()}
function tick(n){if(!S.play)return;S.t+=(n-last)/1e3;last=n;
 if(S.t>=T()){pp(0);setT(0);if(S.end)S.end();return}setT(S.t);requestAnimationFrame(tick)}
$('pl').onclick=()=>pp(!S.play);
$('tw').onscroll=()=>{const w=$('tw');if(S.play||Math.abs(w.scrollLeft-S.t*S.z)<1.5)return;S.t=Math.min(w.scrollLeft/S.z,T());rf()};

/* ---------- linimasa ---------- */
function tl(){const h=$('tw').clientWidth/2,z=S.z,s=ms();let o='';$('rw').style.width=T()*z+h*2+'px';
 const cl=(k,i,st,len,y,hh,m,lab,c)=>`<div class="cl ${c||''}${S.sel&&S.sel.id==i?' on':''}" data-k="${k}" data-i="${i}" style="left:${h+st*z}px;width:${len*z}px;top:${y}px;height:${hh}px;${m&&m.th?`background-image:url(${m.th})`:''}">${lab}${S.sel&&S.sel.id==i?'<i class="hd" data-e="l"></i><i class="hd r" data-e="r"></i>':''}</div>`;
 S.main.forEach((c,i)=>{o+=cl('m',c.id,s[i],c.len,4,52,M[c.m],(M[c.m].type=='v'?tt(c.len):'')+(c.sp&&c.sp!=1?' '+c.sp+'x':''));if(i)o+='<div class="jn" data-i="'+c.id+'" style="left:'+(h+s[i]*z-11)+'px">'+(c.tr&&c.tr.n?'◆':'⋈')+'</div>'});
 S.ov.forEach(v=>o+=cl('o',v.id,v.start,v.len,v.k=='t'?100:62,34,v.k=='t'?0:M[v.m],v.k=='t'?v.text:'',v.k=='t'?'tx':''));
 S.aud.forEach(a=>o+=cl('a',a.id,a.start,a.len,138,34,0,'♪ '+M[a.m].name,'au'));$('rw').innerHTML=o}
$('rw').onclick=e=>{const j=e.target.closest('.jn');if(j)return trs(j.dataset.i);const c=e.target.closest('.cl');S.sel=c?{k:c.dataset.k,id:c.dataset.i}:null;tl();tbr();rf()};
const fnd=()=>{const s=S.sel;if(!s)return;const l=s.k=='m'?S.main:s.k=='o'?S.ov:S.aud;return[l,l.findIndex(x=>x.id==s.id)]};
function tbr(){const s=S.sel,f=fnd(),it=f&&f[0][f[1]],m=it&&M[it.m],tx=it&&it.k=='t',md=m&&(m.type=='v'||m.type=='a'),vis=it&&s.k!='a'&&!tx,b=(a,i,l)=>`<button data-a="${a}"><span>${i}</span>${l}</button>`;
 $('tb').innerHTML=s?b('split','✂','Pisah')+(tx?b('edit','✎','Ubah teks'):'')+(md?b('spd','⏱','Kecepatan')+(s.k!='o'?b('vol','🔊','Volume'):''):'')+(vis&&s.k=='m'?b('flt','◐','Filter')+b('fx','⚡','Efek'):'')+(vis&&s.k=='o'?b('bg','✨','Hapus latar')+(it.bg?b('tol','◎','Toleransi'):'')+b('opa','◔','Opasitas'):'')+b('dup','⧉','Duplikat')+b('del','🗑','Hapus')+b('x','✕','Batal')
  :b('aud','♪','Audio')+b('txt','T','Teks')+b('ov','▣','Overlay')+b('split','✂','Pisah')+b('mute','🔇','Bisukan')}
function sp(f){const t=S.t;if(!f){const s=ms(),i=s.findIndex((v,j)=>t>v&&t<v+S.main[j].len);if(i<0)return toast('Letakkan playhead di dalam klip');f=[S.main,i];S.sel={k:'m',id:S.main[i].id}}
 const[l,i]=f,c=l[i],st=S.sel.k=='m'?ms()[i]:c.start,d=t-st;if(d<.1||d>c.len-.1)return toast('Letakkan playhead di dalam klip');
 cm();const n={...c,id:id(),in:(c.in||0)+d*(c.sp||1),len:c.len-d,tr:null};c.len=d;if(S.sel.k!='m')n.start=t;l.splice(i+1,0,n)}
$('tb').onclick=e=>{const a=e.target.closest('button');if(!a)return;const k=a.dataset.a,f=fnd(),it=f&&f[0][f[1]];
 if(k=='aud')return $('mf').click();if(k=='ov')return op('o');
 if(k=='spd')return sh('Kecepatan',SP,String(it.sp||1),v=>{cm();const n=+v;it.len=it.len*(it.sp||1)/n;it.sp=n;$('sheet').className='';ui()});
 if(k=='vol')return sh('Volume',VO,String(it.vol==null?1:it.vol),v=>{cm();it.vol=+v;$('sheet').className='';ui()});
 if(k=='flt')return sh('Filter',FL,it.fl||'none',v=>{cm();it.fl=v=='none'?'':v;$('sheet').className='';ui()});
 if(k=='fx')return sh('Efek',FX,it.fx||'',v=>{cm();it.fx=v;$('sheet').className='';ui()});
 if(k=='opa')return sh('Opasitas',OP,String(it.op==null?1:it.op),v=>{cm();it.op=+v;$('sheet').className='';ui()});
 if(k=='tol')return sh('Toleransi hapus latar',TL,String(it.tol||60),v=>{cm();it.tol=+v;$('sheet').className='';ui()});
 if(k=='bg'){cm();it.bg=!it.bg;it.kc=null;toast(it.bg?'Latar dihapus (warna sudut gambar)':'Latar dikembalikan');return ui()}
 if(k=='txt'){const x=prompt('Teks:');if(x){cm();S.ov.push({id:id(),k:'t',text:x,x:.5,y:.5,sc:1,start:S.t,len:3})}}
 else if(k=='mute'){S.mute=!S.mute;toast(S.mute?'Suara klip dimatikan':'Suara klip aktif')}
 else if(k=='x')S.sel=null;
 else if(k=='edit'){const x=prompt('Teks:',it.text);if(x){cm();it.text=x}}
 else if(k=='split')sp(f);
 else if(f&&k=='dup'){cm();const c={...it,id:id()};if(S.sel.k=='m')f[0].splice(f[1]+1,0,c);else{c.start+=.3;f[0].push(c)}}
 else if(f&&k=='del'){cm();f[0].splice(f[1],1);S.sel=null}
 ui()};
function ui(){tl();tbr();setT(S.t)}
$('zi').onclick=()=>{S.z=Math.min(300,S.z*1.4);ui()};$('zo').onclick=()=>{S.z=Math.max(15,S.z/1.4);ui()};
$('un').onclick=()=>{if(U.length){R.push(snap());load(U.pop())}};$('re').onclick=()=>{if(R.length){U.push(snap());load(R.pop())}};
$('mt').onclick=()=>{S.mute=!S.mute;toast(S.mute?'Suara klip dimatikan':'Suara klip aktif')};
$('cvb').onclick=()=>toast('Fitur ini belum ada di versi ini');

/* ---------- geser & ubah ukuran overlay di kanvas ---------- */
let dr=null;
cv.onpointerdown=e=>{const r=cv.getBoundingClientRect(),k=S.W/r.width,px=(e.clientX-r.left)*k,py=(e.clientY-r.top)*k;
 const o=[...S.ov].reverse().find(o=>{const b=B[o.id];return S.t>=o.start&&S.t<o.start+o.len&&b&&Math.abs(px-b.x)<b.w/2&&Math.abs(py-b.y)<b.h/2});
 if(!o)return;S.sel={k:'o',id:o.id};tl();tbr();rf();dr={o,px,py,x:o.x,y:o.y,c:0};cv.setPointerCapture(e.pointerId)};
cv.onpointermove=e=>{if(!dr)return;const r=cv.getBoundingClientRect(),k=S.W/r.width;if(!dr.c){cm();dr.c=1}
 dr.o.x=dr.x+((e.clientX-r.left)*k-dr.px)/S.W;dr.o.y=dr.y+((e.clientY-r.top)*k-dr.py)/S.H;rf()};
cv.onpointerup=()=>dr=null;
$('sb').onpointerdown=e=>{const h=e.target.dataset.h,o=S.sel&&S.ov.find(x=>x.id==S.sel.id);if(!h||!o)return;e.stopPropagation();
 if(h=='x'){cm();S.ov.splice(S.ov.indexOf(o),1);S.sel=null;return ui()}
 if(h=='d'){cm();S.ov.push({...o,id:id(),x:o.x+.05,y:o.y+.05});return ui()}
 const r=cv.getBoundingClientRect(),k=S.W/r.width,d0=Math.hypot((e.clientX-r.left)*k-o.x*S.W,(e.clientY-r.top)*k-o.y*S.H),s0=o.sc;cm();
 const mv=v=>{o.sc=Math.max(.1,s0*Math.hypot((v.clientX-r.left)*k-o.x*S.W,(v.clientY-r.top)*k-o.y*S.H)/d0);rf()},
 up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};addEventListener('pointermove',mv);addEventListener('pointerup',up)};

/* ---------- EKSPOR OFFLINE (tanpa real-time): render frame demi frame -> H.264 -> MP4 ---------- */
const sk=(e,t)=>new Promise(r=>{t=Math.max(0,Math.min(t,(e.duration||t)-.02));if(Math.abs(e.currentTime-t)<.001)return r();
 const q=setTimeout(r,2500);e.onseeked=()=>{clearTimeout(q);e.onseeked=null;r()};e.currentTime=t});
async function prep(t){const s=ms(),a=[];
 S.main.forEach((c,i)=>{if(t>=s[i]&&t<s[i]+c.len&&M[c.m].type=='v')a.push(sk(M[c.m].el,c.in+(t-s[i])*(c.sp||1)))});
 S.ov.forEach(o=>{if(o.k=='v'&&t>=o.start&&t<o.start+o.len)a.push(sk(M[o.m].el,o.in+(t-o.start)*(o.sp||1)))});await Promise.all(a)}
async function mix(){const sr=44100,oc=new OfflineAudioContext(2,Math.ceil(T()*sr),sr),s=ms();let n=0;
 const add=async(m,st,i,l,r,v)=>{try{m.ab=m.ab||await oc.decodeAudioData(await m.file.arrayBuffer());const b=oc.createBufferSource();b.buffer=m.ab;b.playbackRate.value=r||1;const gn=oc.createGain();gn.gain.value=v==null?1:v;b.connect(gn);gn.connect(oc.destination);b.start(st,i,l*(r||1));n++}catch(e){}};
 if(!S.mute)for(let i=0;i<S.main.length;i++){const m=M[S.main[i].m];if(m.type=='v')await add(m,s[i],S.main[i].in,S.main[i].len,S.main[i].sp,S.main[i].vol)}
 for(const a of S.aud)await add(M[a.m],a.start,a.in,a.len,a.sp,a.vol);return n?oc.startRendering():null}
async function exp(){pp(0);if(!S.main.length&&!S.ov.length)return toast('Tambahkan video dulu');
 if(!window.VideoEncoder||!window.VideoFrame)return rt();
 const f=+$('ql').value,W=ev(S.W*f),H=ev(S.H*f),F=30,n=Math.ceil(T()*F),k=W/S.W,c=document.createElement('canvas');c.width=W;c.height=H;
 const g=c.getContext('2d'),vs=[],as=[];let vd,ad,er;
 try{const ve=new VideoEncoder({output:(h,m)=>{const b=new Uint8Array(h.byteLength);h.copyTo(b);vs.push({b,k:h.type=='key'});
   if(m&&m.decoderConfig&&m.decoderConfig.description)vd=new Uint8Array(m.decoderConfig.description)},error:e=>er=e});
  ve.configure({codec:'avc1.640033',width:W,height:H,bitrate:Math.round(W*H*F*.1),framerate:F,avc:{format:'avc'}});
  for(let i=0;i<n;i++){if(er)throw er;const t=i/F;await prep(t);draw(g,t,k);const fr=new VideoFrame(c,{timestamp:Math.round(i*1e6/F)});
   ve.encode(fr,{keyFrame:i%60==0});fr.close();while(ve.encodeQueueSize>8)await new Promise(r=>setTimeout(r,4));
   if(i%4==0)toast('Mengekspor '+Math.round(i/n*100)+'%',1)}
  await ve.flush();if(er||!vd)throw er||new Error('no config');
  try{const buf=await mix();if(buf&&window.AudioEncoder){
   const ae=new AudioEncoder({output:(h,m)=>{const b=new Uint8Array(h.byteLength);h.copyTo(b);as.push({b});if(m&&m.decoderConfig&&m.decoderConfig.description)ad=new Uint8Array(m.decoderConfig.description)},error:()=>{}});
   ae.configure({codec:'mp4a.40.2',sampleRate:44100,numberOfChannels:2,bitrate:128000});
   const L=buf.getChannelData(0),Rr=buf.getChannelData(1);
   for(let p=0;p<L.length;p+=4096){const m=Math.min(4096,L.length-p),d=new Float32Array(m*2);d.set(L.subarray(p,p+m));d.set(Rr.subarray(p,p+m),m);
    const a=new AudioData({format:'f32-planar',sampleRate:44100,numberOfFrames:m,numberOfChannels:2,timestamp:Math.round(p*1e6/44100),data:d});ae.encode(a);a.close()}
   await ae.flush()}}catch(e){as.length=0}
  dl(mux(vs,vd,W,H,F,as.length&&ad?as:[],ad,T()),'klipku.mp4');toast('Selesai! Video diunduh.');setT(S.t)}
 catch(e){toast('Ekspor cepat gagal, beralih ke mode rekam…');setTimeout(rt,900)}}
function rt(){if(!window.MediaRecorder)return toast('Browser tidak mendukung ekspor');
 const r=new MediaRecorder(cv.captureStream(30),{mimeType:MediaRecorder.isTypeSupported('video/webm')?'video/webm':''}),ch=[];
 r.ondataavailable=e=>ch.push(e.data);r.onstop=()=>{S.end=null;dl(new Blob(ch,{type:'video/webm'}),'klipku.webm');toast('Selesai (mode rekam, tanpa suara).')};
 S.t=0;S.end=()=>r.stop();r.start();pp(1);toast('Merekam real-time…',1)}
$('exp').onclick=exp;

/* muxer MP4 minimal (H.264 + AAC), moov di depan agar langsung bisa diputar/dibagikan */
function mux(vs,vd,W,H,F,as,ad,d){
 const u32=n=>[n>>>24&255,n>>>16&255,n>>>8&255,n&255],u16=n=>[n>>8&255,n&255],s4=s=>[...s].map(c=>c.charCodeAt(0)),z=n=>new Array(n).fill(0);
 const bx=(t,...c)=>{const q=c.flat(Infinity);return[...u32(q.length+8),...s4(t),...q]};
 const mtx=[65536,0,0,0,65536,0,0,0,1073741824].flatMap(u32),Dm=Math.round(d*1000);
 const trak=(i,v,ts,dur,entry,sm,off)=>{const sz=sm.map(s=>s.b.length),ks=[];sm.forEach((s,j)=>{if(s.k)ks.push(j+1)});
  const stbl=bx('stbl',bx('stsd',u32(0),u32(1),entry),bx('stts',u32(0),u32(1),u32(sm.length),u32(v?90000/F:1024)),
   v?bx('stss',u32(0),u32(ks.length),ks.flatMap(u32)):[],bx('stsc',u32(0),u32(1),u32(1),u32(sm.length),u32(1)),
   bx('stsz',u32(0),u32(0),u32(sm.length),sz.flatMap(u32)),bx('stco',u32(0),u32(1),u32(off)));
  return bx('trak',bx('tkhd',u32(3),u32(0),u32(0),u32(i),u32(0),u32(Dm),z(8),u16(0),u16(0),u16(v?0:256),u16(0),mtx,u32(v?W<<16:0),u32(v?H<<16:0)),
   bx('mdia',bx('mdhd',u32(0),u32(0),u32(0),u32(ts),u32(dur),u16(0x55c4),u16(0)),
    bx('hdlr',u32(0),u32(0),s4(v?'vide':'soun'),z(12),s4('V'),[0]),
    bx('minf',v?bx('vmhd',u32(1),z(8)):bx('smhd',u32(0),z(4)),bx('dinf',bx('dref',u32(0),u32(1),bx('url ',u32(1)))),stbl)))};
 const avc=bx('avc1',z(6),u16(1),z(16),u16(W),u16(H),u32(0x480000),u32(0x480000),u32(0),u16(1),z(32),u16(24),u16(0xffff),bx('avcC',[...vd]));
 let aac=[];if(as.length){const a=[...ad];aac=bx('mp4a',z(6),u16(1),z(8),u16(2),u16(16),u16(0),u16(0),u32(44100<<16),
  bx('esds',u32(0),[3,23+a.length,0,0,0,4,15+a.length,0x40,0x15,z(11),5,a.length,a,6,1,2]))}
 const vb=vs.reduce((n,s)=>n+s.b.length,0),ab=as.reduce((n,s)=>n+s.b.length,0);
 const mk=(vo,ao)=>bx('moov',bx('mvhd',u32(0),u32(0),u32(0),u32(1000),u32(Dm),u32(65536),u16(256),z(10),mtx,z(24),u32(3)),
  trak(1,1,90000,vs.length*90000/F,avc,vs,vo),as.length?trak(2,0,44100,as.length*1024,aac,as,ao):[]);
 const ft=bx('ftyp',s4('isom'),u32(512),s4('isomiso2avc1mp41')),base=ft.length+mk(0,0).length+8;
 return new Blob([new Uint8Array(ft),new Uint8Array(mk(base,base+vb)),new Uint8Array([...u32(8+vb+ab),...s4('mdat')]),...vs.map(s=>s.b),...as.map(s=>s.b)],{type:'video/mp4'})}

/* ---------- v2: hapus latar, transisi, filter, kecepatan, volume, trim ---------- */
const mk2=()=>document.createElement('canvas'),L=mk2(),P=mk2(),K=mk2();
const TR=[['none','Tanpa'],['fade','Pudar'],['dip','Lewat hitam'],['kiri','Geser kiri'],['kanan','Geser kanan'],['zoom','Zoom'],['tirai','Tirai']];
const FL=[['none','Asli'],['grayscale(1)','Hitam putih'],['sepia(.8)','Sepia'],['brightness(1.2) saturate(1.2)','Cerah'],['contrast(1.4) saturate(1.3)','Dramatis'],['hue-rotate(190deg) saturate(1.2)','Dingin'],['sepia(.4) saturate(1.5) hue-rotate(-20deg)','Hangat'],['blur(3px)','Blur']];
const SP=[['0.5','0.5x'],['1','1x'],['1.5','1.5x'],['2','2x'],['3','3x']],VO=[['0','Bisu'],['0.5','50%'],['1','100%'],['1.5','150%']],OP=[['0.25','25%'],['0.5','50%'],['0.75','75%'],['1','100%']],TL=[['30','Halus'],['60','Sedang'],['100','Kuat'],['140','Sangat kuat']];
function sh(t,items,cur,cb){$('stt').textContent=t;$('in').innerHTML=items.map(([k,l])=>`<button class="${k==cur?'on':''}" data-k="${k}">${l}</button>`).join('');$('sheet').className='on';
 $('in').onclick=e=>{const b=e.target.closest('button');if(b)cb(b.dataset.k)}}
$('sx').onclick=()=>$('sheet').className='';
function trs(cid){const i=S.main.findIndex(c=>c.id==cid),c=S.main[i],s=ms()[i];
 sh('Transisi',TR,c.tr&&c.tr.n||'none',v=>{cm();c.tr=v=='none'?null:{n:v,d:Math.min(.6,c.len/2)};$('sheet').className='';ui();if(c.tr){setT(Math.max(0,s-.6));pp(1)}})}
function trn(g,n,p){const W=S.W,H=S.H,D=(im,x,y,sc,a)=>{g.globalAlpha=a;g.drawImage(im,x+W*(1-sc)/2,y+H*(1-sc)/2,W*sc,H*sc)};
 if(n=='fade'){D(P,0,0,1,1);D(L,0,0,1,p)}
 else if(n=='dip'){p<.5?D(P,0,0,1,1-2*p):D(L,0,0,1,2*p-1)}
 else if(n=='kiri'){D(P,-p*W,0,1,1);D(L,(1-p)*W,0,1,1)}
 else if(n=='kanan'){D(P,p*W,0,1,1);D(L,-(1-p)*W,0,1,1)}
 else if(n=='zoom'){D(P,0,0,1+p*.4,1-p);D(L,0,0,.8+p*.2,p)}
 else{D(P,0,0,1,1);g.save();g.beginPath();g.rect(0,0,W*p,H);g.clip();D(L,0,0,1,1);g.restore()}
 g.globalAlpha=1}
function key(e,o){const iw=e.videoWidth||e.naturalWidth,ih=e.videoHeight||e.naturalHeight,r=Math.min(1,480/iw);K.width=Math.max(1,iw*r|0);K.height=Math.max(1,ih*r|0);
 const q=K.getContext('2d',{willReadFrequently:true}),w=K.width,h=K.height;q.drawImage(e,0,0,w,h);const d=q.getImageData(0,0,w,h),a=d.data;
 if(!o.kc){const p=[0,(w-1)*4,(h-1)*w*4,((h-1)*w+w-1)*4];o.kc=[0,1,2].map(j=>p.reduce((n,i)=>n+a[i+j],0)/4)}
 const tol=o.tol||60;for(let i=0;i<a.length;i+=4){const dd=Math.hypot(a[i]-o.kc[0],a[i+1]-o.kc[1],a[i+2]-o.kc[2]);if(dd<tol)a[i+3]=0;else if(dd<tol*1.4)a[i+3]*=(dd-tol)/(tol*.4)}
 q.putImageData(d,0,0);return K}
$('rw').onpointerdown=e=>{const hd=e.target.closest('.hd'),f=fnd();if(!hd||!f)return;e.preventDefault();
 const c=f[0][f[1]],isL=hd.dataset.e=='l',m=M[c.m]||{type:'t'},r=c.sp||1,x0=e.clientX,in0=c.in||0,len0=c.len,st0=c.start,mm=S.sel.k=='m',p=hd.parentElement;cm();
 const mv=v=>{let d=(v.clientX-x0)/S.z;
  if(isL){d=Math.max(-in0/r,Math.min(d,len0-.2));c.in=in0+d*r;c.len=len0-d;if(!mm)c.start=st0+d}
  else c.len=Math.max(.2,Math.min(len0+d,m.type=='v'||m.type=='a'?(m.dur-in0)/r:99));
  p.style.width=c.len*S.z+'px';if(!mm)p.style.left=$('tw').clientWidth/2+c.start*S.z+'px'},
 up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);ui()};addEventListener('pointermove',mv);addEventListener('pointerup',up)};
/* ---------- v3: template XML (simpan/buka) ---------- */
const NUM=new Set('in len sp vol x y sc start op tol bg td dur'.split(' ')),esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const rd=f=>new Promise(r=>{const q=new FileReader();q.onload=()=>r(q.result);q.readAsDataURL(f)});
const ats=o=>Object.entries(o).filter(([k,v])=>v!=null&&v!==''&&typeof v!='object'&&k!='kc').map(([k,v])=>' '+k+'="'+esc(typeof v=='boolean'?+v:v)+'"').join('')+(o.tr?' tn="'+o.tr.n+'" td="'+o.tr.d+'"':'');
$('sv').onclick=async()=>{if(!S.main.length&&!S.ov.length)return toast('Proyek masih kosong');
 const emb=confirm('Sertakan gambar & audio ke dalam file template? (maks. 5 MB, video tidak pernah disertakan)'),ids=[...new Set([...S.main,...S.ov,...S.aud].map(o=>o.m).filter(Boolean))];let tot=0,md='';toast('Menyimpan…',1);
 for(const i of ids){const m=M[i];let d='';if(emb&&(m.type=='i'||m.type=='a')){const u=await rd(m.file);if(tot+u.length<5e6){tot+=u.length;d=u}}
  md+='<media id="'+i+'" type="'+m.type+'" name="'+esc(m.name)+'" dur="'+m.dur+'"'+(d?' data="'+d+'"':'')+'/>\n'}
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n<klipku version="1" w="'+S.W+'" h="'+S.H+'">\n'+md+S.main.map(c=>'<main'+ats(c)+'/>').join('\n')+'\n'+S.ov.map(c=>'<ov'+ats(c)+'/>').join('\n')+'\n'+S.aud.map(c=>'<aud'+ats(c)+'/>').join('\n')+'\n</klipku>';
 dl(new Blob([xml],{type:'application/xml'}),'template-klipku.xml');toast('Template disimpan ('+(xml.length/1024|0)+' KB)')};
function px(txt){const d=new DOMParser().parseFromString(txt,'application/xml'),r=d.documentElement;if(d.querySelector('parsererror')||r.nodeName!='klipku')return null;
 const at=e=>{const o={};for(const a of e.attributes)o[a.name]=NUM.has(a.name)?+a.value:a.value;return o},q=n=>[...r.getElementsByTagName(n)].map(at);
 return{W:+r.getAttribute('w')||1280,H:+r.getAttribute('h')||720,media:q('media'),main:q('main'),ov:q('ov'),aud:q('aud')}}
function ap(d,mp){cm();S.W=d.W;S.H=d.H;const v=d.W+'x'+d.H;if(![...$('ar').options].some(o=>o.value==v))$('ar').add(new Option(d.W+':'+d.H,v));$('ar').value=v;cv.width=S.W;cv.height=S.H;
 const vis=Object.values(mp).filter(i=>M[i].type!='a');let n=0;
 const fx=(o,t)=>{const c={...o,id:id()};if(c.tn)c.tr={n:c.tn,d:c.td||.5};delete c.tn;delete c.td;
  if(c.m){let i=mp[c.m];if(!i){if(t=='a'||!vis.length)return null;i=vis[n++%vis.length]}const m=M[i];c.m=m.id;if(t=='o'&&c.k!='t')c.k=m.type;
   if(m.type=='v'||m.type=='a'){c.in=Math.max(0,Math.min(c.in||0,m.dur-.3));c.len=Math.max(.2,Math.min(c.len,(m.dur-c.in)/(c.sp||1)))}}return c};
 S.main=d.main.map(o=>fx(o,'m')).filter(Boolean);S.ov=d.ov.map(o=>fx(o,'o')).filter(Boolean);S.aud=d.aud.map(o=>fx(o,'a')).filter(Boolean);S.sel=null;S.t=0;ui();toast('Template diterapkan')}
async function tp(txt,ex){const d=px(txt);if(!d)return toast('File template tidak valid');const mp={},need=[],au=(ex||[]).filter(f=>f.type.startsWith('audio'));
 for(const m of d.media){if(m.data){const b=await(await fetch(m.data)).blob();mp[m.id]=(await lm(new File([b],m.name||'media',{type:b.type}))).id}
  else if(m.type=='a'&&au.length)mp[m.id]=(await lm(au.shift())).id;else need.push(m)}
 if(!need.length)return ap(d,mp);
 $('stt').textContent='Isi slot media';$('sheet').className='on';const box=$('in');
 const rs=()=>{box.innerHTML='<button data-j="many">📁 Pilih banyak sekaligus</button>'+need.map((m,j)=>'<button data-j="'+j+'">'+(mp[m.id]?'✓ '+esc(M[mp[m.id]].name):(m.type=='a'?'♪ ':'🖼 ')+(j+1)+'. '+esc(m.name))+'</button>').join('')+'<button class="on" data-j="go">Terapkan</button>'};rs();
 box.onclick=e=>{const b=e.target.closest('button');if(!b)return;const j=b.dataset.j;
  if(j=='go'){if(!Object.values(mp).some(i=>M[i].type!='a'))return toast('Isi minimal satu foto atau video');$('sheet').className='';return ap(d,mp)}
  const f=document.createElement('input');f.type='file';
  if(j=='many'){f.multiple=true;f.accept='image/*,video/*,audio/*';f.onchange=async()=>{toast('Memuat…',1);for(const x of f.files){const m=await lm(x),s=need.find(s=>!mp[s.id]&&(m.type=='a')==(s.type=='a'));if(s)mp[s.id]=m.id}$('toast').hidden=1;rs()}}
  else{const s=need[j];f.accept=s.type=='a'?'audio/*':'image/*,video/*';f.onchange=async()=>{if(f.files[0]){toast('Memuat…',1);mp[s.id]=(await lm(f.files[0])).id;$('toast').hidden=1;rs()}}}
  f.click()}}
const TPL={t0:'<klipku w="720" h="1280"><media id="a" type="i" name="Foto 1"/><media id="b" type="i" name="Foto 2"/><media id="c" type="i" name="Foto 3"/><main id="x1" m="a" in="0" len="3"/><main id="x2" m="b" in="0" len="3" tn="fade" td="0.6"/><main id="x3" m="c" in="0" len="3" tn="zoom" td="0.6"/><ov id="t1" k="t" text="Judul" x="0.5" y="0.85" sc="1.2" start="0" len="9"/></klipku>',
 t1:'<klipku w="1280" h="720"><media id="a" type="v" name="Video 1"/><media id="b" type="v" name="Video 2"/><main id="x1" m="a" in="0" len="5" fl="sepia(.4) saturate(1.5) hue-rotate(-20deg)"/><main id="x2" m="b" in="0" len="5" tn="dip" td="0.6" fl="sepia(.4) saturate(1.5) hue-rotate(-20deg)"/><ov id="t1" k="t" text="VLOG" x="0.5" y="0.15" sc="1.5" start="0" len="3"/></klipku>',
 t2:'<klipku w="1080" h="1080"><media id="a" type="v" name="Klip 1"/><media id="b" type="v" name="Klip 2"/><media id="c" type="v" name="Klip 3"/><main id="x1" m="a" in="0" len="3"/><main id="x2" m="b" in="0" len="3" tn="kiri" td="0.5"/><main id="x3" m="c" in="0" len="3" tn="kanan" td="0.5"/><ov id="t1" k="t" text="Sorotan" x="0.5" y="0.9" sc="1.2" start="0" len="9"/></klipku>'};
const FX=[['','Tanpa'],['pop','Zoom jedug'],['shake','Getar'],['flash','Kilat'],['inv','Invert'],['pop flash','Zoom + kilat'],['shake pop','Getar + zoom']];
TPL.t3=(()=>{const F=['pop','pop flash','shake','pop','inv','pop flash','shake pop','flash'];let x='<klipku w="720" h="1280">'+[1,2,3,4].map(i=>'<media id="s'+i+'" type="v" name="Foto/video '+i+'"/>').join('')+'<media id="sa" type="a" name="Lagu (opsional)"/>';
 for(let i=0;i<16;i++)x+='<main id="x'+i+'" m="s'+(i%4+1)+'" in="'+(i>>2)*.5+'" len="0.5" fx="'+F[i%8]+'"'+(i%4==3?' tn="fade" td="0.15"':'')+'/>';
 return x+'<aud id="au" m="sa" in="0" start="0" len="8"/></klipku>'})();
$('ld').onclick=()=>sh('Template',[['f','📂 Impor XML (+ lagu, maks 5 MB)'],['t3','Jedag-jedug 120 BPM (4 slot)'],['t0','Slideshow 3 foto (9:16)'],['t1','Vlog 2 video (16:9)'],['t2','Sorotan 3 klip (1:1)']],'',k=>{
 if(k!='f'){$('sheet').className='';return tp(TPL[k])}
 const f=document.createElement('input');f.type='file';f.multiple=true;f.accept='.xml,application/xml,text/xml,audio/*';
 f.onchange=async()=>{$('sheet').className='';const fs=[...f.files],x=fs.find(q=>/\.xml$/i.test(q.name));if(!x)return toast('Pilih file .xml');
  if(x.size>5*1024*1024)return toast('File XML melebihi 5 MB');tp(await x.text(),fs.filter(q=>q!==x))};f.click()});
addEventListener('resize',ui);ui();
