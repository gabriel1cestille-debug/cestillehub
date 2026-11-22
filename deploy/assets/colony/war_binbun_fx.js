/* Efeitos portados dos pacotes Binbun VFX (itch.io, versões Free, CC0): Battle FX (slash, swing, claw), Explosion FX (sphere, rings),
   Electric FX (zap) e Dark Magic FX (dark_vortex). Os shaders .gdshader do Godot foram reescritos em GLSL/Three.js; a textura de ruído
   é gerada por código. Orçamento: usa o mesmo limite de itens do ElementalFX; sem luzes dinâmicas. */
(function () {
    'use strict';
    function boot() {
        const T = window.THREE, FX = window.ElementalFX;
        if (!T || !FX || FX.prototype.bbSlash) return !!(FX && FX.prototype.bbSlash);
        const P = FX.prototype, V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z), lin = c => new T.Color(c).convertSRGBToLinear();
        let NOISE = null;
        function noiseTex() {
            if (NOISE) return NOISE;
            const N = 128, cv = document.createElement('canvas'); cv.width = cv.height = N;
            const g = cv.getContext('2d'), im = g.createImageData(N, N), lat = [];
            for (let i = 0; i < 17 * 17; i++) lat.push(Math.random());
            const at = (x, y) => lat[(y % 16) * 17 + (x % 16)];
            for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
                let v = 0, a = .55, f = 4;
                for (let o = 0; o < 3; o++) {
                    const fx = x / N * f, fy = y / N * f, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
                    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
                    const a00 = at(x0 % f, y0 % f), a10 = at((x0 + 1) % f, y0 % f), a01 = at(x0 % f, (y0 + 1) % f), a11 = at((x0 + 1) % f, (y0 + 1) % f);
                    v += a * ((a00 * (1 - sx) + a10 * sx) * (1 - sy) + (a01 * (1 - sx) + a11 * sx) * sy); a *= .5; f *= 2;
                }
                const k = Math.max(0, Math.min(255, v * 255 * 1.1)), i = (y * N + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = k; im.data[i + 3] = 255;
            }
            g.putImageData(im, 0, 0);
            NOISE = new T.CanvasTexture(cv); NOISE.wrapS = NOISE.wrapT = T.RepeatWrapping; NOISE.needsUpdate = true;
            return NOISE;
        }
        const PRE = 'precision highp float;\n#define PI 3.14159265\n#define TAU 6.2831853\nuniform float uTime;uniform float uAlpha;uniform float uDecay;uniform sampler2D uNoise;uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uC3;varying vec2 vUv;varying vec3 vN;\n'
            + 'float overlayF(float b,float m){float l=step(.5,b);return mix(2.*b*m,1.-2.*(1.-b)*(1.-m),l);}\n';
        const VERT = 'varying vec2 vUv;varying vec3 vN;void main(){vUv=uv;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
        function material(frag, c1, c2, c3, extra0) {
            const extra = extra0 ? Object.assign({}, extra0) : null, vert = extra && extra.__vert, add = extra && extra.__add; if (extra) { delete extra.__vert; delete extra.__add; }
            return new T.ShaderMaterial({
                transparent: true, depthWrite: false, side: T.DoubleSide, toneMapped: false, blending: add ? T.AdditiveBlending : T.NormalBlending,
                uniforms: Object.assign({ uTime: { value: 0 }, uAlpha: { value: 1 }, uDecay: { value: 0 }, uNoise: { value: noiseTex() }, uC1: { value: lin(c1) }, uC2: { value: lin(c2 || c1) }, uC3: { value: lin(c3 || '#000000') } }, extra || {}),
                vertexShader: vert || VERT, fragmentShader: PRE + frag.replace(/\}\s*$/, '\n#include <encodings_fragment>\n}')
            });
        }
        function put(fx, geo, mat, life, update, owned) {
            if (fx.items.length >= fx.limit) { mat.dispose(); if (owned) geo.dispose(); return null; }
            const mesh = new T.Mesh(geo, mat); fx.scene.add(mesh);
            fx.items.push({ mesh, life, age: 0, owned: !!owned, update: (m, t, age) => { update(m, t, age); const u = m.material.uniforms; if (u && u.uTime) u.uTime.value = age; } });
            return mesh;
        }
        const PLANE = new T.PlaneGeometry(1, 1, 1, 1);

        /* ---- Battle FX: slash (meia-lua cortante) ---- */
        const SLASH = 'void main(){vec2 UV=vUv;float radius=length(UV*2.-1.);float circle=step(radius,1.);float slash=circle*(pow(UV.x,6.)-(1.-radius)*.5);slash=clamp(slash,0.,1.);slash=smoothstep(0.,.6,slash);'
            + 'float wave=sin(radius*TAU+uTime*TAU);wave=wave*circle*max(UV.x*2.-1.2,0.);slash+=abs(wave);'
            + 'float nm=max(circle,step(UV.x,.5));nm=pow(max((nm-pow(abs(UV.y*2.-1.),4.))*UV.x,0.),.6);'
            + 'float noise=texture2D(uNoise,UV+vec2(1.,0.)*uTime).r;float value=clamp(noise-(1.-nm)+slash,0.,1.);value=max(value-uDecay,0.);'
            + 'float grad=clamp(circle+step(UV.x,.5),0.,1.)*pow(UV.x,4.);grad=max(grad-uDecay,0.);vec3 col=mix(uC2,uC1,value);col=max(col,uC3);'
            + 'float alpha=max(value,grad*.2);alpha=max(alpha-uDecay,0.);gl_FragColor=vec4(col*1.3,clamp(alpha*1.6,0.,1.)*uAlpha);}';
        P.bbSlash = function (p, c1, c2, o) {
            o = o || {}; const size = o.size || 3.8, ang = o.angle || 0;
            this.later(o.delay || 0, () => {
                const m = put(this, PLANE, material(SLASH, c1, c2, '#1a0a2a'), o.life || .5, (mm, t) => {
                    mm.material.uniforms.uDecay.value = Math.max(0, (t - .35) / .65);
                    mm.scale.setScalar(size * (.55 + Math.min(1, t * 3.2) * .65)); mm.position.copy(p);
                });
                if (m) { m.rotation.order = 'ZXY'; m.rotation.x = -1.05; m.rotation.z = ang; }
            });
        };
        P.bbCross = function (p, c1, c2, o) { o = o || {}; this.bbSlash(p, c1, c2, Object.assign({}, o, { angle: .78 })); this.bbSlash(p, c1, c2, Object.assign({}, o, { angle: -.78 + Math.PI, delay: (o.delay || 0) + .12 })); };

        /* ---- Battle FX: swing (arco de golpe pesado) ---- */
        const SWING = 'void main(){vec2 UV=vUv;vec2 cu=UV*2.-1.;float radius=length(cu);float angle=atan(cu.x,cu.y);float factor=uSwing*TAU-PI;'
            + 'float shapeMask=max(sin(angle+factor),0.);float baseMask=max(sin(angle),0.);float colorMask=(1.-sin(angle/2.+factor/2.))*3.;'
            + 'float shape=clamp((radius-.2)/(.8-(1.-.9)),0.,1.)-clamp((radius-.9)/(1.-.9),0.,1.);float wave=(sin((radius*TAU-uTime)*6.)*.5+.5);shape=max(shape-wave*.1,0.);shape=pow(shape,3.);'
            + 'vec2 nuv=vec2(angle/TAU,radius*.5)+vec2(.5,0.)*uTime;float noise=texture2D(uNoise,nuv).r;float value=overlayF(shape,noise);value=(value-(1.-shapeMask)*.5)*shapeMask;value*=baseMask;value=clamp(value-.1,0.,1.);'
            + 'vec3 col=mix(uC2,uC1,value);col=mix(uC3,col,clamp(colorMask,0.,1.));float alpha=clamp(value/(1.-.8),0.,1.)*(1.-uDecay);gl_FragColor=vec4(col*1.3,clamp(alpha*1.6,0.,1.)*uAlpha);}';
        P.bbSwing = function (p, c1, c2, o) {
            o = o || {}; const size = o.size || 5.4;
            this.bbSlash(p.clone().setY(.7), c1, c2, { size, angle: .35, life: .55, delay: o.delay || 0 });
            this.bbSlash(p.clone().setY(.5), c2, c1, { size: size * .8, angle: -.25 + Math.PI, life: .5, delay: (o.delay || 0) + .1 });
        };

        /* ---- Battle FX: claw (três garras) ---- */
        function clawGeometry() {
            const segs = 18, pos = [], uv = [], ix = [];
            for (let i = 0; i <= segs; i++) {
                const t = i / segs, w = Math.sin(t * Math.PI) * .09, cx = t * 1.5 - .75, cy = Math.sin(t * Math.PI * .9) * .35 - .17;
                pos.push(cx, cy + w, 0, cx, cy - w, 0); uv.push(t, 1, t, 0);
                if (i < segs) { const k = i * 2; ix.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
            }
            const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(ix); return g;
        }
        let CLAWG = null;
        const CLAW = 'uniform float uClaw;void main(){float a=step(vUv.x,uClaw);vec3 col=mix(uC1,uC2,vUv.x);float edge=1.-abs(vUv.y*2.-1.);gl_FragColor=vec4(col*(1.6+edge),a*uAlpha*(1.-uDecay));}';
        P.bbClaw = function (p, c1, c2, o) {
            o = o || {}; const size = o.size || 3; CLAWG = CLAWG || clawGeometry();
            for (let k = 0; k < 3; k++) this.later((o.delay || 0) + k * .06, () => {
                const m = put(this, CLAWG, material(CLAW, c1, c2, null, { uClaw: { value: 0 } }), .5, (mm, t) => { mm.material.uniforms.uClaw.value = Math.min(1, t * 4); mm.material.uniforms.uDecay.value = Math.max(0, (t - .5) / .5); mm.position.copy(p).add(V((k - 1) * .16, (k - 1) * .22, (k - 1) * .12)); mm.scale.setScalar(size * (1 + t * .15)); });
                if (m) { m.rotation.x = -.5; m.rotation.z = -.6 + (o.angle || 0); }
            });
        };

        /* ---- Explosion FX: esfera de ruído + anéis ---- */
        const SPH_V = '#define PI 3.14159265\nvarying vec2 vUv;varying vec3 vN;uniform sampler2D uNoise;uniform float uTime;uniform float uDecay;void main(){vUv=uv;vN=normalize(normalMatrix*normal);vec2 nuv=uv+vec2(-.2,.2)*uTime;nuv.x+=nuv.y*.5;float v=texture2D(uNoise,nuv).r;float mask=sin(uv.y*PI);vec3 pos=position+normal*(v*.4*mask+uDecay);gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);}';
        const SPH = 'void main(){vec2 nuv=vUv+vec2(-.2,.2)*uTime;nuv.x+=nuv.y*.5;float value=texture2D(uNoise,nuv).r;float alpha=clamp(value*1.15-uDecay,0.,1.);float cv=max(value-uDecay,0.);vec3 col=mix(uC2,uC1,cv);gl_FragColor=vec4(col*1.15,clamp(alpha*1.3,0.,1.)*uAlpha*.9);}';
        const RING = 'void main(){float mask=1.-abs(vUv.y*4.-1.);vec2 nuv=vUv*vec2(2.,1.)+vec2(0.,.2)*uTime;float noise=texture2D(uNoise,nuv).r;float value=max(mask-(1.-noise)-uDecay,0.);float a=step(.2,value)*value;gl_FragColor=vec4(mix(uC2,uC1,value)*2.4,a*uAlpha*3.);}';
        const SPHG = new T.SphereGeometry(1, 24, 16), RINGG = new T.CylinderGeometry(1, 1, .5, 40, 1, true);
        P.bbExplosion = function (p, c1, c2, o) {
            o = o || {}; const size = o.size || 1.4, at = p.clone();
            this.later(o.delay || 0, () => {
                put(this, SPHG, material(SPH, c1, c2, null, { __vert: SPH_V }), .8, (m, t) => { m.position.copy(at).add(V(0, size * .55, 0)); m.scale.setScalar(size * (.2 + Math.sin(Math.min(1, t * 1.4) * Math.PI / 2) * .42)); m.material.uniforms.uDecay.value = Math.max(0, (t - .15) / .85); });
                for (let k = 0; k < 2; k++) put(this, RINGG, material(RING, c1, c2), .7 + k * .15, (m, t) => { m.position.copy(at).add(V(0, .1 + k * .18, 0)); m.scale.set(size * (.4 + t * 2.4), 1, size * (.4 + t * 2.4)); m.material.uniforms.uDecay.value = t * .9; });
            });
            this.ring(at.clone().setY(.12), c2, size * 1.6, .7, true, o.delay || 0);
        };

        /* ---- Electric FX: zap (raio ramificado em zigue-zague) ---- */
        P.bbZap = function (a, b, c1, c2, o) {
            o = o || {}; const n = 4;
            for (let f = 0; f < n; f++) this.later((o.delay || 0) + f * .06, () => {
                const pts = [], seg = 14, dir = b.clone().sub(a), len = dir.length(), side = V(-dir.z, 0, dir.x).normalize();
                for (let i = 0; i <= seg; i++) { const t = i / seg, tri = Math.abs(((t * 5 + f * .37) % 1) * 2 - 1) - .5, j = (Math.random() - .5) * .5; const q = a.clone().lerp(b, t); const k = Math.sin(t * Math.PI); q.addScaledVector(side, (tri * .55 + j * .5) * k); q.y += (Math.random() - .3) * .5 * k + k * .35; pts.push(q); }
                const geo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, .1, 5, false);
                const mat = material('void main(){float f=pow(abs(dot(normalize(vN),vec3(0.,0.,1.))),2.);vec3 col=mix(uC2,uC1,step(.5,f));float na=texture2D(uNoise,vec2(vUv.x*3.,vUv.y)).r;gl_FragColor=vec4(col*1.45,step(.18,na+uAlpha*.5)*uAlpha);}', c1, c2);
                put(this, geo, mat, .2, (m, t) => { m.material.uniforms.uAlpha.value = 1 - t; }, true);
                if (f === 0) { this.ring(b.clone().setY(.14), c2, 1.1, .5); this.burst(b, c2, 8, .45); }
            });
        };

        /* ---- Dark Magic FX: vórtice sombrio no chão ---- */
        const VOR_V = 'varying vec2 vUv;varying vec3 vN;uniform float uTime;void main(){vUv=uv;vN=normalize(normalMatrix*normal);float r=length(uv*2.-1.);float w=(sin(r*9.-uTime*3.)*.5+.5)*pow(r,.5);vec3 pos=position;pos.z+=w*.1;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);}';
        const VOR = 'void main(){vec2 cu=vUv*2.-1.;float radius=length(cu);float angle=atan(cu.x,cu.y);float w1=sin(radius*5.-uTime*2.);float w2=sin(radius*9.-uTime*2.);float wave=w1+w2;float streaks=sin(angle*5.+uTime)*.5+.5;'
            + 'vec2 nuv=vec2(radius*.5,angle/TAU)-vec2(.2,0.)*uTime;nuv.y+=wave*.05;float noise=texture2D(uNoise,nuv).r;float value=noise+pow(1.-radius,4.)*1.5;value*=sqrt(max(1.-radius,0.));value-=streaks*.2;value=smoothstep(0.,1.,value);value=overlayF(value,pow(value,2.));value=max(value-uDecay-.05,0.);'
            + 'vec3 col=mix(uC2,uC1,value);gl_FragColor=vec4(col*3.,clamp(value,0.,1.)*uAlpha);}';
        const VORG = new T.PlaneGeometry(1, 1, 24, 24);
        P.bbVortex = function (p, c1, c2, o) {
            o = o || {}; const size = o.size || 3.4, at = p.clone(), life = o.life || 1.5;
            this.later(o.delay || 0, () => {
                const m = put(this, VORG, material(VOR, c1, c2, null, { __vert: VOR_V }), life, (mm, t) => { mm.position.copy(at).setY(.14); mm.scale.setScalar(size * Math.min(1, t * 4 + .2)); mm.material.uniforms.uDecay.value = Math.max(0, (t - .7) / .3); mm.rotation.z = t * 1.2; });
                if (m) m.rotation.x = -Math.PI / 2;
            });
            this.ring(at.clone().setY(.14), c1, size * .55, .9, true, o.delay || 0);
            this.column(at.clone(), c1, 2.4, life * .8, .35, (o.delay || 0) + .2);
        };


        /* ---- Muzzle Flash: clarão na boca de quem ataca (todos os dragões) ---- */
        const CONE = new T.ConeGeometry(.09, 1, 6, 1, true);
        const STREAK = 'void main(){float f=1.-vUv.y;gl_FragColor=vec4(mix(uC2,uC1,vUv.y)*1.6,f*f*uAlpha);}';
        P.bbMuzzle = function (a, b, c1, c2, special) {
            const d = b.clone().sub(a); d.y = 0; if (d.lengthSq() < .01) d.set(1, 0, 0); d.normalize();
            this.glow(a, c2, special ? 1.3 : .75, .22);
            const n = special ? 7 : 4;
            for (let i = 0; i < n; i++) {
                const spread = (i / (n - 1) - .5) * (special ? 1.3 : .8), dir = d.clone().applyAxisAngle(V(0, 1, 0), spread); dir.y += (i % 2 ? .12 : -.02);
                const len = (special ? 1.6 : 1.0) * (.75 + (i % 3) * .2), q = new T.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
                put(this, CONE, material(STREAK, i % 2 ? c1 : c2, c1), .22, (m, t) => { m.quaternion.copy(q); m.scale.set(1 + t * .5, len * (.4 + t * .9), 1 + t * .5); m.position.copy(a).addScaledVector(dir, len * (.25 + t * .6)); m.material.uniforms.uAlpha.value = 1 - t; });
            }
        };

        /* ---- Magic Projectiles: orbe (núcleo de ruído + rastro) ---- */
        P.bbOrbShot = function (a, b, c1, c2, o) {
            o = o || {}; const size = o.size || .34, dur = o.dur || .55, A = a.clone(), B = b.clone();
            const path = t => { const p = A.clone().lerp(B, t); p.y += Math.sin(t * Math.PI) * (o.arc == null ? .55 : o.arc); return p; };
            put(this, SPHG, material(SPH, c1, c2, null, { __vert: SPH_V }), dur, (m, t) => { m.position.copy(path(t)); m.scale.setScalar(size * 1.25 * (1 + Math.sin(t * 20) * .08)); m.material.uniforms.uDecay.value = .05; });
            this.glow(A, c1, size * 2.4, dur * .8);
            for (let k = 1; k <= 7; k++) this.later(k * dur / 9, () => this.glow(path(Math.max(0, (k * 1) / 9 + .05)).clone(), c1, size * 1.5, .32));
            return dur;
        };
        /* ---- Magic Projectiles: lança perfurante ---- */
        const CYL = new T.CylinderGeometry(.11, .02, 1, 8, 1, true);
        const JAV = 'void main(){float f=vUv.y;gl_FragColor=vec4(mix(uC2,uC1,f)*1.25,(1.-f*.6)*uAlpha);}';
        P.bbJavelin = function (a, b, c1, c2, o) {
            o = o || {}; const dur = o.dur || .34, A = a.clone(), B = b.clone().setY(Math.max(.5, b.y)), dir = B.clone().sub(A).normalize(), len = o.len || 2.1, q = new T.Quaternion().setFromUnitVectors(V(0, 1, 0), dir);
            put(this, CYL, material(JAV, c2, c1), dur + .12, (m, t) => { const tt = Math.min(1, t * (dur + .12) / dur), tip = A.clone().lerp(B, tt); m.quaternion.copy(q); m.scale.set(1.8, len, 1.8); m.position.copy(tip).addScaledVector(dir, -len * .5); m.material.uniforms.uAlpha.value = t > .8 ? (1 - t) / .2 : 1; });
            for (let k = 1; k <= 5; k++) this.later(k * dur / 6, () => this.glow(A.clone().lerp(B, k / 6), c1, .45, .26));
            return dur;
        };
        /* ---- Magic Projectiles: onda crescente que viaja pelo chão ---- */
        P.bbWaveShot = function (a, b, c1, c2, o) {
            o = o || {}; const dur = o.dur || .7, size = o.size || 2.6, A = a.clone().setY(.55), B = b.clone().setY(.55);
            const dir = B.clone().sub(A); const ang = Math.atan2(-dir.z, dir.x);
            const m = put(this, PLANE, material(SLASH, c1, c2, '#101a30'), dur, (mm, t) => { mm.position.copy(A).lerp(B, t); mm.scale.setScalar(size * (.5 + Math.min(1, t * 2) * .6)); mm.material.uniforms.uDecay.value = Math.max(0, (t - .6) / .4); });
            if (m) { m.rotation.order = 'ZXY'; m.rotation.x = -1.2; m.rotation.z = ang; }
            this.ring(B.clone().setY(.12), c2, 1.3, .5, true, dur * .8);
            return dur;
        };
        /* ---- Beam VFX: feixe contínuo com listras ---- */
        const BEAM = 'void main(){float s=sin(vUv.y*28.-uTime*18.)*.5+.5;float edge=1.-abs(vUv.x*2.-1.);float n=texture2D(uNoise,vec2(vUv.y*3.-uTime*2.,vUv.x)).r;float a=clamp((.55+s*.45)*pow(edge,.6)*(.7+n*.5),0.,1.);gl_FragColor=vec4(mix(uC1,uC2,pow(edge,3.))*1.1,a*uAlpha);}';
        P.bbBeam = function (a, b, c1, c2, o) {
            o = o || {}; const life = o.life || .9, thick = o.thick || .16, A = a.clone(), B = b.clone(), d = B.clone().sub(A), L = d.length(), q = new T.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
            const cyl = new T.CylinderGeometry(1, 1, 1, 14, 1, true);
            [[thick * 2.6, c1, .7], [thick * .8, c2, 1]].forEach(([r, col, al]) => put(this, cyl, material(BEAM, col, c2), life, (m, t) => { const grow = Math.min(1, t * 8), fade = t > .75 ? (1 - t) / .25 : 1; m.quaternion.copy(q); m.position.copy(A).addScaledVector(d, .5); m.scale.set(r * (1 + Math.sin(t * 40) * .06), L * grow, r); m.material.uniforms.uAlpha.value = al * fade; }, true));
            this.glow(A, c1, .9, life * .5); this.glow(B, c1, 1.5, life * .9);
            for (let k = 0; k < 3; k++) this.ring(B.clone().setY(.14), k % 2 ? c1 : c2, 1.1 + k * .5, .6, true, k * .22);
            return Math.min(.45, life);
        };
        /* ---- Battle FX: escudo (casca com listras + anéis orbitando) ---- */
        const SHELL = 'void main(){float rim=pow(1.-abs(normalize(vN).z),2.2);float st=sin(vUv.y*42.-uTime*3.)*.5+.5;float hx=sin(vUv.x*60.)*sin(vUv.y*30.+uTime);vec3 col=mix(uC2,uC1,rim);float a=clamp(rim*.85+.1+st*.08+max(hx,0.)*.08,0.,1.);gl_FragColor=vec4(col*1.4,a*uAlpha);}';
        P.bbShield = function (p, c1, c2, o) {
            o = o || {}; const size = o.size || 1.25, life = o.life || 1.6, at = p.clone().setY(.55);
            put(this, SPHG, material(SHELL, c1, c2), life, (m, t) => { const k = Math.min(1, t * 6), f = t > .8 ? (1 - t) / .2 : 1; m.position.copy(at); m.scale.setScalar(size * (.6 + k * .4) * (1 + Math.sin(t * 14) * .015)); m.material.uniforms.uAlpha.value = f; });
            this.ring(at.clone().setY(.12), c1, size * 1.1, .9, true); this.ring(at.clone().setY(.12), c2, size * 1.5, 1.1, true, .25);
            for (let i = 0; i < 3; i++) put(this, SPHG, material('void main(){gl_FragColor=vec4(uC1*2.,uAlpha);}', c2, c2), life, (m, t) => { const ang = t * 7 + i * 2.094; m.position.copy(at).add(V(Math.cos(ang) * size * 1.08, Math.sin(t * 9 + i) * .25, Math.sin(ang) * size * 1.08)); m.scale.setScalar(.07); m.material.uniforms.uAlpha.value = t > .8 ? (1 - t) / .2 : 1; });
            return .4;
        };
        /* ---- Dark Magic: bola sombria que explode em vórtice ---- */
        const DBALL = 'void main(){float rim=pow(1.-abs(normalize(vN).z),1.8);float n=texture2D(uNoise,vUv*vec2(3.,2.)+vec2(uTime,0.)).r;vec3 col=mix(uC3,uC1,rim)+uC2*rim*n;gl_FragColor=vec4(col,.92*uAlpha);}';
        P.bbDarkBall = function (a, b, c1, c2, o) {
            o = o || {}; const dur = o.dur || .7, size = o.size || .42, A = a.clone(), B = b.clone();
            const path = t => { const p = A.clone().lerp(B, t); p.y += Math.sin(t * Math.PI) * .4; return p; };
            put(this, SPHG, material(DBALL, c1, c2, '#0a0414'), dur, (m, t) => { m.position.copy(path(t)); m.scale.setScalar(size * (1 + Math.sin(t * 24) * .1)); });
            for (let k = 1; k <= 7; k++) this.later(k * dur / 9, () => this.glow(path(Math.min(1, k / 9 + .05)), k % 2 ? c1 : c2, size * 1.5, .35));
            this.bbVortex(B.clone().setY(.12), c1, c2, { size: o.vsize || 3.2, delay: dur, life: o.vlife || 1.1 });
            return dur;
        };
        /* ---- Electric FX: bola de raio com arcos ---- */
        P.bbElecBall = function (a, b, c1, c2, o) {
            o = o || {}; const at = a.clone().add(V(.3, .55, 0)), dur = .5;
            put(this, SPHG, material('void main(){float rim=pow(1.-abs(normalize(vN).z),2.);gl_FragColor=vec4(mix(uC2*2.,uC1,rim),uAlpha);}', c1, c2), dur, (m, t) => { m.position.copy(at); m.scale.setScalar(.28 + Math.sin(t * Math.PI) * .26); });
            for (let k = 0; k < 4; k++) this.later(k * .09, () => this.bbZap(at, at.clone().add(V((Math.random() - .5) * 2.4, (Math.random() - .3) * 1.2, (Math.random() - .5) * 2.4)), c1, c2));
            this.later(dur, () => this.bbZap(at, b, c1, c2));
            for (let k = 0; k < (o.strikes == null ? 3 : o.strikes); k++) this.later(dur + .15 + k * .12, () => { const q = b.clone().add(V((Math.random() - .5) * 2, 0, (Math.random() - .5) * 2)); this.bbZap(q.clone().add(V(0, 4, 0)), q, c1, c2); this.ring(q.clone().setY(.12), c2, 1, .5); });
            return dur + .2;
        };

        /* ---- ligações: usados pelo catálogo (normalFx/specialFx 'bb_*') e por ataques sem catálogo (bbFire) ---- */
        P.bbAttack = function (kind, special, a, b, c1, c2) {
            const ground = b.clone().setY(.12), mid = b.clone().setY(.95);
            switch (kind) {
                case 'bb_slash': this.bbSlash(mid, c1, c2, { size: special ? 4.8 : 3.8 }); if (special) this.bbSlash(mid, c2, c1, { size: 4.8, angle: 1.1, delay: .1 }); return .45;
                case 'bb_cross': this.bbCross(mid, c1, c2, { size: special ? 4.6 : 3.6 }); return .55;
                case 'bb_swing': this.bbSwing(ground.clone().setY(.6), c1, c2, { size: special ? 6.4 : 5 }); this.ring(ground, c2, special ? 2 : 1.4, .6, true, .25); return .5;
                case 'bb_claw': this.bbClaw(mid, c1, c2, { size: special ? 3.8 : 3 }); return .4;
                case 'bb_zap': this.bbZap(a, b, c1, c2); return .35;
                case 'bb_explosion': this.bbExplosion(ground, c1, c2, { size: special ? 2.2 : 1.4 }); if (special) { this.geyser(ground, c1, c2, 2.4, .05); this.column(ground, c1, 3.2, 1.1, .5, .1); } return .5;
                case 'bb_orb': { const d = this.bbOrbShot(a, b.clone().setY(.7), c1, c2, { size: special ? .5 : .34 }); this.later(d, () => { this.bbExplosion(ground, c1, c2, { size: special ? 1.6 : .9 }); }); return d; }
                case 'bb_javelin': { const n = special ? 3 : 1; for (let i = 0; i < n; i++) this.later(i * .08, () => this.bbJavelin(a.clone().add(V(0, i * .12, (i - 1) * .35)), b.clone().add(V(0, 0, (i - 1) * .35)), c1, c2, { len: special ? 2 : 1.5 })); this.later(.32 + (n - 1) * .08, () => { this.ring(ground, c2, 1.1, .5); this.burst(b, c2, 8, .5); }); return .32 + (n - 1) * .08; }
                case 'bb_wave': return this.bbWaveShot(a, b, c1, c2, { size: special ? 3.6 : 2.6 });
                case 'bb_beam': return this.bbBeam(a, b.clone().setY(.8), c1, c2, { life: special ? 1.3 : .8, thick: special ? .24 : .15 });
                case 'bb_shield': return this.bbShield(a, c1, c2, { size: special ? 1.5 : 1.2 });
                case 'bb_dark': return this.bbDarkBall(a, b.clone().setY(.7), c1, c2, { vsize: special ? 4.4 : 3 });
                case 'bb_elecball': return this.bbElecBall(a, b.clone().setY(.7), c1, c2, { strikes: special ? 4 : 1 });
                case 'bb_vortex': this.bbVortex(ground, c1, c2, { size: special ? 6.6 : 4.6 }); return special ? 1.0 : .6;
            }
            return 0;
        };
        const PACK = { eclipse: ['bb_slash', 'bb_vortex'], tempestade: ['bb_zap', null], vulcao: [null, 'bb_explosion'] };
        P.bbFire = function (id, special, a, b, hit) {
            const d = (window.ElementalCatalog || []).find(x => x.id === id), c1 = d ? d.colors[0] : '#cc28ff', c2 = d ? d.colors[1] : '#ffffff';
            if (this.sigRun) { const r0 = this.sigRun(id, special, a, b, c1, c2, hit); if (r0) return r0; }
            const k = PACK[id] && PACK[id][special ? 1 : 0]; if (!k) return null;
            this.glow(a, c1, special ? 1 : .4, special ? .6 : .25); this.ring(a, c1, special ? .85 : .4, .4, false);
            const dur = this.bbAttack(k, special, a, b, c1, c2) + (special ? .2 : .1);
            this.impacts.push({ at: this.time + dur, fn: () => { this.impactFan(b, c1, special ? 1.5 : .7); this.burst(b, c1, special ? 18 : 8, special ? .7 : .35); hit && hit(); } });
            return { kind: 'bb-' + k, duration: dur };
        };
        return true;
    }
    if (!boot()) { let n = 0; const iv = setInterval(() => { if (boot() || ++n > 200) clearInterval(iv); }, 100); }
})();
