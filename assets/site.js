(function(){
  var root=document.documentElement, key="gl-theme";
  try{var saved=localStorage.getItem(key); if(saved){root.setAttribute("data-theme",saved);}}catch(e){}
  var t=document.getElementById("themeToggle");
  if(t){t.addEventListener("click",function(){
    var cur=root.getAttribute("data-theme");
    if(!cur){cur=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
    var next=cur==="dark"?"light":"dark";
    root.setAttribute("data-theme",next);
    try{localStorage.setItem(key,next);}catch(e){}
  });}
  var btn=document.getElementById("copyEmail");
  if(btn){btn.addEventListener("click",function(){
    var done=function(){btn.textContent="Copied";setTimeout(function(){btn.textContent="Copy";},1600);};
    if(navigator.clipboard){navigator.clipboard.writeText("contact@gael-lambert.info").then(done,function(){});}
  });}

  /* hand-drawn tail: from the double underline up and over to the annotation */
  var layer=document.getElementById("arrowLayer"), note=document.getElementById("annot"), circ=document.getElementById("circ");
  function draw(){
    if(!layer||!note||!circ) return;
    var box=layer.getBoundingClientRect(), n=note.getBoundingClientRect(), u=circ.getBoundingClientRect();
    var side = n.left > u.right + 40; // annotation sits to the right (desktop)
    if(!side){ layer.innerHTML=""; return; } // narrow screens: note sits under the paragraph, no tail
    var ux=u.right+2.5-box.left, uy=u.bottom+6-box.top;           // end of the lower underline stroke
    var gy=u.top-7-box.top;                                    // the gap above the line of text
    var nx=n.left-12-box.left, ny=n.top+n.height*0.32-box.top; // left of the annotation
    var d="M"+ux+" "+uy+" C"+(ux+1)+" "+(uy-8)+" "+(ux-0.5)+" "+(gy+7)+" "+(ux+10)+" "+gy+
          " C"+(ux+(nx-ux)*0.45)+" "+(gy-10)+" "+(nx-(nx-ux)*0.25)+" "+(ny+4)+" "+nx+" "+ny;
    var a=Math.atan2(4,(nx-ux)*0.25), L=10, w=0.5;
    var h1x=nx-L*Math.cos(a-w), h1y=ny-L*Math.sin(a-w), h2x=nx-L*Math.cos(a+w), h2y=ny-L*Math.sin(a+w);
    layer.innerHTML='<path d="'+d+'"/><path d="M'+h1x+' '+h1y+' L'+nx+' '+ny+' L'+h2x+' '+h2y+'"/>';
  }
  if(layer){
    draw(); window.addEventListener("resize",draw);
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(draw);}
    window.addEventListener("load",draw);
  }
  /* unfurling line on the path page */
  var tl=document.querySelector(".tl.unfurl");
  if(tl){
    var NS="http://www.w3.org/2000/svg", svg=document.createElementNS(NS,"svg"), guide=document.createElementNS(NS,"path"), inkp=document.createElementNS(NS,"path");
    svg.setAttribute("class","tl-line"); svg.setAttribute("aria-hidden","true");
    guide.setAttribute("class","guide"); inkp.setAttribute("class","inkp");
    svg.appendChild(guide); svg.appendChild(inkp); tl.appendChild(svg);
    var lis=[].slice.call(tl.querySelectorAll("li")), len=0, h=0;
    var still=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function layoutLine(){
      h=tl.offsetHeight; var d="M8 0";
      for(var y=36;y<h;y+=36){d+=" L"+(8+Math.sin(y*0.045)*1.1).toFixed(2)+" "+y;}
      d+=" L8 "+h;
      svg.setAttribute("width","16"); svg.setAttribute("height",h); svg.setAttribute("viewBox","0 0 16 "+h);
      guide.setAttribute("d",d); inkp.setAttribute("d",d);
      len=inkp.getTotalLength(); inkp.style.strokeDasharray=len; updateLine();
    }
    function updateLine(){
      var r=tl.getBoundingClientRect(), vh=window.innerHeight||800;
      var prog=still?1:Math.max(0,Math.min(1,(vh*0.72-r.top)/r.height));
      inkp.style.strokeDashoffset=len*(1-prog);
      var drawn=prog*h;
      lis.forEach(function(li){ li.classList.toggle("reached", li.offsetTop+26<=drawn); });
    }
    layoutLine();
    window.addEventListener("scroll",updateLine,{passive:true});
    window.addEventListener("resize",layoutLine);
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(layoutLine);}
  }

  /* footprint map: bases, arcs and reach, one step at a time */
  var mapFig=document.getElementById("mapFig");
  if(mapFig){
    var svgm=mapFig.querySelector(".worldmap"), lis2=[].slice.call(mapFig.querySelectorAll(".map-steps li")), timer=null, played=false;
    var nSteps=lis2.length, calm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function show(k){
      svgm.querySelectorAll("[data-step]").forEach(function(el){ el.classList.toggle("on", +el.getAttribute("data-step")<=k); });
      svgm.querySelectorAll("[data-pulse]").forEach(function(el){
        if((" "+el.getAttribute("data-pulse")+" ").indexOf(" "+k+" ")>=0){ el.classList.remove("pulse"); void el.getBoundingClientRect(); el.classList.add("pulse"); }
      });
      lis2.forEach(function(li){ var s=+li.getAttribute("data-step"); li.classList.toggle("active", s===k); li.classList.toggle("done", s<k); });
    }
    function play(){
      if(calm){ return; }
      clearInterval(timer); svgm.classList.add("anim"); var k=0; show(0);
      timer=setInterval(function(){ k++; show(k); if(k>=nSteps){ clearInterval(timer); setTimeout(function(){ lis2.forEach(function(li){li.classList.remove("active");li.classList.add("done");}); },1400); } },1400);
    }
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(es,o){ es.forEach(function(e){ if(e.isIntersecting&&!played){ played=true; play(); o.disconnect(); } }); },{threshold:0.35}).observe(mapFig);
    }
    var rp=document.getElementById("mapReplay"); if(rp){ rp.addEventListener("click",play); if(calm){rp.hidden=true;} }
  }

  /* ink picker */
  var inks=document.querySelectorAll(".ink");
  function markInk(){var cur=root.getAttribute("data-ink")||"blueprint";inks.forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-ink")===cur?"true":"false");});}
  inks.forEach(function(b){b.addEventListener("click",function(){
    var v=b.getAttribute("data-ink");
    if(v==="blueprint"){root.removeAttribute("data-ink");}else{root.setAttribute("data-ink",v);}
    try{localStorage.setItem("gl-ink",v);}catch(e){}
    markInk();
  });});
  try{var si=localStorage.getItem("gl-ink");if(si&&si!=="blueprint"){root.setAttribute("data-ink",si);}}catch(e){}
  markInk();
})();
