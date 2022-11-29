import"https://astro.irdev.us/modules/satellite.mjs";import{WebGL2,LogLevel,Utility,Float2,Float3,Float4x4}from"https://webgl.irdev.us/webgl.mjs";export let Astro=function(t,u,m,k,H=function(t){}){let e=Object.create(null);let f=e.wgl=WebGL2();let B=f.ClassBase;let l=f.RollingStats;let Y=f.PointerTracker;let z=f.OnReady;let j=f.Render;let V=f.LoaderShader;let n=f.LoaderPath;let X=f.Texture;let s=f.TextFile;let q=f.Loader;let c=f.Program;let d=f.makeBall;let G=f.Shape;let p=f.Node;let F=f.Thing;let W=function(t){let e=t.seconds;let l=t.minutes+e/60;if("hours"in t){return t.sign*((t.hours+l/60)/24)}else if("degrees"in t){return t.sign*(t.degrees+l/60)/360}};let g=function(t){return W(t)*2*Math.PI};String.prototype.test=function(t){return t.test(this)};let x=function(t){let e=Object.create(null);let l=t.indexOf("-");if(l>=0){e.sign=-1;t=t.substring(l+1)}else{e.sign=1}let n=t.split(/[″"s]\s*/i);let a=parseFloat(n.length>1&&n[1].length>0?n[1]:0);n=n[0].split(/[′'m]\s*/i);e.seconds=parseFloat(n.length>1&&n[1].length>0?n[1]:0)+a;if(t.test(/[°d]/)){n=n[0].split(/[°d]\s*/i);e.minutes=parseFloat(n.length>1&&n[1].length>0?n[1]:0);e.degrees=parseFloat(n[0])}else{n=n[0].split(/[h]\s*/i);e.minutes=parseFloat(n.length>1&&n[1].length>0?n[1]:0);e.hours=parseFloat(n[0])}return e};let K=function(t,e,l,n,a,o){let i=new Date;i.setUTCFullYear(t,e-1,l);i.setUTCHours(n,a,o);return i};let J=function(t){let e=t.getUTCHours();let l=t.getUTCMinutes();let n=t.getUTCSeconds();let a=t.getUTCMilliseconds();let o=e+l/60+n/(60*60)+a/(1e3*60*60);let i=t.getUTCMonth()+1;let r=t.getUTCDate();let s=t.getUTCFullYear();let u=Math.floor;return 367*s-u(7*(s+u((i+9)/12))/4)+u(275*i/9)+r-730531.5+o/24};let Z=function(t){let e=t/36525;let l=67310.54841+(876600*60*60+8640184.812866)*e+.093104*e*e-62e-7*e*e*e;return Utility.unwindDegrees(l/240)};const Q=36525;const T=6378.137;const $=695700;const tt=149597870.7;const h=tt/T;const w=h+1;const et=1737.1;const lt=et/T;const nt=Q/27.321662;let A=Object.create(null);let at=function(t){let p=Utility.cos;let F=Utility.sin;let l=t/Q;{let t=function(t){let e=Object.create(null);let l=(280.46646+t*(36000.76983+t*3032e-7))%360;let n=357.52911+t*(35999.05029-1537e-7*t);let a=l+F(n)*(1.914602-t*(.004817+14e-6*t))+F(2*n)*(.019993-101e-6*t)+F(3*n)*289e-6;let o=a-.00569-.00478*F(125.04-1934.136*t);let i=F(o);e.r=1.000140612-.016708617*p(n)-139589e-9*p(n+n);let r=23+(26+(21.448-t*(46.815+t*(59e-5-t*.001813)))/60)/60;let s=r+.00256*p(125.04-1934.136*t);let u=p(a);let c=p(s)*i;let d=F(s)*i;e.direction=Float3.normalize([-u,d,c]);return e};let e=t(l);A.sunR=e.r;A.sunDirection=e.direction}{let t=function(t){let e=Object.create(null);let l=218.32+481267.8813*t+6.29*F(134.9+477198.85*t)-1.27*F(259.2-413335.38*t)+.66*F(235.7+890534.23*t)+.21*F(269.9+954397.7*t)-.19*F(357.5+35999.05*t)-.11*F(186.6+966404.05*t);let n=5.13*F(93.3+483202.03*t)+.28*F(228.2+960400.87*t)-.28*F(318.3+6003.18*t)-.17*F(217.6-407332.2*t);let a=.9508+.0518*p(134.9+477198.85*t)+.0095*p(259.2-413335.38*t)+.0078*p(235.7+890534.23*t)+.0028*p(269.9+954397.7*t);e.r=1/F(a);let o=23.439291-.0130042*t;let i=p(l);let r=F(l);let s=p(n);let u=F(n);let c=p(o);let d=F(o);let h=s*i;let m=c*s*r-d*u;let f=d*s*r+c*u;e.direction=Float3.normalize([-h,f,m]);return e};let e=t(l);A.moonR=e.r;A.moonDirection=e.direction;A.moonTheta=Utility.degreesToRadians(42.427549902001715+-6.77+360*nt*l)}{let t=Float3.scale(A.sunDirection,A.sunR*h);A.sunPosition=[t[0],t[1],t[2],$/T];let e=Float3.scale(A.moonDirection,A.moonR);A.moonPosition=[e[0],e[1],e[2],et/T]}};let M=function(){let s=Object.create(null);const u=41;const c=Math.PI;let i=[.0014,.0042,.0143,.0435,.1344,.2839,.3483,.3362,.2908,.1954,.0956,.032,.0049,.0093,.0633,.1655,.2904,.4334,.5945,.7621,.9163,1.0263,1.0622,1.0026,.8544,.6424,.4479,.2835,.1649,.0874,.0468,.0227,.0114,.0058,.0029,.0014,7e-4,3e-4,2e-4,1e-4,0];let r=[0,1e-4,4e-4,.0012,.004,.0116,.023,.038,.06,.091,.139,.208,.323,.503,.71,.862,.954,.995,.995,.952,.87,.757,.631,.503,.381,.265,.175,.107,.061,.032,.017,.0082,.0041,.0021,.001,5e-4,3e-4,1e-4,1e-4,0,0];let d=[.0065,.0201,.0679,.2074,.6456,1.3856,1.7471,1.7721,1.6692,1.2876,.813,.4652,.272,.1582,.0782,.0422,.0203,.0087,.0039,.0021,.0017,.0011,8e-4,3e-4,2e-4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];let g=[[.67,.33],[.21,.71],[.14,.08],[.31,.316]];let l=function(n){let a=[];let t=6626176e-40,e=1380662e-29,l=299792500;let o=t*l,i=2*c*o*l,r=o/e;for(let l=0;l<u;++l){let t=(l*10+380)*1e-9;let e=i/(Math.pow(t,5)*(Math.pow(Math.exp(1),r/(t*n))-1));a.push(e)}return a};let x=function(t,e,l){let n=Math.max(Math.max(t,e),l);return[t/n,e/n,l/n]};let T=function(t,e,l){let n=[];let a=g[3][0],o=g[3][1];let i=a/o,r=1,s=(1-a-o)/o;n.push(t+(i-t)*.005);n.push(e+(r-e)*.005);n.push(l+(s-l)*.005);return n};let M=function(e,l,n){let t=g[0][0],a=g[1][0],o=g[2][0],i=g[3][0];let r=g[0][1],s=g[1][1],u=g[2][1],c=g[3][1];let d=1/c*(i*(s-u)-c*(a-o)+a*u-o*s);let h=1/c*(i*(u-r)-c*(o-t)-t*u+o*r);let m=1/c*(i*(r-s)-c*(t-a)+t*s-a*r);let f=e*((s-u-o*s+u*a)/d)+l*((o-a-o*s+a*u)/d)+n*((a*u-o*s)/d);let p=e*((u-r-u*t+r*o)/h)+l*((t-o-t*u+o*r)/h)+e*((o*r-t*u)/h);let F=e*((r-s-r*a+s*t)/m)+l*((a-t-a*r+t*s)/m)+n*((t*s-a*r)/m);if(f>=0&&p>=0&&F>=0){return x(f,p,F)}else{let t=T(e,l,n);return M(t[0],t[1],t[2])}};let n=function(l){let n=0,a=0,o=0;for(let e=0;e<u;++e){let t=l[e];n+=i[e]*t;a+=r[e]*t;o+=d[e]*t}return M(n,a,o)};let e=function(e){let l=0;for(let t=0;t<u;++t){l=Math.max(l,e[t])}return l};let a=function(e,l){let n=[];for(let t=0;t<41;++t){n.push(e[t]*l)}return n};let o=function(t){return a(t,1/e(t))};s.colorAtTemperature=function(t){let e=l(t);e=o(e);return n(e)};s.makeBand=function(t,e){let n='<div style="width:100%;height:100%;">';let a=2e3,l=2e4,o=l-a,i=o/e;let r=99/e;for(let l=0;l<e;++l){let t=a+l*i;let e=s.colorAtTemperature(t);n+='<div style="display:inline-block;width:'+r+"%;height:100%;background-color:rgb("+Math.floor(e[0]*255)+","+Math.floor(e[1]*255)+","+Math.floor(e[2]*255)+');">';n+='<span style="display:inline-block;transform:rotate(270deg);color:black;font-size:7px;margin-top:15px;margin-left:auto;margin-right:auto;"><span>'+Math.floor(t)+"°K</span></span>";n+="</div>"}document.getElementById(t).innerHTML=n+"</div>"};return s}();let ot=function(){let t=Object.create(null);t.make=function(o,i,r){return G.new({buffers:function(){let u=-1.5,t=8;let c=t-u;let d=[];let h=[];let e=function(l){let n=2*Math.PI/l;for(let e=0;e<l;++e){let t=n*e;h.push([Math.cos(t),Math.sin(t),0,1])}h.push([0,0,0,1]);for(let t=0;t<l;++t){d.push(l,(t+1)%l,t)}};e(7);let m=[];let f=[];let p=[];let F=0;let l=function(s){if(s.V>=i&&s.V<r){F++;let t=Math.PI/-2+g(x(s.RA));let e=-g(x(s.Dec));let l=(s.V-u)/c;let n=.005*(1-l)+5e-4*l;let a=Float4x4.chain(Float4x4.scale(n),Float4x4.translate([0,0,1]),Float4x4.rotateX(e),Float4x4.rotateY(t));let o=m.length;for(let t of h){t=Float3.copy(Float4x4.preMultiply(t,a));m.push(t)}let i=.25+.75*(1-l);let r="K"in s?M.colorAtTemperature(s.K):[1,.5,.5];for(let t=1;t<h.length;++t){f.push([r[0],r[1],r[2],.1])}r=Float3.scale(Float3.add([2,2,2],r),.3333);f.push([r[0],r[1],r[2],i]);for(let t of d){p.push(t+o)}}};let n=JSON.parse(s.get("bsc5-short").text);for(let t of n)l(t);let a=JSON.parse(s.get("messier").text);for(let t of a)l(t);LogLevel.info("Star count ("+o+"): "+F);return{position:Utility.flatten(m),color:Utility.flatten(f),index:p}}},o)};return t}();let it=function(){let t=Object.create(null);t.make=function(n,a,o){return G.new({buffers:function(){let t=JSON.parse(s.get("Stars").text);let u=-1.5,e=8;let c=e-u;let d=[];let h=[];let l=function(l){let n=2*Math.PI/l;for(let e=0;e<l;++e){let t=n*e;h.push([Math.cos(t),Math.sin(t),0,1])}h.push([0,0,0,1]);for(let t=0;t<l;++t){d.push(l,(t+1)%l,t)}};l(7);let m=[];let f=[];let p=[];let F=0;for(let s of t){if(s.V>=a&&s.V<o){F++;let t=Math.PI/-2+g(x(s.RA));let e=-g(x(s.Dec));let l=(s.V-u)/c;let n=.005*(1-l)+5e-4*l;let a=Float4x4.chain(Float4x4.scale(n),Float4x4.translate([0,0,1]),Float4x4.rotateX(e),Float4x4.rotateY(t));let o=m.length;for(let t of h){t=Float3.copy(Float4x4.preMultiply(t,a));m.push(t)}let i=.25+.75*(1-l);let r="K"in s?M.colorAtTemperature(s.K):[.5,.5,.5];for(let t=1;t<h.length;++t){f.push([r[0],r[1],r[2],.1])}r=Float3.scale(Float3.add([2,2,2],r),.3333);f.push([r[0],r[1],r[2],i]);for(let t of d){p.push(t+o)}}}LogLevel.info("Star count ("+n+"): "+F);return{position:Utility.flatten(m),color:Utility.flatten(f),index:p}}},n)};return t}();let rt=function(t,e){LogLevel.say(LogLevel.INFO,"Make WGS84...");let n=[];let a=[];let o=Math.PI/e;for(let l=0;l<=e;++l){let t=o*l;let e=Float2.fixNum([Math.sin(t),Math.cos(t)]);n.push(e);a.push(e)}return makeRevolve(t,n,a,e*2,function(t){return t})};let st=function(){let t=Object.create(B);t.readTle=function(t){let l=t.split(/\r?\n/);let n=[];for(let e=0;e<l.length;e+=3){let t=l[e].trim();if(t.length>0)n.push({name:t,line1:l[e+1],line2:l[e+2]})}return n};const o=6378.137;const e=6356.7523142;const l=(o-e)/o;const i=2*l-l*l;let r=function(e,t){let l=Math.sqrt(e.x*e.x+e.y*e.y);let n=Math.atan2(e.z,l);let a;for(let t=0;t<20;++t){let t=Math.sin(n);a=1/Math.sqrt(1-i*(t*t));n=Math.atan2(e.z+o*a*i*t,l)}return{longitude:Math.atan2(e.y,e.x)-t,latitude:n,height:l/Math.cos(n)-o*a,gmst:t}};const n=1e3;const a=60;const s=60;const u=24;const c=.5;const d=n*a*5;const h=n*a*s*u*c/d;const m=Math.PI*2;let f=function(){return(Math.random()-.5)*Math.PI};let p=function(t,e,l){return t+l*(e-t)};let F=function(t,e,l){let n=e-t;while(n>Math.PI)n-=m;while(n<-Math.PI)n+=m;return t+l*n};t.construct=function(t){let l=this.elements=t.elements;this.currentElementIndex=0;let a=Date.now();let o=this.elementIndex={};const i=Float4x4.scale(40/T);for(let t=0,e=l.length;t<e;++t){let n=l[t];n.index=t;n.transform=Float4x4.chain(Float4x4.rotateX(f()),Float4x4.rotateY(f()),Float4x4.rotateZ(f()),i);o[n.name]=t;n.startTime=a;n.positions=[];n.satrec=satellite.twoline2satrec(n.line1,n.line2);for(let l=0;l<h;++l){let t=new Date(a+l*d);let e=satellite.propagate(n.satrec,t);if(typeof e!=="undefined"&&"position"in e&&e.position!==false){n.positions.push(r(e.position,satellite.gstime(t)))}else{n.positions.push({latitude:0,longitude:0,height:0,gmst:0})}}}};const g=200;t.updateElements=function(s,l,t=24){let n=function(t,e){Float4x4.copy(Float4x4.chain(t.transform,Float4x4.translate([(e.height+T)/T,0,0]),Float4x4.rotateZ(e.latitude),Float4x4.rotateY(Math.PI+e.longitude+e.gmst)),l[t.index])};let a=function(t){let e=Math.max(0,s.getTime()-t.startTime);let l=e/d;let n=Math.floor(l);let a=t.positions.length-1;let o=t.positions[Math.min(n,a)];let i=t.positions[Math.min(n+1,a)];let r=l-n;return{latitude:p(o.latitude,i.latitude,r),longitude:F(o.longitude,i.longitude,r),height:p(o.height,i.height,r),gmst:F(o.gmst,i.gmst,r)}};let o=this.elements;let i=this.currentElementIndex;let e=performance.now();let r=false;do{for(let t=0;t<g;++t){let t=o[i];let e=a(t);n(t,e);i=(i+1)%this.elements.length;r=r||i===this.currentElementIndex}}while(performance.now()-e<t&&!r);this.currentElementIndex=i};return t}();e.addTle=function(e){b=null;let l=p.get("world");l.removeChild("tle");let t=s.get("elements").text;let n=t.charAt(0);if(n==="{"){t=JSON.parse(t).response.content}let a=st.readTle(t);if(e){a=a.filter(t=>t.name.includes(e))}if(a.length>0){let t=p.new({replace:true,instance:a.length,state:function(t){c.get("shadowed").use().setSunPosition(A.sunPosition);t.OUTPUT_ALPHA_PARAMETER=1;t.MODEL_COLOR=[1,.7,.4];t.AMBIENT_CONTRIBUTION=.25;t.DIFFUSE_CONTRIBUTION=.9},shape:"ball-tiny",children:false},"tle");l.addChild(t);F.new({replace:true,node:"tle",update:function(t){}},"tle");b=st.new({elements:a});b.updateElements(new Date,t.instanceTransforms.matrices,Number.POSITIVE_INFINITY)}};let ut;let P;let ct;const E=1e3;const dt=E/60;let I=0;let ht=l.new({count:60,fill:dt});let mt=l.new({count:60,fill:dt});let ft=l.new({count:60,fill:0});let R;let y;let b;let O=Object.create(null);let pt=[{name:"sweep",type:"fixed",from:"flyer",at:"earth",fov:40,wheel:{field:"fov",inc:-.5,limitUp:15,limitDown:80}},{name:"manual",type:"orbit",at:"earth",zoom:.25,fov:45,wheel:{field:"zoom",inc:.005,limitUp:1.5,limitDown:.1},default:[.3,.2]},{name:"iss",type:"skewer",from:"ISS (NAUKA)",at:"earth",fov:45,distance:4,wheel:{field:"distance",inc:-.05,limitUp:.35,limitDown:7.5}},{name:"moon at earth",type:"ots",from:"moon",at:"earth",zoom:.15,fov:1,default:[-.7,.4]},{name:"earth at moon",type:"ots",from:"earth",at:"moon",zoom:.5,fov:2,default:[-.7,.4]}];let a;let L=Object.create(null);const C=[0,0,0,1];let v=function(n){let t=p.get(n);if(t){return Float4x4.preMultiply(C,t.getTransform())}else if(b&&n in b.elementIndex){let l=p.get("tle");if(l){let t=l.instanceTransforms.matrices[b.elementIndex[n]];let e=Float4x4.multiply(l.getTransform(),t);return Float4x4.preMultiply(C,e)}}return C};let Ft=document.visibilityState;document.addEventListener("visibilitychange",function(t){Ft=document.visibilityState;r()});let o="focus";window.addEventListener("focus",function(t){o="focus";r()});window.addEventListener("blur",function(t){o="blur";r()});let i=true;let r=function(){if(Ft==="visible"&&o==="focus"){i=true;ut.focus();window.requestAnimationFrame(Pt)}else{i=false;ht.reset();mt.reset();wt=0}};const gt=[1,0,0,1];let U=function(t){let e=p.get(t).getTransform();let l=Float4x4.preMultiply(C,e);let n=Float4x4.preMultiply(gt,e);let a=Float3.subtract(n,l);return Float3.norm(a)};let S={hz:0,ms:0};let xt=function(a){const o=30;let e=0;let i=0;let r=0;let l=0;let s=function(n){let t=performance.now();if(n===l){LogLevel.warn("Repeated frame time");window.requestAnimationFrame(s);return}l=n;if(i===0){i=n;window.requestAnimationFrame(s);return}r+=t-n;if(++e<o){window.requestAnimationFrame(s)}else{let t=r/o;if(t>1){LogLevel.error("performance counter is not aligned with frame timestamp (avg delta: "+t.toFixed(2)+" ms)")}let e=E/((n-i)/o);let l=Math.round(e);if(l%5!==0&&l%12!==0){l=60;LogLevel.warn("Monitor Refresh Rate is strange")}LogLevel.info("Monitor Refresh Rate = "+l+" Hz ("+e.toFixed(3)+" Hz)");S={hz:l,ms:E/l};a()}};window.requestAnimationFrame(s)};let _=performance.now();let Tt=Date.now()-_;let Mt=10;let D;let wt=0;let At=0;let Pt=function(m){if(i===true){let n=performance.now();let a=n-m;a=ft.update(a).avg;window.requestAnimationFrame(Pt);let o=m-At;At=m;let t=_+Tt+Mt*(n-_);let e=new Date(t);D=J(e);at(D);F.updateAll(D);if(b){b.updateElements(e,p.get("tle").instanceTransforms.matrices)}let T=L[N.name].currentPosition;let M;switch(N.type){case"fixed":{let t=v(N.from);let e=v(N.at);M=Float4x4.lookFromAt(t,e,[0,1,0]);break}case"skewer":{let t=v(N.from);let e=v(N.at);let l=Float3.subtract(t,e);let n=Float3.norm(l);t=Float3.add(e,Float3.scale(l,(n+N.distance)/n));M=Float4x4.lookFromAt(t,e,[0,1,0]);break}case"portrait":case"orbit":{let t=v(N.at);let e=U(N.at);let l=e/(N.zoom*.9+.1);let n=Utility.sin(N.fov/2);let a=l/n;let o=Float4x4.preMultiply([0,0,0,1],Float4x4.chain(Float4x4.translate([a,0,0]),Float4x4.rotateZ(T[1]*Math.PI*.5),Float4x4.rotateY(T[0]*Math.PI*-1),Float4x4.translate(t)));M=Float4x4.lookFromAt(o,t,[0,1,0]);break}case"gimbal":{let t=v(N.from);let e=v(N.at);let l=v(N.up);let n=Float3.normalize(Float3.subtract(l,t));M=Float4x4.lookFromAt(t,e,n);break}case"target":{let t=N.targets;let l=[0,0,0];let n=[];for(let e of t){let t=v(e);n.push(t);l=Float3.add(l,t)}l=Float3.scale(l,1/t.length);let a=0;for(let e of n){let t=Float3.subtract(l,e);t[1]=0;a=Math.max(Float3.norm(t),a)}let e=a/(N.zoom*1.8+.2);let o=Utility.tan(N.fov/2);let i=e/o;let r=Float4x4.preMultiply(C,Float4x4.chain(Float4x4.translate([i,0,0]),Float4x4.rotateZ(T[1]*Math.PI*.5),Float4x4.rotateY(T[0]*Math.PI*-1),Float4x4.translate(l)));M=Float4x4.lookFromAt(r,l,[0,1,0]);break}case"ots":{let t=v(N.from);let e=U(N.from);let l=v(N.at);let n=U(N.at);let a=Float3.subtract(l,t);let o=Float3.norm(a);a=Float3.scale(a,1/o);let i=e/(N.zoom*.9+.1);let r=Utility.tan(N.fov/2);let s=i/r;let u=1-r*r;let c=e/o;let d=n/o;let h=c/d;let m=h/(1+h);let f=Math.asin(c/m)*2/u;let p=Math.max(.4*u,c);let F=Float3.add(Float3.scale(t,1-p),Float3.scale(l,p));s+=p*o+e+.1;let g=s*Math.sin(f/2)*1.5;let x=Float4x4.preMultiply(C,Float4x4.chain(Float4x4.translate(Float3.scale(a,-1*s)),Float4x4.translate(Float3.scale([0,1,0],T[1]*g)),Float4x4.rotateY(T[0]*f*-1),Float4x4.translate(F)));M=Float4x4.lookFromAt(x,F,[0,1,0]);break}}let i=f.getContext();i.clear(i.COLOR_BUFFER_BIT|i.DEPTH_BUFFER_BIT);let l=60;let r=Float4x4.copy(M);r[12]=r[13]=r[14]=0;O.CAMERA_POSITION=[0,0,0];O.PROJECTION_MATRIX_PARAMETER=Float4x4.perspective(l,i.viewportWidth/i.viewportHeight,1e3,w*1.1);O.VIEW_MATRIX_PARAMETER=r;O.MODEL_MATRIX_PARAMETER=Float4x4.IDENTITY;R.traverse(O);O.VIEW_MATRIX_PARAMETER=M;O.MODEL_MATRIX_PARAMETER=Float4x4.IDENTITY;let s=Float4x4.inverse(M);O.CAMERA_POSITION=[s[12],s[13],s[14]];let u=Float3.norm(O.CAMERA_POSITION);let c=A.moonR*1.1;let d=Math.max(.1,u-c);let h=u+c;O.PROJECTION_MATRIX_PARAMETER=Float4x4.perspective(N.fov,i.viewportWidth/i.viewportHeight,d,h);y.traverse(O);i.flush();if(o<E/4){let t=performance.now()-n;let e=mt.update(t);let l=ht.update(o);P.innerHTML=(E/l.avg).toFixed(1)+" / "+Utility.padNum((S.hz/(I+1)).toFixed(1),3)+" fps"+"<br>"+Utility.padNum(a.toFixed(1),5,"&nbsp")+" / "+Utility.padNum(e.avg.toFixed(1),5,"&nbsp")+" / "+Utility.padNum(l.avg.toFixed(1),5,"&nbsp")+" ms"+"<br>"+i.viewportWidth+" x "+i.viewportHeight}while(I>0&&performance.now()-n<S.ms*(I+.75)){}}};let Et=function(){d("ball",72);d("ball-med",36);d("ball-small",8);d("ball-tiny",5);ot.make("Bright Stars",-2,6);ot.make("Dim Stars",6,8);let e=f.getContext();e.clearColor(0,0,0,1);e.enable(e.CULL_FACE);e.cullFace(e.BACK);e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA);e.enable(e.BLEND);O.AMBIENT_LIGHT_COLOR=[1,1,1];O.LIGHT_COLOR=[1,1,1];R=p.new({state:function(t){e.disable(e.DEPTH_TEST);e.depthMask(false)}});let t=Float4x4.chain(Float4x4.rotateX(Math.PI),Float4x4.rotateY(Math.PI),Float4x4.scale(-w));let l=.66;R.addChild(p.new({transform:Float4x4.scale(w),state:function(t){c.get("vertex-color").use();t.MODEL_COLOR=[1,1,1];t.OUTPUT_ALPHA_PARAMETER=l},shape:"Dim Stars"},"Dim Stars"));R.addChild(p.new({transform:Float4x4.scale(w),state:function(t){c.get("vertex-color").use();t.MODEL_COLOR=[1,1,1];t.OUTPUT_ALPHA_PARAMETER=l},shape:"Bright Stars"},"Bright Stars"));R.addChild(p.new({transform:t,state:function(t){c.get("texture").use();t.OUTPUT_ALPHA_PARAMETER=l*.5;t.TEXTURE_SAMPLER="starfield"},shape:"ball",children:false},"starfield"));let n=M.colorAtTemperature(5800);let a=p.new({transform:Float4x4.IDENTITY,state:function(t){c.get("color").use();t.OUTPUT_ALPHA_PARAMETER=1;t.MODEL_COLOR=n},shape:"ball-med",children:false},"sun");R.addChild(a);F.new({node:"sun",update:function(t){let e=p.get(this.node);let l=h*A.sunR;let n=Float3.scale(A.sunDirection,l);let a=$/T*(h/l);e.transform=Float4x4.multiply(Float4x4.scale(a),Float4x4.translate(n));O.LIGHT_DIRECTION=A.sunDirection}},"sun");y=p.new({state:function(t){e.enable(e.DEPTH_TEST);e.depthMask(true)}});let o=p.new({transform:Float4x4.IDENTITY,state:function(t){c.get("shadowed-texture").use().setSunPosition(A.sunPosition);t.OUTPUT_ALPHA_PARAMETER=1;t.TEXTURE_SAMPLER="moon";t.MODEL_COLOR=[1,1,1];t.AMBIENT_CONTRIBUTION=.1;t.DIFFUSE_CONTRIBUTION=.95;t.SPECULAR_CONTRIBUTION=.05;t.SPECULAR_EXPONENT=8},shape:"ball-med",children:false},"moon");y.addChild(o);F.new({node:"moon",update:function(t){let e=p.get(this.node);e.transform=Float4x4.chain(Float4x4.scale(lt),Float4x4.rotateY(A.moonTheta),Float4x4.translate(Float3.scale(A.moonDirection,A.moonR)))}},"moon");let i=p.new({transform:Float4x4.IDENTITY},"world");y.addChild(i);i.addChild(p.new({transform:Float4x4.IDENTITY,children:false},"flyer"));F.new({node:"flyer",update:function(t){let e=p.get(this.node);e.transform=Float4x4.chain(Float4x4.scale(.01),Float4x4.translate([5e4/T,0,0]),Float4x4.rotateY(t*4e3*(1/Mt)),Float4x4.rotateZ(Utility.degreesToRadians(18)))}},"flyer");let r=p.new({},"earth-parent");i.addChild(r);r.addChild(p.new({state:function(t){c.get("earth").use().setDayTxSampler("earth-day").setNightTxSampler("earth-night").setSpecularMapTxSampler("earth-specular-map").setSunPosition(A.sunPosition).setMoonPosition(A.moonPosition);t.OUTPUT_ALPHA_PARAMETER=1},shape:"ball",children:false},"earth"));let s=(40+T)/T;r.addChild(p.new({transform:Float4x4.scale(s),state:function(t){c.get("clouds").use().setSunPosition(A.sunPosition).setMoonPosition(A.moonPosition);t.OUTPUT_ALPHA_PARAMETER=.9;t.TEXTURE_SAMPLER="clouds"},shape:"ball",children:false},"clouds"));let u=(160+T)/T;r.addChild(p.new({transform:Float4x4.scale(u),state:function(t){c.get("atmosphere").use().setAtmosphereDepth(u-1).setSunPosition(A.sunPosition).setMoonPosition(A.moonPosition);t.OUTPUT_ALPHA_PARAMETER=.5},shape:"ball",children:false},"atmosphere"));F.new({node:"world",update:function(t){let e=Z(t);p.get(this.node).transform=Float4x4.rotateY(Utility.degreesToRadians(e))}},"world")};let It=function(e){let l=L[N.name];if(e[2]!==0&&"wheel"in N){let t=N.wheel.inc>0?{min:"min",max:"max"}:{min:"max",max:"min"};if(e[2]>0){N[N.wheel.field]=Math[t.min](N[N.wheel.field]+N.wheel.inc,N.wheel.limitUp)}else{N[N.wheel.field]=Math[t.max](N[N.wheel.field]-N.wheel.inc,N.wheel.limitDown)}}let n=1;switch(N.type){case"target":case"portrait":case"orbit":{let t=Float2.add(l.currentPosition,[e[0],-n*e[1]]);t[0]=Utility.unwind(t[0],2);t[1]=Math.max(Math.min(t[1],.9),-.9);l.currentPosition=t;break}case"ots":{let t=Float2.add(l.currentPosition,[e[0]*3,-n*e[1]*.75]);t[0]=Math.max(Math.min(t[0],1),-1);t[1]=Math.max(Math.min(t[1],1),-1);l.currentPosition=t;break}}};let N;let Rt;let yt=function(t){a=t;N=pt[a];Rt.innerHTML=N.name;if(!(N.name in L)){L[N.name]={currentPosition:"default"in N?N.default:[0,0]}}};let bt=function(t){yt((a+1)%pt.length)};let Ot=function(t){I=(I+1)%6};let Lt;let Ct=function(){clearTimeout(Lt);yt(0);window.requestAnimationFrame(Pt);setTimeout(()=>{document.getElementById(k).style.opacity=0},50)};let vt=["Andromeda","Antlia","Apus","Aquarius","Aquila","Ara","Aries","Auriga","Bootes","Caelum","Camelopardalis","Cancer","Canes Venatici","Canis Major","Canis Minor","Capricornus","Carina","Cassiopeia","Centaurus","Cepheus","Cetus","Chamaeleon","Circinus","Columba","Coma Berenices","Corona Australis","Corona Borealis","Corvus","Crater","Crux","Cygnus","Delphinus","Dorado","Draco","Equuleus","Eridanus","Fornax","Gemini","Grus","Hercules","Horologium","Hydra","Hydrus","Indus","Lacerta","Leo","Leo Minor","Lepus","Libra","Lupus","Lynx","Lyra","Mensa","Microscopium","Monoceros","Musca","Norma","Octans","Ophiuchus","Orion","Pavo","Pegasus","Perseus","Phoenix","Pictor","Pisces","Piscis Austrinus","Puppis","Pyxis","Reticulum","Sagitta","Sagittarius","Scorpius","Sculptor","Scutum","Serpens","Sextans","Taurus","Telescopium","Triangulum","Triangulum Australe","Tucana","Ursa Major","Ursa Minor","Vela","Virgo","Volans","Vulpecula"];let Ut=function(t){Lt=setTimeout(function(){Ut(300);let t=vt[Math.floor(Math.random()*vt.length)];document.getElementById(k).innerHTML='<span style="margin-top: 25%;text-align: center;">'+t+"</span>"},t)};Ut(2e3);ut=document.getElementById(t);Y.new({elementId:t,onReady:z.new(null,It),stepSize:.0025});P=document.getElementById(u);P.addEventListener("click",Ot);Rt=document.getElementById(m);Rt.addEventListener("click",bt);ct=j.new({canvasDivId:t,loaders:[V.new("https://astro.irdev.us/shaders/@.glsl").addFragmentShaders(["earth","clouds","atmosphere","shadowed","shadowed-texture","hardlight"]),n.new({type:X,path:"https://astro.irdev.us/textures/@.png"}).addItems(["clouds","earth-day","earth-night","earth-specular-map","moon","satellite"],{generateMipMap:true}),n.new({type:X,path:"https://astro.irdev.us/textures/@.jpg"}).addItems("starfield"),n.new({type:s,path:"https://astro.irdev.us/data/@.json"}).addItems(["bsc5-short","messier"]),q.new().addItem(s,"elements",{url:"https://bedrock.brettonw.com/api?event=fetch&url=https://www.celestrak.com/NORAD/elements/gp.php%3FGROUP%3Dactive%26FORMAT%3Dtle"})],onReady:z.new(null,function(t){c.new({vertexShader:"basic"},"earth");c.new({vertexShader:"basic"},"clouds");c.new({vertexShader:"basic"},"atmosphere");c.new({vertexShader:"basic"},"shadowed");c.new({vertexShader:"basic"},"shadowed-texture");c.new({vertexShader:"basic"},"hardlight");Et();H(e);xt(Ct)})});e.updateVis=function(t,e=Date.now()){LogLevel.info("Update Vis called with "+t.length+" elements, at "+e.toString())};return e};