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
function draw(g,t,k){g.setTransform(k,0,0,k,0,0);g.fillStyle='#000';g.fillRect(0,0,S.W,S.H);const s=ms();
 S.main.forEach((c,i)=>{if(t<s[i]||t>=s[i]+c.len)return;const e=M[c.m].el,w=e.videoWidth||e.naturalWidth,h=e.videoHeight||e.naturalHeight,f=Math.min(S.W/w,S.H/h);
  if(w)g.drawImage(e,(S.W-w*f)/2,(S.H-h*f)/2,w*f,h*f)});
 S.ov.forEach(o=>{if(t<o.start||t>=o.start+o.len)return;let w,h;
  if(o.k=='t'){g.font='700 '+S.W*.06*o.sc+'px sans-serif';g.textAlign='center';g.textBaseline='middle';w=g.measureText(o.text).width;h=S.W*.07*o.sc;
   g.lineWidth=h*.1;g.strokeStyle='#000';g.fillStyle='#fff';g.strokeText(o.text,o.x*S.W,o.y*S.H);g.fillText(o.text,o.x*S.W,o.y*S.H)}
  else{const e=M[o.m].el,iw=e.videoWidth||e.naturalWidth,ih=e.videoHeight||e.naturalHeight;w=S.W*.4*o.sc;h=w*ih/iw;g.drawImage(e,o.x*S.W-w/2,o.y*S.H-h/2,w,h)}
  B[o.id]={x:o.x*S.W,y:o.y*S.H,w,h}})}
function sync(){const t=S.t,s=ms(),W=new Map();
 S.main.forEach((c,i)=>{if(t>=s[i]&&t<s[i]+c.len&&M[c.m].type=='v')W.set(M[c.m].el,[c.in+t-s[i],S.mute])});
 S.ov.forEach(o=>{if(o.k=='v'&&t>=o.start&&t<o.start+o.len&&!W.has(M[o.m].el))W.set(M[o.m].el,[o.in+t-o.start,1])});
 S.aud.forEach(o=>{if(t>=o.start&&t<o.start+o.len)W.set(M[o.m].el,[o.in+t-o.start,0])});
 Object.values(M).forEach(m=>{if(m.type=='i')return;const w=W.get(m.el),e=m.el;if(!w){if(!e.paused)e.pause();return}
  e.muted=!!w[1];const d=Math.abs(e.currentTime-w[0]);
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
 const cl=(k,i,st,len,y,hh,m,lab,c)=>`<div class="cl ${c||''}${S.sel&&S.sel.id==i?' on':''}" data-k="${k}" data-i="${i}" style="left:${h+st*z}px;width:${len*z}px;top:${y}px;height:${hh}px;${m&&m.th?`background-image:url(${m.th})`:''}">${lab}</div>`;
 S.main.forEach((c,i)=>o+=cl('m',c.id,s[i],c.len,4,52,M[c.m],M[c.m].type=='v'?tt(c.len):''));
 S.ov.forEach(v=>o+=cl('o',v.id,v.start,v.len,v.k=='t'?100:62,34,v.k=='t'?0:M[v.m],v.k=='t'?v.text:'',v.k=='t'?'tx':''));
 S.aud.forEach(a=>o+=cl('a',a.id,a.start,a.len,138,34,0,'♪ '+M[a.m].name,'au'));$('rw').innerHTML=o}
$('rw').onclick=e=>{const c=e.target.closest('.cl');S.sel=c?{k:c.dataset.k,id:c.dataset.i}:null;tl();tbr();rf()};
const fnd=()=>{const s=S.sel;if(!s)return;const l=s.k=='m'?S.main:s.k=='o'?S.ov:S.aud;return[l,l.findIndex(x=>x.id==s.id)]};
function tbr(){const s=S.sel,f=fnd(),tx=f&&f[0][f[1]]&&f[0][f[1]].k=='t',b=(a,i,l)=>`<button data-a="${a}"><span>${i}</span>${l}</button>`;
 $('tb').innerHTML=s?b('split','✂','Pisah')+(tx?b('edit','✎','Ubah teks'):'')+b('dup','⧉','Duplikat')+b('del','🗑','Hapus')+b('x','✕','Batal')
  :b('aud','♪','Audio')+b('txt','T','Teks')+b('ov','▣','Overlay')+b('split','✂','Pisah')+b('mute','🔇','Bisukan')}
function sp(f){const t=S.t;if(!f){const s=ms(),i=s.findIndex((v,j)=>t>v&&t<v+S.main[j].len);if(i<0)return toast('Letakkan playhead di dalam klip');f=[S.main,i];S.sel={k:'m',id:S.main[i].id}}
 const[l,i]=f,c=l[i],st=S.sel.k=='m'?ms()[i]:c.start,d=t-st;if(d<.1||d>c.len-.1)return toast('Letakkan playhead di dalam klip');
 cm();const n={...c,id:id(),in:(c.in||0)+d,len:c.len-d};c.len=d;if(S.sel.k!='m')n.start=t;l.splice(i+1,0,n)}
$('tb').onclick=e=>{const a=e.target.closest('button');if(!a)return;const k=a.dataset.a,f=fnd(),it=f&&f[0][f[1]];
 if(k=='aud')return $('mf').click();if(k=='ov')return op('o');
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
$('sv').onclick=$('ld').onclick=$('cvb').onclick=()=>toast('Fitur ini belum ada di versi ini');

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
 S.main.forEach((c,i)=>{if(t>=s[i]&&t<s[i]+c.len&&M[c.m].type=='v')a.push(sk(M[c.m].el,c.in+t-s[i]))});
 S.ov.forEach(o=>{if(o.k=='v'&&t>=o.start&&t<o.start+o.len)a.push(sk(M[o.m].el,o.in+t-o.start))});await Promise.all(a)}
async function mix(){const sr=44100,oc=new OfflineAudioContext(2,Math.ceil(T()*sr),sr),s=ms();let n=0;
 const add=async(m,st,i,l)=>{try{m.ab=m.ab||await oc.decodeAudioData(await m.file.arrayBuffer());const b=oc.createBufferSource();b.buffer=m.ab;b.connect(oc.destination);b.start(st,i,l);n++}catch(e){}};
 if(!S.mute)for(let i=0;i<S.main.length;i++){const m=M[S.main[i].m];if(m.type=='v')await add(m,s[i],S.main[i].in,S.main[i].len)}
 for(const a of S.aud)await add(M[a.m],a.start,a.in,a.len);return n?oc.startRendering():null}
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

addEventListener('resize',ui);ui();
