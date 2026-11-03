// Reusable viewport mapping and astronaut asset drawing.
// Pose x/y are normalized to the *source* video, while video displays as object-fit:cover + scaleX(-1).
export function landmarkToStage(lm, width, height, video) {
  const vw = video?.videoWidth || 1280, vh = video?.videoHeight || 720;
  const scale = Math.max(width/vw,height/vh);
  const displayedW = vw*scale,displayedH=vh*scale;
  const ox = (width-displayedW)/2,oy=(height-displayedH)/2;
  return {x:width-(lm.x*displayedW+ox),y:lm.y*displayedH+oy,visibility:lm.visibility??1};
}
export function drawCoverMirrored(ctx,video,w,h){
  if(!video?.videoWidth||video.readyState<2)return false;
  const scale=Math.max(w/video.videoWidth,h/video.videoHeight);
  const sw=w/scale,sh=h/scale;
  ctx.save();ctx.translate(w,0);ctx.scale(-1,1);
  ctx.drawImage(video,(video.videoWidth-sw)/2,(video.videoHeight-sh)/2,sw,sh,0,0,w,h);
  ctx.restore();return true;
}
export function drawAstronaut(ctx,points,video,w,h,images){
  if(!points||!images.helmet?.complete||!images.suit?.complete||!images.helmet.naturalWidth||!images.suit.naturalWidth)return false;
  const ids=[0,11,12,23,24];
  if(ids.some(i=>!points[i] || (points[i].visibility??1)<.40))return false;
  const p=i=>landmarkToStage(points[i],w,h,video);
  const nose=p(0), leftEar=p(7),rightEar=p(8),ls=p(11),rs=p(12),lh=p(23),rh=p(24);
  const dx=rs.x-ls.x,dy=rs.y-ls.y,shoulder=Math.hypot(dx,dy);
  if(shoulder<20)return false;
  const centerShoulder={x:(ls.x+rs.x)/2,y:(ls.y+rs.y)/2};
  const centerHip={x:(lh.x+rh.x)/2,y:(lh.y+rh.y)/2};
  const bodyLen=Math.max(shoulder*.8,Math.hypot(centerHip.x-centerShoulder.x,centerHip.y-centerShoulder.y));
  const torsoWidth=shoulder*1.45,torsoHeight=bodyLen*1.45;
  let rotation=Math.atan2(dy,dx);
  if(rotation>Math.PI/2)rotation-=Math.PI;
  if(rotation< -Math.PI/2)rotation+=Math.PI;
  // Suit anchors to shoulders: moves with subject instead of sticking to screen.
  ctx.save();ctx.translate(centerShoulder.x,centerShoulder.y-shoulder*.12);ctx.rotate(rotation);
  ctx.drawImage(images.suit,-torsoWidth/2,-torsoHeight*.06,torsoWidth,torsoHeight);ctx.restore();
  // Transparent center of helmet preserves child's face.
  const earDistance=Math.hypot(leftEar.x-rightEar.x,leftEar.y-rightEar.y);
  const headWidth=Math.max(shoulder*.84,earDistance*1.5);
  const helmetHeight=headWidth*1.18;
  const headX=(leftEar.x+rightEar.x)/2;
  const headY=nose.y-helmetHeight*.06;
  let headAngle=Math.atan2(rightEar.y-leftEar.y,rightEar.x-leftEar.x);
  if(headAngle>Math.PI/2)headAngle-=Math.PI;
  if(headAngle< -Math.PI/2)headAngle+=Math.PI;
  ctx.save();ctx.translate(headX,headY);ctx.rotate(headAngle);
  ctx.drawImage(images.helmet,-headWidth/2,-helmetHeight*.46,headWidth,helmetHeight);ctx.restore();
  return true;
}
