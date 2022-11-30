import"https://astro.irdev.us/modules/satellite.mjs";import{WebGL2,LogLevel,Utility,Float2,Float3,Float4x4}from"https://webgl.irdev.us/modules/webgl.mjs";export let SuborbitalTrack=function(D,e=function(t){}){let l=Object.create(null);let a=l.wgl=WebGL2();let M=a.ClassBase;let v=a.RollingStats;let B=a.PointerTracker;let t=a.OnReady;let n=a.Render;let i=a.LoaderShader;let o=a.LoaderPath;let s=a.Texture;let c=a.TextFile;let r=a.Loader;let d=a.Program;let h=a.makeBall;let m=a.makeFan;let H=a.Shape;let f=a.Node;let T=a.Thing;let g=Object.create(null);let u=function(t){let e=t.getUTCHours();let l=t.getUTCMinutes();let n=t.getUTCSeconds();let a=t.getUTCMilliseconds();let i=e+l/60+n/(60*60)+a/(1e3*60*60);let o=t.getUTCMonth()+1;let s=t.getUTCDate();let r=t.getUTCFullYear();let u=Math.floor;return 367*r-u(7*(r+u((o+9)/12))/4)+u(275*o/9)+s-730531.5+i/24};let I=function(t){let e=t/36525;let l=67310.54841+(876600*60*60+8640184.812866)*e+.093104*e*e-62e-7*e*e*e;return Utility.degreesToRadians(Utility.unwindDegrees(l/240))};let p=function(t){let e=Utility.cos;let l=Utility.sin;const n=36525;let a=t/n;let i=(280.46646+a*(36000.76983+a*3032e-7))%360;let o=357.52911+a*(35999.05029-1537e-7*a);let s=i+l(o)*(1.914602-a*(.004817+14e-6*a))+l(2*o)*(.019993-101e-6*a)+l(3*o)*289e-6;let r=s-.00569-.00478*l(125.04-1934.136*a);let u=l(r);let c=23+(26+(21.448-a*(46.815+a*(59e-5-a*.001813)))/60)/60;let d=c+.00256*e(125.04-1934.136*a);g.ra=Math.atan2(e(d)*u,e(r));g.dec=Math.asin(l(d)*u);let h=I(t);g.ra=Utility.unwindRadians(g.ra-h)};let E=function(){let t=Object.create(M);t.readTle=function(t){let l=t.split(/\r?\n/);let n=[];for(let e=0;e<l.length;e+=3){let t=l[e].trim();if(t.length>0)n.push({name:t,line1:l[e+1],line2:l[e+2]})}return n};const i=6378.137;const e=6356.7523142;const l=(i-e)/i;const o=2*l-l*l;let s=function(e,t){let l=Math.sqrt(e.x*e.x+e.y*e.y);let n=Math.atan2(e.z,l);let a;for(let t=0;t<20;++t){let t=Math.sin(n);a=1/Math.sqrt(1-o*(t*t));n=Math.atan2(e.z+i*a*o*t,l)}return{longitude:Math.atan2(e.y,e.x)-t,latitude:n,height:l/Math.cos(n)-i*a,gmst:t}};const n=1e3;const a=60;const r=60;const u=24;const c=.5;const d=n*a*5;const h=n*a*r*u*c/d;const m=Math.PI*2;let f=function(){return(Math.random()-.5)*Math.PI};let T=function(t,e,l){return t+l*(e-t)};let g=function(t,e,l){let n=e-t;while(n>Math.PI)n-=m;while(n<-Math.PI)n+=m;return t+l*n};t.construct=function(t){let l=this.elements=t.elements;this.currentElementIndex=0;let a=Date.now();let i=this.elementIndex={};const o=Float4x4.scale(.01);for(let t=0,e=l.length;t<e;++t){let n=l[t];n.index=t;n.transform=Float4x4.chain(Float4x4.rotateX(f()),Float4x4.rotateY(f()),Float4x4.rotateZ(f()),o);i[n.name]=t;n.startTime=a;n.positions=[];n.satrec=satellite.twoline2satrec(n.line1,n.line2);for(let l=0;l<h;++l){let t=new Date(a+l*d);let e=satellite.propagate(n.satrec,t);if(typeof e!=="undefined"&&"position"in e&&e.position!==false){n.positions.push(s(e.position,satellite.gstime(t)))}else{n.positions.push({latitude:0,longitude:0,height:0,gmst:0})}}}};const I=200;t.updateElements=function(r,l,t=24){let n=function(t,e){Float4x4.copy(Float4x4.chain(t.transform,Float4x4.translate([Utility.unwind2(e.longitude,-Math.PI,Math.PI)/Math.PI,Utility.unwind2(e.latitude,-Math.PI,Math.PI)/Math.PI,-.2])),l[t.index])};let a=function(t){let e=Math.max(0,r.getTime()-t.startTime);let l=e/d;let n=Math.floor(l);let a=t.positions.length-1;let i=t.positions[Math.min(n,a)];let o=t.positions[Math.min(n+1,a)];let s=l-n;return{latitude:T(i.latitude,o.latitude,s),longitude:g(i.longitude,o.longitude,s),height:T(i.height,o.height,s),gmst:g(i.gmst,o.gmst,s)}};let i=this.elements;let o=this.currentElementIndex;let e=performance.now();let s=false;do{for(let t=0;t<I;++t){let t=i[o];let e=a(t);n(t,e);o=(o+1)%this.elements.length;s=s||o===this.currentElementIndex}}while(performance.now()-e<t&&!s);this.currentElementIndex=o};return t}();let O;l.addTle=function(e){O=null;let l=f.get("root");l.removeChild("tle");let t=c.get("elements").text;let n=t.charAt(0);if(n==="{"){t=JSON.parse(t).response.content}let a=E.readTle(t);a=a.filter(t=>{return e.includes(t.name)||e.includes(t.line1.substring(2,7))});if(a.length>0){let t=f.new({replace:true,instance:a.length,state:function(t){d.get("basic").use();t.OUTPUT_ALPHA_PARAMETER=1;t.MODEL_COLOR=[1,.7,.4];t.AMBIENT_CONTRIBUTION=.25;t.DIFFUSE_CONTRIBUTION=.9},shape:"ball-small",children:false},"tle");l.addChild(t);O=E.new({elements:a});O.updateElements(new Date,t.instanceTransforms.matrices,Number.POSITIVE_INFINITY)}};let R;let w;let A=Object.create(null);let F;let P=document.visibilityState;document.addEventListener("visibilitychange",function(t){P=document.visibilityState;_()});let x="focus";window.addEventListener("focus",function(t){x="focus";_()});window.addEventListener("blur",function(t){x="blur";_()});let L=true;let _=function(){if(P==="visible"&&x==="focus"){L=true;F.focus();window.requestAnimationFrame(S)}else{L=false}};let C=performance.now();let U=Date.now()-C;let b=1;let N;let S=function(t){if(L===true){let t=performance.now();window.requestAnimationFrame(S);if(document.hidden){return}let e=C+U+b*(t-C);let l=new Date(e);N=u(l);T.updateAll(N);if(O){O.updateElements(l,f.get("tle").instanceTransforms.matrices)}let n=a.getContext();A.MODEL_MATRIX_PARAMETER=Float4x4.IDENTITY;A.PROJECTION_MATRIX_PARAMETER=Float4x4.orthographic(-1,1,-.5,.5,0,2);A.VIEW_MATRIX_PARAMETER=Float4x4.IDENTITY;A.MODEL_MATRIX_PARAMETER=Float4x4.IDENTITY;w.traverse(A)}};let y=function(){let e=a.getContext();h("ball-small",8);w=f.new({transform:Float4x4.IDENTITY,state:function(t){e.clearColor(0,0,0,1);e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT);e.enable(e.CULL_FACE);e.cullFace(e.BACK);e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA);e.enable(e.BLEND);t.OUTPUT_ALPHA_PARAMETER=1;t.AMBIENT_LIGHT_COLOR=[.8,.8,1];t.LIGHT_COLOR=[1,1,.8];t.LIGHT_DIRECTION=Float3.normalize([1.55,1.75,1.45]);t.AMBIENT_CONTRIBUTION=.25;t.DIFFUSE_CONTRIBUTION=.75;t.SPECULAR_CONTRIBUTION=.05;t.SPECULAR_EXPONENT=8}},"root");w.addChild(f.new({transform:Float4x4.scale([1,.5,1]),enabled:true,state:function(t){d.get("suborbital-earth").use().setDayTxSampler("earth-day").setNightTxSampler("earth-night").setSunRaDec([g.ra,g.dec]);t.MODEL_COLOR=[1,1,1]},shape:"square",children:false}));T.new({node:"earth",update:function(t){p(t)}},"earth");let t=JSON.parse(c.get("ground-stations").text);for(let n of t){if(n.authority==="CSpOC"){let a=[];let i=Float2.scale([n.longitude,n.latitude],Math.PI/180);const r=6378.137;const u=Math.PI*2*r;let t=32;let o=Math.PI*2/t;let e=Math.min(Math.max(n.max_range,1e3),6e3);let s=e/u;for(let n=0;n<t;++n){let t=n*o;let e=Float2.scale([Math.cos(t),Math.sin(t)],s);let l=Float2.add(i,e);l[0]=i[0]+(l[0]-i[0])/Math.cos(l[1]);if(l[0]>Math.PI){}else if(l[0]<-Math.PI){}l=Float2.scale(l,1/Math.PI);a.push(l);LogLevel.info("Pt: "+n+", currentAngle: "+t)}let l="fan-"+n.id;m(l,a);w.addChild(f.new({transform:Float4x4.translate([0,0,-.1]),state:function(t){d.get("color").use();t.MODEL_COLOR=[.5,1,0];t.OUTPUT_ALPHA_PARAMETER=.1},shape:l,children:false}))}}};F=document.getElementById("render-canvas-div");R=n.new({canvasDivId:"render-canvas-div",loaders:[i.new("shaders/@.glsl").addFragmentShaders(["suborbital-earth"]),o.new({type:s,path:"textures/@.png"}).addItems(["earth-day","earth-night"],{generateMipMap:true}),o.new({type:c,path:"data/@.json"}).addItems(["ground-stations"]),r.new().addItem(c,"elements",{url:"data/gp.tle"})],onReady:t.new(null,function(t){d.new({vertexShader:"basic"},"suborbital-earth");y();l.addTle(["ISS (NAUKA)"]);e(l);S()})});l.updateVis=function(t,e){LogLevel.info("Update Vis called with "+t.length+" elements, at "+e.toString())};return l};