import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// Variáveis de controlo do personagem
let mixer;
const animActions = {};
let activeAction;
let monkeyModel;
let rightHandBone = null;
let isOneShotActive = false;

// Estado das teclas (WASD)
const teclas = { w: false, a: false, s: false, d: false };
const velocidadeMovimento = 5.0; // Velocidade de deslocação

// 1. Carregar o Modelo e Mapear Animações
const loader = new GLTFLoader();
const modelPath = './assets/monkey.glb'; // Ajuste para './monkey.glb' se estiver direto na raiz da deploy

loader.load(
  modelPath,
  (gltf) => {
    monkeyModel = gltf.scene;
    monkeyModel.scale.set(1, 1, 1);
    monkeyModel.position.set(0, 0, 0);
    scene.add(monkeyModel);

    // Localizar o osso da mão direita para encaixar armas futuramente
    monkeyModel.traverse((child) => {
      if (child.isBone && (child.name === 'mixamorigRightHand' || child.name.includes('RightHand'))) {
        rightHandBone = child;
      }
    });

    // Inicializar o Gestor de Animações
    mixer = new THREE.AnimationMixer(monkeyModel);

    // Mapear todos os clipes que foram combinados dentro do .glb
    gltf.animations.forEach((clip) => {
      // Trava de segurança: neutraliza deslocamento involuntário de X/Z na raiz (In-Place forçado)
      clip.tracks.forEach((track) => {
        if (track.name.endsWith('.position') && track.name.includes('Hips')) {
          for (let i = 0; i < track.values.length; i += 3) {
            track.values[i] = 0;     // Trava X
            track.values[i + 2] = 0; // Trava Z
          }
        }
      });

      const nomeLimpo = clip.name.toLowerCase().trim();
      animActions[nomeLimpo] = mixer.clipAction(clip);
    });

    // Iniciar na pose de respiração (Idle)
    const animacaoInicial = animActions['idle'] || animActions['happy idle'] || Object.values(animActions)[0];
    if (animacaoInicial) {
      activeAction = animacaoInicial;
      activeAction.play();
    }

    // Ouvinte para restaurar o Idle após ações de disparo único (emotes/pulos)
    mixer.addEventListener('finished', () => {
      isOneShotActive = false;
      const baseAction = isMoving() ? (animActions['run'] || animActions['running']) : (animActions['idle'] || animActions['happy idle']);
      if (baseAction) transicionarPara(baseAction, 0.2);
    });

    console.log('Animações disponíveis:', Object.keys(animActions));
  },
  undefined,
  (error) => {
    console.error('Erro ao carregar o modelo:', error);
  }
);

// 2. Transição Suave entre Animações (CrossFade)
function transicionarPara(novaAcao, duracao = 0.2) {
  if (!novaAcao || novaAcao === activeAction) return;
  novaAcao.reset();
  novaAcao.play();
  activeAction.crossFadeTo(novaAcao, duracao, true);
  activeAction = novaAcao;
}

// 3. Execução de Ações Únicas (Atalhos / Emotes)
function dispararAcaoUnica(nome) {
  const acao = animActions[nome.toLowerCase()];
  if (!acao || isOneShotActive) return;

  isOneShotActive = true;
  acao.setLoop(THREE.LoopOnce, 1);
  acao.clampWhenFinished = true;
  transicionarPara(acao, 0.15);
}

function isMoving() {
  return teclas.w || teclas.a || teclas.s || teclas.d;
}

// 4. Captura dos Controlos de Teclado
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  const key = e.key.toLowerCase();
  if (key in teclas) {
    const estavaParado = !isMoving();
    teclas[key] = true;
    if (estavaParado && !isOneShotActive) {
      const acaoCorrida = animActions['run'] || animActions['running'] || animActions['fast run'];
      if (acaoCorrida) transicionarPara(acaoCorrida, 0.2);
    }
  }

  // Atalhos de Ações e Emotes
  switch (e.code) {
    case 'Space': // Pulo
      dispararAcaoUnica('jumping') || dispararAcaoUnica('jump');
      break;
    case 'Digit1': // Provocação / Taunt
      dispararAcaoUnica('taunt');
      break;
    case 'Digit2': // Capoeira
      dispararAcaoUnica('capoeira');
      break;
    case 'Digit3': // Riso
      dispararAcaoUnica('sitting laughing') || dispararAcaoUnica('laugh');
      break;
    case 'KeyK': // Morte / Derrota
      dispararAcaoUnica('dying') || dispararAcaoUnica('death');
      break;
  }
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key in teclas) {
    teclas[key] = false;
    if (!isMoving() && !isOneShotActive) {
      const acaoParado = animActions['idle'] || animActions['happy idle'];
      if (acaoParado) transicionarPara(acaoParado, 0.25);
    }
  }
});

// 5. Função para Acoplar uma Arma na Mão
export function equiparArma(armaMesh) {
  if (rightHandBone) {
    armaMesh.scale.set(0.5, 0.5, 0.5);
    armaMesh.position.set(0.05, 0.02, 0.08); // Offset para ajustar à palma
    armaMesh.rotation.set(0, Math.PI / 2, 0);
    rightHandBone.add(armaMesh);
  } else {
    console.warn('Osso da mão direita não encontrado.');
  }
}

// 6. Atualização no Loop Principal de Animação
export function atualizarMacaco(delta) {
  if (mixer) mixer.update(delta);

  // Movimentação física no mapa se o boneco existir
  if (monkeyModel && isMoving()) {
    const direcao = new THREE.Vector3();
    if (teclas.w) direcao.z -= 1;
    if (teclas.s) direcao.z += 1;
    if (teclas.a) direcao.x -= 1;
    if (teclas.d) direcao.x += 1;

    direcao.normalize();
    monkeyModel.position.addScaledVector(direcao, velocidadeMovimento * delta);

    // Rodar o macaco na direção da caminhada
    const angulo = Math.atan2(direcao.x, direcao.z);
    monkeyModel.rotation.y = angulo;
  }
}