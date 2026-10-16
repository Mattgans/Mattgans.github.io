import { animate } from "https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm"
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches
const header=document.getElementById("navbar"),progress=document.getElementById("scroll-progress"),glow=document.querySelector(".cursor-glow")
function updateScrollState(){const max=document.documentElement.scrollHeight-window.innerHeight;const amount=max>0?window.scrollY/max:0;header.classList.toggle("scrolled",window.scrollY>24);progress.style.width=`${amount*100}%`;document.documentElement.style.setProperty("--scroll-progress",amount)}window.addEventListener("scroll",updateScrollState,{passive:true});updateScrollState()
if(!reducedMotion){document.addEventListener("pointermove",e=>{glow.style.transform=`translate(${e.clientX-180}px,${e.clientY-180}px)`});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){animate(entry.target,{opacity:[0,1],y:[28,0],duration:750,ease:"outExpo"});observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:"0px 0px -35px"});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));document.querySelectorAll(".project-card").forEach(card=>{card.addEventListener("pointermove",e=>{const b=card.getBoundingClientRect();animate(card,{rotateY:((e.clientX-b.left)/b.width-.5)*2.5,rotateX:((e.clientY-b.top)/b.height-.5)*-2.5,duration:320,ease:"outQuad"})});card.addEventListener("pointerleave",()=>animate(card,{rotateY:0,rotateX:0,duration:650,ease:"outExpo"}))})}

const projectGrid=document.querySelector(".project-grid")
if(projectGrid){projectGrid.insertAdjacentHTML("beforeend",`
  <article class="project-card project-tertiary project-credit">
    <div class="project-visual credit-visual" aria-hidden="true"></div>
    <div class="project-copy"><div class="project-topline"><span>03 / Predictive modeling</span><span>ML SYSTEM</span></div><h3>Credit Utilization<br>Forecasting</h3><p>A three-month forecasting model for credit-card utilization, with an automated pipeline for preprocessing, training, and evaluation.</p><div class="tags"><span>Python</span><span>Random Forest</span><span>XGBoost</span><span>Pandas</span><span>R</span></div><p class="award">90% accuracy <span>&middot;</span> 3-month forecast</p></div>
  </article>
  <article class="project-card project-tertiary project-stock">
    <div class="project-visual stock-visual" aria-hidden="true"></div>
    <div class="project-copy"><div class="project-topline"><span>04 / AI + markets</span><span>2025</span></div><h3>The Daily Prophet<br>AI Trading Bot</h3><p>An autonomous paper-trading workflow that turns news sentiment into market signals and surfaces its activity in a live dashboard.</p><div class="tags"><span>Python</span><span>Gemini</span><span>Alpaca API</span><span>NewsAPI</span></div><p class="award">100+ articles / session <span>&middot;</span> paper trading</p></div>
  </article>
  <article class="project-card project-tertiary project-vr">
    <div class="project-visual vr-visual" aria-hidden="true"></div>
    <div class="project-copy"><div class="project-topline"><span>05 / Multiplayer XR</span><span>2026</span></div><h3>Hidden Foe</h3><p>A two-player VR stealth game where rival assassins hunt each other without alerting NPCs or revealing their identity.</p><div class="tags"><span>Unity</span><span>C#</span><span>VR</span><span>Multiplayer</span></div><a class="project-link" href="https://jwlxe.itch.io/hidden-foe" target="_blank" rel="noopener">Play on itch.io <span>&nearr;</span></a></div>
  </article>
`) }

const dailyProphetCard=document.querySelector(".project-stock .project-copy")
if(dailyProphetCard) dailyProphetCard.insertAdjacentHTML("beforeend",'<a class="project-link" href="https://github.com/Mattgans/The-Daily-Prophet" target="_blank" rel="noopener">View repository <span>&nearr;</span></a>')

const inspectorCard=document.querySelector(".project-feature .project-copy")
if(inspectorCard) inspectorCard.insertAdjacentHTML("beforeend",'<a class="project-link" href="https://devpost.com/software/cat-ar-pillar" target="_blank" rel="noopener">View on Devpost <span>&nearr;</span></a>')

const aboutAside=document.querySelector(".about-aside"),aboutTitle=document.querySelector(".about-content h2"),aboutIntro=document.querySelector(".about-content>p")
if(aboutAside) aboutAside.innerHTML='<p class="eyebrow">Working across</p><div class="about-index"><div><span>01</span><strong>Applied AI</strong><p>Models built around a concrete task.</p></div><div><span>02</span><strong>Software systems</strong><p>Tools people can actually use.</p></div><div><span>03</span><strong>Immersive computing</strong><p>Interfaces for spatial work.</p></div></div>'
if(aboutTitle) aboutTitle.innerHTML="Research, product, and<br>immersive systems."
if(aboutIntro) aboutIntro.textContent="I work across applied machine learning, full-stack product engineering, and XR. The throughline is pragmatic systems: reliable, understandable, and useful."

const footerTagline=document.querySelector("footer span:last-child")
if(footerTagline) footerTagline.remove()

const letsTalk=document.querySelector(".header-contact")
if(letsTalk) letsTalk.href="mailto:Mshang4@illinois.edu?subject=Portfolio%20inquiry"
