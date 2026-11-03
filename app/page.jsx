'use client';

import { useEffect, useRef, useState } from 'react';
import { drawAstronaut, drawCoverMirrored } from '../lib-ar';

const CAREERS = [
  { id:'doctor', th:'คุณหมอ', en:'DOCTOR', emoji:'🩺', outfit:'🥼', prop:'💗', color:'#69c9ed', dark:'#24749a', backdrop:'radial-gradient(circle at 60% 25%,#d8faff,#9edff5 55%,#68b6ed)', pose:'โบกมือให้คนไข้หน่อย!', scene:'🏥', message:'ผู้ดูแลหัวใจของทุกคน' },
  { id:'astronaut', th:'นักบินอวกาศ', en:'ASTRONAUT', emoji:'🚀', outfit:'👩‍🚀', prop:'🪐', color:'#a393ff', dark:'#6855c4', backdrop:'radial-gradient(circle at 50% 22%,#7f73d9,#393578 62%,#201f52)', pose:'กางแขนเหมือนลอยในอวกาศ!', scene:'🌙', message:'พร้อมออกสำรวจจักรวาล' },
  { id:'chef', th:'เชฟ', en:'CHEF', emoji:'👩‍🍳', outfit:'👨‍🍳', prop:'🥘', color:'#ffba69', dark:'#ad6b23', backdrop:'radial-gradient(circle at 50% 18%,#fff0c2,#ffd4a2 58%,#e9a47e)', pose:'ลองทำท่าคนอาหารดูสิ!', scene:'🍰', message:'สร้างความสุขด้วยเมนูอร่อย' },
  { id:'firefighter', th:'นักดับเพลิง', en:'FIREFIGHTER', emoji:'🚒', outfit:'🧑‍🚒', prop:'💦', color:'#ff998d', dark:'#c24d43', backdrop:'radial-gradient(circle at 55% 20%,#ffe4ad,#ffb49a 55%,#e88283)', pose:'ยื่นแขนเหมือนฉีดน้ำ!', scene:'🧯', message:'ฮีโร่ผู้กล้าช่วยเหลือทุกคน' },
  { id:'scientist', th:'นักวิทยาศาสตร์', en:'SCIENTIST', emoji:'🧪', outfit:'🥼', prop:'⚗️', color:'#7ce2bd', dark:'#2e9877', backdrop:'radial-gradient(circle at 48% 18%,#dbfff1,#b3f3d8 52%,#7fd9cb)', pose:'ชูมือเหมือนถือหลอดทดลอง!', scene:'🔬', message:'นักค้นพบสิ่งมหัศจรรย์' },
  { id:'pilot', th:'นักบิน', en:'PILOT', emoji:'✈️', outfit:'🧑‍✈️', prop:'☁️', color:'#89bff8', dark:'#4476b9', backdrop:'radial-gradient(circle at 55% 15%,#e3f9ff,#b7dafa 50%,#86b9e8)', pose:'กางแขนเหมือนเครื่องบิน!', scene:'🌤️', message:'พาความฝันทะยานขึ้นฟ้า' }
];
const STAGES = ['ยินดีต้อนรับ','เตรียมพร้อม','สุ่มอาชีพ','แปลงร่าง','ถ่ายภาพ','รับภาพ'];

function TinyStars({ count=16 }) { return <div className="stars" aria-hidden="true">{Array.from({length:count},(_,i)=><span key={i} style={{left:`${(i*47+9)%94}%`,top:`${(i*31+5)%88}%`,animationDelay:`${(i%6)*.4}s`,fontSize:`${11+i%3*5}px`}}>✦</span>)}</div>; }
function Mirror({ children, color, subtle=false }) { return <div className={'mirror '+(subtle?'mirror-subtle':'')} style={{'--edge':color||'#f6d18a'}}><div className="mirror-inner">{children}</div></div>; }
function Character({ career, live=false }) { return <div className="character" style={{'--c':career.color}}><span className="char-spark one">✦</span><span className="char-spark two">✧</span><div className="char-head"><div className="char-hair"/><div className="char-face"><span>•ᴗ•</span></div><div className="char-hat">{career.id==='chef'?'👨‍🍳':career.id==='astronaut'?'🪐':career.id==='firefighter'?'⛑️':career.id==='pilot'?'🧢':career.id==='scientist'?'🥽':'🩺'}</div></div><div className="char-body"><span className="char-hand left">✋</span><div className="char-costume"><span className="costume-icon">{career.outfit}</span><span className="suit-label">{career.en}</span></div><span className="char-hand right">✋</span></div><div className="char-legs"><div/><div/></div><span className="char-prop">{career.prop}</span>{live&&<span className="demo-chip">AR COSTUME MOCKUP</span>}</div>; }
function PrimaryButton({children,onClick,disabled=false,small=false}) { return <button className={'primary-btn '+(small?'small':'')} onClick={onClick} disabled={disabled}>{children}<span className="button-shine"/></button>; }
function ScreenHeader({step,title,subtitle}) { return <div className="stage-header"><div className="eyebrow"><span>✦</span> FUTURE ME <span>✦</span></div><div className="step-pill">STEP {String(step).padStart(2,'0')} / 06</div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>; }
function CareerIcon({career,active=false,onClick}) { return <button type="button" onClick={onClick} className={'career-tile '+(active?'selected':'')} style={{'--tint':career.color}}><span>{career.emoji}</span><small>{career.th}</small></button>; }

export default function Home() {
  const [step,setStep] = useState(0);
  const [career,setCareer] = useState(CAREERS[1]);
  const [rolling,setRolling] = useState(false);
  const [rollIndex,setRollIndex] = useState(0);
  const [prevCareer,setPrevCareer] = useState(null);
  const [countdown,setCountdown] = useState(null);
  const [autoCapture,setAutoCapture] = useState(true);
  const [autoSeconds,setAutoSeconds] = useState(5);
  const [photo,setPhoto] = useState(null);
  const [cameraOn,setCameraOn] = useState(false);
  const [cameraError,setCameraError] = useState('');
  const [aiStatus,setAiStatus] = useState('ยังไม่เปิด AI');
  const trackerRef = useRef(null);
  const poseRef = useRef(null);
  const overlayRef = useRef(null);
  const assetsRef = useRef({});
  const stageRef = useRef(step);
  stageRef.current = step;
  const rafRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const [muted,setMuted] = useState(true);
  const [help,setHelp] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const reelTimer = useRef(null);
  const countTimer = useRef(null);
  const autoTimer = useRef(null);
  const advanceTimer = useRef(null);
  const careerRef = useRef(career);
  careerRef.current = career;
  const [useFullScreen,setUseFullScreen] = useState(false);

  useEffect(()=>()=>{
    [reelTimer,countTimer,advanceTimer,autoTimer].forEach(x=>clearInterval(x.current));
    cancelAnimationFrame(rafRef.current);
    trackerRef.current?.close?.();
    streamRef.current?.getTracks().forEach(t=>t.stop());
  },[]);
  useEffect(()=>{
    const helmet=new Image(),suit=new Image();
    helmet.src='/assets/astronaut/helmet.svg';suit.src='/assets/astronaut/suit.svg';
    assetsRef.current={helmet,suit};
  },[]);
  useEffect(()=>{
    if(!cameraOn || !trackerRef.current)return;
    let active=true;
    const tick=()=>{
      if(!active)return;
      const video=videoRef.current,detector=trackerRef.current;
      if(video?.readyState>=2 && detector && video.videoWidth){
        if(video.currentTime!==lastVideoTimeRef.current){
          try { const result=detector.detectForVideo(video,performance.now());
            poseRef.current=result.landmarks?.[0]||null;
          } catch(err) { console.warn('Pose frame error',err); }
          lastVideoTimeRef.current=video.currentTime;
        }
      }
      const canvas=overlayRef.current;
      if(canvas){
        const box=canvas.getBoundingClientRect();
        const w=Math.round(box.width),h=Math.round(box.height);
        if(w>0&&h>0){
          // CSS pixels match the rendered video; photo uses its own output dimensions.
          if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
          const ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);
          if(stageRef.current===3||stageRef.current===4){
            if(careerRef.current.id==='astronaut')drawAstronaut(ctx,poseRef.current,video,w,h,assetsRef.current);
          }
        }
      }
      rafRef.current=requestAnimationFrame(tick);
    };
    rafRef.current=requestAnimationFrame(tick);
    return ()=>{active=false;cancelAnimationFrame(rafRef.current);};
  },[cameraOn,step,aiStatus]);
  useEffect(()=>{ if(cameraOn && videoRef.current && streamRef.current){ videoRef.current.srcObject=streamRef.current; videoRef.current.play().catch(()=>{}); } },[step,cameraOn]);

  // Auto photo starts only after reaching the AR costume screen, not on welcome or roulette.
  // A fresh interval is created whenever the AR screen is entered; leaving it cancels the timer.
  useEffect(()=>{
    clearInterval(autoTimer.current);
    if(step!==3 || !autoCapture || help) return;
    let remaining=5;
    setAutoSeconds(remaining);
    autoTimer.current=setInterval(()=>{
      if(document.visibilityState==='hidden') return; // Don't capture while the tab is backgrounded.
      remaining-=1;
      setAutoSeconds(Math.max(remaining,0));
      if(remaining<=0){
        clearInterval(autoTimer.current);
        takePhoto();
      }
    },1000);
    return ()=>clearInterval(autoTimer.current);
  },[step,autoCapture,help,career.id]);


  async function enableCamera(){
    setCameraError('');
    if(!navigator.mediaDevices?.getUserMedia){setCameraError('เบราว์เซอร์นี้ไม่รองรับกล้อง หรือไม่ได้เปิดผ่าน HTTPS');return;}
    try {
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
      streamRef.current?.getTracks().forEach(t=>t.stop());
      streamRef.current=stream;setCameraOn(true);
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      setAiStatus('กำลังโหลดโมเดล Pose...');
      try{
        const {FilesetResolver,PoseLandmarker}=await import('@mediapipe/tasks-vision');
        const vision=await FilesetResolver.forVisionTasks('/mediapipe/wasm');
        const config={baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',delegate:'CPU'},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.5,minTrackingConfidence:.5};
        const detector=await PoseLandmarker.createFromOptions(vision,config);
        trackerRef.current?.close?.();trackerRef.current=detector;
        setAiStatus('AI พร้อมใช้งาน · Astronaut AR');
      }catch(err){console.error('Pose model initialization failed:',err);setAiStatus('AI โหลดไม่สำเร็จ — ยังใช้โหมด Mock ได้');setCameraError('เปิดกล้องได้ แต่โหลด AI ไม่สำเร็จ: '+err.message);}
    } catch(err){setCameraError(err.name==='NotAllowedError'?'กรุณาอนุญาตการใช้กล้องใน Browser':`เปิดกล้องไม่ได้: ${err.message}`);}
  }
  function goto(s){ setHelp(false);setStep(s); }
  function randomize(){
    clearInterval(reelTimer.current); clearTimeout(advanceTimer.current);
    setRolling(true);setRollIndex(0);goto(2);
    const opts=CAREERS.filter(c=>c.id!==prevCareer);
    const choice=opts[Math.floor(Math.random()*opts.length)];
    let tick=0;
    reelTimer.current=setInterval(()=>{ tick++;setRollIndex((tick*3+Math.floor(tick/4))%CAREERS.length); if(tick>=24){clearInterval(reelTimer.current);setCareer(choice);setPrevCareer(choice.id);setRolling(false);advanceTimer.current=setTimeout(()=>goto(3),1150);}},125);
  }
  function renderPortrait(canvas,ctx){
    const w=canvas.width,h=canvas.height;
    const grad=ctx.createLinearGradient(0,0,w,h);grad.addColorStop(0,careerRef.current.color);grad.addColorStop(1,'#8e7cf4');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    const hasVideo=drawCoverMirrored(ctx,videoRef.current,w,h);
    if(hasVideo && careerRef.current.id==='astronaut'){
      drawAstronaut(ctx,poseRef.current,videoRef.current,w,h,assetsRef.current);
    }
    if(!hasVideo){ ctx.font='260px serif';ctx.textAlign='center';ctx.fillText('✨',w/2,h*.58); }
    ctx.fillStyle='rgba(46,29,94,.5)';ctx.fillRect(0,0,w,130);ctx.fillRect(0,h-220,w,220);
    ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 53px sans-serif';ctx.fillText('FUTURE ME',w/2,88);
    ctx.font='170px serif';ctx.fillText(careerRef.current.emoji,w/2,h*.22);
    ctx.font='bold 68px sans-serif';ctx.fillText(careerRef.current.th,w/2,h-108);
    ctx.font='35px sans-serif';ctx.fillText('โตขึ้นหนูอยากเป็นอะไร?',w/2,h-47);
    for(let i=0;i<24;i++){ctx.fillStyle=i%2?'#fff5b7':'#ffffff';ctx.font=`${18+(i%3)*9}px serif`;ctx.fillText('✦',(i*137+44)%w,(i*271+160)%h);}
  }
  function takePhoto(){
    clearInterval(autoTimer.current);
    clearInterval(countTimer.current);let n=3;setCountdown(n);goto(4);
    countTimer.current=setInterval(()=>{n--;if(n>0){setCountdown(n);}else{clearInterval(countTimer.current);setCountdown(null);const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1600;const ctx=canvas.getContext('2d');renderPortrait(canvas,ctx);setPhoto(canvas.toDataURL('image/png'));goto(5);}},1000);
  }
  async function savePhoto(){ if(!photo)return;const res=await fetch(photo);const blob=await res.blob();const filename=`future-me-${career.id}-${Date.now()}.png`;const file=new File([blob],filename,{type:'image/png'});if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'Future Me Magic Mirror'});return;}catch(e){if(e.name==='AbortError')return;}}const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000); }
  function reset(){[reelTimer,countTimer,advanceTimer,autoTimer].forEach(x=>clearInterval(x.current));setRolling(false);setCountdown(null);setPhoto(null);poseRef.current=null;streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setCameraOn(false);trackerRef.current?.close?.();trackerRef.current=null;setAiStatus('ยังไม่เปิด AI');goto(0);}
  function toggleFullscreen(){const el=document.querySelector('.kiosk-frame');if(!document.fullscreenElement){el?.requestFullscreen?.().then(()=>setUseFullScreen(true)).catch(()=>{});}else{document.exitFullscreen?.().then(()=>setUseFullScreen(false)).catch(()=>{});}}
  const displayCareer=rolling?CAREERS[rollIndex]:career;

  return <main className="workstation">
    <div className="workspace-brand"><span className="brand-symbol">✦</span><div><b>FUTURE ME</b><small>MAGIC MIRROR · ASTRONAUT AR V02</small></div></div>
    <section className="kiosk-frame" aria-label="Future Me Magic Mirror prototype">
      <div className="kiosk-grain"/>
      <TinyStars/>
      <div className={'app-screen screen-'+step}>
        {step===0&&<>
          <div className="welcome-top"><div className="logo-star">✦</div><span className="tiny-label">WELCOME TO YOUR FUTURE</span><h1>โตขึ้นหนูอยาก<br/><em>เป็นอะไรนะ?</em></h1><p>มาผจญภัยไปกับกระจกมหัศจรรย์กัน!</p></div>
          <div className="welcome-art"><div className="float-icon at1">🧑‍🚀</div><div className="float-icon at2">🩺</div><div className="float-icon at3">👨‍🍳</div><Mirror><div className="welcome-mirror"><div className="sun-disk"/><span className="big-sparkle">✦</span><span className="rainbow-arch">🌈</span><div className="floating-hat">🚀</div><div className="portal-caption">YOUR FUTURE IS MAGICAL</div></div></Mirror></div>
          <div className="action-zone"><PrimaryButton onClick={()=>goto(1)}>✨ เริ่มเล่นเลย!</PrimaryButton><span className="micro-note">สนุกกับ 6 อาชีพในฝัน · 1 คนต่อรอบ</span></div>
        </>}
        {step===1&&<>
          <ScreenHeader step={1} title="มายืนตรงนี้กัน!" subtitle="ให้กระจกเห็นหนูชัด ๆ นะ"/>
          <div className="stage-area"><Mirror color="#f8e8ab"><div className="camera-stage ready-stage">
            {cameraOn?<video ref={videoRef} className="camera-video" autoPlay playsInline muted/>:<div className="camera-placeholder"><span className="placeholder-cloud">☁️</span><span>พร้อมเปิดกล้องแล้วหรือยัง?</span></div>}
            <div className="guide-outline"><div className="guide-head"/><div className="guide-torso"/><div className="guide-arm arm-left"/><div className="guide-arm arm-right"/></div>
            <div className="stage-overlay-bottom"><span className="status-dot"/>{cameraOn?'กล้องพร้อมแล้ว!':'เปิดกล้อง หรือทดลอง Mock Mode'}</div>
          </div></Mirror></div>
          <div className="action-zone">{!cameraOn&&<button className="secondary-btn" onClick={enableCamera}>📷 เปิดกล้อง</button>}{cameraOn&&<p className="ai-indicator">{aiStatus}</p>}{cameraError&&<p className="error-line">{cameraError}</p>}<PrimaryButton onClick={randomize}>พร้อมแล้ว! ✨</PrimaryButton>{cameraOn&&<button className="secondary-btn" onClick={()=>{setCareer(CAREERS[1]);goto(3);}}>🧑‍🚀 ทดสอบชุดนักบินอวกาศโดยตรง</button>}<button className="text-btn" onClick={()=>goto(0)}>ย้อนกลับ</button></div>
        </>}
        {step===2&&<>
          <ScreenHeader step={2} title="อนาคตของหนู..." subtitle="กระจกกำลังค้นหาความฝันอันแสนพิเศษ!"/>
          <div className="roulette-stage"><div className="reel-glow"/><div className="reel-kicker">✦ FIND YOUR FUTURE ✦</div><div className="reel-cards"><div className="reel-side">{CAREERS[(CAREERS.indexOf(displayCareer)+5)%6].emoji}</div><div className={'reel-main '+(rolling?'spinning':'')} style={{'--reel-color':displayCareer.color}}><span>{displayCareer.emoji}</span><strong>{displayCareer.th}</strong></div><div className="reel-side">{CAREERS[(CAREERS.indexOf(displayCareer)+1)%6].emoji}</div></div><div className="reel-arrow">◆</div><div className="reel-result">{rolling?'กำลังสุ่มอาชีพ...':`ว้าว! ${career.th}!`}</div><div className="roulette-dots">✦ ✧ ✦ ✧ ✦</div></div>
          <div className="action-zone">{rolling?<div className="spinner-caption">ดวงดาวกำลังเลือกให้นะ...</div>:<PrimaryButton onClick={()=>goto(3)}>ดูชุดแปลงร่าง ✨</PrimaryButton>}<button className="text-btn" onClick={()=>{clearInterval(reelTimer.current);clearTimeout(advanceTimer.current);setRolling(false);goto(1)}}>กลับไปหน้าเตรียมพร้อม</button></div>
        </>}
        {step===3&&<>
          <ScreenHeader step={4} title={`ว้าว! ${career.th}`} subtitle="นี่คือชุดอาชีพในฝันของหนู"/>
          <div className="stage-area"><Mirror color={career.color}><div className="career-scene" style={{background:career.backdrop}}><div className="scene-sun">{career.scene}</div>{cameraOn?<><video ref={videoRef} className="camera-video" autoPlay playsInline muted/>{career.id==='astronaut'?<><canvas className="ar-overlay" ref={overlayRef} aria-hidden="true"/><div className="ar-status">{trackerRef.current?'🧑‍🚀 LIVE ASTRONAUT AR':'กำลังเตรียมชุด AR...'}</div></>:<div className="camera-costume-hint"><span>{career.emoji}</span><b>CAREER MOCKUP · AR COMING NEXT</b></div>}</>:<Character career={career} live/>}<div className="scene-headline">{career.emoji} {career.en}</div><div className="pose-hint">{career.id==='astronaut'&&cameraOn?'ถอยให้เห็นหัว ไหล่ และสะโพก · '+career.pose:career.pose}</div></div></Mirror></div>
          <div className="action-zone"><div className="auto-capture-strip" role="status"><span>{autoCapture?`📸 ถ่ายอัตโนมัติใน ${autoSeconds} วินาที`:'📷 โหมดถ่ายภาพด้วยตนเอง'}</span><button type="button" className="auto-capture-toggle" aria-pressed={autoCapture} onClick={()=>setAutoCapture(v=>!v)}>{autoCapture?'ปิดออโต้':'เปิดออโต้'}</button></div><PrimaryButton onClick={takePhoto}>📸 ถ่ายรูปตอนนี้</PrimaryButton><div className="action-twins"><button className="secondary-btn" onClick={randomize}>🔄 สุ่มใหม่</button><button className="secondary-btn" onClick={()=>goto(1)}>เปลี่ยนกล้อง</button></div></div>
        </>}
        {step===4&&<>
          <ScreenHeader step={5} title="เตรียมโพสท่า!" subtitle="ยิ้มกว้าง ๆ แล้วมองกล้องนะ"/>
          <div className="stage-area"><Mirror color="#ffce76"><div className="career-scene photo-scene" style={{background:career.backdrop}}>{cameraOn?<><video ref={videoRef} className="camera-video" autoPlay playsInline muted/>{career.id==='astronaut'&&<canvas className="ar-overlay" ref={overlayRef} aria-hidden="true"/>}</>:<Character career={career}/>}<span className="huge-count">{countdown??'✨'}</span><div className="pose-hint">{career.pose}</div></div></Mirror></div><div className="action-zone"><div className="spinner-caption">📸 3 · 2 · 1 · แชะ!</div><button className="text-btn" onClick={()=>{clearInterval(countTimer.current);setCountdown(null);goto(3)}}>ยกเลิก</button></div>
        </>}
        {step===5&&<>
          <ScreenHeader step={6} title="เก่งมากเลย!" subtitle="นี่คือภาพ Future Me ของหนู ✨"/>
          <div className="photo-display"><div className="polaroid">{photo?<img src={photo} alt={`ภาพที่ระลึก ${career.th}`}/>:<div className="empty-photo">📷</div>}<div className="polaroid-footer"><b>MY FUTURE ME</b><span>{career.th} · {career.message}</span></div></div></div>
          <div className="action-zone"><PrimaryButton onClick={savePhoto}>⬇️ แชร์ / บันทึกรูป</PrimaryButton><div className="action-twins"><button className="secondary-btn" onClick={()=>window.open(photo,'_blank','noopener,noreferrer')}>↗ เปิดรูป</button><button className="secondary-btn" onClick={randomize}>🎲 ลองอีกอาชีพ</button></div><button className="text-btn" onClick={reset}>จบเกม · กลับหน้าแรก</button></div>
        </>}
      </div>
      <div className="kiosk-nav"><button aria-label="กลับหน้าแรก" title="กลับหน้าแรก" onClick={reset}>⌂</button><span>{STAGES[step]}</span><div className="step-dots">{STAGES.map((_,i)=><span key={i} className={i===step?'active':''}/>)}</div><button aria-label="ความช่วยเหลือ" title="ความช่วยเหลือ" onClick={()=>setHelp(!help)}>?</button></div>
      {help&&<div className="help-overlay"><div className="help-card"><h3>✨ วิธีเล่น</h3><p>1. กดเริ่มและเปิดกล้อง (หรือทดลอง Mock Mode)</p><p>2. กดสุ่มอาชีพ แล้วดูชุดตัวอย่าง</p><p>3. กดถ่ายรูปเพื่อรับภาพที่ระลึก</p><p className="help-warning">หมายเหตุ: Prototype 02 มีชุด AR เฉพาะนักบินอวกาศเมื่อเปิดกล้อง อาชีพอื่นยังเป็น Mock</p><button className="primary-btn small" onClick={()=>setHelp(false)}>เข้าใจแล้ว</button></div></div>}
    </section>
    <aside className="workspace-panel"><div className="workspace-side-title">✨ FUTURE ME STUDIO</div><h2>Prototype 02.2</h2><p>ทดลองชุดนักบินอวกาศ AR ติดตามตัวจริง (อีก 5 อาชีพยังเป็น Mock)</p><div className="side-label">SCREEN FLOW</div><div className="side-steps">{STAGES.map((name,i)=><button key={i} onClick={()=>{if(i===2){randomize();return;}if(i===4){takePhoto();return;}if(i===5&&!photo){return;}goto(i)}} className={step===i?'current':''} disabled={i===5&&!photo}><span>{String(i+1).padStart(2,'0')}</span>{name}<span className="side-arrow">›</span></button>)}</div><div className="prototype-tip"><b>UI MOCK MODE</b><p>เปิดกล้องเพื่อทดลอง Astronaut AR จริง และเลือกอาชีพอื่นเพื่อดู Mock ได้เช่นเดิม</p></div><button className="full-btn" onClick={toggleFullscreen}>⛶ {useFullScreen?'ออกจากโหมดเต็มจอ':'เปิด Kiosk Fullscreen'}</button><div className="side-footer">AUTO PHOTO · DESKTOP PREVIEW · PORTRAIT 9:16<br/>LOCAL PORT 3117 · NOT 3107</div></aside>
  </main>;
}
