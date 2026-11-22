/* Regional battle landscapes: shares the canonical grid, never changes combat coordinates. */
(function () {
    'use strict';
    const palettes = [
        { sky: '#9caea1', fog: '#8dada1', soil: '#435c39', stone: '#8b9272', glow: '#b5e680', accent: '#497d43' },
        { sky: '#709eaf', fog: '#87bccb', soil: '#586c79', stone: '#b0c8c4', glow: '#7de7fa', accent: '#176788' },
        { sky: '#241b42', fog: '#42305d', soil: '#353047', stone: '#706080', glow: '#efb7ff', accent: '#9364bf' },
        null,
        { sky: '#090b25', fog: '#191831', soil: '#28273d', stone: '#595272', glow: '#f8db82', accent: '#8a6ecf' },
        { sky: '#a8c8da', fog: '#a6c9d7', soil: '#375d6f', stone: '#688a9b', glow: '#8ad8ef', accent: '#237b9b' },
        { sky: '#28223f', fog: '#4a3d5b', soil: '#29283b', stone: '#4a415d', glow: '#bb92ff', accent: '#7356a5' },
        null,   /* 7: Fosso do Devorador usa o cenário de magma */
        { sky: '#e3b86e', fog: '#d9a45c', soil: '#8a6a3a', stone: '#c9a366', glow: '#ffd27a', accent: '#b5832e' },   /* 8: Dunas das Ruínas */
        { sky: '#6f8a52', fog: '#7a9658', soil: '#3a4a2a', stone: '#5a6a44', glow: '#b6ff6a', accent: '#4f7a2a' },   /* 9: Pântano Venenoso */
        { sky: '#9aa8ba', fog: '#8a98aa', soil: '#3a4452', stone: '#7a8898', glow: '#7fd8ff', accent: '#5a6a82' },   /* 10: Cidadela Mecânica */
        { sky: '#07021a', fog: '#1a0b3a', soil: '#180f30', stone: '#4a2f78', glow: '#ff9bf0', accent: '#9a5ad0' }    /* 11: Trono do Cosmos */
    ];
    function build(scene, region) {
        const T = window.THREE, P = palettes[region] || palettes[0];
        let seed = 139 + region * 977;
        const rng = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
        const root = new T.Group(); scene.add(root);
        scene.background = new T.Color(P.sky); scene.fog = new T.FogExp2(P.fog, region === 0 ? .035 : .023);
        const mat = (color, more) => new T.MeshStandardMaterial(Object.assign({ color, roughness: .87 }, more));
        const stone = mat(P.stone), soil = mat(P.soil), accent = mat(P.accent), metal = mat('#b29b62', { metalness: .65, roughness: .35 });
        const glow = mat(P.glow, { emissive: P.glow, emissiveIntensity: .7, roughness: .25, metalness: .2 });
        const mesh = (g, m, x, y, z, parent = root) => { const o = new T.Mesh(g, m); o.position.set(x, y, z); o.receiveShadow = true; o.castShadow = true; parent.add(o); return o; };
        // Grain and joints stay visible at grazing camera angles.
        const cv = document.createElement('canvas'); cv.width = cv.height = 256;
        const ctx = cv.getContext('2d'); ctx.fillStyle = P.soil; ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 2600; i++) { ctx.fillStyle = rng() > .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.13)'; ctx.fillRect(rng() * 256, rng() * 256, 1 + rng() * 6, 1 + rng() * 3); }
        if(region<5){ctx.strokeStyle = 'rgba(15,12,20,.4)'; ctx.lineWidth = 3; ctx.strokeRect(5, 5, 246, 246);}
        const tex = new T.CanvasTexture(cv); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(8, 5); if (T.sRGBEncoding) tex.encoding = T.sRGBEncoding;
        soil.map = tex;
        const terrain = new T.PlaneGeometry(48, 38, 64, 48); terrain.rotateX(-Math.PI / 2);
        const pos = terrain.attributes.position;
        for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, Math.abs(x) < 9.5 && Math.abs(z) < 4.5 ? -.16 : -.3 + Math.sin(x * .7) * Math.cos(z * .9) * .7); }
        terrain.computeVertexNormals(); mesh(terrain, soil, 0, 0, 0);
        const tileMeshes = [], tileGeo = new T.PlaneGeometry(1.46, 1.46); tileGeo.rotateX(-Math.PI / 2);
        const tileMat = mat(region===6?'#d5c9e0':P.stone, { map: tex.clone(), roughness: .9 });
        if(region===6){const tc=document.createElement('canvas');tc.width=tc.height=128;const tg=tc.getContext('2d');tg.fillStyle='#766a89';tg.fillRect(0,0,128,128);for(let i=0;i<1000;i++){tg.fillStyle=i%2?'rgba(255,255,255,.08)':'rgba(0,0,0,.12)';tg.fillRect(rng()*128,rng()*128,1+rng()*4,1+rng()*3);}tileMat.map=new T.CanvasTexture(tc);if(T.sRGBEncoding)tileMat.map.encoding=T.sRGBEncoding;}
        tileMat.map.repeat.set(1, 1); tileMat.map.needsUpdate = true;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) {
            const tile = mesh(tileGeo, tileMat, -6.4 + c * 1.6, .005, -3.2 + r * 1.6); tile.userData.row = r; tile.userData.col = c; tileMeshes.push(tile);
        }
        // Curved carved buttresses and a continuous crenellated sanctuary wall.
        const wall = new T.Shape(); wall.moveTo(-.28, 0); wall.lineTo(.28, 0); wall.lineTo(.2, 1.8); wall.quadraticCurveTo(0, 2.2, -.2, 1.8); wall.closePath();
        const wallGeo = new T.ExtrudeGeometry(wall, { depth: .48, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .06, bevelThickness: .06 });
        for (let i = 0; i < 15; i++) { const b = mesh(wallGeo, stone, -8.4, -.1, -5.5 + i * .76); b.rotation.y = Math.PI / 2; mesh(new T.SphereGeometry(.13, 10, 7), glow, -8.25, 1.82, -5.25 + i * .76); }
        const bark=mat('#675443');
        if(region===2){for(let j=0;j<3;j++){const z=-12-j*2.5;const pts=[];for(let k=0;k<=16;k++){const a=Math.PI*k/16;pts.push(new T.Vector3(Math.cos(a)*15,Math.sin(a)*7-1,z));}mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.45,8,false),stone,0,0,0);}}
        const rockGeo = new T.IcosahedronGeometry(1, 1), crystalGeo = new T.CylinderGeometry(0, .34, 2, 5, 1), anim = [];
        for (let i = 0; i < 32; i++) {
            const x = -13 + rng() * 29, z = (rng() > .5 ? 1 : -1) * (5.1 + rng() * 9), s = .5 + rng() * 1.8;
            const rock = mesh(rockGeo, stone, x, -.25, z); rock.scale.set(s, s * (.5 + rng()), s * .8); rock.rotation.set(rng(), rng() * 6, rng());
            if (region === 0) {
                // Curved trunks with overlapping leaf crowns; no block tree placeholders.
                const curve = new T.CatmullRomCurve3([new T.Vector3(0,0,0), new T.Vector3(.13,s,0), new T.Vector3(-.15,s*2,.1)]);
                const trunk = mesh(new T.TubeGeometry(curve, 7, .12 * s, 6, false), bark, x, 0, z);
                for (let j = 0; j < 3; j++) { const leaf = mesh(new T.SphereGeometry(s * .7, 10, 8), accent, x + (j-1)*s*.35, s*(1.7+j*.18), z); leaf.scale.y = .7; }
                trunk.castShadow = true;
            } else if (region === 8) {
                // cactos curvos e obeliscos de pedra
                if (i % 3 === 0) { const h = s * 1.5, curve = new T.CatmullRomCurve3([new T.Vector3(0, 0, 0), new T.Vector3(.05, h * .5, 0), new T.Vector3(0, h, 0)]); mesh(new T.TubeGeometry(curve, 6, .16 * s, 8, false), accent, x, 0, z); for (const sd of [-1, 1]) { const arm = new T.CatmullRomCurve3([new T.Vector3(0, h * .45, 0), new T.Vector3(sd * .35 * s, h * .5, 0), new T.Vector3(sd * .42 * s, h * .85, 0)]); mesh(new T.TubeGeometry(arm, 6, .1 * s, 6, false), accent, x, 0, z); } }
                else { const ob = mesh(new T.CylinderGeometry(.18 * s, .32 * s, 2.2 * s, 4), stone, x, s * 1.0, z); ob.rotation.y = rng() * 3; mesh(new T.ConeGeometry(.2 * s, .5 * s, 4), glow, x, s * 2.25, z); }
            } else if (region === 9) {
                // juncos e cogumelos venenosos
                for (let j = 0; j < 5; j++) { const hh = (.8 + rng() * 1.2) * s, rd = mesh(new T.CylinderGeometry(.025, .04, hh, 5), accent, x + (j - 2) * .22, hh / 2, z + (rng() - .5) * .4); rd.rotation.z = (rng() - .5) * .25; mesh(new T.CylinderGeometry(.045, .045, .3, 5), mat('#6a4a2a'), rd.position.x, hh, rd.position.z); }
                if (i % 4 === 0) { mesh(new T.CylinderGeometry(.08 * s, .12 * s, .5 * s, 8), mat('#d8d0b0'), x + .6, .25 * s, z); const cap = mesh(new T.SphereGeometry(.45 * s, 12, 8, 0, 6.3, 0, 1.5), glow, x + .6, .5 * s, z); cap.scale.y = .6; }
            } else if (region === 10) {
                // engrenagens grandes, canos e chaminés
                if (i % 2 === 0) { const r2 = (.8 + rng() * .9) * s, gg = new T.Group(); gg.position.set(x, r2 * .9, z); root.add(gg); mesh(new T.CylinderGeometry(r2, r2, .25, 22), stone, 0, 0, 0, gg).rotation.x = Math.PI / 2; for (let k = 0; k < 12; k++) { const tt = mesh(new T.BoxGeometry(.2, .26, .3), accent, Math.cos(k * .5236) * (r2 + .08), Math.sin(k * .5236) * (r2 + .08), 0, gg); tt.rotation.z = k * .5236; } mesh(new T.CylinderGeometry(r2 * .35, r2 * .35, .32, 12), metal, 0, 0, 0, gg).rotation.x = Math.PI / 2; anim.push({ o: gg, rot: (rng() > .5 ? 1 : -1) * (.3 + rng() * .4) }); }
                else { const hh = s * 2.6; mesh(new T.CylinderGeometry(.32 * s, .4 * s, hh, 10), stone, x, hh / 2, z); mesh(new T.TorusGeometry(.33 * s, .06, 6, 14), metal, x, hh, z).rotation.x = Math.PI / 2; mesh(new T.SphereGeometry(.1, 8, 6), glow, x, hh + .15, z); }
            } else if (region === 11) {
                // fragmentos flutuantes e cristais estelares
                const rk2 = mesh(new T.OctahedronGeometry(.7 * s, 0), stone, x, 1.2 + rng() * 3, z); rk2.rotation.set(rng() * 3, rng() * 3, 0); anim.push({ o: rk2, y: rk2.position.y, ph: rng() * 6 }); for (let j = 0; j < 2; j++) { const cr = mesh(crystalGeo, j ? glow : accent, x + (j - .5) * .5, s * .5, z); cr.scale.setScalar(s * (.4 + rng() * .5)); cr.rotation.z = (j - .5) * .3; }
            } else if (region === 2 || region === 4 || region === 5 || region === 6) {
                for (let j = 0; j < 3; j++) { const cr = mesh(crystalGeo, j === 1 ? glow : accent, x + (j-1)*.38, s * .55, z); cr.scale.setScalar(s * (.45 + rng()*.5)); cr.rotation.z = (j-1)*.25; if (region === 4 || region === 6) anim.push({ o: cr, y: cr.position.y, ph: rng()*6 }); }
            } else {
                // Coral branches with curved fingers on the shore.
                for (let j=0;j<3;j++) { const curve = new T.CatmullRomCurve3([new T.Vector3(), new T.Vector3((j-1)*.25,s*.4,0), new T.Vector3((j-1)*.5,s*.8,.15)]); mesh(new T.TubeGeometry(curve,6,.08,5,false), accent,x,.1,z); }
            }
        }
        let water = null;
        if (region === 9) { water = mesh(new T.PlaneGeometry(42, 32, 1, 1), mat('#4a6a2a', { transparent: true, opacity: .55, metalness: .3, roughness: .35 }), 0, -.06, 0); water.rotation.x = -Math.PI / 2; water.castShadow = false; }
        if (region === 1) { water = mesh(new T.PlaneGeometry(42,32,1,1), mat('#298aab', { transparent:true, opacity:.62, metalness:.5, roughness:.2 }),0,-.06,0); water.rotation.x=-Math.PI/2; water.castShadow=false; }
        let weather=null;
        if (region === 4 || region === 5 || region === 6 || region === 9 || region === 11) {
            const pts = new Float32Array(420*3); for(let i=0;i<420;i++){pts[i*3]=(rng()-.5)*95;pts[i*3+1]=8+rng()*35;pts[i*3+2]=(rng()-.5)*75;}
            const g = new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(pts,3)); weather=new T.Points(g,new T.PointsMaterial({color:region===5?'#f8ffff':region===9?'#c8e8a0':region===11?'#ffd9ff':'#f1dcff',size:region===5?.14:region===11?.16:.11,sizeAttenuation:true,transparent:true,opacity:.8}));root.add(weather);
        }
        if(region===5){
            // Jagged, layered glacier ridges frame the rear of the playable grid.
            const iceDark=mat('#315e74'),iceLight=mat('#6fa7b8');
            for(let layer=0;layer<2;layer++){
                const verts=[],indices=[],step=2.3,z=-10.5-layer*3.8;
                for(let j=0;j<=16;j++){const x=-18+j*step,peak=1.8+rng()*(layer?6.5:4.8);verts.push(x,-.5,z,x,peak,z+(rng()-.5)*1.2);if(j<16){let k=j*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
                const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,layer?iceDark:iceLight,0,0,0).material.side=T.DoubleSide;
            }
            for(let i=0;i<12;i++){const x=-16+i*3,z=-8.5-rng()*3,cr=mesh(crystalGeo,i%2?accent:glow,x,.5,z);cr.scale.set(.8,1.3+rng()*1.8,.8);cr.rotation.z=(rng()-.5)*.5;}
        } else if(region===6){
            // Broken arches and suspended runes make this battlefield distinct.
            const ruin=mat('#343046'),rune=mat('#8c67d1',{emissive:'#4d2c88',emissiveIntensity:.65,metalness:.35,roughness:.5});
            for(let j=0;j<5;j++){const x=-15+j*7,z=-9.5-rng()*3;const pts=[new T.Vector3(x-2,-.2,z),new T.Vector3(x-1.8,3,z),new T.Vector3(x,4+rng()*2,z),new T.Vector3(x+1.8,3,z),new T.Vector3(x+2,-.2,z)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.28,7,false),ruin,0,0,0);const halo=mesh(new T.TorusGeometry(.7,.035,6,32),rune,x,2.3,z+.2);anim.push({o:halo,y:halo.position.y,ph:rng()*6});}
            for(let j=0;j<6;j++){const x=-14+j*5,z=-8-rng()*4,bolt=[];for(let k=0;k<7;k++)bolt.push(new T.Vector3(x+(rng()-.5)*.7,6-k*.65,z+(rng()-.5)*.4));const line=new T.Line(new T.BufferGeometry().setFromPoints(bolt),new T.LineBasicMaterial({color:'#d5b7ff',transparent:true,opacity:.52}));root.add(line);anim.push({o:line,y:line.position.y,ph:rng()*6});}
        }
        const wallMines = [];
        for(let r=0;r<5;r++) { const group=new T.Group(); group.position.set(-7.84,.1,-3.2+r*1.6); root.add(group); const core=mesh(new T.DodecahedronGeometry(.48,1),accent,0,.42,0,group); const ring=mesh(new T.TorusGeometry(.55,.035,6,32),metal,0,.42,0,group); ring.rotation.x=Math.PI/2; wallMines.push({group,coreCrystal:core,runeRing:ring}); }
        return { tileMeshes, wallMines, update(t){ anim.forEach(a=>{ if(a.rot){a.o.rotation.z=t*a.rot;} else a.o.position.y=a.y+Math.sin(t*.7+a.ph)*.15;}); if(water)water.material.opacity=.57+Math.sin(t*.8)*.04;if(weather){weather.position.x=Math.sin(t*.17)*.55;weather.position.y=Math.sin(t*.27)*.35;} } };
    }
    window.WarRegions = { build, palettes };
})();
