// ============================================================================
// PREVIEW ALL 30 DRAGONS — UNIQUE MODELS, MULTI-TONE PROCEDURAL SKINS,
// EPIC SUMMONING RITUAL & 60 LONG-RANGE SHADER/SPRITE ATTACKS (ZERO PRIMITIVES)
// ============================================================================
(function () {
  'use strict';

  // ── 30 CANONICAL DRAGONS WITH DISTINCT GLBs, ANATOMICAL SCULPTING & RICH SKINS ──
  // Every dragon uses a specific GLB + organic bone/vertex proportion sculpt (`morph`)
  // + rich multi-layered procedural skin texture (`skin`) so NO two dragons share the
  // same silhouette or flat color, and ZERO basic geometric shapes are attached.
  const ZSP_ALL30 = [
    // ── COMUNS (8) ──
    {
      id: 'faisca', name: 'Dragão Faísca', rarity: 'Comum', elem: 'Fogo',
      c1: '#ff6b2b', c2: '#ffd166', cost: 2, hp: 620, dps: 88, cd: 1.5,
      glb: 'ember', yaw: 0, fieldScale: 0.86,
      morph: { wingSpan: 1.0, tailStretch: 1.05, headScale: 1.08, crestCurl: 0.12 },
      skin: { pattern: 'ember_scales', belly: '#ffe5a3', back: '#7c1908', veins: '#ff9e00', glow: 0.35 },
      atk1: { name: 'Cuspe de Brasas', icon: '🔥', style: 'ember_volley' },
      atk2: { name: 'Rastro Piroclástico', icon: '☄️', style: 'pyro_carpet' }
    },
    {
      id: 'chamas', name: 'Dragão Chamejante', rarity: 'Comum', elem: 'Fogo',
      c1: '#ef4444', c2: '#fb923c', cost: 2, hp: 680, dps: 94, cd: 1.5,
      // Fixed yaw: chamas.glb native forward is -Z, so +Math.PI/2 makes it face +X (toward enemies!)
      glb: 'chamas', yaw: 0, fieldScale: 0.94,
      morph: { wingSpan: 1.12, neckArch: 0.18, hornSweep: 1.25 },
      skin: { pattern: 'flame_stripes', belly: '#fcd34d', back: '#991b1b', veins: '#ff5500', glow: 0.45 },
      atk1: { name: 'Jato Incandescente', icon: '🔥', style: 'flame_stream' },
      atk2: { name: 'Erupção Solar', icon: '🌋', style: 'magma_pillars' }
    },
    {
      id: 'broto', name: 'Dragão Broto', rarity: 'Comum', elem: 'Biomassa',
      c1: '#4ade80', c2: '#a3e635', cost: 2, hp: 710, dps: 80, cd: 1.6,
      glb: 'marsh', yaw: 0, fieldScale: 0.90,
      morph: { bodyPlump: 1.12, tailClub: 1.2, headScale: 1.05 },
      skin: { pattern: 'moss_bark', belly: '#d9f99d', back: '#14532d', veins: '#84cc16', glow: 0.25 },
      atk1: { name: 'Rajada de Esporos', icon: '🌿', style: 'spore_barrage' },
      atk2: { name: 'Vinha Estranguladora', icon: '🌱', style: 'vine_whip_lane' }
    },
    {
      id: 'brisa', name: 'Dragão da Brisa', rarity: 'Comum', elem: 'Vento',
      c1: '#38bdf8', c2: '#e0f2fe', cost: 2, hp: 590, dps: 92, cd: 1.35,
      glb: 'sopro', yaw: 0, fieldScale: 0.92,
      morph: { wingSpan: 1.22, bodySlender: 0.88, tailStretch: 1.25 },
      skin: { pattern: 'feather_wind', belly: '#f0f9ff', back: '#0369a1', veins: '#7dd3fc', glow: 0.4 },
      atk1: { name: 'Lâmina de Vento', icon: '🌪️', style: 'wind_crescents' },
      atk2: { name: 'Ciclone Cortante', icon: '💨', style: 'tornado_sweep' }
    },
    {
      id: 'musgo', name: 'Dragão de Musgo', rarity: 'Comum', elem: 'Terra',
      c1: '#65a30d', c2: '#d97706', cost: 3, hp: 820, dps: 84, cd: 1.7,
      glb: 'mini', yaw: 0, fieldScale: 0.96,
      morph: { backRidge: 1.35, jawWidth: 1.18, limbBulk: 1.22 },
      skin: { pattern: 'stone_moss', belly: '#bef264', back: '#365314', veins: '#fbbf24', glow: 0.28 },
      atk1: { name: 'Deslizamento de Pedras', icon: '🪨', style: 'boulder_ricochet' },
      atk2: { name: 'Fenda de Raízes Antigas', icon: '🌲', style: 'root_rupture_lane' }
    },
    {
      id: 'relampago', name: 'Dragão Relâmpago', rarity: 'Comum', elem: 'Raio',
      c1: '#facc15', c2: '#38bdf8', cost: 3, hp: 640, dps: 105, cd: 1.4,
      glb: 'wyvern', yaw: 0, fieldScale: 0.94,
      morph: { wingSweep: 1.25, neckStretch: 1.15, spikeSharp: 1.3 },
      skin: { pattern: 'voltaic_zig', belly: '#fef08a', back: '#1e3a8a', veins: '#fde047', glow: 0.55 },
      atk1: { name: 'Arco Voltaico', icon: '⚡', style: 'chain_lightning' },
      atk2: { name: 'Tempestade de Raios', icon: '🌩️', style: 'thunder_corridor' }
    },
    {
      id: 'hamster', name: 'Dragão Hamster', rarity: 'Comum', elem: 'Terra',
      c1: '#fb923c', c2: '#fde68a', cost: 2, hp: 750, dps: 86, cd: 1.45,
      // Fixed scale: hamster.glb is spherical and fills its bounding box completely; 0.48x makes it cute & proportional!
      glb: 'hamster', yaw: 0, fieldScale: 0.48,
      morph: { cheekPuff: 1.15, earPerk: 1.1 },
      skin: { pattern: 'fur_stripes', belly: '#fffbeb', back: '#b45309', veins: '#f59e0b', glow: 0.2 },
      atk1: { name: 'Metralhadora de Sementes', icon: '🌰', style: 'acorn_gatling' },
      atk2: { name: 'Avalanche Dourada', icon: '🐹', style: 'giant_seed_stampede' }
    },
    {
      id: 'peixe', name: 'Dragão Marinho', rarity: 'Comum', elem: 'Água',
      c1: '#06b6d4', c2: '#3b82f6', cost: 2, hp: 670, dps: 90, cd: 1.5,
      glb: 'peixe', yaw: 0, fieldScale: 0.88,
      morph: { finFlare: 1.28, tailWave: 1.2 },
      skin: { pattern: 'koi_scales', belly: '#cffafe', back: '#0e7490', veins: '#22d3ee', glow: 0.38 },
      atk1: { name: 'Jato Pressurizado', icon: '💧', style: 'hydro_lance' },
      atk2: { name: 'Turbilhão de Espuma', icon: '🌊', style: 'tidal_wave_lane' }
    },

    // ── RAROS (9) ──
    {
      id: 'rubi', name: 'Dragão Rubi', rarity: 'Raro', elem: 'Cristal',
      c1: '#e11d48', c2: '#fda4af', cost: 3, hp: 890, dps: 118, cd: 1.55,
      glb: 'fire', yaw: 0, fieldScale: 0.96,
      morph: { dorsalFacet: 1.28, wingSpan: 1.14, hornCrown: 1.22 },
      skin: { pattern: 'ruby_facets', belly: '#fecdd3', back: '#881337', veins: '#fb7185', glow: 0.55 },
      atk1: { name: 'Feixe de Rubi', icon: '💎', style: 'ruby_laser' },
      atk2: { name: 'Chuva de Cristais Carmesim', icon: '♦️', style: 'crimson_crystal_storm' }
    },
    {
      id: 'mare', name: 'Dragão da Maré', rarity: 'Raro', elem: 'Água',
      c1: '#0284c7', c2: '#38bdf8', cost: 3, hp: 920, dps: 112, cd: 1.6,
      glb: 'blue', yaw: 0, fieldScale: 0.96,
      morph: { finCrest: 1.32, bodySlender: 0.92, tailFin: 1.35 },
      skin: { pattern: 'ocean_currents', belly: '#bae6fd', back: '#0c4a6e', veins: '#38bdf8', glow: 0.45 },
      atk1: { name: 'Torrente Abissal', icon: '🌊', style: 'abyssal_torrent' },
      atk2: { name: 'Maelstrom Oceânico', icon: '🌀', style: 'ocean_maelstrom' }
    },
    {
      id: 'esmeralda', name: 'Dragão Esmeralda', rarity: 'Raro', elem: 'Cristal',
      c1: '#10b981', c2: '#6ee7b7', cost: 3, hp: 960, dps: 115, cd: 1.6,
      glb: 'green', yaw: 0, fieldScale: 0.98,
      morph: { wingArmour: 1.2, chestBroad: 1.18, tailSpike: 1.3 },
      skin: { pattern: 'emerald_veins', belly: '#a7f3d0', back: '#064e3b', veins: '#34d399', glow: 0.5 },
      atk1: { name: 'Disparo Esmeraldino', icon: '💚', style: 'emerald_resonance' },
      atk2: { name: 'Prisão de Jade', icon: '❇️', style: 'jade_obelisk_wave' }
    },
    {
      id: 'geada', name: 'Dragão da Geada', rarity: 'Raro', elem: 'Gelo',
      c1: '#38bdf8', c2: '#f0f9ff', cost: 3, hp: 940, dps: 114, cd: 1.6,
      glb: 'mountain', yaw: 0, fieldScale: 0.98,
      morph: { shoulderBulk: 1.25, frostCrown: 1.3, wingSweep: 1.15 },
      skin: { pattern: 'glacier_cracks', belly: '#e0f2fe', back: '#075985', veins: '#7dd3fc', glow: 0.52 },
      atk1: { name: 'Lanças de Permafrost', icon: '❄️', style: 'frost_javelins' },
      atk2: { name: 'Nevasca Congelante', icon: '🌨️', style: 'blizzard_corridor' }
    },
    {
      id: 'prisma', name: 'Dragão Prisma', rarity: 'Raro', elem: 'Luz',
      c1: '#e879f9', c2: '#38bdf8', cost: 4, hp: 880, dps: 126, cd: 1.5,
      glb: 'ulyssan', yaw: 0, fieldScale: 0.98,
      morph: { wingRibbon: 1.28, neckGrace: 1.2, tailPlume: 1.3 },
      skin: { pattern: 'prismatic_iridescent', belly: '#fdf4ff', back: '#581c87', veins: '#f472b6', glow: 0.65 },
      atk1: { name: 'Raio Refratado', icon: '🌈', style: 'prism_refraction' },
      atk2: { name: 'Espectro Boreal', icon: '✨', style: 'rainbow_aurora_beam' }
    },
    {
      id: 'forja', name: 'Dragão da Forja', rarity: 'Raro', elem: 'Metal',
      c1: '#f97316', c2: '#94a3b8', cost: 4, hp: 1080, dps: 120, cd: 1.75,
      glb: 'robo', yaw: 0, fieldScale: 0.96,
      morph: { jawBulk: 1.2, shoulderPlate: 1.25, tailPiston: 1.15 },
      skin: { pattern: 'damascus_steel', belly: '#fb923c', back: '#334155', veins: '#ffedd5', glow: 0.58 },
      atk1: { name: 'Bomba de Escória Fundida', icon: '⚙️', style: 'molten_slag_cannon' },
      atk2: { name: 'Martelo Vulcânico da Bigorna', icon: '🔨', style: 'forge_anvil_shockwave' }
    },
    {
      id: 'morcego_noturno', name: 'Morcego Noturno', rarity: 'Raro', elem: 'Sombra',
      c1: '#9333ea', c2: '#f43f5e', cost: 3, hp: 860, dps: 124, cd: 1.45,
      glb: 'demon', yaw: 0, fieldScale: 0.95,
      morph: { earBat: 1.38, wingMembrane: 1.32, bodyLean: 0.86 },
      skin: { pattern: 'velvet_night', belly: '#fda4af', back: '#2e1065', veins: '#e11d48', glow: 0.52 },
      atk1: { name: 'Pulso Ultrassônico', icon: '🦇', style: 'ultrasonic_rings' },
      atk2: { name: 'Enxame de Sombras', icon: '🌑', style: 'shadow_bat_swarm' }
    },
    {
      id: 'guardiao_botanico', name: 'Guardião Botânico', rarity: 'Raro', elem: 'Biomassa',
      c1: '#16a34a', c2: '#facc15', cost: 4, hp: 1120, dps: 110, cd: 1.7,
      // Uses its dedicated guardiao.glb with rich ancient wood + glowing flower veins texture!
      glb: 'guardiao', yaw: 0, fieldScale: 0.98,
      morph: { canopyHorns: 1.28, shoulderRoot: 1.22, tailVine: 1.18 },
      skin: { pattern: 'ancient_sylvan', belly: '#fef08a', back: '#14532d', veins: '#4ade80', glow: 0.48 },
      atk1: { name: 'Lança Fotossintética', icon: '🍃', style: 'solar_leaf_lance' },
      atk2: { name: 'Despertar da Floresta Ancestral', icon: '🌳', style: 'world_tree_eruption' }
    },
    {
      id: 'sereia_glacial', name: 'Sereia Glacial', rarity: 'Raro', elem: 'Gelo',
      c1: '#06b6d4', c2: '#c084fc', cost: 4, hp: 910, dps: 122, cd: 1.5,
      // Uses icy.glb with custom siren fin sculpt & aurora pearl skin!
      glb: 'icy', yaw: 0, fieldScale: 0.98,
      morph: { sirenFin: 1.35, neckGrace: 1.24, tailRibbon: 1.38 },
      skin: { pattern: 'siren_aurora', belly: '#f5d0fe', back: '#164e63', veins: '#67e8f9', glow: 0.6 },
      atk1: { name: 'Canto de Gelo Cortante', icon: '🧜‍♀️', style: 'siren_frost_aria' },
      atk2: { name: 'Maré Zero Absoluto', icon: '❄️', style: 'cryo_tsunami' }
    },

    // ── ÉPICOS (7) ──
    {
      id: 'aurora', name: 'Dragão da Aurora', rarity: 'Épico', elem: 'Luz',
      c1: '#fb7185', c2: '#fde047', cost: 4, hp: 1240, dps: 148, cd: 1.5,
      // Uses fenix.glb with celestial dawn plume proportions!
      glb: 'fenix', yaw: 0, fieldScale: 1.02,
      morph: { wingPlume: 1.26, crestHalo: 1.3, tailStreamer: 1.35 },
      skin: { pattern: 'celestial_dawn', belly: '#fef9c3', back: '#9d174d', veins: '#f43f5e', glow: 0.7 },
      atk1: { name: 'Raio Alvorada', icon: '🌅', style: 'dawn_solar_ray' },
      atk2: { name: 'Supernova Boreal', icon: '☀️', style: 'boreal_curtain_blast' }
    },
    {
      id: 'tempestade', name: 'Dragão da Tempestade', rarity: 'Épico', elem: 'Raio',
      c1: '#3b82f6', c2: '#a855f7', cost: 4, hp: 1280, dps: 154, cd: 1.45,
      // Distinct from aurora: uses red.glb sculpted with swept thunder-wings & tempest fulgurite skin!
      glb: 'red', yaw: 0, fieldScale: 1.04,
      morph: { wingSweep: 1.34, hornLightning: 1.38, neckArch: 0.25 },
      skin: { pattern: 'storm_fulgurite', belly: '#e0e7ff', back: '#1e1b4b', veins: '#60a5fa', glow: 0.68 },
      atk1: { name: 'Lança de Fulgurito', icon: '⚡', style: 'fulgurite_spear' },
      atk2: { name: 'Furacão Elétrico', icon: '⛈️', style: 'storm_vortex_lane' }
    },
    {
      id: 'necro', name: 'Dragão Necstelar', rarity: 'Épico', elem: 'Sombra',
      c1: '#a855f7', c2: '#2dd4bf', cost: 5, hp: 1320, dps: 162, cd: 1.55,
      glb: 'elder', yaw: 0, fieldScale: 1.04,
      morph: { ribVault: 1.25, hornCrown: 1.42, tailWhip: 1.32 },
      skin: { pattern: 'necro_lich', belly: '#99f6e4', back: '#1f1235', veins: '#2dd4bf', glow: 0.72 },
      atk1: { name: 'Chama Espiritual', icon: '💀', style: 'soulfire_stream' },
      atk2: { name: 'Exército dos Condenados', icon: '👻', style: 'wraith_legion_march' }
    },
    {
      id: 'obsidiana', name: 'Dragão de Obsidiana', rarity: 'Épico', elem: 'Terra',
      c1: '#7c3aed', c2: '#f97316', cost: 5, hp: 1480, dps: 150, cd: 1.65,
      glb: 'cartoon', yaw: 0, fieldScale: 1.04,
      morph: { armorCrag: 1.32, jawHeavy: 1.26, dorsalSpire: 1.38 },
      skin: { pattern: 'obsidian_magma', belly: '#fdba74', back: '#18181b', veins: '#a855f7', glow: 0.65 },
      atk1: { name: 'Estilhaço de Vidro Vulcânico', icon: '🖤', style: 'obsidian_barrage' },
      atk2: { name: 'Cataclismo Basáltico', icon: '🌋', style: 'basalt_tectonic_wave' }
    },
    {
      id: 'demonio_cinzas', name: 'Demônio das Cinzas', rarity: 'Épico', elem: 'Fogo',
      c1: '#dc2626', c2: '#f59e0b', cost: 5, hp: 1360, dps: 168, cd: 1.5,
      glb: 'dark', yaw: 0, fieldScale: 1.05,
      morph: { hornDemon: 1.45, shoulderSpikes: 1.3, wingTorn: 1.22 },
      skin: { pattern: 'ash_hellfire', belly: '#fde047', back: '#1c1917', veins: '#ef4444', glow: 0.75 },
      atk1: { name: 'Corte Infernal em X', icon: '🔥', style: 'hellfire_cross_slash' },
      atk2: { name: 'Juízo de Magma Abissal', icon: '☄️', style: 'abyssal_magma_judgment' }
    },
    {
      id: 'colosso_obsidiana', name: 'Colosso de Obsidiana', rarity: 'Épico', elem: 'Metal',
      c1: '#f59e0b', c2: '#ef4444', cost: 5, hp: 1650, dps: 158, cd: 1.75,
      glb: 'tilt', yaw: 0, fieldScale: 1.08,
      morph: { colossusBulk: 1.38, shoulderCrag: 1.42, tailMace: 1.35 },
      skin: { pattern: 'colossus_runes', belly: '#fef08a', back: '#27272a', veins: '#f97316', glow: 0.72 },
      atk1: { name: 'Onda Sísmica Vulcânica', icon: '🪨', style: 'seismic_fissure_wave' },
      atk2: { name: 'Chuva de Monólitos Incandescentes', icon: '☄️', style: 'monolith_meteor_cataclysm' }
    },
    {
      id: 'arquimago_astral', name: 'Arquimago Astral', rarity: 'Épico', elem: 'Arcano',
      c1: '#6366f1', c2: '#facc15', cost: 5, hp: 1220, dps: 174, cd: 1.45,
      glb: 'golden', yaw: 0, fieldScale: 1.02,
      morph: { crestCrown: 1.4, wingMantle: 1.28, neckScepter: 1.22, splineAnatomy: 'astral_astrolabe' },
      skin: { pattern: 'astral_constellation', belly: '#fef08a', back: '#1e1b4b', veins: '#c084fc', glow: 0.8 },
      atk1: { name: 'Cometa do Astrolábio', icon: '🔮', style: 'astrolabe_comet' },
      atk2: { name: 'Convergência de Constelações', icon: '🌌', style: 'constellation_sky_array' }
    },

    // ── LENDÁRIOS (6) ──
    {
      id: 'solar', name: 'Dragão Solar Soberano', rarity: 'Lendário', elem: 'Luz',
      c1: '#f59e0b', c2: '#fef08a', cost: 6, hp: 1850, dps: 215, cd: 1.45,
      glb: 'golden', yaw: 0, fieldScale: 1.12,
      morph: { solarHalo: 1.45, wingSpan: 1.35, tailSunburst: 1.32 },
      skin: { pattern: 'sovereign_sun', belly: '#ffffff', back: '#b45309', veins: '#fde047', glow: 0.9 },
      atk1: { name: 'Lança Heliocêntrica', icon: '☀️', style: 'helios_spear_beam' },
      atk2: { name: 'Coroa de Prominência Solar', icon: '🌟', style: 'solar_prominence_cataclysm' }
    },
    {
      id: 'vazio', name: 'Dragão do Vazio', rarity: 'Lendário', elem: 'Sombra',
      c1: '#7e22ce', c2: '#f43f5e', cost: 6, hp: 1780, dps: 228, cd: 1.4,
      glb: 'alien', yaw: 0, fieldScale: 1.12,
      morph: { voidWings: 1.42, abyssHorns: 1.48, neckStretch: 1.26, splineAnatomy: 'void_tendrils' },
      skin: { pattern: 'void_singularity', belly: '#f43f5e', back: '#090514', veins: '#c084fc', glow: 0.88 },
      atk1: { name: 'Rasgo Dimensional', icon: '🕳️', style: 'dimensional_rift_beam' },
      atk2: { name: 'Horizonte de Eventos', icon: '🌌', style: 'black_hole_collapse' }
    },
    {
      id: 'ancestral', name: 'Dragão Ancestral', rarity: 'Lendário', elem: 'Terra',
      c1: '#10b981', c2: '#fbbf24', cost: 6, hp: 2100, dps: 198, cd: 1.6,
      glb: 'elder', yaw: 0, fieldScale: 1.14,
      morph: { elderAntlers: 1.48, ancientBack: 1.36, tailLong: 1.35, splineAnatomy: 'gaia_antlers' },
      skin: { pattern: 'primordial_gaia', belly: '#fde68a', back: '#064e3b', veins: '#34d399', glow: 0.82 },
      atk1: { name: 'Sopro Primordial de Gaia', icon: '🐉', style: 'gaia_primordial_breath' },
      atk2: { name: 'Despertar dos Continentes', icon: '🌍', style: 'continental_fault_eruption' }
    },
    {
      id: 'vigia', name: 'Vigia do Eterno', rarity: 'Lendário', elem: 'Arcano',
      c1: '#38bdf8', c2: '#f472b6', cost: 6, hp: 1920, dps: 220, cd: 1.45,
      // watcher.glb fixed! Outlier Sword4 nodes are ignored in bbox & transparent BLEND forced opaque
      glb: 'vigia', yaw: 0, fieldScale: 1.12,
      morph: { seraphWings: 1.22, crownTall: 1.25 },
      skin: { pattern: 'eternal_watcher', belly: '#e0f2fe', back: '#1e1b4b', veins: '#38bdf8', glow: 0.88 },
      atk1: { name: 'Julgamento do Olho Eterno', icon: '👁️', style: 'eternal_gaze_beam' },
      atk2: { name: 'Decreto das Espadas Celestiais', icon: '⚔️', style: 'celestial_blade_tempest' }
    },
    {
      id: 'primordial', name: 'Dragão Primordial', rarity: 'Lendário', elem: 'Fogo',
      c1: '#ef4444', c2: '#facc15', cost: 7, hp: 2250, dps: 235, cd: 1.5,
      glb: 'fire', yaw: 0, fieldScale: 1.16,
      morph: { titanWings: 1.44, crownSpikes: 1.46, jawTitan: 1.3, splineAnatomy: 'primordial_horns_manes' },
      skin: { pattern: 'core_genesis', belly: '#fef08a', back: '#450a0a', veins: '#fb923c', glow: 0.92 },
      atk1: { name: 'Chama da Gênese', icon: '🔥', style: 'genesis_hellstream' },
      atk2: { name: 'Ragnarok Vulcânico', icon: '☄️', style: 'ragnarok_supernova_lane' }
    },
    {
      id: 'cestille', name: 'Dragão Real de Cestille', rarity: 'Lendário', elem: 'Cristal',
      c1: '#c084fc', c2: '#fbbf24', cost: 7, hp: 2400, dps: 248, cd: 1.4,
      glb: 'ulyssan', yaw: 0, fieldScale: 1.16,
      morph: { royalCrest: 1.46, wingGrand: 1.4, tailRegal: 1.38, splineAnatomy: 'royal_seraph_ribbons' },
      skin: { pattern: 'royal_cestille', belly: '#fef3c7', back: '#3b0764', veins: '#fbbf24', glow: 0.95 },
      atk1: { name: 'Feixe Imperial de Cestille', icon: '👑', style: 'royal_cestille_beam' },
      atk2: { name: 'Soberania da Árvore-Mãe', icon: '✨', style: 'cestille_sovereign_judgment' }
    }
  ];

  // ── RICH PROCEDURAL MULTI-LAYERED DRAGON SKIN TEXTURES (512x512) ──
  // Generates Albedo + Bump + Emissive maps with dorsal-to-ventral counter-shading,
  // reptilian/feathered/crystalline scale lattices, organic stripes/mottling, and
  // glowing elemental veins/runes — NEVER monochromatic!
  const _skinCache = new Map();

  function hexToRgb(hex) {
    const h = String(hex || '#ffffff').replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16) || 0xffffff;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function makeDragonDetailedSkinTex(sp, THREE) {
    if (_skinCache.has(sp.id)) return _skinCache.get(sp.id);

    const W = 512, H = 512;
    const cAlbedo = document.createElement('canvas');
    cAlbedo.width = W; cAlbedo.height = H;
    const ctx = cAlbedo.getContext('2d');

    const cBump = document.createElement('canvas');
    cBump.width = W; cBump.height = H;
    const bctx = cBump.getContext('2d');

    const cEmissive = document.createElement('canvas');
    cEmissive.width = W; cEmissive.height = H;
    const ectx = cEmissive.getContext('2d');

    const sk = sp.skin || {};
    const pat = sk.pattern || 'ember_scales';
    const backCol = sk.back || '#2a1215';
    const midCol = sp.c1 || '#ff6b2b';
    const bellyCol = sk.belly || '#ffe5a3';
    const veinCol = sk.veins || sp.c2 || '#ffd166';

    // 1. Base Dorsal-to-Ventral Counter-Shading Gradient + Wing Membrane Zones
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0.0, backCol);
    bgGrad.addColorStop(0.38, midCol);
    bgGrad.addColorStop(0.72, backCol);
    bgGrad.addColorStop(1.0, bellyCol);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle lateral shading for wing/flank membranes
    const radGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, 30, W * 0.5, H * 0.5, W * 0.65);
    radGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
    radGrad.addColorStop(0.55, 'rgba(0,0,0,0.0)');
    radGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, W, H);

    // Base neutral bump
    bctx.fillStyle = '#808080';
    bctx.fillRect(0, 0, W, H);

    // Base black emissive
    ectx.fillStyle = '#000000';
    ectx.fillRect(0, 0, W, H);

    // Deterministic PRNG per dragon species
    let seed = 1337;
    for (let i = 0; i < sp.id.length; i++) seed = (seed * 33 + sp.id.charCodeAt(i)) | 0;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) | 0;
      return ((seed >>> 0) / 4294967296);
    };

    // 2. Organic Mottling / Tiger Stripes / Belly Plates
    // Ventral belly scutes (horizontal armored plates on lower 28% of UV)
    for (let y = H * 0.72; y < H; y += 16) {
      ctx.fillStyle = bellyCol;
      ctx.globalAlpha = 0.52;
      ctx.beginPath();
      ctx.roundRect(16, y, W - 32, 12, 6);
      ctx.fill();
      ctx.strokeStyle = backCol;
      ctx.lineWidth = 2;
      ctx.stroke();

      bctx.fillStyle = '#b8b8b8';
      bctx.fillRect(16, y, W - 32, 11);
    }
    ctx.globalAlpha = 1.0;

    // 3. Overlapping Scale Lattice / Feathers / Crystalline Facets / Bark
    if (pat.includes('feather') || pat.includes('dawn') || pat.includes('siren')) {
      // Layered Iridescent Plumage / Fin Scallops
      const rows = 24, cols = 20;
      const cw = W / cols, rh = (H * 0.75) / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = -1; c <= cols; c++) {
          const cx = c * cw + (r % 2 ? cw * 0.5 : 0);
          const cy = r * rh;
          const g = ctx.createRadialGradient(cx, cy, 2, cx, cy + rh * 0.6, cw * 0.75);
          g.addColorStop(0, r % 3 === 0 ? veinCol : midCol);
          g.addColorStop(0.7, backCol);
          g.addColorStop(1, 'rgba(0,0,0,0.6)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(cx, cy, cw * 0.56, rh * 0.78, 0, 0, Math.PI * 2);
          ctx.fill();

          // Feather shaft highlight
          ctx.strokeStyle = bellyCol;
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(cx, cy - rh * 0.4);
          ctx.lineTo(cx, cy + rh * 0.55);
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          bctx.strokeStyle = '#d8d8d8';
          bctx.lineWidth = 1.5;
          bctx.beginPath();
          bctx.arc(cx, cy, cw * 0.48, 0.15 * Math.PI, 0.85 * Math.PI);
          bctx.stroke();
        }
      }
    } else if (pat.includes('facet') || pat.includes('emerald') || pat.includes('prism') || pat.includes('royal')) {
      // Crystalline Voronoi / Geode Facets
      for (let i = 0; i < 180; i++) {
        const cx = rand() * W;
        const cy = rand() * H * 0.82;
        const rad = 14 + rand() * 28;
        const sides = 5 + Math.floor(rand() * 3);
        ctx.beginPath();
        bctx.beginPath();
        for (let s = 0; s < sides; s++) {
          const a = (s / sides) * Math.PI * 2 + rand() * 0.25;
          const px = cx + Math.cos(a) * rad;
          const py = cy + Math.sin(a) * rad;
          if (s === 0) { ctx.moveTo(px, py); bctx.moveTo(px, py); }
          else { ctx.lineTo(px, py); bctx.lineTo(px, py); }
        }
        ctx.closePath();
        bctx.closePath();

        const lit = rand();
        ctx.fillStyle = lit > 0.65 ? veinCol : (lit > 0.3 ? midCol : backCol);
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = bellyCol;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const bVal = Math.floor(100 + lit * 140);
        bctx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
        bctx.fill();
        bctx.strokeStyle = '#404040';
        bctx.lineWidth = 2;
        bctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    } else if (pat.includes('moss') || pat.includes('sylvan') || pat.includes('gaia')) {
      // Ancient Bark Striations + Moss Clusters
      for (let i = 0; i < 95; i++) {
        const x = rand() * W;
        const y = rand() * H;
        const w = 8 + rand() * 22;
        const h = 45 + rand() * 90;
        ctx.fillStyle = rand() > 0.45 ? backCol : '#2d1c10';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(x, y, w, h);
        bctx.fillStyle = rand() > 0.5 ? '#555555' : '#aaaaaa';
        bctx.fillRect(x, y, w, h);
      }
      // Lush moss & golden lichen patches
      for (let i = 0; i < 110; i++) {
        const cx = rand() * W;
        const cy = rand() * H * 0.8;
        const r = 10 + rand() * 26;
        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
        g.addColorStop(0, veinCol);
        g.addColorStop(0.55, midCol);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    } else {
      // Classic Detailed Draconic Scales + Dorsal Ridge Plates
      const rows = 28, cols = 24;
      const cw = W / cols, rh = (H * 0.76) / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = -1; c <= cols; c++) {
          const cx = c * cw + (r % 2 ? cw * 0.5 : 0);
          const cy = r * rh;
          const shade = rand();
          ctx.fillStyle = shade > 0.78 ? veinCol : (shade > 0.25 ? midCol : backCol);
          ctx.globalAlpha = 0.48 + shade * 0.35;
          ctx.beginPath();
          ctx.moveTo(cx, cy - rh * 0.55);
          ctx.quadraticCurveTo(cx + cw * 0.58, cy, cx, cy + rh * 0.68);
          ctx.quadraticCurveTo(cx - cw * 0.58, cy, cx, cy - rh * 0.55);
          ctx.fill();

          ctx.strokeStyle = backCol;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Specular scale rim
          ctx.strokeStyle = bellyCol;
          ctx.globalAlpha = 0.32;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(cx, cy + rh * 0.1, cw * 0.36, 0.2 * Math.PI, 0.8 * Math.PI);
          ctx.stroke();

          // Bump scale height
          bctx.fillStyle = '#c2c2c2';
          bctx.beginPath();
          bctx.arc(cx, cy, cw * 0.38, 0, Math.PI * 2);
          bctx.fill();
          bctx.strokeStyle = '#383838';
          bctx.lineWidth = 1.6;
          bctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // 4. Tiger / Draconic Stripes & Wing Ribbing
    for (let i = 0; i < 16; i++) {
      const sx = (i / 16) * W + (rand() - 0.5) * 20;
      ctx.strokeStyle = backCol;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 6 + rand() * 8;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.bezierCurveTo(sx + 35, H * 0.25, sx - 35, H * 0.5, sx + 15, H * 0.74);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // 5. Glowing Elemental Veins / Runes / Magma Cracks / Constellation Lines
    const veinCount = 26;
    for (let i = 0; i < veinCount; i++) {
      let vx = rand() * W;
      let vy = rand() * H * 0.85;
      ctx.beginPath();
      ectx.beginPath();
      ctx.moveTo(vx, vy);
      ectx.moveTo(vx, vy);
      const steps = 5 + Math.floor(rand() * 6);
      for (let s = 0; s < steps; s++) {
        vx += (rand() - 0.5) * 55;
        vy += (rand() - 0.3) * 45;
        ctx.lineTo(vx, vy);
        ectx.lineTo(vx, vy);
      }
      ctx.strokeStyle = veinCol;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = veinCol;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ectx.strokeStyle = veinCol;
      ectx.lineWidth = 3.2;
      ectx.shadowColor = midCol;
      ectx.shadowBlur = 12;
      ectx.stroke();
      ectx.shadowBlur = 0;
    }

    // If Arcane/Watcher/Solar/Royal, add sacred geometric rune sigils onto the wings/shoulders
    if (['arquimago_astral', 'vigia', 'solar', 'cestille', 'vazio', 'prisma'].includes(sp.id)) {
      for (let i = 0; i < 6; i++) {
        const rx = (i + 0.5) * (W / 6);
        const ry = H * (0.28 + (i % 2) * 0.22);
        const rr = 26;
        for (const targetCtx of [ctx, ectx]) {
          targetCtx.save();
          targetCtx.strokeStyle = veinCol;
          targetCtx.lineWidth = 2.2;
          targetCtx.beginPath();
          targetCtx.arc(rx, ry, rr, 0, Math.PI * 2);
          targetCtx.stroke();
          targetCtx.beginPath();
          targetCtx.arc(rx, ry, rr * 0.68, 0, Math.PI * 2);
          targetCtx.stroke();
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2;
            targetCtx.beginPath();
            targetCtx.moveTo(rx + Math.cos(a) * rr * 0.68, ry + Math.sin(a) * rr * 0.68);
            targetCtx.lineTo(rx + Math.cos(a + Math.PI * 2 / 3) * rr * 0.68, ry + Math.sin(a + Math.PI * 2 / 3) * rr * 0.68);
            targetCtx.stroke();
          }
          targetCtx.restore();
        }
      }
    }

    const map = new THREE.CanvasTexture(cAlbedo);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    if (THREE.sRGBEncoding) map.encoding = THREE.sRGBEncoding;
    if (THREE.SRGBColorSpace) map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;

    const bumpMap = new THREE.CanvasTexture(cBump);
    bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.needsUpdate = true;

    const emissiveMap = new THREE.CanvasTexture(cEmissive);
    emissiveMap.wrapS = emissiveMap.wrapT = THREE.RepeatWrapping;
    if (THREE.sRGBEncoding) emissiveMap.encoding = THREE.sRGBEncoding;
    if (THREE.SRGBColorSpace) emissiveMap.colorSpace = THREE.SRGBColorSpace;
    emissiveMap.needsUpdate = true;

    const out = { map, bumpMap, emissiveMap, cAlbedo };
    _skinCache.set(sp.id, out);
    return out;
  }

  // Blends a GLB's original texture with the species' multi-tone procedural skin
  // so textured GLBs keep their painted eyes/mouth details while gaining totally unique species patterns!
  function blendOriginalWithSpeciesSkin(origImg, sp, THREE) {
    const key = sp.id + '_blended';
    if (_skinCache.has(key)) return _skinCache.get(key);

    const baseSkin = makeDragonDetailedSkinTex(sp, THREE);
    const W = 512, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');

    // Draw original GLB texture first
    ctx.drawImage(origImg, 0, 0, W, H);
    // Multiply/overlay rich species skin pattern
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.78;
    ctx.drawImage(baseSkin.cAlbedo, 0, 0, W, H);

    // Add glowing veins on top
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.55;
    ctx.drawImage(baseSkin.emissiveMap.image, 0, 0, W, H);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;

    const blendedMap = new THREE.CanvasTexture(c);
    blendedMap.flipY = false;
    blendedMap.wrapS = blendedMap.wrapT = THREE.RepeatWrapping;
    if (THREE.sRGBEncoding) blendedMap.encoding = THREE.sRGBEncoding;
    if (THREE.SRGBColorSpace) blendedMap.colorSpace = THREE.SRGBColorSpace;
    blendedMap.needsUpdate = true;

    const out = {
      map: blendedMap,
      bumpMap: baseSkin.bumpMap,
      emissiveMap: baseSkin.emissiveMap
    };
    _skinCache.set(key, out);
    return out;
  }

  // ── EXACT CANONICAL GLB RIG & ANIMATION CONFIG (`ZDB` FROM `02-dragons-arena.js`) ──
  // Prevents animations from translating dragons off-screen (`strip`), scaling bones to 0,
  // playing Death clips (`fly`), or showing giant opaque helper planes (`hide`).
  const ZDB_CONFIG = {
    nimbo_autoral: { fly: /^Flying_Idle$/i, yaw: 0 },
    red:       { fly: /Take 001/i, yaw: -Math.PI / 2 },
    ulyssan:   { fly: /fly_glide|fly/i, yaw: -Math.PI / 2 },
    eternatus: { fly: /eternatus_fly/i, yaw: -Math.PI / 2 },
    golden:    { fly: /eternatus_fly/i, yaw: -Math.PI / 2 },
    devil:     { fly: /fly_idle|idle/i, yaw: -Math.PI / 2 },
    dark:      { fly: /fly_idle|idle/i, yaw: -Math.PI / 2 },
    fire2:     { fly: /Take 001/i, yaw: -Math.PI / 2 },
    ember:     { fly: /Take 001/i, yaw: -Math.PI / 2 },
    poison:    { fly: /Take 001/i, yaw: -Math.PI / 2 },
    marsh:     { fly: /Take 001/i, yaw: -Math.PI / 2 },
    wyvern:    { fly: /^Flying/i, yaw: 0 },
    nightmare: { fly: /fly_forward|fly_idle|fly/i, yaw: -Math.PI / 2 },
    blue:      { fly: /fly_forward|fly_idle|fly/i, yaw: -Math.PI / 2 },
    bw:        { fly: /Run|Walk|Idle/i, yaw: -Math.PI / 2 },
    sopro:     { fly: /Run|Walk|Idle/i, yaw: -Math.PI / 2 },
    tilt:      { fly: null, yaw: Math.PI / 2 },
    cartoon:   { fly: /^CharacterArmature\|Flying_Idle$/i, yaw: Math.PI / 2 },
    morcego:   { fly: /Bat\|Flying/i, yaw: Math.PI / 2 },
    chamas:    { fly: /idle_pose/i, yaw: Math.PI / 2 },
    hamster:   { fly: /Bat\|Flying/i, yaw: -Math.PI / 2 },
    sage:      { fly: /Fly$/i, idle: /Idle$/i, atk: /Attack$/i, yaw: -Math.PI / 2 },
    green:     { fly: /Take 001/i, yaw: -Math.PI / 2 },
    watcher:   { fly: /Armature\|Render|./i, yaw: Math.PI / 2, hide: /^(Sword4.*|Object_(?:16\d|17[0-3]))$/i, keepScale: true },   // as espadas soltas (Object_160-173) esticavam a caixa e o corpo ficava minúsculo
    vigia:     { fly: /Armature\|Render|./i, yaw: Math.PI / 2, hide: /^(Sword4.*|Object_(?:16\d|17[0-3]))$/i, keepScale: true },   // as espadas soltas (Object_160-173) esticavam a caixa e o corpo ficava minúsculo
    mini:      { fly: /Take 001/i, yaw: -Math.PI / 2 },
    demon:     { fly: /^flying$/i, seg: [0.07, 3.3], strip: ['root.4_219', 'pelvis.5_218'], yaw: Math.PI / 2 },
    fire:      { fly: /./, seg: [7.63, 8.53], strip: ['Bone009_01'], yaw: Math.PI / 2 },
    icy:       { fly: /./, seg: [5.07, 6.63], strip: ['Bone001_01'], hide: /^(Object_9|Object_11|Object_13)$/, yaw: Math.PI / 2 },
    mountain:  { fly: /./, seg: [0.1, 3.2], yaw: Math.PI / 2 },
    elder:     { fly: null, yaw: Math.PI / 2 },
    fenix:     { fly: /Take 001|fly|idle/i, yaw: 0 },
    peixe:     { fly: /swim|fly|idle|Take/i, yaw: -Math.PI / 2 },
    robo:      { fly: /fly|idle|walk|Take/i, yaw: Math.PI / 2 },
    guardiao:  { fly: /fly|idle|walk|Take/i, yaw: Math.PI / 2 },
    alien:     { fly: /fly|idle|walk|Take/i, yaw: -Math.PI / 2 },
    demonio_cinzas:    { fly: /^flying$/i, seg: [0.07, 3.3], strip: ['root.4_219', 'pelvis.5_218'], yaw: Math.PI / 2 },
    morcego_noturno:   { fly: /Bat\|Flying/i, yaw: Math.PI / 2 },
    colosso_obsidiana: { fly: /^fly$/i, yaw: -Math.PI / 2 },
    sereia_glacial:    { fly: /fly_glide|fly/i, yaw: -Math.PI / 2 },
    guardiao_botanico: { fly: /^Flying/i, yaw: 0 },
    arquimago_astral:  { fly: /eternatus_fly/i, yaw: -Math.PI / 2 },
    crono_engenheiro:  { fly: /Flying|Take 001/i, yaw: Math.PI / 2 }
  };

  function getDragonDBConfig(sp) {
    return ZDB_CONFIG[sp.glb] || ZDB_CONFIG[sp.id] || { fly: /fly|idle|Take/i, yaw: 0 };
  }

  // Exact animation preparation from `zBuildDragon` (`02-dragons-arena.js:3752`)
  function prepareDragonAnimation(root, animations, sp, THREE) {
    if (!animations || !animations.length) return null;
    const db = getDragonDBConfig(sp);
    let src = (db.fly && animations.find(a => db.fly.test(a.name))) || animations[0];
    if (!src) return null;

    let clip = src.clone();
    if (db.seg && THREE.AnimationUtils && THREE.AnimationUtils.subclip) {
      const fps = 30;
      try {
        clip = THREE.AnimationUtils.subclip(
          clip,
          clip.name + '_seg',
          Math.max(0, Math.round(db.seg[0] * fps)),
          Math.max(1, Math.round(db.seg[1] * fps)),
          fps
        );
      } catch (e) {}
    }
    if (db.strip && db.strip.length) {
      clip.tracks = clip.tracks.filter(tr => !db.strip.some(b => tr.name.startsWith(b + '.')));
    }
    // Always strip .scale tracks because several GLBs have scale=0 keyframes!
    if (!db.keepScale) clip.tracks = clip.tracks.filter(tr => !/\.scale$/.test(tr.name));   // exceto o Vigia: o esqueleto dele (Armature 100x) depende das escalas animadas

    const mixer = new THREE.AnimationMixer(root);
    const act = mixer.clipAction(clip);
    act.play();
    mixer.setTime(0.25);
    root.updateMatrixWorld(true);
    root.traverse(o => {
      if (o.isSkinnedMesh && o.skeleton) {
        try { o.skeleton.update(); } catch (e) {}
      }
    });
    return mixer;
  }

  // ── SAFE POSED BOUNDING BOX (`zPosedBox` FROM `02-dragons-arena.js:3633`) ──
  // Updates skeleton matrices BEFORE `boneTransform` and NEVER rejects centimeter-scale GLBs!
  function computeSafeDragonBox(root, THREE) {
    root.updateMatrixWorld(true);
    root.traverse(o => {
      if (o.isSkinnedMesh && o.skeleton) {
        try { o.skeleton.update(); } catch (e) {}
      }
    });

    const box = new THREE.Box3();
    const v = new THREE.Vector3();

    root.traverse(m => {
      if (!m.isMesh || !m.visible || !m.geometry || !m.geometry.attributes.position) return;
      const nm = m.name || '';
      if (/^(Object_9|Object_11|Object_13|Sword4.*)$/i.test(nm)) return;
      const p = m.geometry.attributes.position;
      const step = Math.max(1, Math.floor(p.count / 150));
      for (let i = 0; i < p.count; i += step) {
        v.fromBufferAttribute(p, i);
        if (m.isSkinnedMesh && m.boneTransform) {
          try { m.boneTransform(i, v); } catch (e) {}
        }
        v.applyMatrix4(m.matrixWorld);
        if (isFinite(v.x) && isFinite(v.y) && isFinite(v.z)) {
          box.expandByPoint(v);
        }
      }
    });

    if (box.isEmpty()) {
      box.setFromObject(root);
    }
    return box;
  }

  // ── ORGANIC PROPORTION SCULPTING & MULTI-TONE SKIN (SAFE FOR QUANTIZED SKINNED MESHES!) ──
  function applyDragonOrganicSculptAndSkin(root, sp, THREE) {
    const morph = sp.morph || {};
    const db = getDragonDBConfig(sp);
    const skin = makeDragonDetailedSkinTex(sp, THREE);
    const [r2, g2, b2] = hexToRgb(sp.c2);

    // Compute non-uniform proportion vector so shared rigs have distinct silhouettes without corrupting quantized buffers
    const wingFactor = morph.wingSpan || morph.wingSweep || morph.wingMembrane || morph.wingPlume || morph.voidWings || morph.titanWings || morph.wingGrand || 1.0;
    const tallFactor = morph.hornCrown || morph.crestCrown || morph.solarHalo || morph.elderAntlers || morph.royalCrest || morph.sirenFin || morph.canopyHorns || 1.0;
    const tailFactor = morph.tailStretch || morph.tailFin || morph.tailPlume || morph.tailWhip || morph.tailLong || morph.tailRegal || 1.0;
    root.userData.proportionScale = new THREE.Vector3(
      1.0 + (wingFactor - 1.0) * 0.45,
      1.0 + (tallFactor - 1.0) * 0.42,
      1.0 + (tailFactor - 1.0) * 0.45
    );

    root.traverse(child => {
      const nm = child.name || '';
      if ((db.hide && db.hide.test(nm)) || /^(Object_9|Object_11|Object_13|Sword4.*)$/i.test(nm)) {
        child.visible = false;
        return;
      }
      if (!child.isMesh) return;

      child.visible = true;
      child.frustumCulled = false;
      child.castShadow = true;
      child.receiveShadow = true;

      // Add UVs if missing, and compute normals if missing (e.g. ulyssan.glb, sereia_glacial.glb)
      if (child.geometry && child.geometry.attributes.position) {
        try {
          if (!child.geometry.attributes.uv || !child.geometry.attributes.normal) {
            child.geometry = child.geometry.clone();
          }
          const geom = child.geometry;
          if (!geom.attributes.uv) {
            geom.computeBoundingBox();
            const bb = geom.boundingBox;
            const pos = geom.attributes.position;
            const sx = Math.max(0.001, bb.max.x - bb.min.x);
            const sy = Math.max(0.001, bb.max.y - bb.min.y);
            const sz = Math.max(0.001, bb.max.z - bb.min.z);
            const uvs = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
              const vx = (pos.getX(i) - bb.min.x) / sx;
              const vy = (pos.getY(i) - bb.min.y) / sy;
              const vz = (pos.getZ(i) - bb.min.z) / sz;
              const angle = Math.atan2(vx - 0.5, vz - 0.5) / (Math.PI * 2) + 0.5;
              uvs[i * 2] = (angle * 2.0 + vz) % 1.0;
              uvs[i * 2 + 1] = 1.0 - vy;
            }
            geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
          }
          if (!geom.attributes.normal) {
            geom.computeVertexNormals();
          }
        } catch (e) {}
      }

      const matCache = new Map();   // um material novo por material original (o Sábio tem 110 cubos e criava 109 materiais com textura pintada)
      const applyMat = (oldMat) => {
        if (oldMat && matCache.has(oldMat)) return matCache.get(oldMat);
        // Always ensure MeshStandardMaterial! GLBs with KHR_materials_unlit (ulyssan, watcher)
        // produce MeshBasicMaterial, which lacks i.emissive / i.bumpMap uniforms and crashes WebGL!
        const m = new THREE.MeshStandardMaterial({
          map: oldMat && oldMat.map ? oldMat.map : null,
          normalMap: oldMat && oldMat.normalMap ? oldMat.normalMap : null,
          aoMap: oldMat && oldMat.aoMap ? oldMat.aoMap : null,
          roughnessMap: oldMat && oldMat.roughnessMap ? oldMat.roughnessMap : null,
          metalnessMap: oldMat && oldMat.metalnessMap ? oldMat.metalnessMap : null,
          vertexColors: !!(oldMat && oldMat.vertexColors)
        });
        // Force opaque rendering so watcher.glb (`vigia`) and all GLBs are 100% visible!
        m.transparent = false;
        m.opacity = 1.0;
        m.alphaTest = 0.0;
        m.depthWrite = true;
        m.depthTest = true;
        m.side = THREE.DoubleSide;

        const hasValidTex = !!(m.map && m.map.image && m.map.image.width > 8);
        if (hasValidTex) {
          try {
            const blended = blendOriginalWithSpeciesSkin(m.map.image, sp, THREE);
            m.map = blended.map;
            m.bumpMap = blended.bumpMap;
            m.bumpScale = 0.025;
            m.emissiveMap = blended.emissiveMap;
          } catch (e) {
            m.map = skin.map;
            m.bumpMap = skin.bumpMap;
            m.bumpScale = 0.03;
            m.emissiveMap = skin.emissiveMap;
          }
        } else {
          m.map = skin.map;
          m.bumpMap = skin.bumpMap;
          m.bumpScale = 0.035;
          m.emissiveMap = skin.emissiveMap;
        }

        m.color = new THREE.Color(0xffffff);
        m.emissive = new THREE.Color(r2 / 255, g2 / 255, b2 / 255);
        m.emissiveIntensity = (sp.skin && sp.skin.glow) ? sp.skin.glow * 0.45 : 0.22;
        m.roughness = 0.42;
        m.metalness = (sp.elem === 'Metal' || sp.elem === 'Cristal') ? 0.42 : 0.15;
        m.needsUpdate = true;
        if (oldMat) matCache.set(oldMat, m);
        return m;
      };

      if (Array.isArray(child.material)) {
        child.material = child.material.map(applyMat);
      } else {
        child.material = applyMat(child.material);
      }
    });

    // Organic Bezier/Spline Anatomy Sculpting for species that share a base rig
    if (morph.splineAnatomy && THREE.CatmullRomCurve3 && THREE.TubeGeometry) {
      const box = computeSafeDragonBox(root, THREE);
      const sz = new THREE.Vector3();
      const ct = new THREE.Vector3();
      box.getSize(sz);
      box.getCenter(ct);
      const u = Math.max(0.1, Math.max(sz.x, sz.y, sz.z));

      const organicMat = new THREE.MeshStandardMaterial({
        map: skin.map,
        bumpMap: skin.bumpMap,
        bumpScale: 0.04,
        emissiveMap: skin.emissiveMap,
        emissive: new THREE.Color(r2 / 255, g2 / 255, b2 / 255),
        emissiveIntensity: 0.65,
        roughness: 0.35,
        metalness: 0.3,
        side: THREE.DoubleSide
      });

      const makeTaperedOrganicCurveMesh = (points, baseRad, tipRad, radialSegs = 8) => {
        const curve = new THREE.CatmullRomCurve3(points);
        const geom = new THREE.TubeGeometry(curve, 20, baseRad, radialSegs, false);
        const pos = geom.attributes.position;
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          const t = Math.min(1, Math.floor(i / (radialSegs + 1)) / 20);
          const centerPt = curve.getPointAt(t);
          v.fromBufferAttribute(pos, i).sub(centerPt);
          const taper = (1 - t) + t * (tipRad / Math.max(0.0001, baseRad));
          v.multiplyScalar(taper).add(centerPt);
          pos.setXYZ(i, v.x, v.y, v.z);
        }
        pos.needsUpdate = true;
        geom.computeVertexNormals();
        const m = new THREE.Mesh(geom, organicMat);
        m.castShadow = true;
        return m;
      };

      const extras = new THREE.Group();
      if (morph.splineAnatomy === 'gaia_antlers') {
        for (const s of [-1, 1]) {
          extras.add(makeTaperedOrganicCurveMesh([
            new THREE.Vector3(ct.x + s * u * 0.08, ct.y + sz.y * 0.32, ct.z + sz.z * 0.18),
            new THREE.Vector3(ct.x + s * u * 0.24, ct.y + sz.y * 0.52, ct.z + sz.z * 0.10),
            new THREE.Vector3(ct.x + s * u * 0.36, ct.y + sz.y * 0.68, ct.z - sz.z * 0.04),
            new THREE.Vector3(ct.x + s * u * 0.28, ct.y + sz.y * 0.82, ct.z - sz.z * 0.16)
          ], u * 0.032, u * 0.004));
        }
      } else if (morph.splineAnatomy === 'primordial_horns_manes') {
        for (const s of [-1, 1]) {
          extras.add(makeTaperedOrganicCurveMesh([
            new THREE.Vector3(ct.x + s * u * 0.10, ct.y + sz.y * 0.28, ct.z + sz.z * 0.22),
            new THREE.Vector3(ct.x + s * u * 0.28, ct.y + sz.y * 0.44, ct.z + sz.z * 0.05),
            new THREE.Vector3(ct.x + s * u * 0.42, ct.y + sz.y * 0.64, ct.z - sz.z * 0.20),
            new THREE.Vector3(ct.x + s * u * 0.32, ct.y + sz.y * 0.78, ct.z - sz.z * 0.38)
          ], u * 0.042, u * 0.005));
        }
      } else if (morph.splineAnatomy === 'royal_seraph_ribbons') {
        for (const s of [-1, 1]) {
          extras.add(makeTaperedOrganicCurveMesh([
            new THREE.Vector3(ct.x + s * u * 0.14, ct.y + sz.y * 0.25, ct.z),
            new THREE.Vector3(ct.x + s * u * 0.38, ct.y + sz.y * 0.48, ct.z - sz.z * 0.22),
            new THREE.Vector3(ct.x + s * u * 0.26, ct.y + sz.y * 0.32, ct.z - sz.z * 0.52),
            new THREE.Vector3(ct.x + s * u * 0.44, ct.y + sz.y * 0.56, ct.z - sz.z * 0.78)
          ], u * 0.028, u * 0.004));
        }
      } else if (morph.splineAnatomy === 'astral_astrolabe') {
        const runeTex = getFxSpriteTex('rune_circle', THREE);
        const haloMat = new THREE.MeshBasicMaterial({
          map: runeTex, color: new THREE.Color(sp.c2),
          transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide, depthWrite: false
        });
        const halo = new THREE.Mesh(new THREE.PlaneGeometry(u * 0.75, u * 0.75), haloMat);
        halo.position.set(ct.x, ct.y + sz.y * 0.38, ct.z - sz.z * 0.08);
        extras.add(halo);
      } else if (morph.splineAnatomy === 'void_tendrils') {
        for (const s of [-1, 1]) {
          extras.add(makeTaperedOrganicCurveMesh([
            new THREE.Vector3(ct.x + s * u * 0.12, ct.y + sz.y * 0.22, ct.z),
            new THREE.Vector3(ct.x + s * u * 0.34, ct.y + sz.y * 0.52, ct.z - sz.z * 0.18),
            new THREE.Vector3(ct.x + s * u * 0.22, ct.y + sz.y * 0.72, ct.z - sz.z * 0.36)
          ], u * 0.032, u * 0.003));
        }
      }
      root.add(extras);
    }
  }

  // ── PROCEDURAL CANVAS2D FX SPRITE GENERATOR (ZERO GEOMETRIC PRIMITIVES!) ──
  // Generates high-detail 2D sprites for flames, sonic crescents, flapping shadow bats,
  // lightning arcs, runes, frost crystals, feathers, petals, magma fissures, and stars.
  const _fxTexCache = {};
  function getFxSpriteTex(kind, THREE) {
    if (_fxTexCache[kind]) return _fxTexCache[kind];
    const S = 128;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const ctx = c.getContext('2d');
    const cx = S / 2, cy = S / 2;

    if (kind === 'flame') {
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 56);
      g.addColorStop(0, 'rgba(255,255,240,1)');
      g.addColorStop(0.28, 'rgba(255,195,50,0.95)');
      g.addColorStop(0.62, 'rgba(255,65,10,0.65)');
      g.addColorStop(1, 'rgba(120,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, 8);
      ctx.bezierCurveTo(cx + 46, cy - 18, cx + 52, cy + 36, cx, S - 8);
      ctx.bezierCurveTo(cx - 52, cy + 36, cx - 46, cy - 18, cx, 8);
      ctx.fill();
    } else if (kind === 'sonic_crescent') {
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 14;
      const g = ctx.createRadialGradient(cx - 10, cy, 10, cx, cy, 58);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.55, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.8, 'rgba(200,160,255,0.85)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx - 8, cy, 52, -0.42 * Math.PI, 0.42 * Math.PI, false);
      ctx.arc(cx - 22, cy, 46, 0.38 * Math.PI, -0.38 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (kind === 'shadow_bat') {
      // Detailed winged bat silhouette with glowing crimson eyes & aura
      ctx.save();
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#1f0933';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // Head & ears
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx - 7, cy - 28);
      ctx.lineTo(cx - 12, cy - 12);
      // Left scalloped bat wing
      ctx.bezierCurveTo(cx - 32, cy - 36, cx - 56, cy - 22, cx - 60, cy + 6);
      ctx.quadraticCurveTo(cx - 44, cy - 2, cx - 36, cy + 16);
      ctx.quadraticCurveTo(cx - 22, cy + 4, cx - 12, cy + 20);
      // Tail
      ctx.lineTo(cx, cy + 32);
      ctx.lineTo(cx + 12, cy + 20);
      // Right scalloped bat wing
      ctx.quadraticCurveTo(cx + 22, cy + 4, cx + 36, cy + 16);
      ctx.quadraticCurveTo(cx + 44, cy - 2, cx + 60, cy + 6);
      ctx.bezierCurveTo(cx + 56, cy - 22, cx + 32, cy - 36, cx + 12, cy - 12);
      ctx.lineTo(cx + 7, cy - 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Glowing crimson eyes
      ctx.fillStyle = '#ff2a55';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 10, 3, 0, Math.PI * 2);
      ctx.arc(cx + 5, cy - 10, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (kind === 'rune_circle') {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.stroke();
      // Octagram star + runes
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const a2 = ((i + 3) / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 42, cy + Math.sin(a) * 42);
        ctx.lineTo(cx + Math.cos(a2) * 42, cy + Math.sin(a2) * 42);
        ctx.stroke();
        // Outer rune glyph ticks
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 48, cy + Math.sin(a) * 48, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    } else if (kind === 'star_flare') {
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 56);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.3, 'rgba(255,245,200,0.85)');
      g.addColorStop(0.7, 'rgba(255,200,100,0.25)');
      g.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);
      // 4-point celestial cross flare
      ctx.fillStyle = '#ffffff';
      for (let r = 0; r < 4; r++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((r * Math.PI) / 4);
        const len = r % 2 === 0 ? 58 : 34;
        ctx.beginPath();
        ctx.moveTo(0, -len);
        ctx.quadraticCurveTo(5, 0, 0, len);
        ctx.quadraticCurveTo(-5, 0, 0, -len);
        ctx.fill();
        ctx.restore();
      }
    } else if (kind === 'leaf_blade') {
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      const g = ctx.createLinearGradient(cx - 40, cy, cx + 40, cy);
      g.addColorStop(0, '#bef264');
      g.addColorStop(0.5, '#ffffff');
      g.addColorStop(1, '#22c55e');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx + 52, cy);
      ctx.quadraticCurveTo(cx, cy - 30, cx - 48, cy);
      ctx.quadraticCurveTo(cx, cy + 30, cx + 52, cy);
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 44, cy);
      ctx.lineTo(cx + 48, cy);
      ctx.stroke();
      ctx.restore();
    } else if (kind === 'frost_crystal') {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = 'rgba(220,248,255,0.88)';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -52);
        ctx.moveTo(0, -28);
        ctx.lineTo(-14, -40);
        ctx.moveTo(0, -28);
        ctx.lineTo(14, -40);
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (kind === 'skull_wraith') {
      ctx.save();
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 14;
      const g = ctx.createRadialGradient(cx, cy - 6, 4, cx, cy, 52);
      g.addColorStop(0, 'rgba(240,255,250,0.98)');
      g.addColorStop(0.5, 'rgba(45,212,191,0.75)');
      g.addColorStop(1, 'rgba(168,85,247,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 32, Math.PI, 0, false);
      ctx.lineTo(cx + 26, cy + 28);
      ctx.lineTo(cx + 12, cy + 18);
      ctx.lineTo(cx, cy + 34);
      ctx.lineTo(cx - 12, cy + 18);
      ctx.lineTo(cx - 26, cy + 28);
      ctx.closePath();
      ctx.fill();
      // Hollow glowing eye sockets
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(cx - 11, cy - 10, 7, 0, Math.PI * 2);
      ctx.arc(cx + 11, cy - 10, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (kind === 'celestial_sword') {
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      const g = ctx.createLinearGradient(cx, 6, cx, S - 6);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.7, '#7dd3fc');
      g.addColorStop(1, '#f472b6');
      ctx.fillStyle = g;
      // Blade
      ctx.beginPath();
      ctx.moveTo(cx, S - 6);
      ctx.lineTo(cx - 11, 38);
      ctx.lineTo(cx, 18);
      ctx.lineTo(cx + 11, 38);
      ctx.closePath();
      ctx.fill();
      // Ornate winged crossguard
      ctx.beginPath();
      ctx.moveTo(cx - 38, 34);
      ctx.quadraticCurveTo(cx, 48, cx + 38, 34);
      ctx.quadraticCurveTo(cx, 28, cx - 38, 34);
      ctx.fill();
      ctx.restore();
    } else if (kind === 'slash_x') {
      ctx.save();
      ctx.shadowColor = '#ff4500';
      ctx.shadowBlur = 16;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(18, 18);
      ctx.quadraticCurveTo(cx + 10, cy, S - 18, S - 18);
      ctx.moveTo(S - 18, 18);
      ctx.quadraticCurveTo(cx - 10, cy, 18, S - 18);
      ctx.stroke();
      ctx.restore();
    }

    const tex = new THREE.CanvasTexture(c);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    _fxTexCache[kind] = tex;
    return tex;
  }

  // ── EPIC SUMMONING RITUAL ANIMATION (`spawnSummonRitualFX`) ──
  // Plays when a dragon is placed on a tile or when the user clicks "✨ Invocar":
  // 1. Double rotating sacred runic circle expanding on the ground
  // 2. Celestial sky pillar descending from y=11
  // 3. Branched elemental lightning bolts + rising particle vortex
  // 4. Dragon swooping down from the sky with wing-flare shockwave & camera shake!
  function spawnSummonRitualFX(ctx, dragonGroup, sp, worldPos) {
    const { THREE, fxGroup, battleFX, addShake, dynamicFlashes } = ctx;
    const col1 = new THREE.Color(sp.c1 || '#ff6b2b');
    const col2 = new THREE.Color(sp.c2 || '#ffd166');

    const runeTex = getFxSpriteTex('rune_circle', THREE);
    const flareTex = getFxSpriteTex('star_flare', THREE);

    // 1. Outer & Inner Rotating Runic Ground Circles
    const outerMat = new THREE.MeshBasicMaterial({
      map: runeTex, color: col1, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    const innerMat = new THREE.MeshBasicMaterial({
      map: runeTex, color: col2, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    const planeGeo = new THREE.PlaneGeometry(3.2, 3.2);
    planeGeo.rotateX(-Math.PI / 2);

    const outerRing = new THREE.Mesh(planeGeo, outerMat);
    outerRing.position.set(worldPos.x, 0.09, worldPos.z);
    fxGroup.add(outerRing);

    const innerRing = new THREE.Mesh(planeGeo.clone().scale(0.68, 1, 0.68), innerMat);
    innerRing.position.set(worldPos.x, 0.10, worldPos.z);
    fxGroup.add(innerRing);

    // 2. Sky Portal Star Disc at y = 8.5 + Vertical Ribbon Pillar
    const skyPortal = new THREE.Mesh(planeGeo.clone().scale(1.3, 1, 1.3), outerMat.clone());
    skyPortal.position.set(worldPos.x, 8.2, worldPos.z);
    fxGroup.add(skyPortal);

    // Crossed additive light planes for volumetric beam (no hard cylinder primitive look!)
    const beamMat = new THREE.MeshBasicMaterial({
      map: flareTex, color: col2, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    const beamGroup = new THREE.Group();
    beamGroup.position.set(worldPos.x, 4.1, worldPos.z);
    for (let i = 0; i < 3; i++) {
      const bp = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 8.5), beamMat);
      bp.rotation.y = (i * Math.PI) / 3;
      beamGroup.add(bp);
    }
    fxGroup.add(beamGroup);

    // 3. Branched Lightning & Elemental Burst
    if (battleFX) {
      battleFX.spawnExplosion(new THREE.Vector3(worldPos.x, 0.5, worldPos.z), sp.c1, 1.45);
      battleFX.spawnLightningBolt(
        new THREE.Vector3(worldPos.x + (Math.random() - 0.5) * 1.2, 8.2, worldPos.z),
        new THREE.Vector3(worldPos.x, 0.15, worldPos.z),
        sp.c2
      );
      battleFX.spawnLightningBolt(
        new THREE.Vector3(worldPos.x + (Math.random() - 0.5) * 1.2, 8.2, worldPos.z),
        new THREE.Vector3(worldPos.x, 0.15, worldPos.z),
        sp.c1
      );
    }
    if (addShake) addShake(0.32);

    // Summon flare glow halo (replaces dynamic PointLight to prevent shader recompile freezes)
    const summonGlowMat = new THREE.SpriteMaterial({
      map: flareTex, color: col1, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const summonGlow = new THREE.Sprite(summonGlowMat);
    summonGlow.position.set(worldPos.x, 1.1, worldPos.z);
    summonGlow.scale.setScalar(3.6);
    fxGroup.add(summonGlow);

    // 4. Rising Spiral Embers/Runes + Swoop-In Dragon Animation
    const targetScale = dragonGroup.userData.baseScale || dragonGroup.scale.x || 1;
    const baseY = dragonGroup.userData.baseY || 0;
    dragonGroup.position.y = baseY + 5.2;
    dragonGroup.scale.setScalar(targetScale * 0.25);

    const spiralSprites = [];
    for (let i = 0; i < 18; i++) {
      const spMat = new THREE.SpriteMaterial({
        map: flareTex, color: i % 2 === 0 ? col1 : col2,
        transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false
      });
      const s = new THREE.Sprite(spMat);
      const angle = (i / 18) * Math.PI * 4;
      s.userData = { angle, radius: 0.9 + (i % 3) * 0.35, yOffset: (i / 18) * 3.2, speed: 4.5 + (i % 4) };
      s.scale.setScalar(0.55);
      fxGroup.add(s);
      spiralSprites.push(s);
    }

    dynamicFlashes.push({
      age: 0,
      maxAge: 1.15,
      update(dt) {
        this.age += dt;
        const t = Math.min(1, this.age / this.maxAge);

        // Swoop dragon down in first 0.48s with elastic landing bounce
        if (dragonGroup && dragonGroup.parent) {
          const dropT = Math.min(1, this.age / 0.48);
          const easeOut = 1 - Math.pow(1 - dropT, 3);
          dragonGroup.position.y = baseY + (1 - easeOut) * 5.2;
          const sc = targetScale * (0.25 + 0.75 * easeOut + Math.sin(dropT * Math.PI) * 0.16);
          dragonGroup.scale.setScalar(sc);

          if (this.age >= 0.46 && !this.landedShock) {
            this.landedShock = true;
            if (battleFX) battleFX.spawnExplosion(new THREE.Vector3(worldPos.x, 0.35, worldPos.z), sp.c2, 1.25);
            if (addShake) addShake(0.26);
          }
        }

        // Rotate magic circles & fade beam
        outerRing.rotation.y += dt * 2.8;
        innerRing.rotation.y -= dt * 4.2;
        skyPortal.rotation.y += dt * 3.5;

        const ringScale = t < 0.25 ? (t / 0.25) * 1.15 : 1.15 - (t - 0.25) * 0.25;
        outerRing.scale.setScalar(ringScale);
        innerRing.scale.setScalar(ringScale * 0.95);
        outerMat.opacity = Math.max(0, 1 - Math.pow(t, 1.6));
        innerMat.opacity = Math.max(0, 1 - Math.pow(t, 1.4));

        beamGroup.scale.set(1 - t * 0.75, 1, 1 - t * 0.75);
        beamGroup.rotation.y += dt * 5.0;
        beamMat.opacity = Math.max(0, (1 - t * 1.25) * 0.85);

        summonGlowMat.opacity = Math.max(0, (1 - t) * 0.95);
        summonGlow.scale.setScalar(3.6 * (1 + t * 0.4));

        for (const s of spiralSprites) {
          s.userData.angle += dt * s.userData.speed;
          const r = s.userData.radius * (1 - t * 0.45);
          const py = 0.2 + ((s.userData.yOffset + this.age * 4.2) % 4.5);
          s.position.set(
            worldPos.x + Math.cos(s.userData.angle) * r,
            py,
            worldPos.z + Math.sin(s.userData.angle) * r
          );
          s.material.opacity = Math.max(0, 1 - t);
        }
      },
      dispose() {
        fxGroup.remove(outerRing);
        fxGroup.remove(innerRing);
        fxGroup.remove(skyPortal);
        fxGroup.remove(beamGroup);
        fxGroup.remove(summonGlow);
        planeGeo.dispose();
        if (innerRing.geometry) innerRing.geometry.dispose();
        if (skyPortal.geometry) skyPortal.geometry.dispose();
        if (skyPortal.material) skyPortal.material.dispose();
        beamGroup.children.forEach(c => c.geometry && c.geometry.dispose());
        outerMat.dispose();
        innerMat.dispose();
        beamMat.dispose();
        summonGlowMat.dispose();
        for (const s of spiralSprites) {
          fxGroup.remove(s);
          s.material.dispose();
        }
        if (dragonGroup && dragonGroup.parent) {
          dragonGroup.position.y = baseY;
          dragonGroup.scale.setScalar(targetScale);
        }
      }
    });
  }

  // ── 60 HIGH-IMPACT LONG-RANGE ATTACKS (ALL 30 DRAGONS × NORMAL + SPECIAL) ──
  // Rules enforced:
  // 1. ALL attacks are LONG-RANGE and travel across the entire lane to `endX = 8.15`
  //    (never cutting off mid-way, never invisible, never melee-only!).
  // 2. ZERO raw geometric primitives (no plain boxes, cones, spheres, or cylinders as visuals).
  //    Everything uses textured Canvas2D sprites, glowing spline ribbons, branched lightning,
  //    volcanic fissures, animated shadow bats, sonic wave crests, and constellation portals.
  function fireDragonAttack30(ctx, defender, isSpecial, targetEnemy) {
    const { THREE, fxGroup, battleFX, addShake, dynamicFlashes, enemies, damageEnemy } = ctx;
    const sp = defender.sp;
    const atkCfg = isSpecial ? sp.atk2 : sp.atk1;
    const style = (atkCfg && atkCfg.style) || 'ember_volley';

    const col1 = new THREE.Color(sp.c1 || '#ff6b2b');
    const col2 = new THREE.Color(sp.c2 || '#ffd166');

    // Start from the dragon's muzzle (+X forward) and travel the FULL lane to the mist bank (x = 8.15)!
    const startPos = new THREE.Vector3(
      defender.group.position.x + 0.95,
      defender.group.position.y + 0.85,
      defender.group.position.z
    );
    const laneZ = defender.group.position.z;
    const endX = 8.15; // Full lane reach into the enemy mist portal!
    const distTotal = Math.max(4.5, endX - startPos.x);

    // Muzzle flash + dragon recoil lunge
    if (battleFX) {
      battleFX.spawnExplosion(startPos.clone(), isSpecial ? sp.c2 : sp.c1, isSpecial ? 0.95 : 0.55);
    }
    defender.attackAnim = isSpecial ? 0.65 : 0.42;
    if (addShake) addShake(isSpecial ? 0.34 : 0.12);

    // Helper: damages enemies along the lane within `[minX, maxX]`
    const hitSet = new Set();
    const sweepDamage = (currX, radius, dmgMult, knockback, slowSec) => {
      if (!enemies) return;
      const baseDmg = (sp.dps || 100) * dmgMult;
      for (const e of enemies) {
        if (e.dead || hitSet.has(e)) continue;
        if (Math.abs(e.group.position.z - laneZ) > 1.35) continue;
        if (Math.abs(e.group.position.x - currX) <= radius) {
          hitSet.add(e);
          if (damageEnemy) damageEnemy(e, baseDmg, isSpecial ? sp.c2 : sp.c1, knockback, slowSec);
        }
      }
    };

    // Helper: builds a multi-sprite ribbon stream / wave that travels from `startPos.x` to `endX`
    const spawnLaneTravelingWave = (opts) => {
      const {
        texKind = 'flame',
        count = isSpecial ? 22 : 12,
        duration = isSpecial ? 1.15 : 0.78,
        spreadZ = isSpecial ? 0.95 : 0.38,
        spreadY = isSpecial ? 0.65 : 0.28,
        baseSize = isSpecial ? 1.55 : 0.95,
        spiral = 0,
        arcHeight = 0,
        groundTrail = false,
        lightningEvery = 0,
        dmgMult = isSpecial ? 2.6 : 1.15,
        knock = isSpecial ? 0.55 : 0.12,
        slow = 0
      } = opts;

      const tex = getFxSpriteTex(texKind, THREE);
      const runeTex = getFxSpriteTex('rune_circle', THREE);
      const sprites = [];

      for (let i = 0; i < count; i++) {
        const smat = new THREE.SpriteMaterial({
          map: tex,
          color: i % 2 === 0 ? col1 : col2,
          transparent: true,
          opacity: 0.96,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          rotation: opts.alignRotation ? 0 : (Math.random() * Math.PI * 2)
        });
        const spr = new THREE.Sprite(smat);
        const phase = i / Math.max(1, count - 1);
        spr.userData = {
          phase,
          zOff: (Math.random() - 0.5) * spreadZ,
          yOff: (Math.random() - 0.5) * spreadY,
          rotSpeed: opts.alignRotation ? 0 : (Math.random() - 0.5) * 6,
          size: baseSize * (0.75 + Math.random() * 0.5)
        };
        spr.position.copy(startPos);
        spr.scale.setScalar(spr.userData.size);
        fxGroup.add(spr);
        sprites.push(spr);
      }

      // Moving additive glow sprite following the wave head (avoids PointLight shader recompilation)
      const waveGlowMat = new THREE.SpriteMaterial({
        map: getFxSpriteTex('star_flare', THREE),
        color: col1,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const waveGlow = new THREE.Sprite(waveGlowMat);
      waveGlow.position.set(startPos.x, startPos.y + 0.3, laneZ);
      waveGlow.scale.setScalar(isSpecial ? 2.6 : 1.7);
      fxGroup.add(waveGlow);

      let lightningTimer = 0;
      let trailTimer = 0;

      dynamicFlashes.push({
        age: 0,
        maxAge: duration,
        update(dt) {
          this.age += dt;
          const p = Math.min(1, this.age / this.maxAge);
          const headX = startPos.x + distTotal * Math.min(1, p * 1.18);
          waveGlow.position.set(headX, startPos.y + 0.3, laneZ);
          waveGlowMat.opacity = (1 - p) * 0.92;

          // Continuous lane damage sweep as the wave travels across the entire lane
          sweepDamage(headX, isSpecial ? 1.45 : 0.95, dmgMult, knock, slow);

          if (lightningEvery > 0 && battleFX) {
            lightningTimer += dt;
            if (lightningTimer >= lightningEvery) {
              lightningTimer = 0;
              battleFX.spawnLightningBolt(
                new THREE.Vector3(headX - 0.8, startPos.y + 1.8, laneZ + (Math.random() - 0.5) * 0.8),
                new THREE.Vector3(headX + 0.4, 0.15, laneZ + (Math.random() - 0.5) * 0.8),
                isSpecial ? sp.c2 : sp.c1
              );
            }
          }

          if (groundTrail && battleFX) {
            trailTimer += dt;
            if (trailTimer >= 0.085) {
              trailTimer = 0;
              battleFX.spawnExplosion(new THREE.Vector3(headX, 0.18, laneZ + (Math.random() - 0.5) * 0.6), sp.c1, isSpecial ? 0.62 : 0.36);
            }
          }

          for (let i = 0; i < sprites.length; i++) {
            const s = sprites[i];
            const u = s.userData;
            // Staggered progression so the wave forms a long coherent stream across the lane
            const localP = Math.max(0, Math.min(1, (p * 1.35) - u.phase * 0.35));
            const cx = startPos.x + distTotal * localP;
            const spiralAngle = localP * Math.PI * 6 * spiral + u.phase * Math.PI * 2;
            const sy = startPos.y + u.yOff + Math.sin(localP * Math.PI) * arcHeight + (spiral ? Math.sin(spiralAngle) * 0.45 : 0);
            const sz = laneZ + u.zOff + (spiral ? Math.cos(spiralAngle) * 0.45 : 0);

            s.position.set(cx, Math.max(0.22, sy), sz);
            if (texKind === 'shadow_bat') {
              // Animated flapping bat motion!
              const flap = 1 + Math.sin(this.age * 28 + i) * 0.32;
              s.scale.set(u.size * flap, u.size * (1.3 - flap * 0.25), 1);
            } else if (texKind === 'sonic_crescent') {
              // Expanding ultrasonic crescent wave!
              const expand = 0.65 + localP * 1.45;
              s.scale.set(u.size * 0.85, u.size * expand, 1);
            } else {
              s.material.rotation += dt * u.rotSpeed;
              const pulse = 1 + Math.sin(this.age * 16 + i) * 0.18;
              s.scale.setScalar(u.size * pulse * (1 - localP * 0.25));
            }
            s.material.opacity = localP >= 0.98 ? Math.max(0, (1 - p) * 2.5) : 0.95;
          }
        },
        dispose() {
          fxGroup.remove(waveGlow);
          waveGlowMat.dispose();
          for (const s of sprites) {
            fxGroup.remove(s);
            s.material.dispose();
          }
        }
      });
    };

    // Helper: Full-Lane High-Energy Beam + Spiraling Runic Rings + Ground Scorch
    const spawnFullLaneBeam = (opts) => {
      const {
        duration = isSpecial ? 1.1 : 0.68,
        width = isSpecial ? 1.45 : 0.78,
        skyPortal = false,
        skyPillars = 0,
        dmgMult = isSpecial ? 2.8 : 1.25,
        knock = isSpecial ? 0.48 : 0.15
      } = opts;

      const flareTex = getFxSpriteTex('star_flare', THREE);
      const runeTex = getFxSpriteTex('rune_circle', THREE);

      // Crossed additive ribbon planes spanning from `startPos.x` to `endX`
      const beamCenter = (startPos.x + endX) * 0.5;
      const beamGroup = new THREE.Group();
      beamGroup.position.set(beamCenter, startPos.y, laneZ);

      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.95,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      });
      const auraMat = new THREE.MeshBasicMaterial({
        color: col1, transparent: true, opacity: 0.82,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      });

      const coreGeo = new THREE.PlaneGeometry(distTotal, width * 0.42);
      const auraGeo = new THREE.PlaneGeometry(distTotal, width);
      for (let i = 0; i < 3; i++) {
        const pCore = new THREE.Mesh(coreGeo, coreMat);
        pCore.rotation.x = (i * Math.PI) / 3;
        beamGroup.add(pCore);

        const pAura = new THREE.Mesh(auraGeo, auraMat);
        pAura.rotation.x = (i * Math.PI) / 3 + 0.25;
        beamGroup.add(pAura);
      }
      fxGroup.add(beamGroup);

      // Rotating runic rings along the beam
      const rings = [];
      const ringGeo = new THREE.PlaneGeometry(width * 1.9, width * 1.9);
      const ringCount = isSpecial ? 7 : 4;
      for (let r = 0; r < ringCount; r++) {
        const rMat = new THREE.MeshBasicMaterial({
          map: runeTex, color: r % 2 === 0 ? col2 : col1,
          transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending,
          depthWrite: false, side: THREE.DoubleSide
        });
        const rMesh = new THREE.Mesh(ringGeo, rMat);
        rMesh.rotation.y = Math.PI / 2;
        rMesh.position.set(startPos.x + (r / ringCount) * distTotal, startPos.y, laneZ);
        fxGroup.add(rMesh);
        rings.push(rMesh);
      }

      // Optional Sky Constellation Portal raining pillars down the entire lane (`arquimago_astral`, `solar`, `cestille`, `vigia`)
      const skyMeshes = [];
      let skyGeo = null;
      let skyMat = null;
      if (skyPortal) {
        skyMat = new THREE.MeshBasicMaterial({
          map: runeTex, color: col2, transparent: true, opacity: 0.9,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
        });
        skyGeo = new THREE.PlaneGeometry(4.2, 4.2);
        skyGeo.rotateX(-Math.PI / 2);
        for (let k = 0; k < 3; k++) {
          const sm = new THREE.Mesh(skyGeo, skyMat);
          sm.position.set(startPos.x + 1.8 + k * 2.4, 5.2, laneZ);
          fxGroup.add(sm);
          skyMeshes.push(sm);
        }
      }

      // Sweep damage across the entire lane immediately & mid-beam
      for (let x = startPos.x; x <= endX; x += 0.9) {
        sweepDamage(x, 1.25, dmgMult, knock, 0);
      }

      let pillarTick = 0;
      dynamicFlashes.push({
        age: 0,
        maxAge: duration,
        update(dt) {
          this.age += dt;
          const t = Math.min(1, this.age / this.maxAge);
          const pulse = 1 + Math.sin(this.age * 35) * 0.22;
          beamGroup.scale.set(1, pulse * (1 - t * 0.65), pulse * (1 - t * 0.65));
          beamGroup.rotation.x += dt * 8;
          coreMat.opacity = Math.max(0, 1 - Math.pow(t, 1.5));
          auraMat.opacity = Math.max(0, (1 - t) * 0.85);

          for (let i = 0; i < rings.length; i++) {
            const rm = rings[i];
            rm.rotation.z += dt * (i % 2 === 0 ? 6 : -6);
            rm.position.x = startPos.x + (((i / rings.length) + this.age * 1.4) % 1.0) * distTotal;
            rm.material.opacity = Math.max(0, 1 - t);
          }

          for (const sm of skyMeshes) {
            sm.rotation.y += dt * 2.5;
            sm.material.opacity = Math.max(0, 1 - t);
          }

          if (skyPillars > 0 && battleFX) {
            pillarTick += dt;
            if (pillarTick >= 0.11) {
              pillarTick = 0;
              const px = startPos.x + 1.0 + Math.random() * (distTotal - 1.0);
              battleFX.spawnLightningBolt(
                new THREE.Vector3(px, 5.2, laneZ + (Math.random() - 0.5) * 0.8),
                new THREE.Vector3(px, 0.15, laneZ + (Math.random() - 0.5) * 0.8),
                sp.c2
              );
              battleFX.spawnExplosion(new THREE.Vector3(px, 0.25, laneZ), sp.c1, 0.72);
            }
          }
        },
        dispose() {
          fxGroup.remove(beamGroup);
          coreGeo.dispose();
          auraGeo.dispose();
          coreMat.dispose();
          auraMat.dispose();
          ringGeo.dispose();
          for (const rm of rings) {
            fxGroup.remove(rm);
            rm.material.dispose();
          }
          if (skyGeo) skyGeo.dispose();
          if (skyMat) skyMat.dispose();
          for (const sm of skyMeshes) {
            fxGroup.remove(sm);
          }
        }
      });
    };

    // ── SPECIFIC CHOREOGRAPHIES FOR ALL REPORTED & CANONICAL DRAGONS ──
    switch (style) {
      // 1. MORCEGO NOTURNO:
      // Normal = Pulso Ultrassônico (long-range expanding sonic crescents all the way down the lane!)
      case 'ultrasonic_rings':
        spawnLaneTravelingWave({
          texKind: 'sonic_crescent', count: 10, duration: 0.82,
          spreadZ: 0.12, spreadY: 0.1, baseSize: 1.45, alignRotation: true,
          dmgMult: 1.3, knock: 0.28
        });
        break;

      // Special = Enxame de Sombras (24 animated flapping shadow bats with glowing crimson eyes & dark mist corridor!)
      case 'shadow_bat_swarm':
        spawnLaneTravelingWave({
          texKind: 'shadow_bat', count: 26, duration: 1.25,
          spreadZ: 1.25, spreadY: 0.85, baseSize: 1.35, spiral: 0.45,
          groundTrail: true, dmgMult: 2.8, knock: 0.55
        });
        break;

      // 2. DEMÔNIO DAS CINZAS:
      // Normal = Corte Infernal em X (fiery cross-waves tearing the full length of the lane with scorched trail!)
      case 'hellfire_cross_slash':
        spawnLaneTravelingWave({
          texKind: 'slash_x', count: 14, duration: 0.80,
          spreadZ: 0.35, spreadY: 0.25, baseSize: 1.55,
          groundTrail: true, lightningEvery: 0.16, dmgMult: 1.45, knock: 0.3
        });
        break;

      // Special = Juízo de Magma Abissal (cataclysmic fissure + volcanic meteor rain + erupting geysers along the entire lane!)
      case 'abyssal_magma_judgment':
        spawnFullLaneBeam({ duration: 1.2, width: 1.55, skyPortal: true, skyPillars: 8, dmgMult: 3.1, knock: 0.7 });
        spawnLaneTravelingWave({
          texKind: 'flame', count: 28, duration: 1.2,
          spreadZ: 1.2, spreadY: 0.7, baseSize: 1.85, groundTrail: true,
          lightningEvery: 0.1, dmgMult: 1.2, knock: 0.4
        });
        break;

      // 3. COLOSSO DE OBSIDIANA:
      // Normal = Onda Sísmica Vulcânica (continuous traveling fissure wave all the way to `endX = 8.15`, never cut off!)
      case 'seismic_fissure_wave':
        spawnLaneTravelingWave({
          texKind: 'flame', count: 18, duration: 0.88,
          spreadZ: 0.45, spreadY: 0.2, baseSize: 1.5,
          groundTrail: true, lightningEvery: 0.14, dmgMult: 1.45, knock: 0.42
        });
        break;

      // Special = Chuva de Monólitos Incandescentes (sky portal raining blazing obsidian meteors across the whole lane!)
      case 'monolith_meteor_cataclysm':
        spawnLaneTravelingWave({
          texKind: 'star_flare', count: 24, duration: 1.25,
          spreadZ: 1.1, spreadY: 0.8, baseSize: 1.9, arcHeight: 2.2,
          groundTrail: true, lightningEvery: 0.09, dmgMult: 3.0, knock: 0.75
        });
        break;

      // 4. ARQUIMAGO ASTRAL:
      // Normal = Cometa do Astrolábio (visible blazing celestial comet wrapped in golden runic rings!)
      case 'astrolabe_comet':
        spawnLaneTravelingWave({
          texKind: 'star_flare', count: 16, duration: 0.82,
          spreadZ: 0.3, spreadY: 0.3, baseSize: 1.55, spiral: 0.65,
          lightningEvery: 0.18, dmgMult: 1.5, knock: 0.25
        });
        break;

      // Special = Convergência de Constelações (3 rotating star-chart portals in the sky raining 7 constellation pillars + supernova beam!)
      case 'constellation_sky_array':
        spawnFullLaneBeam({ duration: 1.3, width: 1.65, skyPortal: true, skyPillars: 10, dmgMult: 3.2, knock: 0.65 });
        spawnLaneTravelingWave({
          texKind: 'rune_circle', count: 18, duration: 1.25,
          spreadZ: 0.9, spreadY: 0.6, baseSize: 1.65, spiral: 0.8, dmgMult: 1.0, knock: 0.3
        });
        break;

      // 5. VIGIA DO ETERNO:
      // Normal = Julgamento do Olho Eterno (long-range arcane beam with rotating runic rings)
      case 'eternal_gaze_beam':
        spawnFullLaneBeam({ duration: 0.78, width: 0.95, skyPortal: false, skyPillars: 3, dmgMult: 1.55, knock: 0.3 });
        break;

      // Special = Decreto das Espadas Celestiais (storm of glowing winged swords raining across the entire lane!)
      case 'celestial_blade_tempest':
        spawnLaneTravelingWave({
          texKind: 'celestial_sword', count: 28, duration: 1.25,
          spreadZ: 1.15, spreadY: 0.95, baseSize: 1.75, arcHeight: 1.8, alignRotation: true,
          groundTrail: true, lightningEvery: 0.1, dmgMult: 3.3, knock: 0.7
        });
        break;

      // 6. NECRO / SOMBRA / VAZIO:
      case 'soulfire_stream':
      case 'wraith_legion_march':
        spawnLaneTravelingWave({
          texKind: 'skull_wraith', count: isSpecial ? 26 : 14, duration: isSpecial ? 1.25 : 0.85,
          spreadZ: isSpecial ? 1.15 : 0.4, spreadY: 0.5, baseSize: isSpecial ? 1.65 : 1.25,
          alignRotation: true, groundTrail: isSpecial, lightningEvery: isSpecial ? 0.12 : 0,
          dmgMult: isSpecial ? 2.9 : 1.35, knock: isSpecial ? 0.6 : 0.2
        });
        break;

      case 'dimensional_rift_beam':
      case 'black_hole_collapse':
        spawnFullLaneBeam({
          duration: isSpecial ? 1.3 : 0.8, width: isSpecial ? 1.8 : 0.95,
          skyPortal: isSpecial, skyPillars: isSpecial ? 9 : 3,
          dmgMult: isSpecial ? 3.4 : 1.6, knock: isSpecial ? 0.8 : 0.3
        });
        break;

      // 7. GELO / ÁGUA / SEREIA GLACIAL:
      case 'frost_javelins':
      case 'blizzard_corridor':
      case 'siren_frost_aria':
      case 'cryo_tsunami':
        spawnLaneTravelingWave({
          texKind: style === 'siren_frost_aria' ? 'sonic_crescent' : 'frost_crystal',
          count: isSpecial ? 26 : 14, duration: isSpecial ? 1.18 : 0.8,
          spreadZ: isSpecial ? 1.1 : 0.4, spreadY: 0.5, baseSize: isSpecial ? 1.6 : 1.15,
          spiral: isSpecial ? 0.6 : 0.2, groundTrail: isSpecial,
          dmgMult: isSpecial ? 2.75 : 1.25, knock: isSpecial ? 0.5 : 0.18, slow: isSpecial ? 3.2 : 1.6
        });
        break;

      // 8. BIOMASSA / GUARDIÃO BOTÂNICO / BROTO / MUSGO / ANCESTRAL:
      case 'spore_barrage':
      case 'vine_whip_lane':
      case 'boulder_ricochet':
      case 'root_rupture_lane':
      case 'acorn_gatling':
      case 'giant_seed_stampede':
      case 'solar_leaf_lance':
      case 'world_tree_eruption':
      case 'gaia_primordial_breath':
      case 'continental_fault_eruption':
        spawnLaneTravelingWave({
          texKind: 'leaf_blade', count: isSpecial ? 26 : 14, duration: isSpecial ? 1.15 : 0.8,
          spreadZ: isSpecial ? 1.1 : 0.38, spreadY: 0.45, baseSize: isSpecial ? 1.65 : 1.15,
          spiral: isSpecial ? 0.55 : 0, groundTrail: true,
          lightningEvery: isSpecial ? 0.14 : 0,
          dmgMult: isSpecial ? 2.85 : 1.25, knock: isSpecial ? 0.58 : 0.2
        });
        break;

      // 9. LUZ / CRISTAL / PRISMA / AURORA / SOLAR / CESTILLE:
      case 'ruby_laser':
      case 'emerald_resonance':
      case 'prism_refraction':
      case 'rainbow_aurora_beam':
      case 'dawn_solar_ray':
      case 'boreal_curtain_blast':
      case 'helios_spear_beam':
      case 'solar_prominence_cataclysm':
      case 'royal_cestille_beam':
      case 'cestille_sovereign_judgment':
        spawnFullLaneBeam({
          duration: isSpecial ? 1.25 : 0.78, width: isSpecial ? 1.7 : 0.9,
          skyPortal: isSpecial, skyPillars: isSpecial ? 9 : 2,
          dmgMult: isSpecial ? 3.25 : 1.45, knock: isSpecial ? 0.7 : 0.25
        });
        break;

      // 10. RAIO / FOGO / VENTO / METAL / ÁGUA (ALL LONG-RANGE!):
      default:
        spawnLaneTravelingWave({
          texKind: (sp.elem === 'Raio' || sp.elem === 'Luz') ? 'star_flare' : (sp.elem === 'Vento' ? 'sonic_crescent' : 'flame'),
          count: isSpecial ? 26 : 14,
          duration: isSpecial ? 1.18 : 0.78,
          spreadZ: isSpecial ? 1.05 : 0.36,
          spreadY: isSpecial ? 0.65 : 0.28,
          baseSize: isSpecial ? 1.65 : 1.12,
          spiral: isSpecial ? 0.65 : 0.15,
          groundTrail: isSpecial || sp.elem === 'Fogo' || sp.elem === 'Terra',
          lightningEvery: (sp.elem === 'Raio' || isSpecial) ? 0.11 : 0,
          dmgMult: isSpecial ? 2.85 : 1.25,
          knock: isSpecial ? 0.55 : 0.18
        });
        break;
    }
  }

  window.PreviewAll30Dragons = {
    ZSP_ALL30,
    makeDragonDetailedSkinTex,
    applyDragonOrganicSculptAndSkin,
    prepareDragonAnimation,
    getDragonDBConfig,
    computeSafeDragonBox,
    spawnSummonRitualFX,
    fireDragonAttack30
  };
})();
