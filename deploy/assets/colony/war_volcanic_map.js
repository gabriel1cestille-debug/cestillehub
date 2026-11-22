(function(){
"use strict";
      const ROWS = 5;
      const COLS = 9;
      const CELL_W = 1.60;
      const CELL_D = 1.60;
      const GRID_X0 = -6.40; // Colunas 0..8 -> x: -6.40 .. +6.40
      const GRID_Z0 = -3.20; // Trilhas 0..4 -> z: -3.20 .. +3.20
      const LAVA_X  = GRID_X0 + 3.5 * CELL_W; // -0.80 (entre colunas 3 e 4)
      const WALL_X  = -8.05; // Muralha do Castelo Santuário à esquerda
      const MIST_X  =  8.25; // Banco de Névoa Volumétrica à direita

      function cellToWorld(row, col) {
        return new THREE.Vector3(
          GRID_X0 + col * CELL_W,
          0,
          GRID_Z0 + row * CELL_D
        );
      }

      const DEFENDERS = [
        {
          id: 'solar',
          name: 'Dragão Solar',
          short: 'Solar',
          icon: '☀️',
          cost: 50,
          hp: 165,
          col: '#fbbf24',
          accent: '#ea580c',
          cd: 5.2,
          desc: 'Conjura Relíquias Estelares (+25 Mana) sobre sua casa.'
        },
        {
          id: 'musgo',
          name: 'Dragão de Musgo',
          short: 'Musgo',
          icon: '🌿',
          cost: 100,
          hp: 205,
          col: '#4ade80',
          accent: '#15803d',
          cd: 1.22,
          dmg: 32,
          desc: 'Dispara rajadas rápidas de esporos esmeralda.'
        },
        {
          id: 'orvalho',
          name: 'Dragão do Orvalho',
          short: 'Orvalho',
          icon: '❄️',
          cost: 150,
          hp: 215,
          col: '#38bdf8',
          accent: '#0284c7',
          cd: 1.38,
          dmg: 28,
          slow: true,
          desc: 'Dispara orbes glaciais que congelam e retardam invasores.'
        },
        {
          id: 'prisma',
          name: 'Dragão Prisma',
          short: 'Prisma',
          icon: '💎',
          cost: 225,
          hp: 255,
          col: '#e879f9',
          accent: '#7e22ce',
          cd: 1.90,
          dmg: 84,
          pierce: true,
          desc: 'Dispara feixes prismáticos perfurantes que atravessam toda a trilha!'
        }
      ];

      const CESTILLE_SNIPPET = `/* =========================================================================
 * CAMPO DE BATALHA VULCÂNICO — CESTILLE-HUB.HTML ([SEC: DRAGOES_BATALHA_3D])
 * 1) Minas Rúnicas Explosivas no Muro (1 por trilha com knockback parabólico)
 * 2) Banco de Névoa Volumétrica Orgânica (60 sprites FBM em camadas)
 * 3) Relíquias Estelares Gigantes com Feixe Celestial & Cauda de Cometa
 * ========================================================================= */
function clWallMinesCreate(T, scene, wallX, zLanes) {
  const mines = [];
  const ironMat = new T.MeshStandardMaterial({ color: '#1e2430', metalness: 0.85, roughness: 0.25 });
  zLanes.forEach((z, row) => {
    const grp = new T.Group();
    grp.position.set(wallX + 0.68, 0.03, z);
    const housing = new T.Mesh(new T.CylinderGeometry(0.36, 0.44, 0.08, 8), ironMat);
    grp.add(housing);
    const coreMat = new T.MeshBasicMaterial({ color: '#38bdf8' });
    const core = new T.Mesh(new T.OctahedronGeometry(0.18, 0), coreMat);
    core.position.y = 0.14;
    grp.add(core);
    const ring = new T.Mesh(
      new T.RingGeometry(0.38, 0.48, 24),
      new T.MeshBasicMaterial({ color: '#38bdf8', side: T.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02;
    grp.add(ring);
    scene.add(grp);
    mines.push({ row, grp, core, coreMat, ring, armed: true });
  });
  return mines;
}`;

      // =========================================================================
      // 2. TEXTURAS PBR PROCEDURAIS (1024x1024 / 256x256) & REFLEXOS PMREM
      // =========================================================================
      function createRng(seed) {
        let s = seed % 2147483647;
        if (s <= 0) s += 2147483646;
        return () => (s = (s * 16807) % 2147483647) / 2147483647;
      }

      function makeCanvasTex(size, drawFn, rx = 1, ry = 1, srgb = true, clamp = false) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        drawFn(c.getContext('2d'), size);
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
        t.repeat.set(rx, ry);
        t.anisotropy = 8;
        if (srgb) t.encoding = THREE.sRGBEncoding;
        return t;
      }

      const TEX = (() => {
        const rng = createRng(77123);

        // Rede orgânica de fissuras magmáticas
        const fissures = [];
        for (let i = 0; i < 36; i++) {
          const pts = [];
          let cx = rng() * 1024, cy = rng() * 1024;
          let ang = rng() * Math.PI * 2;
          for (let s = 0; s < 10; s++) {
            pts.push([cx, cy]);
            ang += (rng() - 0.5) * 1.15;
            cx += Math.cos(ang) * (34 + rng() * 46);
            cy += Math.sin(ang) * (34 + rng() * 46);
          }
          fissures.push(pts);
        }

        // 1. Basalto Chamuscado Albedo (1024x1024)
        const basaltAlbedo = makeCanvasTex(1024, (g, W) => {
          g.fillStyle = '#141014';
          g.fillRect(0, 0, W, W);

          const tones = ['#1f181f', '#0e0a0d', '#292027', '#1a1318', '#30232a'];
          for (let i = 0; i < 680; i++) {
            const x = rng() * W, y = rng() * W, r = 18 + rng() * 68;
            const grd = g.createRadialGradient(x, y, 2, x, y, r);
            grd.addColorStop(0, tones[Math.floor(rng() * tones.length)]);
            grd.addColorStop(1, 'rgba(20,16,20,0)');
            g.fillStyle = grd;
            g.beginPath();
            g.arc(x, y, r, 0, Math.PI * 2);
            g.fill();
          }

          for (let i = 0; i < 4500; i++) {
            const v = 14 + Math.floor(rng() * 34);
            g.fillStyle = `rgb(${v + 2},${v - 1},${v + 3})`;
            g.fillRect(rng() * W, rng() * W, 2 + rng() * 4, 2 + rng() * 4);
          }

          g.lineCap = 'round';
          fissures.forEach(pts => {
            g.strokeStyle = 'rgba(255, 70, 0, 0.72)';
            g.lineWidth = 3.6;
            g.beginPath();
            pts.forEach((p, idx) => idx === 0 ? g.moveTo(p[0], p[1]) : g.lineTo(p[0], p[1]));
            g.stroke();

            g.strokeStyle = '#ffd166';
            g.lineWidth = 1.2;
            g.stroke();
          });
        }, 6, 4, true);

        // 2. Basalto Bump Map
        const basaltBump = makeCanvasTex(1024, (g, W) => {
          g.fillStyle = '#909090';
          g.fillRect(0, 0, W, W);
          for (let i = 0; i < 5200; i++) {
            const v = rng() > 0.45 ? 148 + Math.floor(rng() * 90) : 32 + Math.floor(rng() * 52);
            g.fillStyle = `rgb(${v},${v},${v})`;
            g.beginPath();
            g.arc(rng() * W, rng() * W, 1.5 + rng() * 4.5, 0, Math.PI * 2);
            g.fill();
          }
          g.lineCap = 'round';
          fissures.forEach(pts => {
            g.strokeStyle = '#0c0c0c';
            g.lineWidth = 6.0;
            g.beginPath();
            pts.forEach((p, idx) => idx === 0 ? g.moveTo(p[0], p[1]) : g.lineTo(p[0], p[1]));
            g.stroke();
          });
        }, 6, 4, false);

        // 3. Basalto Roughness Map
        const basaltRough = makeCanvasTex(512, (g, W) => {
          g.fillStyle = '#dadada';
          g.fillRect(0, 0, W, W);
          for (let i = 0; i < 280; i++) {
            const x = rng() * W, y = rng() * W, r = 12 + rng() * 42;
            const grd = g.createRadialGradient(x, y, 2, x, y, r);
            grd.addColorStop(0, 'rgba(60,60,60,0.78)');
            grd.addColorStop(1, 'rgba(220,220,220,0)');
            g.fillStyle = grd;
            g.beginPath();
            g.arc(x, y, r, 0, Math.PI * 2);
            g.fill();
          }
        }, 6, 4, false);

        // 4. Fissuras de Magma Emissive Map
        const magmaEmissive = makeCanvasTex(1024, (g, W) => {
          g.fillStyle = '#000000';
          g.fillRect(0, 0, W, W);
          g.lineCap = 'round';
          fissures.forEach(pts => {
            g.shadowColor = '#ff3800';
            g.shadowBlur = 16;
            g.strokeStyle = '#ff5900';
            g.lineWidth = 4.5;
            g.beginPath();
            pts.forEach((p, idx) => idx === 0 ? g.moveTo(p[0], p[1]) : g.lineTo(p[0], p[1]));
            g.stroke();

            g.shadowBlur = 0;
            g.strokeStyle = '#fff099';
            g.lineWidth = 1.6;
            g.stroke();
          });
        }, 6, 4, true);

        // 5. Pedra Medieval Escura (Muralha do Castelo & Pontes)
        const darkStoneMap = makeCanvasTex(512, (g, W) => {
          g.fillStyle = '#131720';
          g.fillRect(0, 0, W, W);
          const rows = 8, rh = W / rows;
          for (let r = 0; r < rows; r++) {
            let x = (r % 2) * -36;
            while (x < W) {
              const bw = 64 + Math.floor(rng() * 44);
              const tone = 42 + Math.floor(rng() * 24);
              g.fillStyle = `rgb(${tone},${tone + 4},${tone + 10})`;
              g.fillRect(x + 3, r * rh + 3, bw - 6, rh - 6);
              if (rng() < 0.35) {
                g.fillStyle = 'rgba(46, 82, 42, 0.45)';
                g.beginPath();
                g.arc(x + bw * 0.5, (r + 1) * rh - 3, 12 + rng() * 14, Math.PI, 0);
                g.fill();
              }
              x += bw;
            }
          }
        }, 2, 2, true);

        const darkStoneBump = makeCanvasTex(512, (g, W) => {
          g.fillStyle = '#141414';
          g.fillRect(0, 0, W, W);
          const rows = 8, rh = W / rows;
          for (let r = 0; r < rows; r++) {
            let x = (r % 2) * -36;
            while (x < W) {
              const bw = 64 + Math.floor(rng() * 44);
              g.fillStyle = '#c8c8c8';
              g.fillRect(x + 4, r * rh + 4, bw - 8, rh - 8);
              x += bw;
            }
          }
        }, 2, 2, false);

        // 6. Textura Orgânica de Nuvem Volumétrica FBM (256x256, bordas 100% suaves)
        const volumetricMistTex = makeCanvasTex(256, (g, W) => {
          g.clearRect(0, 0, W, W);
          // Vários lóbulos de fumaça sobrepostos para silhueta irregular e orgânica
          const puffs = [
            [128, 128, 118, 0.42],
            [92,  112, 86,  0.34],
            [164, 118, 84,  0.34],
            [115, 158, 88,  0.36],
            [148, 92,  78,  0.30],
            [82,  146, 72,  0.28],
            [172, 148, 70,  0.28]
          ];
          puffs.forEach(([px, py, pr, alpha]) => {
            const gr = g.createRadialGradient(px, py, pr * 0.08, px, py, pr);
            gr.addColorStop(0.0, `rgba(255, 255, 255, ${alpha})`);
            gr.addColorStop(0.48, `rgba(240, 232, 245, ${alpha * 0.62})`);
            gr.addColorStop(0.78, `rgba(220, 210, 230, ${alpha * 0.22})`);
            gr.addColorStop(1.0, 'rgba(200, 190, 210, 0)');
            g.fillStyle = gr;
            g.beginPath();
            g.arc(px, py, pr, 0, Math.PI * 2);
            g.fill();
          });
        }, 1, 1, true, true);

        // 7. Brilho Radial Macio
        const softGlow = makeCanvasTex(128, (g, W) => {
          const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
          gr.addColorStop(0, 'rgba(255,255,255,1)');
          gr.addColorStop(0.32, 'rgba(255,255,255,0.58)');
          gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr;
          g.fillRect(0, 0, W, W);
        }, 1, 1, true, true);

        return {
          basaltAlbedo, basaltBump, basaltRough, magmaEmissive,
          darkStoneMap, darkStoneBump, volumetricMistTex, softGlow
        };
      })();

      function buildVolcanicPMREM(renderer) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 256;
        const g = c.getContext('2d');
        const grd = g.createLinearGradient(0, 0, 0, 256);
        grd.addColorStop(0.00, '#070306');
        grd.addColorStop(0.36, '#1e080e');
        grd.addColorStop(0.49, '#ff4514');
        grd.addColorStop(0.55, '#ffb738');
        grd.addColorStop(0.76, '#481308');
        grd.addColorStop(1.00, '#120504');
        g.fillStyle = grd;
        g.fillRect(0, 0, 512, 256);

        const eq = new THREE.CanvasTexture(c);
        eq.mapping = THREE.EquirectangularReflectionMapping;
        eq.encoding = THREE.sRGBEncoding;

        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const rt = pmrem.fromEquirectangular(eq);
        eq.dispose();
        pmrem.dispose();
        return rt.texture;
      }

      // =========================================================================
      // 3. CÉU VULCÂNICO FBM & CORDILHEIRAS ORGÂNICAS (ZERO CONES/PIRÂMIDES)
      // =========================================================================
      function buildVolcanicSkyAndRidges(scene) {
        const skyUniforms = { uTime: { value: 0 } };
        const skyMat = new THREE.ShaderMaterial({
          uniforms: skyUniforms,
          side: THREE.BackSide,
          depthWrite: false,
          vertexShader: `
            varying vec3 vDir;
            void main() {
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vDir = normalize(wp.xyz);
              gl_Position = projectionMatrix * viewMatrix * wp;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            varying vec3 vDir;

            float hash(vec2 p) {
              return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }
            float noise(vec2 p) {
              vec2 i = floor(p), f = fract(p);
              vec2 u = f * f * (3.0 - 2.0 * f);
              return mix(
                mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                u.y
              );
            }
            float fbm(vec2 p) {
              float v = 0.0, a = 0.5;
              for (int i = 0; i < 4; i++) {
                v += a * noise(p);
                p = p * 2.03 + vec2(1.7, 9.2);
                a *= 0.5;
              }
              return v;
            }

            void main() {
              vec3 d = normalize(vDir);
              float h = clamp(d.y, 0.0, 1.0);

              vec3 zenithCol   = vec3(0.028, 0.012, 0.024); // #070306
              vec3 twilightCol = vec3(0.115, 0.030, 0.055);
              vec3 horizonCol  = vec3(0.950, 0.240, 0.060);

              vec3 sky = mix(horizonCol, twilightCol, smoothstep(0.0, 0.24, h));
              sky = mix(sky, zenithCol, smoothstep(0.18, 0.76, h));

              // Nuvens densas de cinzas iluminadas por baixo pelo brilho da lava
              vec2 cloudUv = d.xz / (d.y + 0.30) * 1.4;
              float n1 = fbm(cloudUv + vec2(uTime * 0.03, -uTime * 0.02));
              float n2 = fbm(cloudUv * 2.15 - vec2(uTime * 0.045, uTime * 0.025));
              float clouds = smoothstep(0.35, 0.85, n1 * 0.65 + n2 * 0.35);

              vec3 emberLit = mix(vec3(0.88, 0.16, 0.04), vec3(1.0, 0.55, 0.14), n2);
              float lowLit = (1.0 - smoothstep(0.0, 0.56, h)) * clouds;
              sky = mix(sky, zenithCol * 0.65, clouds * 0.54);
              sky += emberLit * lowLit * 0.60;

              // Relâmpagos distantes nas nuvens de cinzas
              float flash = pow(max(0.0, sin(uTime * 1.8) * sin(uTime * 4.5 + 1.1)), 20.0);
              float flashZone = smoothstep(0.55, 0.90, n2) * smoothstep(0.10, 0.45, h);
              sky += vec3(0.55, 0.35, 0.98) * flash * flashZone * 0.85;

              // Brasas estelares no topo do céu
              float starH = fract(sin(dot(floor(d.xz * 120.0), vec2(12.9898, 78.233))) * 43758.5453);
              float twinkle = step(0.985, starH) * (0.5 + 0.5 * sin(uTime * 4.0 + starH * 50.0));
              sky += vec3(1.0, 0.82, 0.55) * twinkle * smoothstep(0.28, 0.65, h);

              gl_FragColor = vec4(sky, 1.0);
            }
          `
        });
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(72, 36, 24), skyMat));

        // Cordilheiras orgânicas contínuas esculpidas com PlaneGeometry FBM (ZERO cones ou pirâmides!)
        const ridgeUniforms = { uTime: { value: 0 } };
        const ridgeMat = new THREE.MeshStandardMaterial({
          color: '#110a0e',
          roughness: 0.95,
          metalness: 0.04
        });
        ridgeMat.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = ridgeUniforms.uTime;
          shader.vertexShader = 'varying vec3 vRWorld;\n' + shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            vRWorld = (modelMatrix * vec4(position, 1.0)).xyz;`
          );
          shader.fragmentShader = 'uniform float uTime;\nvarying vec3 vRWorld;\n' + shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
            float calderaGlow = smoothstep(3.2, 0.2, vRWorld.y) * (0.65 + 0.35 * sin(uTime * 1.8 + vRWorld.x * 0.25));
            totalEmissiveRadiance += vec3(0.85, 0.18, 0.03) * calderaGlow * 0.45;`
          );
        };

        [
          { z: -26, w: 70, h: 7.4, seed: 1.3 },
          { z: -34, w: 84, h: 10.0, seed: 4.7 }
        ].forEach((cfg, idx) => {
          const rGeo = new THREE.PlaneGeometry(cfg.w, cfg.h, 128, 24);
          const pos = rGeo.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vy = pos.getY(i);
            const normY = (vy + cfg.h * 0.5) / cfg.h;

            const n =
              Math.sin(vx * 0.16 + cfg.seed) * 0.45 +
              Math.cos(vx * 0.37 - cfg.seed * 1.4) * 0.28 +
              Math.sin(vx * 0.82 + cfg.seed * 2.1) * 0.14 +
              Math.cos(vx * 1.75) * 0.06;

            const edgeFade = Math.cos((vx / (cfg.w * 0.5)) * (Math.PI * 0.45));
            const heightFactor = Math.max(0.15, (0.55 + n * 0.55) * Math.max(0, edgeFade));

            const finalY = -1.2 + normY * cfg.h * heightFactor;
            const finalZ = Math.sin(vx * 0.12 + idx) * 2.2 - normY * 1.4;
            pos.setXYZ(i, vx, finalY, finalZ);
          }
          rGeo.computeVertexNormals();
          const ridgeMesh = new THREE.Mesh(rGeo, ridgeMat);
          ridgeMesh.position.set(0, 0, cfg.z);
          scene.add(ridgeMesh);
        });

        return {
          update(t) {
            skyUniforms.uTime.value = t;
            ridgeUniforms.uTime.value = t;
          }
        };
      }

      // =========================================================================
      // 4. TERRENO 5x9 DE BASALTO, RIO DE LAVA FBM, CASTELO COM 5 MINAS & NÉVOA 3D
      // =========================================================================
      function createTaperedSpline(points, radii, radSegs = 12, tubSegs = 14, capEnd = true) {
        const curve = new THREE.CatmullRomCurve3(points);
        const frames = curve.computeFrenetFrames(tubSegs, false);
        const pos = [], nor = [], uv = [], idx = [];
        const radAt = (t) => {
          const f = t * (radii.length - 1);
          const i = Math.min(radii.length - 2, Math.floor(f));
          return radii[i] + (radii[i + 1] - radii[i]) * (f - i);
        };
        for (let i = 0; i <= tubSegs; i++) {
          const t = i / tubSegs;
          const p = curve.getPointAt(t);
          const N = frames.normals[i], B = frames.binormals[i], r = radAt(t);
          for (let j = 0; j <= radSegs; j++) {
            const a = (j / radSegs) * Math.PI * 2;
            const cos = Math.cos(a), sin = Math.sin(a);
            const dx = N.x * cos + B.x * sin, dy = N.y * cos + B.y * sin, dz = N.z * cos + B.z * sin;
            pos.push(p.x + dx * r, p.y + dy * r, p.z + dz * r);
            nor.push(dx, dy, dz);
            uv.push(j / radSegs, t);
          }
        }
        for (let i = 0; i < tubSegs; i++) {
          for (let j = 0; j < radSegs; j++) {
            const a = i * (radSegs + 1) + j, b = a + radSegs + 1;
            idx.push(a, b, a + 1, b, b + 1, a + 1);
          }
        }
        if (capEnd) {
          const endPt = curve.getPointAt(1), endTan = curve.getTangentAt(1), tipIdx = pos.length / 3, rEnd = radAt(1);
          pos.push(endPt.x + endTan.x * rEnd * 0.8, endPt.y + endTan.y * rEnd * 0.8, endPt.z + endTan.z * rEnd * 0.8);
          nor.push(endTan.x, endTan.y, endTan.z);
          uv.push(0.5, 1);
          const base = tubSegs * (radSegs + 1);
          for (let j = 0; j < radSegs; j++) idx.push(base + j, tipIdx, base + j + 1);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx);
        return geo;
      }

      function terrainHeight(x, z) {
        let y = 0.0;
        const dLava = Math.abs(x - LAVA_X);
        if (dLava < 0.76) {
          const bank = 1.0 - dLava / 0.76;
          y -= bank * bank * 0.50;
        }
        const outX = Math.max(0, Math.abs(x) - 9.2);
        const outZ = Math.max(0, Math.abs(z) - 4.8);
        const rimDist = Math.hypot(outX * 0.65, outZ);
        if (rimDist > 0) {
          const wave = 0.7 + 0.3 * Math.sin(x * 0.42 + 0.4) * Math.cos(z * 0.52);
          y += Math.min(2.6, Math.pow(rimDist, 1.18) * 0.26) * wave;
        }
        return y;
      }

      function buildVolcanicBattlefield(scene) {
        const env = new THREE.Group();
        scene.add(env);
        const rng = createRng(91234);

        // 1. Terreno Contínuo de Basalto Chamuscado (1024x1024 PBR)
        const terrainGeo = new THREE.PlaneGeometry(54, 40, 128, 96);
        terrainGeo.rotateX(-Math.PI / 2);
        const tPos = terrainGeo.attributes.position;
        for (let i = 0; i < tPos.count; i++) {
          tPos.setY(i, terrainHeight(tPos.getX(i), tPos.getZ(i)));
        }
        terrainGeo.computeVertexNormals();

        const groundUniforms = { uTime: { value: 0 } };
        const terrainMat = new THREE.MeshStandardMaterial({
          map: TEX.basaltAlbedo,
          bumpMap: TEX.basaltBump,
          bumpScale: 0.055,
          roughnessMap: TEX.basaltRough,
          roughness: 0.84,
          metalness: 0.12,
          emissiveMap: TEX.magmaEmissive,
          emissive: new THREE.Color('#ff4800'),
          emissiveIntensity: 0.82,
          envMapIntensity: 1.35
        });
        terrainMat.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = groundUniforms.uTime;
          shader.fragmentShader = 'uniform float uTime;\n' + shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
            totalEmissiveRadiance *= (0.72 + 0.36 * sin(uTime * 2.1));`
          );
        };

        const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
        terrainMesh.receiveShadow = true;
        env.add(terrainMesh);

        // 2. Tabuleiro Tático 5x9 (x: -7.2 a +7.2, z: -4.0 a +4.0)
        const tileMatA = new THREE.MeshStandardMaterial({
          color: '#281f26',
          map: TEX.basaltAlbedo,
          bumpMap: TEX.basaltBump,
          bumpScale: 0.03,
          roughness: 0.72,
          metalness: 0.16,
          emissiveMap: TEX.magmaEmissive,
          emissive: new THREE.Color('#ff4500'),
          emissiveIntensity: 0.42
        });
        const tileMatB = new THREE.MeshStandardMaterial({
          color: '#1b141a',
          map: TEX.basaltAlbedo,
          bumpMap: TEX.basaltBump,
          bumpScale: 0.03,
          roughness: 0.78,
          metalness: 0.14,
          emissiveMap: TEX.magmaEmissive,
          emissive: new THREE.Color('#ff4500'),
          emissiveIntensity: 0.25
        });
        const stoneCurbMat = new THREE.MeshStandardMaterial({
          map: TEX.darkStoneMap,
          bumpMap: TEX.darkStoneBump,
          bumpScale: 0.035,
          roughness: 0.38,
          metalness: 0.32,
          envMapIntensity: 1.5
        });

        const tileMeshes = [];
        const plotGeo = new THREE.PlaneGeometry(CELL_W * 0.90, CELL_D * 0.90);
        plotGeo.rotateX(-Math.PI / 2);

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const p = cellToWorld(r, c);
            const plot = new THREE.Mesh(plotGeo, (r + c) % 2 === 0 ? tileMatA : tileMatB);
            plot.position.set(p.x, 0.008, p.z);
            plot.receiveShadow = true;
            plot.userData = { row: r, col: c };
            env.add(plot);
            tileMeshes.push(plot);
          }
        }

        // Bordas de Obsidiana Rúnica entre as 5 Trilhas
        const runeStripeMat = new THREE.MeshBasicMaterial({ color: '#ff6a1a', transparent: true, opacity: 0.48 });
        for (let r = 0; r <= ROWS; r++) {
          const zLane = -4.0 + r * CELL_D;
          for (let c = 0; c < COLS; c++) {
            const bx = GRID_X0 + c * CELL_W;
            if (Math.abs(bx - LAVA_X) < 0.78) continue;

            const curb = new THREE.Mesh(new THREE.BoxGeometry(CELL_W * 0.88, 0.06, 0.12), stoneCurbMat);
            curb.position.set(bx, 0.025, zLane);
            curb.castShadow = true;
            curb.receiveShadow = true;
            env.add(curb);

            const vein = new THREE.Mesh(new THREE.PlaneGeometry(CELL_W * 0.55, 0.024), runeStripeMat);
            vein.rotation.x = -Math.PI / 2;
            vein.position.set(bx, 0.058, zLane);
            env.add(vein);
          }
        }

        // 3. RIO DE LAVA DERRETIDA GLSL FBM (x = -0.80) + 5 PONTES DE PEDRA E FERRO FORJADO
        const lavaUniforms = { uTime: { value: 0 } };
        const lavaMat = new THREE.ShaderMaterial({
          uniforms: lavaUniforms,
          vertexShader: `
            uniform float uTime;
            varying vec3 vWorldP;
            void main() {
              vec3 p = position;
              p.z += sin(p.y * 4.2 - uTime * 2.5 + p.x * 3.0) * 0.015;
              vec4 wp = modelMatrix * vec4(p, 1.0);
              vWorldP = wp.xyz;
              gl_Position = projectionMatrix * viewMatrix * wp;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            varying vec3 vWorldP;

            float hash(vec2 p) {
              return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            float noise(vec2 p) {
              vec2 i = floor(p), f = fract(p);
              vec2 u = f * f * (3.0 - 2.0 * f);
              return mix(
                mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                u.y
              );
            }
            float fbm(vec2 p) {
              float v = 0.0, a = 0.5;
              for (int i = 0; i < 4; i++) {
                v += a * noise(p);
                p = p * 2.02 + vec2(2.3, 4.1);
                a *= 0.5;
              }
              return v;
            }

            void main() {
              vec2 flow = vec2(vWorldP.x * 2.4, vWorldP.z * 1.35 - uTime * 0.62);
              float n1 = fbm(flow);
              float n2 = fbm(flow * 2.3 + vec2(n1 * 1.8, -uTime * 0.4));
              float heat = clamp(n1 * 0.55 + n2 * 0.55, 0.0, 1.0);

              vec3 crustCol = vec3(0.08, 0.03, 0.03);
              vec3 redMagma = vec3(1.00, 0.14, 0.00);
              vec3 orgMagma = vec3(1.00, 0.58, 0.00);
              vec3 hotCore  = vec3(1.00, 0.96, 0.70);

              vec3 col = mix(crustCol, redMagma, smoothstep(0.32, 0.52, heat));
              col = mix(col, orgMagma, smoothstep(0.50, 0.72, heat));
              col = mix(col, hotCore,  smoothstep(0.72, 0.92, heat));

              float edge = smoothstep(0.42, 0.62, abs(vWorldP.x - (${LAVA_X.toFixed(2)})));
              col = mix(col, crustCol, edge * 0.65);

              gl_FragColor = vec4(col * 1.35, 1.0);
            }
          `
        });

        const lavaRiver = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 28.0, 20, 96), lavaMat);
        lavaRiver.rotation.x = -Math.PI / 2;
        lavaRiver.position.set(LAVA_X, -0.06, 0);
        env.add(lavaRiver);

        const lavaLights = [];
        [-2.8, 0.0, 2.8].forEach(lz => {
          const ll = new THREE.PointLight('#ff4818', 1.65, 6.8);
          ll.position.set(LAVA_X, 0.45, lz);
          env.add(ll);
          lavaLights.push(ll);
        });

        const darkIronMat = new THREE.MeshStandardMaterial({
          color: '#1e222b',
          metalness: 0.86,
          roughness: 0.28,
          envMapIntensity: 1.6
        });
        const lanternGlowMat = new THREE.MeshBasicMaterial({ color: '#ffbe3b' });

        for (let r = 0; r < ROWS; r++) {
          const pz = GRID_Z0 + r * CELL_D;
          const bridge = new THREE.Group();
          bridge.position.set(LAVA_X, 0.025, pz);
          env.add(bridge);

          [-0.46, 0.46].forEach(px => {
            [-0.46, 0.46].forEach(oz => {
              const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.14), stoneCurbMat);
              pillar.position.set(px, -0.06, oz);
              pillar.castShadow = true;
              bridge.add(pillar);
            });
          });

          for (let p = -3; p <= 3; p++) {
            const slab = new THREE.Mesh(
              new THREE.BoxGeometry(0.18, 0.05, CELL_D * 0.74),
              p % 2 === 0 ? stoneCurbMat : darkIronMat
            );
            slab.position.set(p * 0.19, 0.03 + Math.cos(p * 0.35) * 0.035, 0);
            slab.rotation.z = -p * 0.04;
            slab.castShadow = true;
            slab.receiveShadow = true;
            bridge.add(slab);
          }

          [-0.48, 0.48].forEach(oz => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.065, 0.06), darkIronMat);
            rail.position.set(0, 0.24, oz);
            rail.castShadow = true;
            bridge.add(rail);

            const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), lanternGlowMat);
            lantern.position.set(0.56, 0.34, oz);
            bridge.add(lantern);
          });
        }

        // 4. MURALHA DO CASTELO SANTUÁRIO + 5 MINAS RÚNICAS EXPLOSIVAS (1 POR TRILHA!)
        const castleWall = new THREE.Group();
        castleWall.position.set(WALL_X, 0, 0);
        env.add(castleWall);

        const wallMat = new THREE.MeshStandardMaterial({
          map: TEX.darkStoneMap,
          bumpMap: TEX.darkStoneBump,
          bumpScale: 0.04,
          roughness: 0.85
        });

        // Muralha contínua atravessando todas as 5 trilhas com ameias no topo
        const mainWall = new THREE.Mesh(new THREE.BoxGeometry(1.20, 2.25, 8.8), wallMat);
        mainWall.position.set(-0.20, 1.125, 0);
        mainWall.castShadow = true;
        mainWall.receiveShadow = true;
        castleWall.add(mainWall);

        for (let m = -3; m <= 3; m++) {
          const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.64), wallMat);
          merlon.position.set(0.18, 2.42, m * 1.25);
          merlon.castShadow = true;
          castleWall.add(merlon);
        }

        const brazierFlames = [];
        const banners = [];
        [-4.5, 4.5].forEach((tz, ti) => {
          const tower = new THREE.Group();
          tower.position.set(0.05, 0, tz);
          castleWall.add(tower);

          const body = new THREE.Mesh(new THREE.BoxGeometry(1.55, 3.25, 1.55), wallMat);
          body.position.y = 1.625;
          body.castShadow = true;
          tower.add(body);

          // Braseiro flamejante
          const bowl = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.24, 0.54), darkIronMat);
          bowl.position.set(0.90, 2.35, 0);
          tower.add(bowl);

          const flame = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.25, 1),
            new THREE.MeshBasicMaterial({ color: '#ffae34' })
          );
          flame.scale.set(0.85, 1.70, 0.85);
          flame.position.set(0.90, 2.66, 0);
          tower.add(flame);
          brazierFlames.push(flame);

          const bLight = new THREE.PointLight('#ff7b1c', 1.7, 9.0);
          bLight.position.set(1.0, 2.75, 0);
          tower.add(bLight);

          // Estandarte medieval ondulando ao vento
          const bannerGeo = new THREE.PlaneGeometry(0.55, 1.35, 6, 12);
          const bannerMat = new THREE.MeshStandardMaterial({
            color: ti === 0 ? '#0284c7' : '#d97706',
            emissive: new THREE.Color(ti === 0 ? '#0369a1' : '#b45309'),
            emissiveIntensity: 0.35,
            side: THREE.DoubleSide,
            roughness: 0.65
          });
          const banner = new THREE.Mesh(bannerGeo, bannerMat);
          banner.position.set(0.82, 1.45, 0);
          banner.rotation.y = Math.PI / 2;
          tower.add(banner);
          banners.push(banner);
        });

        // 5 Minas Rúnicas Explosivas engastadas na base do muro (1 por trilha)
        const wallMines = [];
        for (let r = 0; r < ROWS; r++) {
          const zLane = GRID_Z0 + r * CELL_D;
          const mGroup = new THREE.Group();
          mGroup.position.set(WALL_X + 0.66, 0.03, zLane);
          env.add(mGroup);

          const baseHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 0.09, 8), darkIronMat);
          baseHousing.castShadow = true;
          baseHousing.receiveShadow = true;
          mGroup.add(baseHousing);

          const runeRingMat = new THREE.MeshBasicMaterial({
            color: '#38bdf8',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.90,
            blending: THREE.AdditiveBlending
          });
          const runeRing = new THREE.Mesh(new THREE.RingGeometry(0.40, 0.52, 24), runeRingMat);
          runeRing.rotation.x = -Math.PI / 2;
          runeRing.position.y = 0.025;
          mGroup.add(runeRing);

          const coreMat = new THREE.MeshStandardMaterial({
            color: '#38bdf8',
            emissive: new THREE.Color('#00f5d4'),
            emissiveIntensity: 1.45,
            roughness: 0.15
          });
          const coreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.19, 0), coreMat);
          coreCrystal.scale.set(1.0, 1.35, 1.0);
          coreCrystal.position.y = 0.16;
          mGroup.add(coreCrystal);

          wallMines.push({
            row: r,
            group: mGroup,
            coreCrystal,
            coreMat,
            runeRing,
            runeRingMat,
            armed: true
          });
        }

        // 5. BANCO DE NÉVOA VOLUMÉTRICA DENSA E ORGÂNICA (60 SPRITES FBM EM CAMADAS)
        const mistBank = new THREE.Group();
        env.add(mistBank);

        const mistSprites = [];
        const MIST_PUFF_COUNT = 60;
        for (let i = 0; i < MIST_PUFF_COUNT; i++) {
          const depthFrac = rng(); // 0 = borda frontal perto do tabuleiro, 1 = fundo denso
          const x = MIST_X - 0.85 + depthFrac * 3.8;
          const z = (rng() - 0.5) * 11.8;
          const y = 0.55 + rng() * 3.8;

          const isLow = y < 1.85;
          const puffCol = new THREE.Color(
            isLow
              ? (rng() > 0.35 ? '#7c2d12' : '#9a3412') // Brilho quente da lava na base da névoa
              : (rng() > 0.45 ? '#261424' : '#3b1c32') // Bruma densa arroxeada/cinza no topo
          );

          const spMat = new THREE.SpriteMaterial({
            map: TEX.volumetricMistTex,
            color: puffCol,
            transparent: true,
            opacity: 0.34 + depthFrac * 0.30,
            depthWrite: false,
            blending: isLow ? THREE.AdditiveBlending : THREE.NormalBlending
          });

          const sp = new THREE.Sprite(spMat);
          const sc = 3.2 + rng() * 2.8;
          sp.scale.set(sc * 1.25, sc, 1);
          sp.position.set(x, y, z);
          mistBank.add(sp);

          mistSprites.push({
            sp,
            baseX: x,
            baseY: y,
            baseZ: z,
            baseSc: sc,
            ph: rng() * Math.PI * 2,
            spd: 0.25 + rng() * 0.45
          });
        }

        const mistLavaLight = new THREE.PointLight('#ff4514', 2.4, 12.0);
        mistLavaLight.position.set(MIST_X - 0.6, 1.5, 0);
        env.add(mistLavaLight);

        // Brasas atmosféricas subindo e saindo da névoa
        const emberCount = 190;
        const emberPos = new Float32Array(emberCount * 3);
        const emberCol = new Float32Array(emberCount * 3);
        const emberMeta = [];
        for (let i = 0; i < emberCount; i++) {
          const fromMist = i < 85;
          const x = fromMist ? (MIST_X + (rng() - 0.5) * 2.6) : ((rng() - 0.5) * 18.0);
          const y = rng() * 4.8;
          const z = (rng() - 0.5) * 11.0;
          emberPos[i * 3] = x;
          emberPos[i * 3 + 1] = y;
          emberPos[i * 3 + 2] = z;

          const c = new THREE.Color(fromMist ? '#ff4514' : (rng() > 0.35 ? '#ff7b00' : '#ffd166'));
          emberCol[i * 3] = c.r;
          emberCol[i * 3 + 1] = c.g;
          emberCol[i * 3 + 2] = c.b;
          emberMeta.push({ fromMist, baseX: x, baseZ: z, ph: rng() * 6.28, spd: 0.4 + rng() * 0.8 });
        }
        const emberGeo = new THREE.BufferGeometry();
        emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
        emberGeo.setAttribute('color', new THREE.BufferAttribute(emberCol, 3));
        const emberPoints = new THREE.Points(
          emberGeo,
          new THREE.PointsMaterial({
            size: 0.14,
            map: TEX.softGlow,
            vertexColors: true,
            transparent: true,
            opacity: 0.88,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          })
        );
        env.add(emberPoints);

        // Cursor Rúnico de Posicionamento no Tabuleiro
        const hoverCursor = new THREE.Mesh(
          new THREE.RingGeometry(0.52, 0.66, 4),
          new THREE.MeshBasicMaterial({ color: '#fbbf24', side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
        );
        hoverCursor.rotation.x = -Math.PI / 2;
        hoverCursor.rotation.z = Math.PI / 4;
        hoverCursor.position.y = 0.045;
        hoverCursor.visible = false;
        env.add(hoverCursor);

        return {
          tileMeshes,
          wallMines,
          hoverCursor,
          update(t) {
            groundUniforms.uTime.value = t;
            lavaUniforms.uTime.value = t;

            lavaLights.forEach((ll, idx) => {
              ll.intensity = 1.65 + Math.sin(t * 6.2 + idx * 2.1) * 0.35;
            });
            brazierFlames.forEach((fl, idx) => {
              const s = 1 + Math.sin(t * 14 + idx * 2) * 0.16;
              fl.scale.set(0.85 / Math.sqrt(s), 1.70 * s, 0.85 / Math.sqrt(s));
            });
            banners.forEach((bn, idx) => {
              const pos = bn.geometry.attributes.position;
              for (let k = 0; k < pos.count; k++) {
                const py = pos.getY(k);
                const wave = Math.sin(py * 4.5 + t * 4.8 + idx) * 0.08 * Math.max(0, 0.65 - py);
                pos.setZ(k, wave);
              }
              pos.needsUpdate = true;
            });

            // Pulso das Minas Rúnicas armadas no muro
            wallMines.forEach((m, idx) => {
              if (m.armed) {
                m.coreCrystal.visible = true;
                m.coreCrystal.rotation.y = t * 2.4 + idx;
                m.coreCrystal.position.y = 0.16 + Math.sin(t * 4.0 + idx) * 0.03;
                m.runeRing.rotation.z = t * 1.5;
                m.runeRingMat.color.set('#38bdf8');
                m.runeRingMat.opacity = 0.72 + Math.sin(t * 5.0 + idx) * 0.22;
              } else {
                m.coreCrystal.visible = false;
                m.runeRingMat.color.set('#334155');
                m.runeRingMat.opacity = 0.35;
              }
            });

            // Ondulação orgânica das 60 nuvens volumétricas da névoa
            mistSprites.forEach((ms) => {
              ms.sp.position.x = ms.baseX + Math.sin(t * ms.spd + ms.ph) * 0.42;
              ms.sp.position.y = ms.baseY + Math.cos(t * ms.spd * 0.85 + ms.ph) * 0.18;
              ms.sp.position.z = ms.baseZ + Math.sin(t * ms.spd * 0.7 + ms.ph) * 0.45;
              ms.sp.material.rotation = Math.sin(t * 0.35 + ms.ph) * 0.35;
            });
            mistLavaLight.intensity = 2.3 + Math.sin(t * 3.2) * 0.45;

            const arr = emberGeo.attributes.position.array;
            for (let i = 0; i < emberCount; i++) {
              const m = emberMeta[i];
              arr[i * 3 + 1] += m.spd * 0.022;
              if (m.fromMist) {
                arr[i * 3] -= m.spd * 0.030;
                if (arr[i * 3] < MIST_X - 4.8 || arr[i * 3 + 1] > 4.6) {
                  arr[i * 3] = MIST_X + (Math.random() - 0.5) * 1.8;
                  arr[i * 3 + 1] = 0.15 + Math.random() * 2.2;
                }
              } else {
                arr[i * 3] = m.baseX + Math.sin(t * 1.6 + m.ph) * 0.35;
                if (arr[i * 3 + 1] > 4.8) arr[i * 3 + 1] = 0.05;
              }
            }
            emberGeo.attributes.position.needsUpdate = true;
          }
        };
      }

      // =========================================================================
      // 5. METEOROS VULCÂNICOS ESCULPIDOS (AMBIENTAIS VISUAIS + CHUVA ESTELAR)
      // =========================================================================
      function createSculptedMeteorRock(radius = 0.42) {
        const geo = new THREE.IcosahedronGeometry(radius, 3);
        const pos = geo.attributes.position;
        const craters = [
          { dir: new THREE.Vector3( 0.7,  0.5,  0.4).normalize(), r: 0.55, d: 0.24 },
          { dir: new THREE.Vector3(-0.6, -0.4,  0.6).normalize(), r: 0.48, d: 0.20 },
          { dir: new THREE.Vector3( 0.2, -0.8, -0.5).normalize(), r: 0.52, d: 0.22 },
          { dir: new THREE.Vector3(-0.5,  0.6, -0.6).normalize(), r: 0.45, d: 0.18 }
        ];
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          const n = v.clone().normalize();
          let disp = 1.0 +
            Math.sin(n.x * 5.2 + n.y * 4.1) * 0.11 +
            Math.cos(n.y * 6.5 - n.z * 5.8) * 0.08;
          craters.forEach(c => {
            const ang = Math.acos(Math.max(-1, Math.min(1, n.dot(c.dir))));
            if (ang < c.r) {
              const f = 1.0 - ang / c.r;
              disp -= f * f * c.d;
            }
          });
          v.multiplyScalar(disp);
          pos.setXYZ(i, v.x, v.y, v.z);
        }
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
          color: '#1b1114',
          map: TEX.basaltAlbedo,
          bumpMap: TEX.basaltBump,
          bumpScale: 0.04,
          roughness: 0.72,
          emissiveMap: TEX.magmaEmissive,
          emissive: new THREE.Color('#ff5500'),
          emissiveIntensity: 1.85
        });
        return new THREE.Mesh(geo, mat);
      }

      // Cratera de magma esfriando lentamente no basalto após o impacto
      function createCoolingCraterDecal(scene, pos, radius = 1.25) {
        const u = { uCool: { value: 0.0 } };
        const mat = new THREE.ShaderMaterial({
          uniforms: u,
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv * 2.0 - 1.0;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uCool;
            varying vec2 vUv;
            void main() {
              float d = length(vUv);
              if (d > 1.0) discard;
              float ang = atan(vUv.y, vUv.x);
              float cracks = abs(sin(ang * 7.0 + d * 6.0)) * abs(cos(ang * 5.0 - d * 8.0));
              float heat = (1.0 - d * d) * (1.0 - uCool);
              float rim = smoothstep(0.65, 0.88, d) * (1.0 - smoothstep(0.88, 1.0, d));
              vec3 darkChar = vec3(0.05, 0.02, 0.03);
              vec3 magma = mix(vec3(1.0, 0.25, 0.0), vec3(1.0, 0.88, 0.45), heat);
              vec3 col = mix(darkChar, magma, smoothstep(0.22, 0.65, heat + cracks * 0.35 * (1.0 - uCool)));
              float alpha = (1.0 - smoothstep(0.75, 1.0, d)) * (1.0 - uCool * 0.88) + rim * 0.35 * (1.0 - uCool);
              gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.92));
            }
          `
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(pos.x, 0.016, pos.z);
        scene.add(mesh);
        return { mesh, mat, u, age: 0, maxAge: 9.0 };
      }

      // =========================================================================
      // 6. RELÍQUIA ESTELAR GIGANTE CAINDO DO CÉU (+25 MANA)
      // =========================================================================
      function buildGiantStellarRelicMesh() {
        const root = new THREE.Group();
        const scaleMult = 1.62; // Bem maior e cinematográfico!

        // Cristal prismático duplo facetado central
        const crystalGroup = new THREE.Group();
        crystalGroup.scale.setScalar(scaleMult);
        root.add(crystalGroup);

        const coreMat = new THREE.MeshPhysicalMaterial({
          color: '#fef08a',
          emissive: new THREE.Color('#38bdf8'),
          emissiveIntensity: 0.85,
          roughness: 0.08,
          metalness: 0.25,
          clearcoat: 1.0,
          flatShading: true
        });
        const mainCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), coreMat);
        mainCrystal.scale.set(0.82, 1.55, 0.82);
        mainCrystal.castShadow = true;
        crystalGroup.add(mainCrystal);

        // Coroa de 5 cristais menores orbitando o núcleo
        const miniShards = [];
        const shardMat = new THREE.MeshStandardMaterial({
          color: '#7dd3fc',
          emissive: new THREE.Color('#fbbf24'),
          emissiveIntensity: 0.75,
          roughness: 0.15,
          flatShading: true
        });
        for (let i = 0; i < 5; i++) {
          const sh = new THREE.Mesh(new THREE.OctahedronGeometry(0.068, 0), shardMat);
          sh.scale.set(0.65, 1.5, 0.65);
          crystalGroup.add(sh);
          miniShards.push({ mesh: sh, ang: (i / 5) * Math.PI * 2 });
        }

        // 3 Anéis Orbitais Rúnicos Inclinados
        const rings = [];
        const ringCols = ['#fbbf24', '#38bdf8', '#f472b6'];
        for (let r = 0; r < 3; r++) {
          const rMesh = new THREE.Mesh(
            new THREE.TorusGeometry(0.34 + r * 0.07, 0.014, 8, 32),
            new THREE.MeshBasicMaterial({ color: ringCols[r], transparent: true, opacity: 0.88 })
          );
          rMesh.rotation.set(r * 0.75, r * 0.55, r * 0.4);
          crystalGroup.add(rMesh);
          rings.push(rMesh);
        }

        // Aura volumétrica aditiva
        const halo = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: TEX.softGlow,
            color: '#fde047',
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        halo.scale.setScalar(1.85);
        crystalGroup.add(halo);

        // Feixe Celestial Vertical (God-Beam) apontando até o solo
        const beamMat = new THREE.MeshBasicMaterial({
          color: '#7dd3fc',
          transparent: true,
          opacity: 0.24,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        const godBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.55, 14.0, 18, 1, true), beamMat);
        godBeam.position.y = 7.0;
        root.add(godBeam);

        // Alvo luminoso no chão onde a relíquia pousa
        const groundMarker = new THREE.Mesh(
          new THREE.RingGeometry(0.32, 0.56, 32),
          new THREE.MeshBasicMaterial({
            color: '#fbbf24',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.82,
            blending: THREE.AdditiveBlending
          })
        );
        groundMarker.rotation.x = -Math.PI / 2;
        groundMarker.position.y = 0.035;
        root.add(groundMarker);

        // Hitbox invisível ampla para facilitar o clique/toque no celular
        const hitbox = new THREE.Mesh(
          new THREE.SphereGeometry(0.68, 10, 10),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.y = 0.65;
        root.add(hitbox);

        return { root, crystalGroup, mainCrystal, miniShards, rings, halo, godBeam, groundMarker, hitbox };
      }

      // =========================================================================
      // 7. DRAGÕES GUARDIÕES CARTOON & 3 INIMIGOS CARTOON ESTILIZADOS
      // =========================================================================
      function buildDefenderMesh(typeDef) {
        const root = new THREE.Group();
        const body = new THREE.Group();
        body.position.y = 0.42;
        root.add(body);

        const skinMat = new THREE.MeshPhysicalMaterial({
          color: typeDef.col,
          emissive: new THREE.Color(typeDef.accent),
          emissiveIntensity: 0.24,
          roughness: 0.28,
          metalness: 0.14,
          clearcoat: 0.55,
          envMapIntensity: 1.5
        });
        const bellyMat = new THREE.MeshStandardMaterial({ color: '#fef9c3', roughness: 0.45 });
        const wingMat = new THREE.MeshPhysicalMaterial({
          color: typeDef.accent,
          emissive: new THREE.Color(typeDef.col),
          emissiveIntensity: 0.38,
          roughness: 0.22,
          transparent: true,
          opacity: 0.92,
          side: THREE.DoubleSide
        });

        const torso = new THREE.Mesh(
          createTaperedSpline(
            [new THREE.Vector3(-0.22, -0.06, 0), new THREE.Vector3(0.04, 0.04, 0), new THREE.Vector3(0.22, 0.16, 0)],
            [0.14, 0.21, 0.15], 16, 12, true
          ),
          skinMat
        );
        torso.castShadow = true;
        body.add(torso);

        const head = new THREE.Group();
        head.position.set(0.28, 0.34, 0);
        body.add(head);

        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.20, 20, 16), skinMat);
        skull.scale.set(1.18, 0.96, 1.02);
        skull.castShadow = true;
        head.add(skull);

        const snout = new THREE.Mesh(
          createTaperedSpline([new THREE.Vector3(0.10, -0.02, 0), new THREE.Vector3(0.28, -0.03, 0)], [0.105, 0.055], 12, 8, true),
          bellyMat
        );
        head.add(snout);

        [-1, 1].forEach(sd => {
          const horn = new THREE.Mesh(
            createTaperedSpline([new THREE.Vector3(-0.04, 0.14, 0.07 * sd), new THREE.Vector3(-0.18, 0.30, 0.13 * sd)], [0.035, 0.006], 8, 8, true),
            bellyMat
          );
          head.add(horn);

          const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 12), new THREE.MeshBasicMaterial({ color: '#090d16' }));
          sclera.scale.set(0.65, 1.15, 1.0);
          sclera.position.set(0.14, 0.04, 0.13 * sd);
          head.add(sclera);

          const iris = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), new THREE.MeshBasicMaterial({ color: typeDef.col }));
          iris.scale.set(0.65, 1.12, 1.0);
          iris.position.set(0.15, 0.04, 0.135 * sd);
          head.add(iris);

          const shine = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
          shine.position.set(0.165, 0.06, 0.142 * sd);
          head.add(shine);
        });

        const wings = [];
        [-1, 1].forEach(sd => {
          const wPiv = new THREE.Group();
          wPiv.position.set(0.02, 0.16, 0.14 * sd);
          body.add(wPiv);

          const wMem = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), wingMat);
          wMem.scale.set(0.85, 0.12, 1.35);
          wMem.position.set(-0.06, 0.04, 0.28 * sd);
          wMem.castShadow = true;
          wPiv.add(wMem);
          wings.push({ piv: wPiv, sd });
        });

        const tail = new THREE.Mesh(
          createTaperedSpline([new THREE.Vector3(-0.20, -0.05, 0), new THREE.Vector3(-0.48, 0.06, 0)], [0.10, 0.022], 10, 10, true),
          skinMat
        );
        body.add(tail);

        const aura = new THREE.Mesh(
          new THREE.RingGeometry(0.42, 0.54, 32),
          new THREE.MeshBasicMaterial({ color: typeDef.col, side: THREE.DoubleSide, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending })
        );
        aura.rotation.x = -Math.PI / 2;
        aura.position.y = 0.02;
        root.add(aura);

        return { root, body, head, wings, tail };
      }

      // 3 Inimigos Cartoon Estilizados + Estrelinhas de Atordoamento
      function buildCartoonEnemyMesh(kind) {
        const root = new THREE.Group();
        const body = new THREE.Group();
        root.add(body);

        const isGolem = kind === 'golem';
        const isBoss = kind === 'boss';

        const refs = {
          kind, root, body,
          skinMat: null,
          wings: [], arms: [], feet: [],
          crown: null, tail: null,
          stunGroup: null,
          hpBarBg: null, hpBarFill: null
        };

        if (kind === 'imp') {
          const impMat = new THREE.MeshStandardMaterial({
            color: '#2d242c',
            emissive: new THREE.Color('#ff5500'),
            emissiveIntensity: 0.30,
            roughness: 0.52
          });
          const bellyMat = new THREE.MeshStandardMaterial({
            color: '#ff7b29',
            emissive: new THREE.Color('#ff4500'),
            emissiveIntensity: 0.45,
            roughness: 0.45
          });
          const hornMat = new THREE.MeshStandardMaterial({ color: '#fde68a', roughness: 0.3 });
          refs.skinMat = impMat;

          const torso = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 14), impMat);
          torso.scale.set(0.95, 1.08, 1.02);
          torso.position.y = 0.36;
          torso.castShadow = true;
          body.add(torso);

          const belly = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 12), bellyMat);
          belly.scale.set(0.75, 0.95, 0.90);
          belly.position.set(-0.11, 0.33, 0);
          body.add(belly);

          const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), impMat);
          head.position.set(-0.04, 0.68, 0);
          head.castShadow = true;
          body.add(head);

          [-1, 1].forEach(sd => {
            const horn = new THREE.Mesh(
              createTaperedSpline([new THREE.Vector3(-0.02, 0.84, 0.11 * sd), new THREE.Vector3(0.06, 0.98, 0.17 * sd)], [0.036, 0.006], 8, 8, true),
              hornMat
            );
            body.add(horn);

            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), new THREE.MeshBasicMaterial({ color: '#fbbf24' }));
            eye.scale.set(0.65, 1.15, 1.0);
            eye.position.set(-0.22, 0.69, 0.095 * sd);
            body.add(eye);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), new THREE.MeshBasicMaterial({ color: '#140c08' }));
            pupil.position.set(-0.25, 0.69, 0.095 * sd);
            body.add(pupil);

            const arm = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), impMat);
            arm.scale.set(1.3, 0.85, 0.85);
            arm.position.set(-0.06, 0.40, 0.28 * sd);
            body.add(arm);
            refs.arms.push({ mesh: arm, sd });

            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), impMat);
            foot.scale.set(1.35, 0.75, 0.95);
            foot.position.set(-0.04, 0.08, 0.13 * sd);
            foot.castShadow = true;
            body.add(foot);
            refs.feet.push({ mesh: foot, sd });
          });

          const torchStick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.28, 6), hornMat);
          torchStick.position.set(-0.18, 0.46, 0.30);
          torchStick.rotation.z = 0.45;
          body.add(torchStick);

          const torchFlame = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffae34' }));
          torchFlame.position.set(-0.25, 0.58, 0.30);
          body.add(torchFlame);

        } else if (kind === 'golem') {
          const rockMat = new THREE.MeshStandardMaterial({
            map: TEX.darkStoneMap,
            bumpMap: TEX.darkStoneBump,
            bumpScale: 0.04,
            emissive: new THREE.Color('#ff5500'),
            emissiveIntensity: 0.32,
            roughness: 0.72
          });
          const mossMat = new THREE.MeshStandardMaterial({ color: '#3f8a42', roughness: 0.85 });
          refs.skinMat = rockMat;

          const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 2), rockMat);
          boulder.scale.set(1.05, 1.12, 1.18);
          boulder.position.y = 0.52;
          boulder.castShadow = true;
          body.add(boulder);

          const mossCap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), mossMat);
          mossCap.position.set(0, 0.78, 0);
          body.add(mossCap);

          const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
          coreGem.position.set(-0.38, 0.48, 0);
          body.add(coreGem);

          [-1, 1].forEach(sd => {
            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.065, 0.16), rockMat);
            brow.position.set(-0.38, 0.74, 0.15 * sd);
            brow.rotation.x = sd * 0.25;
            body.add(brow);

            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
            eye.position.set(-0.39, 0.66, 0.15 * sd);
            body.add(eye);

            const fist = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 1), rockMat);
            fist.position.set(-0.14, 0.34, 0.52 * sd);
            fist.castShadow = true;
            body.add(fist);
            refs.arms.push({ mesh: fist, sd });

            const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), rockMat);
            pebble.position.set(0.04, 0.88, 0.46 * sd);
            body.add(pebble);

            const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.18, 8), rockMat);
            foot.position.set(-0.04, 0.09, 0.22 * sd);
            foot.castShadow = true;
            body.add(foot);
            refs.feet.push({ mesh: foot, sd });
          });

        } else {
          const bossMat = new THREE.MeshPhysicalMaterial({
            color: '#581c87',
            emissive: new THREE.Color('#e11d48'),
            emissiveIntensity: 0.42,
            roughness: 0.28,
            metalness: 0.25,
            clearcoat: 0.65
          });
          const bellyMat = new THREE.MeshStandardMaterial({ color: '#fda4af', roughness: 0.4 });
          const goldMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.85, roughness: 0.2, emissive: '#f59e0b', emissiveIntensity: 0.4 });
          refs.skinMat = bossMat;

          const torso = new THREE.Mesh(new THREE.SphereGeometry(0.46, 20, 16), bossMat);
          torso.scale.set(1.18, 1.05, 1.02);
          torso.position.y = 0.68;
          torso.castShadow = true;
          body.add(torso);

          const belly = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12), bellyMat);
          belly.scale.set(0.85, 0.95, 0.90);
          belly.position.set(-0.22, 0.64, 0);
          body.add(belly);

          const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), bossMat);
          head.scale.set(1.22, 0.96, 1.04);
          head.position.set(-0.34, 1.12, 0);
          head.castShadow = true;
          body.add(head);

          [-1, 1].forEach(sd => {
            const horn = new THREE.Mesh(
              createTaperedSpline([new THREE.Vector3(-0.26, 1.36, 0.14 * sd), new THREE.Vector3(-0.08, 1.62, 0.24 * sd)], [0.055, 0.008], 8, 8, true),
              goldMat
            );
            body.add(horn);

            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.072, 14, 12), new THREE.MeshBasicMaterial({ color: '#fbbf24' }));
            eye.scale.set(0.65, 1.15, 1.0);
            eye.position.set(-0.62, 1.14, 0.16 * sd);
            body.add(eye);

            const wPiv = new THREE.Group();
            wPiv.position.set(0.04, 0.96, 0.34 * sd);
            body.add(wPiv);
            const wing = new THREE.Mesh(new THREE.SphereGeometry(0.44, 14, 10), new THREE.MeshStandardMaterial({ color: '#be123c', emissive: '#ff1e56', emissiveIntensity: 0.45 }));
            wing.scale.set(0.95, 0.10, 1.45);
            wing.position.set(0.06, 0.08, 0.42 * sd);
            wPiv.add(wing);
            refs.wings.push({ piv: wPiv, sd });

            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), bossMat);
            foot.scale.set(1.4, 0.75, 1.0);
            foot.position.set(-0.10, 0.14, 0.24 * sd);
            foot.castShadow = true;
            body.add(foot);
            refs.feet.push({ mesh: foot, sd });
          });

          const crown = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.032, 8, 24), goldMat);
          crown.rotation.x = Math.PI / 2;
          crown.position.set(-0.34, 1.56, 0);
          body.add(crown);
          refs.crown = crown;

          const tail = new THREE.Mesh(
            createTaperedSpline([new THREE.Vector3(0.38, 0.56, 0), new THREE.Vector3(0.88, 0.72, 0)], [0.16, 0.025], 10, 10, true),
            bossMat
          );
          body.add(tail);
          refs.tail = tail;
        }

        // Estrelinhas de Atordoamento (visíveis quando arremessados pela Mina do Muro)
        const stunGroup = new THREE.Group();
        stunGroup.position.y = isBoss ? 1.68 : isGolem ? 1.05 : 0.96;
        stunGroup.visible = false;
        body.add(stunGroup);
        for (let s = 0; s < 3; s++) {
          const a = (s / 3) * Math.PI * 2;
          const star = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.065, 0),
            new THREE.MeshBasicMaterial({ color: '#fde047' })
          );
          star.position.set(Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28);
          stunGroup.add(star);
        }
        refs.stunGroup = stunGroup;

        // Barra de Vida 3D Billboard
        const barW = isBoss ? 1.15 : isGolem ? 0.78 : 0.62;
        const barY = isBoss ? 1.92 : isGolem ? 1.26 : 1.16;

        const hpBarBg = new THREE.Mesh(
          new THREE.PlaneGeometry(barW, 0.09),
          new THREE.MeshBasicMaterial({ color: '#070306', side: THREE.DoubleSide })
        );
        hpBarBg.position.y = barY;
        root.add(hpBarBg);

        const hpBarFill = new THREE.Mesh(
          new THREE.PlaneGeometry(barW - 0.04, 0.06),
          new THREE.MeshBasicMaterial({ color: isBoss ? '#fbbf24' : isGolem ? '#38bdf8' : '#fb923c', side: THREE.DoubleSide })
        );
        hpBarFill.position.set(0, barY, 0.01);
        root.add(hpBarFill);

        refs.hpBarBg = hpBarBg;
        refs.hpBarFill = hpBarFill;
        return refs;
      }

      // =========================================================================
      // 8. GERENCIADOR DE EFEITOS 3D (EXPLOSÕES, METEOROS AMBIENTAIS & CHUVA ESTELAR)
      // =========================================================================
      function createBattleFX(scene, onDamageImpactFn) {
        const particles = [];
        const rings = [];
        const meteors = [];
        const craters = [];

        function spawnParticle(pos, vel, colorHex, size = 0.26, life = 0.6, grav = 0, additive = true) {
          if (particles.length >= 180) return;
          const sp = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: additive ? TEX.softGlow : TEX.volumetricMistTex,
              color: colorHex,
              transparent: true,
              opacity: additive ? 0.95 : 0.68,
              depthWrite: false,
              blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
            })
          );
          sp.position.copy(pos);
          sp.scale.setScalar(size);
          scene.add(sp);
          particles.push({ sp, vel, age: 0, max: life, s0: size, grav, additive });
        }

        function spawnShockRing(pos, colorHex, maxScale = 5.5) {
          const mat = new THREE.MeshBasicMaterial({
            color: colorHex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.34, 32), mat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(pos.x, 0.05, pos.z);
          scene.add(ring);
          rings.push({ mesh: ring, mat, age: 0, max: 0.55, maxScale });
        }

        // Explosão massiva de Mina do Muro ou Meteoro (sem PointLight dinâmico para evitar recompilação de shaders WebGL)
        function spawnExplosion(pos, radiusScale = 1.0, primaryCol = '#ff6a1a', secondaryCol = '#38bdf8') {
          spawnShockRing(pos, primaryCol, 5.8 * radiusScale);
          spawnShockRing(pos, secondaryCol, 3.8 * radiusScale);

          spawnParticle(
            pos.clone().add(new THREE.Vector3(0, 0.45, 0)),
            new THREE.Vector3(0, 0.4, 0),
            primaryCol,
            3.2 * radiusScale,
            0.22,
            0,
            true
          );

          for (let i = 0; i < 16; i++) {
            const a = Math.random() * Math.PI * 2;
            const spd = (1.6 + Math.random() * 4.2) * radiusScale;
            spawnParticle(
              pos.clone().add(new THREE.Vector3(0, 0.35, 0)),
              new THREE.Vector3(Math.cos(a) * spd, 2.2 + Math.random() * 3.8, Math.sin(a) * spd),
              i % 3 === 0 ? secondaryCol : (i % 2 === 0 ? primaryCol : '#fde047'),
              0.38 * radiusScale,
              0.65,
              4.2,
              true
            );
          }

          for (let s = 0; s < 5; s++) {
            const a = Math.random() * Math.PI * 2;
            spawnParticle(
              pos.clone().add(new THREE.Vector3(Math.cos(a) * 0.3, 0.4, Math.sin(a) * 0.3)),
              new THREE.Vector3(Math.cos(a) * 0.9, 1.4 + Math.random() * 1.4, Math.sin(a) * 0.9),
              '#271c24',
              1.15 * radiusScale,
              1.0,
              -0.3,
              false
            );
          }
        }

        /**
         * Lança um meteoro vulcânico esculpido do céu até targetPos.
         * @param {boolean} dealsDamage - false para meteoros ambientais visuais; true para Chuva Estelar!
         */
        function launchMeteor(targetPos, dealsDamage = false, dmgVal = 250) {
          const rock = createSculptedMeteorRock(dealsDamage ? 0.46 : 0.38);
          const startPos = targetPos.clone().add(new THREE.Vector3(3.6, 12.5, -2.2));
          rock.position.copy(startPos);
          scene.add(rock);

          const plasmaHalo = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: TEX.softGlow,
              color: dealsDamage ? '#e879f9' : '#ff5500',
              transparent: true,
              opacity: 0.95,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            })
          );
          plasmaHalo.scale.setScalar(dealsDamage ? 2.4 : 1.9);
          rock.add(plasmaHalo);

          // Marcador rúnico no chão
          const markerMat = new THREE.MeshBasicMaterial({
            color: dealsDamage ? '#e879f9' : '#ff6a1a',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
          });
          const marker = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.68, 28), markerMat);
          marker.rotation.x = -Math.PI / 2;
          marker.position.set(targetPos.x, 0.03, targetPos.z);
          scene.add(marker);

          meteors.push({
            rock, marker, markerMat,
            startPos, targetPos: targetPos.clone(),
            dealsDamage, dmgVal,
            age: 0, dur: 0.78,
            trailAcc: 0
          });
        }

        function update(dt) {
          // Partículas
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.age += dt;
            if (p.age >= p.max) {
              scene.remove(p.sp);
              p.sp.material.dispose();
              particles.splice(i, 1);
              continue;
            }
            const u = p.age / p.max;
            p.vel.y -= p.grav * dt;
            p.sp.position.addScaledVector(p.vel, dt);
            const scaleMul = p.additive ? (1.0 - u * 0.52) : (1.0 + u * 1.15);
            p.sp.scale.setScalar(p.s0 * scaleMul);
            p.sp.material.opacity = (1.0 - u) * (p.additive ? 0.95 : 0.65);
          }

          // Ondas de choque
          for (let i = rings.length - 1; i >= 0; i--) {
            const r = rings[i];
            r.age += dt;
            if (r.age >= r.max) {
              scene.remove(r.mesh);
              r.mesh.geometry.dispose();
              r.mat.dispose();
              rings.splice(i, 1);
              continue;
            }
            const u = r.age / r.max;
            const sc = 1.0 + u * r.maxScale;
            r.mesh.scale.set(sc, sc, 1);
            r.mat.opacity = (1.0 - u) * 0.90;
          }

          // Meteoros caindo
          for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i];
            m.age += dt;
            const u = Math.min(1, m.age / m.dur);
            const ease = u * u;
            m.rock.position.lerpVectors(m.startPos, m.targetPos, ease);
            m.rock.rotation.x += 7 * dt;
            m.rock.rotation.z += 9 * dt;
            m.marker.rotation.z += 4 * dt;
            m.markerMat.opacity = 0.35 + u * 0.55;

            m.trailAcc += dt * 55;
            while (m.trailAcc >= 1) {
              m.trailAcc -= 1;
              spawnParticle(
                m.rock.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.25, 0.1, (Math.random() - 0.5) * 0.25)),
                new THREE.Vector3(0.4, 0.8 + Math.random(), -0.3),
                m.dealsDamage ? '#e879f9' : '#ff7b00',
                0.42,
                0.38,
                0,
                true
              );
              spawnParticle(
                m.rock.position.clone(),
                new THREE.Vector3(0.2, 0.5, -0.2),
                '#291d24',
                0.78,
                0.65,
                0,
                false
              );
            }

            if (u >= 1) {
              spawnExplosion(
                m.targetPos,
                m.dealsDamage ? 1.15 : 0.88,
                m.dealsDamage ? '#e879f9' : '#ff5500',
                m.dealsDamage ? '#38bdf8' : '#ffd166'
              );
              craters.push(createCoolingCraterDecal(scene, m.targetPos, m.dealsDamage ? 1.35 : 1.05));

              if (onDamageImpactFn) {
                onDamageImpactFn(m.targetPos, m.dealsDamage, m.dmgVal);
              }

              scene.remove(m.rock);
              scene.remove(m.marker);
              m.marker.geometry.dispose();
              m.markerMat.dispose();
              meteors.splice(i, 1);
            }
          }

          // Crateras esfriando no chão
          for (let i = craters.length - 1; i >= 0; i--) {
            const c = craters[i];
            c.age += dt;
            if (c.age >= c.maxAge) {
              scene.remove(c.mesh);
              c.mesh.geometry.dispose();
              c.mat.dispose();
              craters.splice(i, 1);
              continue;
            }
            c.u.uCool.value = c.age / c.maxAge;
          }
        }

        return { spawnParticle, spawnShockRing, spawnExplosion, launchMeteor, update };
      }

      // =========================================================================
      // 9. ÁUDIO PROCEDURAL (WEB AUDIO API)
      // =========================================================================
window.VolcanicMap3D = {
  ROWS, COLS, CELL_W, CELL_D, GRID_X0, GRID_Z0, LAVA_X, WALL_X, MIST_X,
  cellToWorld, terrainHeight, TEX,
  buildVolcanicPMREM, buildVolcanicSkyAndRidges, buildVolcanicBattlefield,
  createSculptedMeteorRock, createCoolingCraterDecal, buildGiantStellarRelicMesh,
  buildCartoonEnemyMesh, createBattleFX
};
})();
