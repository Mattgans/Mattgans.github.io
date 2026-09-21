import { animate, stagger } from "https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm"
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches
const header=document.getElementById("navbar"),progress=document.getElementById("scroll-progress"),glow=document.querySelector(".cursor-glow")
function updateScrollState(){const max=document.documentElement.scrollHeight-window.innerHeight;const amount=max>0?window.scrollY/max:0;header.classList.toggle("scrolled",window.scrollY>24);progress.style.width=`${amount*100}%`;document.documentElement.style.setProperty("--scroll-progress",amount)}window.addEventListener("scroll",updateScrollState,{passive:true});updateScrollState()
if(!reducedMotion){document.addEventListener("pointermove",e=>{glow.style.transform=`translate(${e.clientX-180}px,${e.clientY-180}px)`});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){animate(entry.target,{opacity:[0,1],y:[28,0],duration:750,ease:"outExpo"});observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:"0px 0px -35px"});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));animate(".signal-graphic i",{scaleY:[.25,1],delay:stagger(85),duration:900,ease:"outElastic(1,.5)"});document.querySelectorAll(".project-card").forEach(card=>{card.addEventListener("pointermove",e=>{const b=card.getBoundingClientRect();animate(card,{rotateY:((e.clientX-b.left)/b.width-.5)*2.5,rotateX:((e.clientY-b.top)/b.height-.5)*-2.5,duration:320,ease:"outQuad"})});card.addEventListener("pointerleave",()=>animate(card,{rotateY:0,rotateX:0,duration:650,ease:"outExpo"}))})}

const arm = {
  linkOne: document.querySelector(".robot-link-one"), linkTwo: document.querySelector(".robot-link-two"),
  elbow: document.querySelector(".robot-joint-elbow"), wrist: document.querySelector(".robot-joint-wrist"),
  gripper: document.querySelector(".robot-gripper"), fingerOne: document.querySelector(".finger-one"),
  fingerTwo: document.querySelector(".finger-two"), cube: document.querySelector(".robot-cube"),
  portalLeft: document.querySelector(".portal-left"), portalRight: document.querySelector(".portal-right")
}

const armFrames = [
  { at:0,    elbow:[148,52], wrist:[194,107], cube:[195,114], held:false, closed:false },
  { at:.14,  elbow:[148,52], wrist:[194,107], cube:[195,114], held:false, closed:false },
  { at:.22,  elbow:[148,52], wrist:[195,105], cube:[195,114], held:true,  closed:true  },
  { at:.38,  elbow:[143,39], wrist:[160,53],  cube:[160,62],  held:true,  closed:true  },
  { at:.58,  elbow:[108,32], wrist:[84,51],   cube:[84,60],   held:true,  closed:true  },
  { at:.76,  elbow:[69,50],  wrist:[25,105],  cube:[25,114],  held:true,  closed:true  },
  { at:.82,  elbow:[69,50],  wrist:[25,105],  cube:[25,114],  held:false, closed:false },
  { at:.88,  elbow:[82,41],  wrist:[55,65],   cube:[25,132],  held:false, closed:false },
  { at:.92,  elbow:[102,34], wrist:[94,55],   cube:[195,136], held:false, closed:false },
  { at:.97,  elbow:[128,39], wrist:[154,59],  cube:[195,101], held:false, closed:false },
  { at:1,    elbow:[148,52], wrist:[194,107], cube:[195,114], held:false, closed:false }
]

function mix(a,b,t){return a+(b-a)*t}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function pulse(value,start,peak,end){if(value<=start||value>=end)return 0;return value<peak?(value-start)/(peak-start):(end-value)/(end-peak)}
function renderArm(time){
  const duration=7200, progress=(time%duration)/duration
  let index=armFrames.findIndex(frame=>frame.at>=progress)
  if(index<1) index=1
  const from=armFrames[index-1],to=armFrames[index],local=ease((progress-from.at)/(to.at-from.at))
  const ex=mix(from.elbow[0],to.elbow[0],local),ey=mix(from.elbow[1],to.elbow[1],local)
  const wx=mix(from.wrist[0],to.wrist[0],local),wy=mix(from.wrist[1],to.wrist[1],local)
  arm.linkOne.setAttribute("x2",ex);arm.linkOne.setAttribute("y2",ey)
  arm.linkTwo.setAttribute("x1",ex);arm.linkTwo.setAttribute("y1",ey);arm.linkTwo.setAttribute("x2",wx);arm.linkTwo.setAttribute("y2",wy)
  arm.elbow.setAttribute("cx",ex);arm.elbow.setAttribute("cy",ey);arm.wrist.setAttribute("cx",wx);arm.wrist.setAttribute("cy",wy)
  const closed=from.closed||to.closed,spread=closed?4:9
  arm.fingerOne.setAttribute("x1",wx);arm.fingerOne.setAttribute("y1",wy);arm.fingerOne.setAttribute("x2",wx+spread);arm.fingerOne.setAttribute("y2",wy+9)
  arm.fingerTwo.setAttribute("x1",wx);arm.fingerTwo.setAttribute("y1",wy);arm.fingerTwo.setAttribute("x2",wx-spread);arm.fingerTwo.setAttribute("y2",wy+9)
  let cx=mix(from.cube[0],to.cube[0],local),cy=mix(from.cube[1],to.cube[1],local)
  arm.cube.setAttribute("x",cx-8);arm.cube.setAttribute("y",cy-8)
  const disappearing=progress>.84&&progress<.92,appearing=progress>=.92
  const cubeOpacity=disappearing?Math.max(0,1-(progress-.84)/.05):appearing?Math.min(1,(progress-.92)/.04):1
  const cubeScale=progress>.84&&progress<.92?.72:progress>=.92&&progress<.985?1.16:1
  arm.cube.style.opacity=cubeOpacity;arm.cube.style.transform=`scale(${cubeScale}) rotate(${progress*220}deg)`
  const leftGlow=pulse(progress,.80,.875,.925),rightGlow=pulse(progress,.90,.955,1)
  arm.portalLeft.style.strokeWidth=1.5+leftGlow*4;arm.portalLeft.style.opacity=.55+leftGlow*.45;arm.portalLeft.style.filter=`drop-shadow(0 0 ${leftGlow*9}px #8b5cf6)`
  arm.portalRight.style.strokeWidth=1.5+rightGlow*4;arm.portalRight.style.opacity=.55+rightGlow*.45;arm.portalRight.style.filter=`drop-shadow(0 0 ${rightGlow*9}px #60a5fa)`
  requestAnimationFrame(renderArm)
}
if(arm.linkOne&&!reducedMotion) requestAnimationFrame(renderArm)
