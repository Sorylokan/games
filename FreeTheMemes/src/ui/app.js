import { DiceTray } from "./dice-tray.js";
import { createTranslator, loadLocale, getLocale } from "../i18n.js";
import { createLocalGame } from "../game/setup.js";
import { GAME_PHASES } from "../game/game-state.js";
import { startGame, beginTurn, completeAreaAction, completeAttack, completeMovement, endTurn } from "../game/turn-manager.js";
import { areaAttack, attack, canTargetWithAttack, mustAttack, resolveCombatPendingAction } from "../game/combat.js";
import { getCharacter } from "../data/characters.js";
import { AREAS } from "../data/areas.js";
import { getCard } from "../data/cards.js";
import { resolveAreaAction, resolveAreaPendingAction } from "../game/areas.js";
import { resolvePendingAction } from "../game/cards.js";
import { createRoomId, createRoomLink, getRoomIdFromLocation, normalizeRoomCode, isValidRoomCode } from "../networking/room.js";
import { createHostSession, createClientSession } from "../networking/game-session.js";
import { createActionRequest, cleanName, MESSAGE_TYPES } from "../networking/messages.js";
import { SECRET_REACTION, isSecretPendingType } from "../networking/serialization.js";
import { resolveEquipmentReward } from "../game/rules-engine.js";
import { isValidMovementDestination, getAdjacentAreaIds, resolveMovementAction, resolveMovementDestination, resolveMovementRollChoice } from "../movement.js";
import { ABILITY_BY_CHARACTER } from "../game/abilities.js";
import { tick, thunk, click, ping, bonk, hit, heal, death, tada, isMuted, toggleMuted, setSoundTheme } from "./sound.js";

const diceHost = document.createElement("div");
const dice = new DiceTray(diceHost, [6, 4], { cell: 38, onTick: tick, onSettle: thunk });
let seenEvents = null;
// Evenements de des recus mais pas encore montres : l'odometre tourne, le
// journal et le plateau n'affichent la consequence qu'a l'arret des des.
const pendingDice = new Set();
const diceRolling = () => pendingDice.size > 0;
 
// Animation "impact" : ajoute la classe anim-shake au body, la retire apres.
// Defaut : les zones vibrent ; theme MSN : wizz global de l'ecran (cf CSS).
const ANIM_MS = 550;
let animTimer = null;
const playShake = () => {
  document.body.classList.remove("anim-shake");
  void document.body.offsetWidth;              // relance l'animation meme si deja active
  document.body.classList.add("anim-shake");
  clearTimeout(animTimer);
  animTimer = setTimeout(() => document.body.classList.remove("anim-shake"), ANIM_MS);
};

const syncDice = () => {
  const real = state.events;
  if (seenEvents === null || real.length < seenEvents) { seenEvents = real.length; return; }
  const fresh = real.slice(seenEvents);
  seenEvents = real.length;

  // Sons d'evenements (degats, soin, mort, victoire) : joues pour chaque
  // evenement frais. try/catch : un AudioContext non pret ne doit pas casser le render.
  for (const e of fresh) {
    try {
      if (e.type === "DAMAGE_DEALT") { hit(e.amount); playShake(); }
      else if (e.type === "HEAL_APPLIED") heal();
      else if (e.type === "PLAYER_DIED") { death(); playShake(); }
      else if (e.type === "VICTORY_REACHED") tada();
    } catch (err) { warnLog("sound error", err); }
  }

  // Ne pas nommer cette variable "hit" : elle masquerait le son hit() importé,
  // et la boucle ci-dessus planterait (variable pas encore initialisée).
  const diceEvent = fresh.findLast((e) => e.type === "ATTACK_RESOLVED" || e.type === "AREA_ATTACK_RESOLVED" || e.type === "MOVEMENT_ROLLED" || e.type === "ABILITY_ROLLED");
  if (!diceEvent) return;
  const diceIndex = real.indexOf(diceEvent);
  // Retenir le jet ET ses consequences (deplacement, degats...) jusqu'a
  // l'arret de l'odometre, sinon le journal devoile le resultat trop tot.
  const held = real.slice(diceIndex);
  held.forEach((e) => pendingDice.add(e));
  let rolling;
  if (diceEvent.type === "ABILITY_ROLLED") {
    rolling = dice.dice[diceEvent.sides === 4 ? 1 : 0].roll(diceEvent.value);   // d6 Death Note, d4 Hadouken
  } else {
    rolling = diceEvent.d6 == null ? dice.dice[1].roll(diceEvent.d4) : dice.roll([diceEvent.d6, diceEvent.d4]);   // attaque forcee : d4 seul
  }
  rolling.then(() => { held.forEach((e) => pendingDice.delete(e)); fillLog(); revealMovement(held); });
};

// Journal de DEBUG : console de l'inspecteur uniquement, jamais injecte dans
// state.events (sinon il polluerait l'historique de partie ET serait diffuse
// aux autres joueurs via serializePublicState).
const debugLog = (...args) => console.debug("[FTM]", ...args);
const warnLog = (...args) => console.warn("[FTM]", ...args);

// Animation FLIP : quand les des s'arretent, on fait glisser les pions de
// leur ancienne zone vers la nouvelle au lieu de les teleporter.
const revealMovement = (held) => {
  const movedIds = new Set(held.filter((e) => e.type === "PLAYER_MOVED").map((e) => e.playerId));
  const before = new Map();
  for (const playerId of movedIds) {
    const el = app.querySelector(`[data-piece="${playerId}"]`);
    if (el) before.set(playerId, el.getBoundingClientRect());
  }
  render();
  if (!before.size) return;
  for (const [playerId, oldRect] of before) {
    const el = app.querySelector(`[data-piece="${playerId}"]`);
    if (!el) continue;
    const newRect = el.getBoundingClientRect();
    const dx = oldRect.left - newRect.left;
    const dy = oldRect.top - newRect.top;
    if (!dx && !dy) continue;
    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      el.style.transition = "transform .5s cubic-bezier(.25,.8,.3,1)";
      el.style.transform = "";
    });
  }
};


const app = document.querySelector("#app");
app.addEventListener("click", (e) => { if (e.target.closest(".action")) click(); });
let state;
let translate;
let localPlayerId = "player-1";
let network;
let roomId = getRoomIdFromLocation();
let roomStatus = "offline";
let peers = [];
let roomPlayers = [];
let isHost = false;
let hostSession;
let clientSession;
// Pseudo par defaut au premier lancement, localStorage des qu'il est choisi ou edite (handleNameChange).
const DEFAULT_NAMES = [
  "Pepe", "Nyan Cat", "Trollface", "Distracted BF", "Shrek",
  "Gigachad", "Keyboard Cat", "Grumpy Cat", "Bad Luck Brian", "Hide the Pain",
  "Woman Yelling", "Surprised Pikachu", "Raptor Jesus", "Rage Guy", "Dat Boi"
];
const randomPlayerName = () => DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];

let localPlayerName = cleanName(localStorage.getItem("ftm-player-name"), "") || randomPlayerName();
localStorage.setItem("ftm-player-name", localPlayerName);
let assignedPlayerId = "player-1";
let roomRole = roomId ? "client" : "local";
let privateState = null;
let publicPendingActions = []; // actions en attente telles que diffusées à tous (réactions secrètes masquées)
let wasMyTurn = false;

// Jeton de siege local : stable par salle et par navigateur, jamais secret.
// L'hote s'en sert pour rendre son siege a un joueur qui se reconnecte.
const loadSeatToken = (code) => {
  const key = `ftm-seat:${code}`;
  let token = null;
  try { token = localStorage.getItem(key); } catch { /* stockage indisponible */ }
  if (!token) {
    token = globalThis.crypto?.randomUUID?.() ?? `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    try { localStorage.setItem(key, token); } catch { /* ignore */ }
  }
  return token;
};

// Fusionne ce que seul CE joueur a le droit de savoir dans sa copie locale de l'état.
// Les actions en attente repartent toujours de la version publique, puis on y remet la
// version complète des NÔTRES : une vue privée en retard est corrigée au message suivant.
const withPrivate = (s) => {
  const me = privateState && s?.players?.[privateState.playerId];
  if (!me) return s;
  const pendingActions = publicPendingActions.map((action, i) => {
    const mine = privateState.pendingActions?.[i];
    const matches = mine?.playerId === action.playerId && (action.type === SECRET_REACTION || mine.type === action.type);
    return matches ? mine : action;
  });
  return {
    ...s,
    pendingActions,
    players: {
      ...s.players,
      [me.id]: {
        ...me,
        characterId: privateState.characterId,
        faction: privateState.faction,
        abilityState: privateState.abilityState,
        maxHp: privateState.maxHp,
        hp: privateState.maxHp - (me.damage ?? 0)
      }
    }
  };
};

let logOpen = false;
const logWin = document.createElement("div");
logWin.className = "term";
logWin.hidden = true;
logWin.innerHTML = `<div class="term-bar"><span>journal.ps1</span><button type="button" class="term-x" aria-label="Close">×</button></div><div class="term-body"></div>`;
document.body.append(logWin);
logWin.querySelector(".term-x").addEventListener("click", () => { logOpen = false; logWin.hidden = true; });
const termBar = logWin.querySelector(".term-bar");
const termBody = logWin.querySelector(".term-body");
termBody.addEventListener("scroll", () => {
  termBody.dataset.stick = termBody.scrollHeight - termBody.scrollTop - termBody.clientHeight < 40 ? "1" : "0";
});
termBar.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button")) return;
  const r = logWin.getBoundingClientRect();
  const dx = e.clientX - r.left, dy = e.clientY - r.top;
  logWin.style.right = "auto"; logWin.style.bottom = "auto";
  termBar.setPointerCapture(e.pointerId);
  const move = (ev) => {
    logWin.style.left = `${Math.min(Math.max(0, ev.clientX - dx), innerWidth - 80)}px`;
    logWin.style.top = `${Math.min(Math.max(0, ev.clientY - dy), innerHeight - 40)}px`;
  };
  const up = () => { termBar.removeEventListener("pointermove", move); termBar.removeEventListener("pointerup", up); };
  termBar.addEventListener("pointermove", move);
  termBar.addEventListener("pointerup", up);
});
const fillLog = () => {
  // Historique de partie : uniquement les evenements de jeu (le debug vit dans la console).
  termBody.innerHTML = state.events.slice(-80)
    .filter((e) => !pendingDice.has(e))
    .map((e) => `<div>${describeEvent(e)}</div>`).join("");
  if (termBody.dataset.stick !== "0") termBody.scrollTop = termBody.scrollHeight;
};

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 8;
const players = Array.from({ length: MAX_PLAYERS }, (_, i) => ({ id: `player-${i + 1}`, name: `Player ${i + 1}` }));
let roomLobby = null;

const AREA_NAME_KEYS = Object.fromEntries(Object.values(AREAS).map((area) => [area.id, area.nameKey]));
const getAreaLabel = (areaId) => (areaId ? translate(AREA_NAME_KEYS[areaId] ?? areaId) : "Nowhere yet");
const getEquipmentLabel = (cardId) => {
  const card = getCard(cardId);
  return card ? translate(card.nameKey) : cardId.replaceAll("-", " ");
};
const T = (key, vars) => translate(key, vars);

// Messages d'état du salon : stockés comme clé + variables, donc retraduits au changement de langue.
let roomNotice = null;
const setNotice = (key, vars = {}) => { roomNotice = { key, vars }; };
let joinCodeDraft = "";   // code tapé dans l'accueil, conservé entre deux rendus
// Code/lien masqués par défaut dans le salon (stream, capture d'écran) : le bouton œil
// les révèle, les boutons Copier copient toujours les vraies valeurs (comme GridOfGreed).
const ROOM_CODE_MASK = "••••-••••";
let roomCodeShown = false;

// ---- Thème ----
// Pour ajouter un thème plus tard : une ligne ici + son fichier CSS (theme-<id>.css).
// Le socle styles.css est neutre ; chaque thème fournit l'apparence complète.
const THEMES = [
  { id: "persona5", label: "Persona 5", css: "./src/ui/theme-persona5.css" },
  { id: "synthwave", label: "Synthwave", css: "./src/ui/theme-synthwave.css" },
  { id: "msn", label: "MSN / Web 2000", css: "./src/ui/theme-msn.css" },
  { id: "memes", label: "Meme Culture", css: "./src/ui/theme-memes.css" },
  { id: "desktop-2004", label: "Bureau 2004", css: "./src/ui/theme-bureau2004.css" }
];
let theme = localStorage.getItem("ftm-theme");
if (!THEMES.some((t) => t.id === theme)) theme = THEMES[0].id;
const themeLink = document.createElement("link");
themeLink.rel = "stylesheet";
document.head.append(themeLink);
const applyTheme = (id) => {
  const def = THEMES.find((t) => t.id === id) ?? THEMES[0];
  theme = def.id;
  localStorage.setItem("ftm-theme", theme);
  // la classe va sur <body> (pas sur #app) : le fond et la police du body doivent voir les variables du thème
  document.body.classList.remove(...[...document.body.classList].filter((c) => c.startsWith("theme-")));
  document.body.classList.add(`theme-${theme}`);
  if (def.css) themeLink.href = def.css; else themeLink.removeAttribute("href");
  setSoundTheme(theme);   // adapte les sons synthétisés au thème actif
};
applyTheme(theme);

// ---- Langue ----
const SUPPORTED_LOCALES = [{ code: "en", label: "English" }, { code: "fr", label: "Français" }];
const isSupported = (code) => SUPPORTED_LOCALES.some((l) => l.code === code);
let locale = localStorage.getItem("ftm-locale");
if (!isSupported(locale)) locale = isSupported(getLocale()) ? getLocale() : "en";
let englishMessages = null;

const loadMessages = async (code) => {
  englishMessages ??= await loadLocale("en");
  const messages = { en: englishMessages };
  if (code !== "en") {
    try { messages[code] = await loadLocale(code); } catch { /* fichier absent : repli sur l'anglais */ }
  }
  translate = createTranslator({ locale: code, messages });
};
const setLocale = async (code) => {
  if (!isSupported(code)) return;
  locale = code;
  localStorage.setItem("ftm-locale", code);
  document.documentElement.lang = code;
  await loadMessages(code);
  render();
};
const renderLocaleSelect = () => `<select class="locale-select" data-locale aria-label="${escHtml(T("ui.language"))}">${
  SUPPORTED_LOCALES.map((l) => `<option value="${l.code}" ${l.code === locale ? "selected" : ""}>${l.label}</option>`).join("")
}</select>`;

// Retour au catalogue de tous les jeux (dossier parent), en tête de chaque barre du haut.
// Classe wordmark en plus : la flèche prend la couleur du logo, que chaque thème redéfinit.
const renderBackLink = () => `<a class="wordmark back-link" href="../" title="${escHtml(T("ui.allGames"))}" aria-label="${escHtml(T("ui.allGames"))}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></a>`;

const renderThemeSelect = () => `<select class="locale-select" data-theme-select aria-label="${escHtml(T("ui.theme"))}">${
  THEMES.map((t) => `<option value="${t.id}" ${t.id === theme ? "selected" : ""}>${t.label}</option>`).join("")
}</select>`;

app.addEventListener("change", (e) => {
  const select = e.target.closest?.("[data-locale]");
  if (select) setLocale(select.value);
  const themeSelect = e.target.closest?.("[data-theme-select]");
  if (themeSelect) applyTheme(themeSelect.value);   // pas besoin de render() : seul le CSS change
});
const esc = (s) => String(s).replaceAll('"', "&quot;");
const AREA_BY_ID = Object.fromEntries(Object.values(AREAS).map((area) => [area.id, area]));
const diceLabel = (areaId) => {
  const totals = AREA_BY_ID[areaId]?.dieTotals ?? [];
  return totals.length > 1 ? `${totals[0]}–${totals.at(-1)}` : `${totals[0] ?? "?"}`;
};
const getEquipmentText = (cardId) => {
  const card = getCard(cardId);
  return card ? translate(card.textKey) : "";
};

// Purely decorative - not game data, just a visual identifier per Area so the board
// doesn't read as a grid of identical boxes.
const AREA_ICONS = Object.freeze({
  "otakus-paradise": "🎌",
  "bed-of-your-dreams": "🛏️",
  "grandmas-new-bedroom": "🕯️",
  "attic-hatch": "🪜",
  "toxic-relationship": "💔",
  "pickpocket-boulevard": "🧤"
});

// A player's board piece/token, colored by their fixed turn-order slot so the same
// player keeps the same color across the zone tokens and the character cards below.
const pieceIndexFor = (playerId) => {
  const index = state.turnOrder.indexOf(playerId);
  return index < 0 ? 0 : index % 8;
};

// attackableIds: set des cibles valides en phase d'attaque -> le pion devient cliquable.
const renderPieceToken = (player, active, attackableIds = null) => {
  const attackable = attackableIds?.has(player.id);
  return `
  <span class="piece piece-${pieceIndexFor(player.id)} ${player.id === active.id ? "current" : ""} ${player.alive ? "" : "dead"} ${attackable ? "attackable" : ""}" data-piece="${player.id}" ${attackable ? `data-attack-target="${player.id}" role="button" tabindex="0"` : ""} title="${player.alive ? player.name : `${escHtml(player.name)}, eliminated`}">
    <span class="piece-avatar">${player.name.slice(0, 1).toUpperCase()}</span>
    <span class="piece-name">${escHtml(player.name)}</span>
  </span>`;
};

// const renderCharacterCard = (player, active) => {
  // const character = player.characterId ? getCharacter(player.characterId) : null;
  // const revealed = player.revealed || player.id === localPlayerId;
  // const factionClass = revealed && character ? `faction-${character.faction}` : "faction-hidden";
  // const hpPercent = Math.max(0, Math.round((player.hp / player.maxHp) * 100));
// 
  // return `
    // <article class="char-card ${factionClass} piece-${pieceIndexFor(player.id)} ${player.id === active.id ? "active" : ""} ${player.alive ? "" : "dead"}">
      // <header class="char-card-head">
        // <span class="char-avatar">${player.name.slice(0, 1).toUpperCase()}</span>
        // <div class="char-card-identity">
          // <strong>${escHtml(player.name)}</strong>
          // <small>${revealed && character ? translate(character.nameKey) : "Hidden identity"}</small>
        // </div>
      // </header>
      // ${player.alive
        // ? `<div class="hp-bar"><div class="hp-fill" style="width:${hpPercent}%"></div></div>
          //  <p class="char-meta">${player.hp}/${player.maxHp} HP &middot; ${getAreaLabel(player.areaId)}</p>`
        // : `<p class="char-meta">Eliminated</p>`}
      // ${player.equipment.length ? `<div class="equip-row">${player.equipment.map((cardId) => `<span class="equip-chip">${cardId.replaceAll("-", " ")}</span>`).join("")}</div>` : ""}
    // </article>`;
// };

const randomRoll = (sides) => Math.floor(Math.random() * sides) + 1;
const actionForPhase = Object.freeze({
  [GAME_PHASES.START_TURN]: "MOVE",
  [GAME_PHASES.MOVEMENT]: "MOVE",
  [GAME_PHASES.AREA_ACTION]: "RESOLVE_AREA_ACTION",
  [GAME_PHASES.ATTACK]: "COMPLETE_ATTACK",
  [GAME_PHASES.END_TURN]: "END_TURN"
});
const playerLabel = (playerId) => {
  const player = state?.players[playerId];
  if (!player) return playerId ?? "unknown player";

  if (!player.characterId) return player.name;
  const character = getCharacter(player.characterId);
  const mayRevealCharacter = player.id === localPlayerId || player.revealed;
  return mayRevealCharacter ? `${escHtml(player.name)} (${translate(character.nameKey)})` : player.name;
};

const describeEvent = (event) => {
  if (event.type === "PLAYER_MOVED") return `${playerLabel(event.playerId)} moved to ${getAreaLabel(event.areaId)}${event.total ? ` (roll ${event.total})` : ""}.`;
  if (event.type === "ATTACK_STARTED") return `${playerLabel(event.attackerId)} attacked ${playerLabel(event.targetId)}.`;
  if (event.type === "ATTACK_RESOLVED") return `${playerLabel(event.attackerId)} dealt ${event.damage} damage to ${playerLabel(event.targetId)} (${event.d6 != null ? `d6 ${event.d6} − d4 ${event.d4} = ${Math.abs(event.d6 - event.d4)}` : `d4 ${event.d4}`}${event.bonus ? `, +${event.bonus} equipment` : ""}).`;
  if (event.type === "DAMAGE_DEALT") return `${playerLabel(event.playerId)} lost ${event.amount} HP.`;
  if (event.type === "DAMAGE_PREVENTED") return `Damage to ${playerLabel(event.playerId)} was prevented${event.reason ? ` (${event.reason})` : ""}.`;
  if (event.type === "HEAL_APPLIED") return `${playerLabel(event.playerId)} recovered ${event.amount} HP.`;
  if (event.type === "PLAYER_DIED") return `${playerLabel(event.playerId)} died. Body count: ${event.bodyCountAtDeath}.`;
  if (event.type === "ABILITY_USED") return `${playerLabel(event.playerId)} used ${event.abilityId}.`;
  if (event.type === "CHARACTER_REVEALED") return `${playerLabel(event.playerId)} revealed their Character.`;
  if (event.type === "EQUIPMENT_ACQUIRED") return `${playerLabel(event.playerId)} acquired ${getEquipmentLabel(event.cardId)}.`;
  if (event.type === "EQUIPMENT_STOLEN") return `${playerLabel(event.toPlayerId)} stole ${event.cardId ? getEquipmentLabel(event.cardId) : "Equipment"} from ${playerLabel(event.fromPlayerId)}.`;
  if (event.type === "MOVEMENT_ROLLED") return `${playerLabel(event.playerId)} rolled ${event.d6} + ${event.d4} = ${event.total}.`;
  if (event.type === "CARD_DRAWN") return `${playerLabel(event.playerId)} drew from the ${T(`pending.deck.${event.deckId}`)} deck.`;
  if (event.type === "AREA_ATTACK_RESOLVED") return `${playerLabel(event.attackerId)} hit ${event.targetIds.length} player(s) for ${event.damage} damage each (d6 ${event.d6 ?? "–"}, d4 ${event.d4}).`;
  if (event.type === "EQUIPMENT_TRANSFERRED") return `${playerLabel(event.toPlayerId)} received ${getEquipmentLabel(event.cardId)} from ${playerLabel(event.fromPlayerId)}.`;
  if (event.type === "TURN_STARTED") return `${playerLabel(event.playerId)}'s turn started.`;
  if (event.type === "TURN_ENDED") return `${playerLabel(event.playerId)}'s turn ended.`;
  if (event.type === "VICTORY_REACHED") return `Victory reached by ${event.playerId}.`;
  return `${event.type.replaceAll("_", " ")}${event.playerId ? ` - ${playerLabel(event.playerId)}` : ""}.`;
};

// Toast d'erreur en jeu : affiche dans le dock quand une action est refusee,
// sinon un refus silencieux laisse croire que le bouton est casse.
let gameNotice = null;
let gameNoticeTimer = null;
const setGameNotice = (text) => {
  gameNotice = text;
  clearTimeout(gameNoticeTimer);
  gameNoticeTimer = setTimeout(() => { gameNotice = null; render(); }, 4000);
};

const run = (result, label = "action") => {
  if (!result.ok) {
    warnLog(`RESULT ${label}: REJECTED - ${result.error}: ${result.message ?? "Action rejected"}`);
    setGameNotice(`${result.message ?? result.error ?? "Action refusée"}`);
    render();
    return false;
  }
  state = result.state;
  debugLog(`RESULT ${label}: accepted; phase is now ${state.phase}.`);
  return true;
};

// Routes the host's own actions through HostAuthority too, so the resulting state is
// broadcast to connected peers instead of only updating the host's local view.
const runAsHost = (action, payload, label) => {
  const result = hostSession.authority.handleRequest(createActionRequest(assignedPlayerId, action, payload));
  if (!result.ok) {
    warnLog(`RESULT ${label}: REJECTED - ${result.message.error}: ${result.message.message}`);
    return false;
  }
  state = result.state;
  debugLog(`RESULT ${label}: accepted; phase is now ${state.phase}.`);
  return true;
};

const sendAction = (action, payload, label) => {
  if (!isHost && clientSession) {
    clientSession.requestAction(createActionRequest(assignedPlayerId, action, payload));
    return;
  }
  if (isHost && hostSession) { runAsHost(action, payload, label); render(); }
};

const currentPlayer = () => state.players[state.currentPlayerId];
const phaseLabel = () => state.phase.replaceAll("-", " ");
const canControlCurrentPlayer = () => roomRole === "local" || state?.currentPlayerId === assignedPlayerId;

const handleStart = () => {
  if (!isHost || !hostSession) return;
  const started = hostSession.authority.startMatch();
  if (!started.ok) {
    setNotice("lobby.error", { message: started.message });
    render();
    return;
  }
  state = started.state;
  render();
};

const connectToRoom = async (requestedRoomId) => {
  try {
    roomId = requestedRoomId;
    if (!network) {
      const { TrysteroNetwork } = await import("../networking/trystero-network.js");
      network = new TrysteroNetwork();
    }
    network.on("connected", () => { roomStatus = "connected"; roomNotice = null; render(); });
    network.on("PLAYER_JOINED", ({ peerId }) => {
      peers = [...new Set([...peers, peerId])];
      hostSession?.authority.broadcast();
      if (!isHost) network.sendHello(localPlayerName, loadSeatToken(roomId));
      render();
    });
    network.on("PLAYER_LEFT", ({ peerId }) => { peers = peers.filter((currentPeerId) => currentPeerId !== peerId); render(); });
    if (!isHost) {
      clientSession?.dispose();
      network.on(MESSAGE_TYPES.ROOM_REFUSED, ({ message }) => {
        setNotice(message.reason === "started" ? "lobby.gameInProgress" : "lobby.roomFull");
        render();
      });
      clientSession = createClientSession(network, ({ publicState, privateState: incomingPrivate }) => {
        if (incomingPrivate) privateState = incomingPrivate;
        if (publicState) {
          if (publicState.phase === GAME_PHASES.SETUP) {
            state = null; seenEvents = null; privateState = null; wasMyTurn = false;
            clearMarks();
            roomPlayers = Object.values(publicState.players ?? {});
            roomLobby = publicState.lobby ?? null;
            roomStatus = "connected"; roomNotice = null;
            render();
            return;
          }
          state = { ...state, ...publicState, players: publicState.players };
          publicPendingActions = publicState.pendingActions ?? [];
          roomStatus = "game synchronized";
        }
        if (state) state = withPrivate(state);
        render();
      }, (playerSlot) => {
        localPlayerId = playerSlot;
        assignedPlayerId = playerSlot;
        setNotice("lobby.assigned", { name: localPlayerName, slot: playerSlot });
        render();
      });
    }
    await network.connect(roomId);
    if (isHost && !hostSession) {
      const localPlayers = players.map((player, index) => (
        index === 0 ? { ...player, name: localPlayerName } : player
      ));
      const lobbyState = createLocalGame(localPlayers, { startingPlayerIndex: 0 });
      hostSession = createHostSession(lobbyState, network, {
        onStateChange: (next) => {
          if (!state) { render(); return; }
          if (next.phase !== GAME_PHASES.SETUP) { state = next; render(); }
        }
      });
      roomPlayers = Object.values(lobbyState.players);
    }
    roomStatus = "connected"; roomNotice = null;
    render();
  } catch (error) {
    roomStatus = "error"; setNotice("lobby.error", { message: error.message });
    render();
  }
};

const handleCreateRoom = () => {
  isHost = true;
  roomRole = "host";
  roomId = createRoomId();
  roomCodeShown = false;   // chaque nouveau salon repart masqué
  roomPlayers = [];
  roomStatus = "connecting"; setNotice("lobby.roomCreated", { code: roomId });
  render();
  connectToRoom(roomId);
};

const handleJoinRoom = () => {
  isHost = false;
  roomRole = "client";
  const input = app.querySelector("[data-room-input]");
  const requestedRoomId = normalizeRoomCode(input.value);
  if (!isValidRoomCode(requestedRoomId)) {
    setNotice("lobby.invalidCode");
    render();
    return;
  }

  roomId = requestedRoomId;
  roomCodeShown = false;   // chaque nouveau salon repart masqué
  roomStatus = "connecting"; setNotice("lobby.joining", { code: requestedRoomId });
  render();
  connectToRoom(requestedRoomId);
};

const lobbyStatusLabel = () => {
  if (roomNotice) return T(roomNotice.key, roomNotice.vars);
  if (roomStatus === "connected") return isHost ? T("lobby.hostLobby", { n: peers.length }) : T("lobby.guestWaiting");
  return roomStatus === "connecting" ? T("lobby.connecting") : roomStatus;
};

const copyText = async (text, okKey, inputSelector) => {
  let copied = true;
  // Si le presse-papier échoue, on révèle le code : le repli sélectionne le texte de
  // l'input, qui doit donc contenir la vraie valeur et non le masque.
  try { await navigator.clipboard.writeText(text); setNotice(okKey); }
  catch { copied = false; roomCodeShown = true; setNotice("lobby.copyManual"); }
  render();
  if (!copied) {
    const el = app.querySelector(inputSelector);   // sélectionné APRÈS le rendu, sinon la sélection disparaît
    el?.focus(); el?.select();
    return;
  }
  setTimeout(() => { if (roomNotice?.key === okKey) { roomNotice = null; render(); } }, 2500);
};
const handleCopyInvite = () => copyText(createRoomLink(roomId), "lobby.linkCopied", "[data-invite-link]");
const handleCopyCode = () => copyText(roomId, "lobby.codeCopied", "[data-room-code]");
const handleNameChange = (event) => {
  localPlayerName = cleanName(event.target.value);
  localStorage.setItem("ftm-player-name", localPlayerName);
};

const handlePrimaryAction = () => {
  if (!canControlCurrentPlayer()) {
    warnLog(`BLOCKED primary action: it is ${playerLabel(state.currentPlayerId)}'s turn.`);
    return;
  }

  if (state.pendingActions.length > 0) {
    warnLog(`BLOCKED primary action: ${state.pendingActions[0].type} must be resolved first.`);
    return;
  }

  if (!actionForPhase[state.phase]) {
    warnLog(`BLOCKED primary action: no action for phase ${state.phase}.`);
    return;
  }

  const playerId = roomRole === "local" ? state.currentPlayerId : assignedPlayerId;
  if (!isHost && clientSession) {
    debugLog(`NETWORK REQUEST ${state.phase}.`);
    clientSession.requestAction(createActionRequest(playerId, actionForPhase[state.phase]));
    return;
  }
  const label = `${state.phase} primary button by ${playerLabel(playerId)}`;
  debugLog(`CLICK ${label}.`);
  if (isHost && hostSession) {
    runAsHost(actionForPhase[state.phase], {}, label);
    render();
    return;
  }
  if (state.phase === GAME_PHASES.START_TURN) {
    // Pas de bouton "commencer" : le premier geste lance directement les dés.
    if (run(beginTurn(state, playerId), "begin turn")) {
      const movement = resolveMovementAction(state, playerId, { rollDie: randomRoll });
      if (run(movement, "roll and move") && !movement.reroll && !movement.pendingAction) {
        run(completeMovement(state, playerId), "complete movement");
      }
    }
  }
  else if (state.phase === GAME_PHASES.MOVEMENT) {
    const movement = resolveMovementAction(state, playerId, { rollDie: randomRoll });
    if (run(movement, "roll and move") && !movement.reroll && !movement.pendingAction) {
      run(completeMovement(state, playerId), "complete movement");
    }
  }
  else if (state.phase === GAME_PHASES.AREA_ACTION) {
    const result = resolveAreaAction(state, playerId, state.players[playerId].areaId);
    if (run(result, "resolve area") && state.pendingActions.length === 0) {
      run(completeAreaAction(state, playerId), "complete area action");
    }
  }
  else if (state.phase === GAME_PHASES.ATTACK) {
    if (mustAttack(state, playerId)) warnLog("BLOCKED: you must attack.");
    else run(completeAttack(state, playerId), "skip attack");
  }
  else if (state.phase === GAME_PHASES.END_TURN) run(endTurn(state, playerId), "end turn");
  render();
};

const handleAttack = (targetId) => {
  if (!state || state.phase !== GAME_PHASES.ATTACK) return;
  if (!canControlCurrentPlayer()) {
    warnLog(`BLOCKED attack: it is ${playerLabel(state.currentPlayerId)}'s turn.`);
    return;
  }
  debugLog(`CLICK Attack ${playerLabel(targetId)} by ${playerLabel(state.currentPlayerId)}.`);
  if (!isHost && clientSession) {
    clientSession.requestAction(createActionRequest(state.currentPlayerId, "ATTACK", { targetId }));
    return;
  }
  if (isHost && hostSession) {
    runAsHost("ATTACK", { targetId }, `attack ${playerLabel(targetId)}`);
    render();
    return;
  }
  const attackerId = roomRole === "local" ? state.currentPlayerId : assignedPlayerId;
  const result = state.players[attackerId].equipment.includes("pfrt-tube")
    ? areaAttack(state, attackerId, { rollDie: randomRoll })
    : attack(state, attackerId, targetId, { rollDie: randomRoll });
  if (run(result) && !state.gameOver && state.pendingActions.length === 0) {
    run(completeAttack(state, state.currentPlayerId), "complete attack");
  }
  render();
};

const handlePendingReaction = (selectedDestination = null, selectedRollIndex = 0) => {
  const pendingAction = state?.pendingActions[0];
  if (!pendingAction) return;

  debugLog(`CLICK Resolve pending reaction: ${pendingAction.type}.`);
  if (pendingAction.type === "CHOOSE_MOVEMENT_DESTINATION") {
    const destinationAreaId = selectedDestination ?? Object.values(state.board.areaAtPosition)
      .find((areaId) => isValidMovementDestination(state.board, areaId) && areaId !== pendingAction.excludedAreaId);

    if (!isHost && clientSession) {
      clientSession.requestAction(createActionRequest(pendingAction.playerId, "CHOOSE_MOVEMENT_DESTINATION", { areaId: destinationAreaId }));
      return;
    }

    if (isHost && hostSession) {
      runAsHost("CHOOSE_MOVEMENT_DESTINATION", { areaId: destinationAreaId }, "resolve movement destination");
      render();
      return;
    }

    const result = resolveMovementDestination(state, pendingAction, destinationAreaId);

    if (run(result, "resolve movement destination") && state.phase === GAME_PHASES.MOVEMENT && state.pendingActions.length === 0) {
      run(completeMovement(state, pendingAction.playerId), "complete movement after destination");
    }
    render();
    return;
  }

  if (pendingAction.type === "CHOOSE_MOVEMENT_ROLL") {
    if (!isHost && clientSession) {
      clientSession.requestAction(createActionRequest(pendingAction.playerId, "CHOOSE_MOVEMENT_ROLL", { rollIndex: selectedRollIndex }));
      return;
    }

    if (isHost && hostSession) {
      runAsHost("CHOOSE_MOVEMENT_ROLL", { rollIndex: selectedRollIndex }, "resolve movement roll");
      render();
      return;
    }

    const result = resolveMovementRollChoice(state, pendingAction, selectedRollIndex);
    if (run(result, "resolve movement roll") && state.phase === GAME_PHASES.MOVEMENT && state.pendingActions.length === 0) {
      run(completeMovement(state, pendingAction.playerId), "complete movement after roll choice");
    }
    render();
    return;
  }
};

// Combat reactions (Doge, Pay-to-Win, Life Stonks, Surprise MF, John Wick, Telescopic Lance)
// belong to whichever player the pendingAction names, which may not be the active player.
const resolveReaction = (choice, label) => {
  const pendingAction = state?.pendingActions[0];
  if (!pendingAction) return;

  debugLog(`CLICK Resolve pending reaction: ${label}.`);

  if (!isHost && clientSession) {
    clientSession.requestAction(createActionRequest(pendingAction.playerId, "RESOLVE_COMBAT_REACTION", { choice }));
    return;
  }
  if (isHost && hostSession) {
    runAsHost("RESOLVE_COMBAT_REACTION", { choice }, label);
    render();
    return;
  }

  const result = resolveCombatPendingAction(state, pendingAction, choice, { rollDie: randomRoll });
  if (run(result, label) && !state.gameOver && state.pendingActions.length === 0 && state.phase === GAME_PHASES.ATTACK) {
    const reactionPlayerId = state.currentPlayerId;
    if (run(completeAttack(state, reactionPlayerId), "complete attack after reaction") && !state.players[reactionPlayerId].alive) {
      run(endTurn(state, reactionPlayerId), "skip dead player's turn");
    }
  }
  render();
};

const resolveReward = (cardId) => {
  const pendingAction = state?.pendingActions[0];
  if (!pendingAction) return;
  debugLog(`CLICK Equipment reward: ${cardId ?? "none"}.`);
  if (!isHost && clientSession) {
    clientSession.requestAction(createActionRequest(pendingAction.playerId, "CHOOSE_EQUIPMENT_REWARD", { cardId }));
    return;
  }
  if (isHost && hostSession) {
    runAsHost("CHOOSE_EQUIPMENT_REWARD", { cardId }, "equipment reward");
    render();
    return;
  }
  const result = resolveEquipmentReward(state, pendingAction, cardId);
  if (run(result, "equipment reward") && !state.gameOver && state.pendingActions.length === 0 && state.phase === GAME_PHASES.ATTACK) {
    run(completeAttack(state, state.currentPlayerId), "complete attack after reward");
  }
  render();
};

const resolvePendingChoice = (choice = {}, label = "resolve pending effect") => {
  const pendingAction = state?.pendingActions[0];
  if (!pendingAction) return;

  if (!isHost && clientSession) {
    clientSession.requestAction(createActionRequest(pendingAction.playerId, "RESOLVE_PENDING_ACTION", { choice }));
    return;
  }
  if (isHost && hostSession) {
    runAsHost("RESOLVE_PENDING_ACTION", { choice }, label);
    render();
    return;
  }

  const areaPendingTypes = new Set([
    "CHOOSE_AREA_DECK", "GIVE_NOTIFICATION", "POKER_FACE_NOTIFICATION",
    "RESOLVE_DRAWN_CARD", "TOXIC_RELATIONSHIP_CHOICE", "PICKPOCKET_CHOICE"
  ]);
  const result = areaPendingTypes.has(pendingAction.type)
    ? resolveAreaPendingAction(state, pendingAction, choice)
    : resolvePendingAction(state, pendingAction, choice, { rollDie: randomRoll });
  if (run(result, label) && state.phase === GAME_PHASES.AREA_ACTION && state.pendingActions.length === 0 && state.players[state.currentPlayerId]?.alive) {
    run(completeAreaAction(state, state.currentPlayerId), "complete area action");
  }
  render();
};

// Reveal-gated reactions share the same "reveal & activate" / "decline" shape; only the
// wording changes per character. Pay-to-Win and Telescopic Lance have their own payloads.
const OPTIONAL_REACTION_PROMPTS = Object.freeze({
  DOGE_ATTACK_REACTION: { reveal: "reactions.doge.reveal", decline: "reactions.doge.decline" },
  LIFE_STONKS_REACTION: { reveal: "reactions.lifeStonks.reveal", decline: "reactions.lifeStonks.decline" },
  SURPRISE_COUNTERATTACK: { reveal: "reactions.surpriseMf.reveal", decline: "reactions.surpriseMf.decline" },
  JOHN_WICK_SECOND_ATTACK: { reveal: "reactions.johnWick.reveal", decline: "reactions.johnWick.decline" }
});

const renderPendingReactionPanel = (pendingReaction, pendingMovementDestinations) => {
  if (!pendingReaction) return "";

  const ownerLabel = playerLabel(pendingReaction.playerId);
  const canResolve = roomRole === "local" || pendingReaction.playerId === assignedPlayerId;

  if (!canResolve) {
    // Réaction propre à un personnage : nommer l'action trahirait qui il est.
    const waiting = isSecretPendingType(pendingReaction.type)
      ? escT("ui.waitingForChoice", { name: ownerLabel })
      : escT("ui.waitingForResolve", { name: ownerLabel, action: pendingReaction.type.replaceAll("_", " ").toLowerCase() });
    return `<p class="pending-label" style="margin-top:8px">${waiting}</p>`;
  }

  const choiceButton = (label, choice, secondary = true) => (
    `<button class="action ${secondary ? "secondary" : ""}" data-pending-choice="${encodeURIComponent(JSON.stringify(choice))}">${label}</button>`
  );
  const cardForPending = pendingReaction.card ?? getCard(pendingReaction.cardId);
  const cardHeading = cardForPending
    ? `<strong>${translate(cardForPending.nameKey)}</strong><p>${translate(cardForPending.textKey)}</p>`
    : "";

  if (pendingReaction.type === "CHOOSE_AREA_DECK") {
    return `<div class="pending-choices"><p class="pending-label">${escT("pending.chooseDeck")}</p>${[
      ["white", T("pending.deck.white")], ["black", T("pending.deck.black")], ["notifications", T("pending.deck.notifications")]
    ].map(([deck, label]) => choiceButton(label, deck)).join("")}</div>`;
  }

  if (pendingReaction.type === "GIVE_NOTIFICATION") {
    const recipients = Object.values(state.players).filter((player) => player.alive && player.id !== pendingReaction.playerId);
    return `<div class="pending-choices"><p class="pending-label">${escT("pending.giveNotification")}</p>${cardHeading}${recipients.map((player) => choiceButton(player.name, player.id)).join("")}</div>`;
  }

  if (pendingReaction.type === "POKER_FACE_NOTIFICATION") {
    return `<div class="pending-choices"><p class="pending-label">${escT("pending.receivedNotification")}</p>${cardHeading}${choiceButton(T("pending.resolveNotification"), "resolve")}${choiceButton(T("pending.lieAndDiscard"), "lie")}</div>`;
  }

  if (pendingReaction.type === "RESOLVE_DRAWN_CARD") {
    return `<div class="pending-choices"><p class="pending-label">${escT("pending.drawnCard")}</p>${cardHeading}${choiceButton(T("pending.resolveCard"), {})}</div>`;
  }

  if (pendingReaction.type === "TOXIC_RELATIONSHIP_CHOICE") {
    const targets = Object.values(state.players).filter((player) => player.alive);
    return `<div class="pending-choices"><p class="pending-label">${escT("pending.toxicChoice")}</p>${targets.map((player) => `${choiceButton(T("pending.dealTo", { name: player.name }), { targetId: player.id, action: "damage" })}${choiceButton(T("pending.healByOne", { name: player.name }), { targetId: player.id, action: "heal" })}`).join("")}</div>`;
  }

  if (pendingReaction.type === "PICKPOCKET_CHOICE") {
    const targets = Object.values(state.players).filter((player) => player.alive && player.id !== pendingReaction.playerId && player.equipment.length);
    return `<div class="pending-choices"><p class="pending-label">${escT("pending.pickpocketChoice")}</p>${targets.flatMap((player) => player.equipment.map((cardId) => choiceButton(`${escHtml(player.name)}: ${getEquipmentLabel(cardId)}`, { targetId: player.id, cardId }))).join("")}</div>`;
  }

  if (pendingReaction.type === "RESOLVE_CARD_EFFECT") {
    const actor = state.players[pendingReaction.playerId];
    const living = Object.values(state.players).filter((player) => player.alive);
    const others = living.filter((player) => player.id !== actor.id);
    let choices = [];
    if (pendingReaction.effect === "faction-or-equipment") {
      choices = [choiceButton(T("pending.takeDamageOne"), { action: "damage" }), ...actor.equipment.map((cardId) => choiceButton(T("pending.giveTo", { card: getEquipmentLabel(cardId), name: state.players[state.currentPlayerId].name }), { action: "give", cardId }))];
    } else if (pendingReaction.effect === "give-equipment-or-damage") {
      choices = [choiceButton(T("pending.takeDamageOne"), { action: "damage" }), ...actor.equipment.flatMap((cardId) => others.map((player) => choiceButton(T("pending.giveTo", { card: getEquipmentLabel(cardId), name: player.name }), { action: "give", targetId: player.id, cardId })))];
    } else if (pendingReaction.effect === "steal-one-equipment") {
      choices = others.flatMap((player) => player.equipment.map((cardId) => choiceButton(T("pending.takeFrom", { card: getEquipmentLabel(cardId), name: player.name }), { targetId: player.id, cardId })));
      if (!choices.length) choices = [choiceButton(T("pending.nothingToSteal"), { targetId: null, cardId: null })];
    } else if (pendingReaction.effect === "target-heal-die-6") {
      choices = others.map((player) => choiceButton(T("pending.healDie6", { name: player.name }), { targetId: player.id }));
    } else if (pendingReaction.effect === "voodoo-die-6") {
      choices = living.map((player) => choiceButton(T("pending.targetDie6", { name: player.name }), { targetId: player.id }));
    } else if (["set-hp-2", "damage-2-heal-self-1", "damage-2-self-2"].includes(pendingReaction.effect)) {
      const labelKey = pendingReaction.effect === "set-hp-2" ? "pending.setHp2" : "pending.dealTwoDamage";
      choices = living.map((player) => choiceButton(T(labelKey, { name: player.name }), { targetId: player.id }));
    } else {
      choices = [choiceButton(T("pending.resolveEffect"), {})];
    }
    return `<div class="pending-choices"><p class="pending-label">${escT("pending.resolveCardEffect")}</p>${cardHeading}${choices.join("")}</div>`;
  }

  if (pendingReaction.type === "CHOOSE_MOVEMENT_DESTINATION") {
    return `<div class="pending-choices"><p class="pending-label">${escT("pending.chooseDestination")}</p>${pendingMovementDestinations.map((areaId) => `<button class="action secondary" data-destination="${areaId}">${getAreaLabel(areaId)}</button>`).join("")}</div>`;
  }

  if (pendingReaction.type === "CHOOSE_MOVEMENT_ROLL") {
    return `<div class="pending-choices"><p class="pending-label">${escT("pending.chooseRoll")}</p>${pendingReaction.rolls.map((roll, index) => (
      `<button class="action secondary" data-roll-index="${index}">d6 ${roll.d6} + d4 ${roll.d4} = ${roll.total}</button>`
    )).join("")}</div>`;
  }

  if (pendingReaction.type === "CHOOSE_EQUIPMENT_REWARD") {
    return `<div class="pending-choices">
      <p class="pending-label">${ownerLabel} : ${escT("pending.equipmentReward")}</p>
      ${pendingReaction.cardIds.map((id) => `<button class="action secondary" data-reward="${id}">${getEquipmentLabel(id)}</button>`).join("")}
      <button class="action secondary" data-reward-none>${escT("pending.takeNothing")}</button>
    </div>`;
  }

  if (pendingReaction.type === "PAY_TO_WIN_REACTION") {
    const target = state.players[pendingReaction.targetId];
    return `<div class="pending-choices">
      <p class="pending-label">${escT("pending.payToWinPrompt", { name: ownerLabel, damage: pendingReaction.damage })}</p>
      <button class="action secondary" data-reaction="pay-to-win-damage">${escT("pending.dealDamage", { damage: pendingReaction.damage })}</button>
      ${target.equipment.map((cardId) => `<button class="action secondary" data-reaction="pay-to-win-steal" data-card="${cardId}">${escT("pending.stealCard", { card: getEquipmentLabel(cardId) })}</button>`).join("")}
    </div>`;
  }

  if (pendingReaction.type === "TELESCOPIC_LANCE_REACTION") {
    return `<div class="pending-choices">
      <p class="pending-label">${escT("pending.lancePrompt", { name: ownerLabel })}</p>
      <button class="action secondary" data-reaction="lance-plain">${escT("pending.dealDamage", { damage: pendingReaction.damage })}</button>
      <button class="action secondary" data-reaction="lance-bonus">${escT("pending.lanceReveal", { damage: pendingReaction.damage + 2 })}</button>
    </div>`;
  }

  if (pendingReaction.type === "ACTIVATE_ABILITY") {
    const base = pendingReaction.requiresRevealConfirmation ? { confirmReveal: true } : {};
    const owner = state.players[pendingReaction.playerId];    const reachable = owner.areaId
      ? getAdjacentAreaIds(state.board, owner.areaId)
      : Object.values(state.board.areaAtPosition);
    const choices = pendingReaction.abilityId === "parkour-move"
      ? reachable.map((areaId) => choiceButton(getAreaLabel(areaId), { ...base, areaId }))
      : Object.values(state.players).filter((p) => p.alive && p.id !== owner.id)
          .map((p) => choiceButton(escHtml(p.name), { ...base, targetId: p.id }));
    return `<div class="pending-choices"><p class="pending-label">${ownerLabel}: ${pendingReaction.requiresRevealConfirmation ? `${escT("ability.revealAndChoose")}` : escT("ability.chooseTarget")}</p>${choices.join("")}${choiceButton(T("ui.cancel"), { cancel: true })}</div>`;
  }
  
  const prompt = OPTIONAL_REACTION_PROMPTS[pendingReaction.type];
  if (!prompt) return "";

  return `<div class="pending-choices">
    <p class="pending-label">${escT("reactions.optional", { name: ownerLabel })}</p>
    <button class="action secondary" data-reaction="optional-reveal">${escT(prompt.reveal)}</button>
    <button class="action secondary" data-reaction="optional-decline">${escT(prompt.decline)}</button>
  </div>`;
};

const renderDock = ({ active, canAct, pendingReaction, isGameOver, otherPlayers }) => {
  if (isGameOver) return `<div class="dock-row"><span class="dock-title">${escT("ui.gameOver")}</span></div>`;
  if (pendingReaction) return renderPendingReactionPanel(pendingReaction, pendingMovementDestinationsFor(pendingReaction));
  if (!canAct) return `<div class="dock-row"><span class="dock-title">${escT("ui.thinking", { name: active.name })}</span></div>`;
  // Tant que les des tournent, on ne propose aucune action : la phase a deja
  // avance cote moteur (ex. AREA_ACTION) mais le joueur n'est pas encore "arrive".
  if (diceRolling()) return `<div class="dock-row"><span class="dock-title">${escT("ui.rollingDice")}</span></div>`;
 
  const P = (label, cls = "") => `<button class="action ${cls}" data-action="primary">${label}</button>`;
  const phase = {
    [GAME_PHASES.START_TURN]: [T("ui.yourTurn"), P(T("ui.rollDice"))],
    [GAME_PHASES.MOVEMENT]: [T("ui.phaseMovement"), P(T("ui.rollDice"))],
    [GAME_PHASES.AREA_ACTION]: [getAreaLabel(active.areaId), P(T("ui.resolveArea"))],
    [GAME_PHASES.ATTACK]: [T("ui.phaseAttack"),
      (active.equipment.includes("pfrt-tube") && otherPlayers.length
        ? `<button class="action secondary" data-area-attack>${escT("ui.attackAllInRange", { count: otherPlayers.length })}</button>`
        : otherPlayers.map((p) => `<button class="action secondary" data-target="${p.id}">${escT("ui.attackPlayer", { name: p.name })}</button>`).join("")) +
      (mustAttack(state, active.id) ? "" : P(T("ui.pass")))],
    [GAME_PHASES.END_TURN]: [T("ui.endOfTurn"), P(T("ui.endTurn"))]
  }[state.phase];

  const abilityId = ABILITY_BY_CHARACTER[active.characterId];
  const abilityUsable = abilityId === "parkour-move"
    ? [GAME_PHASES.START_TURN, GAME_PHASES.MOVEMENT].includes(state.phase)
    : state.phase !== GAME_PHASES.START_TURN;
  const abilityBtn = abilityId && abilityUsable && !active.abilityState?.[abilityId]
    ? `<button class="action secondary" data-action="use-ability">${escT("ui.useAbility")}</button>` : "";
  return phase ? `<div class="dock-row"><span class="dock-title">${phase[0]}</span>${phase[1]}${abilityBtn}</div>` : "";
};
const pendingMovementDestinationsFor = (pa) => pa?.type === "CHOOSE_MOVEMENT_DESTINATION"
  ? Object.values(state.board.areaAtPosition).filter((id) => id !== pa.excludedAreaId) : [];

// ---- Pastilles : notes privées, stockées dans CE navigateur, jamais envoyées au réseau ----
const DEFAULT_TAGS = [
  { id: "suspect", key: "ui.tag.suspect", color: 0 },
  { id: "trusted", key: "ui.tag.trusted", color: 1 },
  { id: "watch", key: "ui.tag.watch", color: 2 },
  { id: "ally", key: "ui.tag.ally", color: 3 }
];
const TAG_COLORS = 6;
const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Localized labels may contain & or < once translated; escape them so labels render as text.
const escT = (key, vars) => escHtml(T(key, vars));
const loadJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const saveJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ } };

let customTags = loadJson("ftm-custom-tags", []);
let marks = {};
let marksKeyLoaded = null;
let selectedTag = null;
let newTagColor = 4;
let tagError = "";
let dragging = false;

const marksKey = () => `ftm-marks:${roomId ?? "local"}`;
const ensureMarks = () => {
  if (marksKeyLoaded !== marksKey()) { marksKeyLoaded = marksKey(); marks = loadJson(marksKeyLoaded, {}); }
};
const saveMarks = () => saveJson(marksKey(), marks);
const clearMarks = () => { marks = {}; marksKeyLoaded = marksKey(); saveMarks(); };
const allTags = () => [...DEFAULT_TAGS, ...customTags];
const findTag = (id) => allTags().find((t) => t.id === id);
const tagLabel = (t) => (t.key ? T(t.key) : t.label);

const addMark = (playerId, tagId) => {
  const list = (marks[playerId] ??= []);
  if (!list.includes(tagId)) list.push(tagId);
  saveMarks();
};
const removeMark = (playerId, tagId) => {
  marks[playerId] = (marks[playerId] ?? []).filter((id) => id !== tagId);
  saveMarks();
};
const createTag = (rawLabel) => {
  const label = rawLabel.trim().slice(0, 18);
  if (!label || allTags().some((t) => tagLabel(t).toLowerCase() === label.toLowerCase())) return false;
  customTags.push({ id: `c${Date.now().toString(36)}`, label, color: newTagColor });
  saveJson("ftm-custom-tags", customTags);
  return true;
};
const deleteTag = (id) => {
  customTags = customTags.filter((t) => t.id !== id);
  saveJson("ftm-custom-tags", customTags);
  for (const playerId of Object.keys(marks)) marks[playerId] = marks[playerId].filter((m) => m !== id);
  saveMarks();
  if (selectedTag === id) selectedTag = null;
};

const renderMarks = (playerId) => (marks[playerId] ?? []).map(findTag).filter(Boolean).map((t) => (
  `<span class="note n${t.color}">${escHtml(tagLabel(t))}<button type="button" data-mark-remove="${t.id}" aria-label="${escHtml(T("ui.removeTag"))}">×</button></span>`
)).join("");

const renderTagPalette = () => `
  <div class="tag-palette">${allTags().map((t) => (
    `<span class="note src n${t.color} ${selectedTag === t.id ? "sel" : ""}" draggable="true" data-tag="${t.id}">${escHtml(tagLabel(t))}${t.key ? "" : `<button type="button" data-tag-delete="${t.id}" aria-label="${escHtml(T("ui.removeTag"))}">×</button>`}</span>`
  )).join("")}</div>
  <div class="tag-new">
    <input data-tag-input maxlength="18" placeholder="${escHtml(T("ui.newTag"))}" aria-label="${escHtml(T("ui.newTag"))}">
    <button type="button" class="action secondary" data-tag-add>${T("ui.addTag")}</button>
    <div class="tag-colors">${Array.from({ length: TAG_COLORS }, (_, i) => (
      `<button type="button" class="tag-dot n${i} ${i === newTagColor ? "on" : ""}" data-tag-color="${i}" aria-label="${i + 1}"></button>`
    )).join("")}</div>
  </div>
  ${tagError ? `<p class="tag-err">${escHtml(tagError)}</p>` : ""}
  <p class="tag-hint">${T("ui.tagHint")} <button type="button" class="tag-clear" data-tag-clear>${T("ui.clearTags")}</button></p>`;

const submitTag = () => {
  const input = app.querySelector("[data-tag-input]");
  if (!input) return;
  if (createTag(input.value)) { tagError = ""; input.value = ""; } else { tagError = T("ui.tagInvalid"); }
  render();
};
const endDrag = () => {
  if (!dragging) return;
  dragging = false;
  render();
};

// Écouteurs délégués sur #app : posés UNE fois, ils survivent aux re-rendus.
app.addEventListener("dragstart", (e) => {
  const chip = e.target.closest?.("[data-tag]");
  if (!chip) return;
  dragging = true;
  e.dataTransfer.setData("text/plain", chip.dataset.tag);
  e.dataTransfer.effectAllowed = "copy";
});
app.addEventListener("dragover", (e) => {
  const row = e.target.closest?.("[data-player]");
  if (!dragging || !row) return;
  e.preventDefault();
  app.querySelectorAll(".pl.over").forEach((r) => r.classList.remove("over"));
  row.classList.add("over");
});
app.addEventListener("drop", (e) => {
  const row = e.target.closest?.("[data-player]");
  const tagId = e.dataTransfer.getData("text/plain");
  if (row && findTag(tagId)) { e.preventDefault(); addMark(row.dataset.player, tagId); }
  endDrag();
});
document.addEventListener("dragend", endDrag);
// Un nouveau clic/toucher prouve qu'aucun glissé n'est en cours.
document.addEventListener("pointerdown", () => { dragging = false; });
app.addEventListener("input", (e) => {
  if (e.target.matches?.("[data-tag-input]")) tagError = "";
  if (e.target.matches?.("[data-room-input]")) joinCodeDraft = e.target.value;
});
app.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches?.("[data-tag-input]")) submitTag(); });
app.addEventListener("click", (e) => {
  const t = e.target;
  const del = t.closest("[data-tag-delete]");
  if (del) { deleteTag(del.dataset.tagDelete); render(); return; }
  const rm = t.closest("[data-mark-remove]");
  if (rm) { removeMark(rm.closest("[data-player]").dataset.player, rm.dataset.markRemove); render(); return; }
  const dot = t.closest("[data-tag-color]");
  if (dot) { newTagColor = Number(dot.dataset.tagColor); render(); return; }
  if (t.closest("[data-tag-add]")) { submitTag(); return; }
  if (t.closest("[data-tag-clear]")) { clearMarks(); render(); return; }
  const chip = t.closest("[data-tag]");
  if (chip) { selectedTag = selectedTag === chip.dataset.tag ? null : chip.dataset.tag; render(); return; }
  const row = t.closest("[data-player]");
  if (row && selectedTag) { addMark(row.dataset.player, selectedTag); render(); }
});

const render = () => {
  if (dragging) return;
  logWin.hidden = !(state && logOpen);
  if (!state) {
    if (roomId && roomRole !== "local") {
      const knownPlayers = roomRole === "host" && hostSession
        ? Object.values(hostSession.authority.state.players)
        : roomPlayers;
      const lobby = roomRole === "host" && hostSession ? hostSession.authority.state.lobby : roomLobby;
      const seatLimit = lobby?.seatLimit ?? MIN_PLAYERS;
      const occupiedIds = new Set(lobby?.occupied ?? []);
      const playersInRoom = knownPlayers.filter((player) => occupiedIds.has(player.id));
      const canStart = roomStatus === "connected" && playersInRoom.length >= MIN_PLAYERS;
      const waitingSlots = Math.max(0, seatLimit - occupiedIds.size);
      const roomRoster = playersInRoom.length
        ? playersInRoom.map((player) => `<li class="room-player"><span class="room-player-mark">${escHtml(player.name.slice(0, 1).toUpperCase())}</span><span>${escHtml(player.name)}</span><small>${player.id === "player-1" ? T("lobby.hostTag") : T("lobby.seatTag")}</small></li>`).join("")
        : `<li class="room-player room-player-waiting"><span class="room-player-mark">+</span><span>${T("lobby.waitingPlayers")}</span></li>`;
        app.innerHTML = `
        <main class="room-screen">
          <header class="room-topbar">${renderBackLink()}<a class="wordmark" href="./">FREE THE MEMES</a>
            <div class="topbar-right">${renderLocaleSelect()}${renderThemeSelect()}<span class="connection-state"><i></i>${isHost ? T("lobby.roomOpen") : peers.length > 0 ? T("lobby.hostFound") : T("lobby.searching")}</span></div></header>
          <div class="room-content">
            <section class="room-main">
              <p class="eyebrow">${T("lobby.onlineRoom")} / ${isHost ? T("lobby.host") : T("lobby.guest")}</p>
              <h1>${isHost ? T("lobby.hostTitle") : T("lobby.guestTitle")}</h1>
              <p class="room-intro">${isHost ? T("lobby.hostIntro") : T("lobby.guestIntro")}</p>
              <div class="invite-block" data-title="${T("lobby.win.invite")}">
                <div><label for="room-code">${T("lobby.roomCode")}</label>
                  <div class="invite-field has-toggle"><input id="room-code" data-room-code readonly value="${escHtml(roomCodeShown ? roomId : ROOM_CODE_MASK)}"><button class="action secondary" data-action="toggle-code" aria-pressed="${roomCodeShown}" title="${escHtml(T("lobby.showCode"))}" aria-label="${escHtml(T("lobby.showCode"))}">👁</button><button class="action" data-action="copy-code">${T("lobby.copy")}</button></div></div>
                <div><label for="invite-link">${T("lobby.inviteLink")}</label>
                  <div class="invite-field"><input id="invite-link" data-invite-link readonly value="${escHtml(roomCodeShown ? createRoomLink(roomId) : createRoomLink(roomId).replace(roomId, ROOM_CODE_MASK))}"><button class="action" data-action="copy-invite">${T("lobby.copy")}</button></div></div>
              </div>
              ${isHost
                ? `<div class="seat-picker"><span>${T("lobby.seatLimit")}</span>
                    <button type="button" class="action secondary" data-seat-delta="-1" ${seatLimit <= Math.max(MIN_PLAYERS, playersInRoom.length) ? "disabled" : ""}>−</button>
                    <b>${seatLimit}</b>
                    <button type="button" class="action secondary" data-seat-delta="1" ${seatLimit >= MAX_PLAYERS ? "disabled" : ""}>+</button></div>
                  <button type="button" class="action start-room-action" data-action="start" ${canStart ? "" : "disabled"}>${canStart ? T("lobby.startMatch") : T("lobby.needPlayers", { n: playersInRoom.length })} <span aria-hidden="true">${canStart ? "→" : "···"}</span></button>`
                : `<p class="waiting-note"><span class="waiting-pulse"></span>${T("lobby.waitingHostStart")}</p>`}
              <p class="room-status">${lobbyStatusLabel()}</p>
            </section>
            <aside class="room-roster" data-title="${T("lobby.win.seats")}"><div class="roster-heading"><h2>${T("lobby.seats")}</h2><span>${playersInRoom.length}/${seatLimit}</span></div><ul>${roomRoster}${Array.from({ length: waitingSlots }, () => `<li class="room-player room-player-open"><span class="room-player-mark">·</span><span>${T("lobby.openSeat")}</span></li>`).join("")}</ul><p class="roster-foot">${T("lobby.upToX", { count: seatLimit })}</p></aside>
          </div>
        </main>`;
      app.querySelector("[data-action=start]")?.addEventListener("click", handleStart);
      app.querySelector("[data-action=copy-invite]")?.addEventListener("click", handleCopyInvite);
      app.querySelector("[data-action=copy-code]")?.addEventListener("click", handleCopyCode);
      app.querySelector("[data-action=toggle-code]")?.addEventListener("click", () => { roomCodeShown = !roomCodeShown; render(); });
      app.querySelectorAll("[data-seat-delta]").forEach((b) => b.addEventListener("click", () => {
        hostSession.authority.setSeatLimit(hostSession.authority.seatLimit + Number(b.dataset.seatDelta));
        render();
      }));
      return;
    }

    app.innerHTML = `
      <main class="home-screen">
        <header class="home-topbar">${renderBackLink()}<span class="top-chip">${T("lobby.tagline")}</span>
          <div class="topbar-right">${renderLocaleSelect()}${renderThemeSelect()}</div></header>
        <section class="home-content">
          <div class="home-copy"><p class="eyebrow">${T("lobby.homeEyebrow")}</p><h1>${T("lobby.homeTitle1")}<br><em>${T("lobby.homeTitle2")}</em></h1><p class="home-intro">${T("lobby.homeIntro")}</p><label class="name-field">${T("lobby.playerName")}<input data-player-name value="${escHtml(localPlayerName)}" maxlength="24" aria-label="${escHtml(T("lobby.playerName"))}"></label></div>
          <div class="online-actions" data-title="${T("lobby.win.join")}"><button type="button" class="action create-room-action" data-action="create-room"><span>${T("lobby.createRoom")}</span><span aria-hidden="true">↗</span></button><div class="join-room-block"><label for="room-code-input">${T("lobby.haveCode")}</label><div class="room-join"><input id="room-code-input" data-room-input placeholder="${escHtml(T("lobby.codePlaceholder"))}" value="${escHtml(joinCodeDraft || roomId || "")}" aria-label="${escHtml(T("lobby.haveCode"))}"><button type="button" class="action secondary" data-action="join-room">${T("lobby.joinRoom")} <span aria-hidden="true">→</span></button></div></div><p class="room-status">${roomStatus === "offline" && !roomNotice ? T("lobby.privateNote") : lobbyStatusLabel()}</p></div>
        </section>
        <footer class="home-footer"><span>01 / ${T("lobby.footer1")}</span><span>02 / ${T("lobby.footer2")}</span><span>03 / ${T("lobby.footer3")}</span></footer>
      </main>`;
    app.querySelector("[data-action=create-room]").addEventListener("click", handleCreateRoom);
    app.querySelector("[data-action=join-room]").addEventListener("click", handleJoinRoom);
    app.querySelector("[data-player-name]").addEventListener("input", handleNameChange);
    return;
  }

  const active = currentPlayer();
  const boardAreas = Object.entries(state.board.areaAtPosition);
  const otherPlayers = Object.values(state.players).filter((p) => (
    p.id !== state.currentPlayerId && p.alive && canTargetWithAttack(state, state.currentPlayerId, p.id)));
  const pendingReaction = state.pendingActions[0];
  const canAct = canControlCurrentPlayer();
  const isGameOver = state.gameOver || state.phase === GAME_PHASES.GAME_OVER;
  // Cibles cliquables sur le plateau : phase d'attaque, a nous de jouer, rien en
  // attente, des arretes. otherPlayers est deja filtre par canTargetWithAttack.
  const attackableIds = (canAct && !isGameOver && !pendingReaction && !diceRolling() && state.phase === GAME_PHASES.ATTACK)
    ? new Set(otherPlayers.map((p) => p.id))
    : null;
    if (canAct && !isGameOver && !wasMyTurn && roomRole !== "local") ping();
    wasMyTurn = canAct;
  const winnerNames = state.winners.map((id) => state.players[id]?.name ?? id);
  const me = state.players[localPlayerId] ?? active;
  const myCharacter = me.characterId ? getCharacter(me.characterId) : null;
  const pct = (p) => Math.max(0, Math.round((p.hp / p.maxHp) * 100));
  const myHasHp = Number.isFinite(me.maxHp) && Number.isFinite(me.hp);
  ensureMarks();
  const tagInput = app.querySelector("[data-tag-input]");
  const tagDraft = tagInput ? { value: tagInput.value, focused: document.activeElement === tagInput, pos: tagInput.selectionStart } : null;
  // Position visible : tant que le de du joueur tourne, son pion reste sur la
  // derniere zone revelee ; a l'arret, pendingDice se vide et le rendu saute.
  const shownAreaOf = (p) => {
    if (!diceRolling()) return p.areaId;
    const revealedMoves = state.events.filter((e) => e.type === "PLAYER_MOVED" && e.playerId === p.id && !pendingDice.has(e));
    const pendingMove = state.events.some((e) => pendingDice.has(e) && ((e.type === "MOVEMENT_ROLLED" && e.playerId === p.id) || (e.type === "PLAYER_MOVED" && e.playerId === p.id)));
    return pendingMove ? (revealedMoves.at(-1)?.areaId ?? null) : p.areaId;
  };
  // Meme idee pour les PV : tant que les des tournent, on "rembobine" les
  // evenements de PV encore retenus (pendingDice) pour ne pas devoiler le
  // resultat d'un jet avant l'arret de l'odometre.
  const shownHpOf = (p) => {
    if (!diceRolling() || !Number.isFinite(p.hp)) return p.hp;
    let hp = p.hp;
    const pending = state.events.filter((e) => pendingDice.has(e) && e.playerId === p.id);
    for (const e of pending) {
      if (e.type === "DAMAGE_DEALT") hp += e.amount;                 // inverse de la perte
      else if (e.type === "HEAL_APPLIED") hp -= e.amount;            // inverse du soin
      else if (e.type === "HP_SET") hp = p.maxHp;                    // valeur absolue inconnue -> prudence
    }
    return Math.max(0, Math.min(hp, p.maxHp));
  };
  const occupantsOf = (areaId) => Object.values(state.players).filter((p) => shownAreaOf(p) === areaId);

  app.innerHTML = `
  <main class="game-screen">
    <header class="bar">
      ${renderBackLink()}<a class="wordmark" href="./">Free the Memes</a>
      <div class="bar-right">${renderLocaleSelect()}${renderThemeSelect()}<span class="chip">${roomId ?? T("ui.localRoom")}</span><span class="chip">${phaseLabel()}</span>
        <button class="action secondary" data-action="mute" aria-label="${escT("ui.sound")}">${isMuted() ? "🔇" : "🔊"}</button>
        <button class="action secondary" data-action="toggle-log">${T("ui.log")}</button>
        <button class="action secondary" data-action="reset">${T("ui.quit")}</button>
      </div>
    </header>
  
    <section class="stage">
      <div class="turnline ${canAct ? "mine" : ""}">${isGameOver ? escT("ui.gameOver") : canAct ? escT("ui.turnYours") : escT("ui.turnOf", { name: active.name })}</div>
      ${isGameOver ? `<div class="victory"><h2>${winnerNames.length > 1 ? escT("ui.victoryPlural") : escT("ui.victory")}</h2>${escHtml(winnerNames.join(", "))} · ${escT("ui.eliminatedCount", { count: state.bodyCount })}</div>` : ""}
      <div class="board">
        <svg class="tri" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="6,18 94,18 50,94"/></svg>
        ${boardAreas.map(([pos, areaId], i) => `
          <article class="zone win z${i} ${areaId === shownAreaOf(active) ? "here" : ""}">
            <div class="win-title"><span>${AREA_ICONS[areaId] ?? "📍"} ${getAreaLabel(areaId)}</span><span class="zone-dice">🎲 ${diceLabel(areaId)}</span></div>
            <div class="win-body">
              <p class="zone-effect">${T(AREA_BY_ID[areaId].effectKey)}</p>
              <div class="zone-tokens">${occupantsOf(areaId)
                .map((p) => renderPieceToken(p, active, attackableIds)).join("") || '<span class="empty">·</span>'}</div>
            </div>
          </article>`).join("")}
        <div class="dice-slot win"><div class="win-title">${escT("ui.diceWindow")}</div><div class="dice-body"></div></div>
      </div>
      <div class="dock">${gameNotice ? `<div class="dock-row"><span class="dock-title game-notice">${escHtml(gameNotice)}</span></div>` : ""}${renderDock({ active, canAct, pendingReaction, isGameOver, otherPlayers })}</div>
    </section>

    <aside class="side">
      <section class="win"><div class="win-title">${T("ui.yourCharacter")}</div><div class="win-body">
        ${myCharacter ? `
          <div class="me-name"><span class="pl-avatar piece-${pieceIndexFor(me.id)}">${me.name[0].toUpperCase()}</span>
            <b>${T(myCharacter.nameKey)}</b>
            <span class="badge f-${myCharacter.faction}">${T(`factions.${myCharacter.faction}`)}</span>
            <span class="badge">${me.revealed ? T("ui.revealed") : T("ui.secret")}</span></div>
          <div class="hp"><span>HP</span><div class="hp-bar"><div class="hp-fill" style="width:${myHasHp ? Math.max(0, Math.round((shownHpOf(me) / me.maxHp) * 100)) : 100}%"></div></div><span>${myHasHp ? `${shownHpOf(me)}/${me.maxHp}` : "?"}</span></div>
          <dl class="sheet">
            <dt>${T("ui.ability")}</dt><dd>${T(myCharacter.abilityKey)}</dd>
            <dt>${T("ui.winCondition")}</dt><dd>${T(myCharacter.winConditionKey)}</dd>
          </dl>` : `<div class="me-name">${T("ui.hiddenIdentity")}</div>`}
      </div></section>

      <section class="win"><div class="win-title">${T("ui.equipment")}</div><div class="win-body">
        ${me.equipment.map((id) => `<div class="eq"><b>${getEquipmentLabel(id)}</b><small>${getEquipmentText(id)}</small></div>`).join("") || `<small>${T("ui.nothingYet")}</small>`}
      </div></section>

      <section class="win"><div class="win-title">${T("ui.players")}</div><div class="win-body">
        ${state.turnOrder.map((id) => state.players[id]).filter((p) => p && p.id !== me.id).map((p) => {
          const ch = p.revealed && p.characterId ? getCharacter(p.characterId) : null;
          const taggable = p.id !== me.id;
          return `
          <div class="pl piece-${pieceIndexFor(p.id)} ${p.id === active.id ? "active" : ""} ${p.alive ? "" : "dead"} ${ch ? "revealed" : ""} ${taggable && selectedTag ? "droppable" : ""}"
               ${taggable ? `data-player="${p.id}"` : ""} ${ch ? `title="${esc(T(ch.abilityKey))}"` : ""}>
            <span class="pl-avatar">${p.name[0].toUpperCase()}</span>
            <span><b>${p.name}</b>
              ${ch ? `<em class="pl-id"><i class="badge f-${ch.faction}">${T(`factions.${ch.faction}`)}</i> ${T(ch.nameKey)}</em>` : ""}
              <small>${p.alive ? getAreaLabel(p.areaId) : T("ui.eliminated")}</small>
              <small>${p.equipment.length ? p.equipment.map(getEquipmentLabel).join(", ") : "–"}</small></span>
            <span>${p.alive ? "" : "×"}</span>
            ${taggable ? `<div class="pl-tags">${renderMarks(p.id)}</div>` : ""}
          </div>`;
        }).join("")}
        <div class="tags-box">${renderTagPalette()}</div>
      </div></section>
    </aside>
  </main>`;

  if (tagDraft) {
    const el = app.querySelector("[data-tag-input]");
    el.value = tagDraft.value;
    if (tagDraft.focused) { el.focus(); el.setSelectionRange(tagDraft.pos, tagDraft.pos); }
  }

  fillLog();
  app.querySelector("[data-action=toggle-log]")?.addEventListener("click", () => {
    logOpen = !logOpen;
    logWin.hidden = !logOpen;
    if (logOpen) fillLog();
  });
  app.querySelector(".dice-body").append(diceHost);
  syncDice();

  app.querySelector("[data-action=use-ability]")?.addEventListener("click", () => sendAction("USE_ABILITY", {}, "use ability"));
  app.querySelector("[data-action=primary]")?.addEventListener("click", handlePrimaryAction);
  app.querySelector("[data-action=pending]")?.addEventListener("click", handlePendingReaction);
  app.querySelectorAll("[data-destination]").forEach((button) => button.addEventListener("click", () => handlePendingReaction(button.dataset.destination)));
  app.querySelectorAll("[data-roll-index]").forEach((button) => button.addEventListener("click", () => handlePendingReaction(null, Number(button.dataset.rollIndex))));
  app.querySelectorAll("[data-pending-choice]").forEach((button) => button.addEventListener("click", () => {
    resolvePendingChoice(JSON.parse(decodeURIComponent(button.dataset.pendingChoice)));
  }));
  app.querySelector("[data-action=reset]").addEventListener("click", () => {
    if (isHost && hostSession) {
      const currentPlayers = hostSession.authority.state.players;
      const lobbyPlayers = players.map((player, index) => ({
        ...player,
        name: index === 0 ? localPlayerName : currentPlayers[player.id]?.name ?? player.name
      }));
      const lobbyState = createLocalGame(lobbyPlayers, { startingPlayerIndex: 0 });
      hostSession.authority.replaceState(lobbyState);
      roomPlayers = Object.values(lobbyState.players);
    }
    state = null;
    seenEvents = null;
    clearMarks();
    privateState = null;
    wasMyTurn = false;
    render();
  });
  app.querySelector("[data-action=mute]").addEventListener("click", (e) => {
    toggleMuted();
    e.currentTarget.textContent = isMuted() ? "🔇" : "🔊";
  });
  app.querySelectorAll("[data-reward]").forEach((b) => b.addEventListener("click", () => resolveReward(b.dataset.reward)));
  app.querySelector("[data-reward-none]")?.addEventListener("click", () => resolveReward(null));
  app.querySelectorAll("[data-target]").forEach((button) => button.addEventListener("click", () => handleAttack(button.dataset.target)));
  app.querySelector("[data-area-attack]")?.addEventListener("click", () => handleAttack(otherPlayers[0]?.id));
  // Clic direct sur un pion du plateau pour l'attaquer (equivaut aux boutons "Attaquer X").
  app.querySelectorAll("[data-attack-target]").forEach((piece) => {
    piece.addEventListener("click", () => handleAttack(piece.dataset.attackTarget));
    piece.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleAttack(piece.dataset.attackTarget); } });
  });
  app.querySelector("[data-reaction=pay-to-win-damage]")?.addEventListener("click", () => resolveReaction({ action: "damage" }, "Pay-to-Win: deal damage"));
  app.querySelectorAll("[data-reaction=pay-to-win-steal]").forEach((button) => button.addEventListener("click", () => (
    resolveReaction({ action: "steal", cardId: button.dataset.card, confirmReveal: true }, `Pay-to-Win: steal ${button.dataset.card}`)
  )));
  app.querySelector("[data-reaction=lance-plain]")?.addEventListener("click", () => resolveReaction({}, "Telescopic Lance: plain damage"));
  app.querySelector("[data-reaction=lance-bonus]")?.addEventListener("click", () => resolveReaction({ confirmReveal: true }, "Telescopic Lance: bonus damage"));
  app.querySelector("[data-reaction=optional-reveal]")?.addEventListener("click", () => resolveReaction({ confirmReveal: true }, "reveal & activate reaction"));
  app.querySelector("[data-reaction=optional-decline]")?.addEventListener("click", () => resolveReaction({ decline: true }, "decline reaction"));
};

document.documentElement.lang = locale;
loadMessages(locale).then(() => {
  render();
  if (roomId) connectToRoom(roomId);
});
