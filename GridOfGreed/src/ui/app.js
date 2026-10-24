// Point d'entrée UI : accueil (créer/rejoindre en deux clics) puis salon.
// Aucune logique de règles ici (brief, section 7) : tout passe par networking/.
import { createTranslator, loadLocale, getLocale, DEFAULT_LOCALE } from "../i18n.js";
import { TrysteroNetwork } from "../networking/trystero-network.js";
import { createHostSession, createClientSession } from "../networking/game-session.js";
import { createRoomId, createRoomLink, getRoomIdFromLocation, isValidRoomCode, normalizeRoomCode } from "../networking/room.js";
import { MESSAGE_TYPES, cleanName, createActionRequest } from "../networking/messages.js";
import { renderTable, fitBoard } from "./table.js";
import { renderSidebar, playerDot } from "./sidebar.js";
import { LANGS, THEMES, getPref, setPref, soundEnabled, readTheme } from "./prefs.js";
import { playEvents, setMuted, click as sndClick } from "./sound.js";

const $ = (id) => document.getElementById(id);

let t = (k, v) => k; // traducteur, remplacé au démarrage
let network = null;  // transport Trystero partagé
let session = null;  // session hôte ou client
let myId = null;
let isHost = false;
let lastView = null; // dernière vue reçue (redimensionnement, changement de langue)
let lastLobby = null; // dernier état du salon (changement de langue)
let assignedTimer;
let lobbyCode = "";
let lobbyLink = "";
let codeShown = false;

// État purement local de la table : sélection de révélation + mode défausser/retourner.
const ui = { revealPicks: [], discardFlipMode: false };

// --- i18n ---
function applyTexts() {
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", t(el.dataset.i18nTitle));
    el.setAttribute("aria-label", t(el.dataset.i18nTitle));
  });
  // Labels d'optgroup (catégories du sélecteur de thème) : attribut label, pas textContent.
  document.querySelectorAll("[data-i18n-label]").forEach((el) => { el.setAttribute("label", t(el.dataset.i18nLabel)); });
}

// Jeton de siège stable par salle : survit au rechargement pour la reconnexion.
function seatToken(roomId) {
  const key = `gog-seat:${roomId}`;
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

// Pseudo sauvegardé pour ne pas le retaper à chaque partie.
function savedName() {
  return localStorage.getItem("gog-name") ?? "";
}
function saveName(name) {
  localStorage.setItem("gog-name", name);
}

function showError(key) {
  const el = $("home-error");
  el.textContent = t(key);
  el.hidden = false;
}

function setConnecting(on) {
  $("create").disabled = on;
  $("join-form").querySelector("button[type=submit]").disabled = on;
  if (on) {
    const el = $("home-error");
    el.textContent = t("app.connecting");
    el.hidden = false;
  }
}

// --- Salon ---
const MASK = "••••-••••";

function paintCode() {
  $("lobby-code").textContent = codeShown ? lobbyCode : MASK;
  // Le lien contient le code : on le masque aussi, sinon il se lirait dans la boîte.
  $("lobby-link").textContent = codeShown ? lobbyLink : lobbyLink.replace(lobbyCode, MASK);
  $("toggle-code").setAttribute("aria-pressed", String(codeShown));
}

function showLobby(code) {
  document.querySelector(".home").hidden = true;
  $("lobby").hidden = false;
  lobbyCode = code;
  lobbyLink = createRoomLink(code);
  codeShown = false;
  paintCode();
}

function renderLobby(lobby) {
  lastLobby = lobby;
  const { maxPlayers, targetScore } = lobby.settings;
  $("lobby-count").textContent = t("lobby.players", { count: lobby.players.length, max: maxPlayers });
  const ul = $("lobby-players");
  ul.innerHTML = "";
  for (let i = 0; i < maxPlayers; i++) {
    const p = lobby.players[i];
    const li = document.createElement("li");
    if (!p) {
      li.className = "free";
      li.textContent = t("lobby.free");
      ul.append(li);
      continue;
    }
    li.className = p.id === myId ? "me" : "";
    const dot = playerDot(i, p.id === lobby.hostId ? t("lobby.hostTip") : null);
    const name = document.createElement("span");
    name.className = "pname";
    name.textContent = p.name;
    li.append(dot, name);
    if (p.id === myId) {
      const you = document.createElement("span");
      you.className = "tag";
      you.textContent = t("lobby.you");
      li.append(you);
    }
    ul.append(li);
  }

  // Réglages : modifiables par l'hôte, en lecture seule pour les autres.
  $("seats-val").textContent = maxPlayers;
  $("seats-minus").disabled = !isHost || maxPlayers <= Math.max(lobby.minPlayers, lobby.players.length);
  $("seats-plus").disabled = !isHost || maxPlayers >= lobby.seatLimit;
  $("opt-score").value = String(targetScore);
  $("opt-score").disabled = !isHost;

  const canStart = isHost && lobby.players.length >= lobby.minPlayers;
  $("start").hidden = !isHost;
  $("start").disabled = !canStart;
  $("lobby-hint").textContent = isHost
    ? (canStart ? "" : t("lobby.startHint"))
    : t("lobby.onlyHostStarts");
}

// Envoie une action au moteur : l'hôte l'exécute lui-même, le client l'envoie.
// L'hôte fait autorité (brief §3) ; un refus se traduit par... rien : la vue
// ne change pas, le coup est simplement ignoré.
function sendAction(action) {
  const request = createActionRequest(myId, action);
  if (isHost) session?.authority.handleRequest(request);
  else session?.requestAction(request);
}

// Une vue reçue (client) ou produite localement (hôte) : on bascule du salon
// vers la table au premier état, puis on redessine à chaque mise à jour.
function showTable(view, events = []) {
  if (!view) return;
  lastView = view;
  playEvents(events); // sons des événements moteur (noop si sourdine)
  if ($("table").hidden) {
    document.querySelector(".home").hidden = true;
    $("lobby").hidden = true;
    $("table").hidden = false;
    ui.revealPicks = [];
  }
  renderTable($("board"), $("table-panel"), view, myId, {
    t, isHost, ui, events,
    onAction: sendAction,
    onNextRound: () => sendAction({ type: "startNextRound" }),
  });
  renderSidebar(view, myId, t);
}

addEventListener("resize", () => {
  if (!$("table").hidden && lastView) fitBoard(lastView.players.length);
});

// --- Créer (1 clic) : code généré, salon ouvert, on est l'hôte ---
async function createRoom() {
  const name = cleanName($("name").value, "");
  if (!name) return showError("app.errorName");
  saveName(name);
  setConnecting(true);
  try {
    const code = createRoomId();
    network = new TrysteroNetwork();
    await withTimeout(network.connect(code));
    history.replaceState(null, "", `#salle=${code}`);
    isHost = true;
    myId = "p1"; // l'hôte est toujours le premier siège
    session = createHostSession(network, {
      hostName: name,
      onLobby: renderLobby,
      // L'hôte reçoit sa vue masquée comme les clients (host-authority).
      onStateChange: showTable,
    });
    showLobby(code);
  } catch {
    showError("app.errorConnection");
  } finally {
    setConnecting(false);
  }
}

// connect() de Trystero peut pendre indéfiniment si les relais nostr sont
// lents ou bloqués : on borne l'attente pour ne pas rester sur « Connexion… ».
function withTimeout(promise, ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

// --- Rejoindre (code dans l'URL ou saisi) : 2 clics ---
async function joinRoom(code) {
  const name = cleanName($("name").value, "");
  if (!name) return showError("app.errorName");
  saveName(name);
  const normalized = normalizeRoomCode(code);
  if (!isValidRoomCode(normalized)) return showError("app.errorInvalidCode");
  setConnecting(true);
  try {
    network = new TrysteroNetwork();
    await withTimeout(network.connect(normalized));
    history.replaceState(null, "", `#salle=${normalized}`);   // <- ici
    session = createClientSession(network, {
      onLobby: renderLobby,
      onAssigned: (playerId) => {
        clearTimeout(assignedTimer);
        myId = playerId;
        showLobby(normalized);
      },
      onRefused: (reason) => {
        clearTimeout(assignedTimer);
        session?.dispose();
        network?.disconnect();
        document.querySelector(".home").hidden = false;
        $("lobby").hidden = true;
        showError(reason === "full" ? "app.errorRoomFull" : "app.errorRoomStarted");
      },
      onView: showTable,
    });
    const hello = () => network.sendHello(name, seatToken(normalized));
    network.on(MESSAGE_TYPES.PLAYER_JOINED, hello);
    hello();
    assignedTimer = setTimeout(() => {
      session?.dispose();
      network?.disconnect();
      showError("app.errorNoHost");
    }, 10000);
  } catch {
    showError("app.errorConnection");
  } finally {
    setConnecting(false);
  }
}

// --- Préférences globales (barre du haut) : langue, thème, sons ---
async function setLanguage(lang) {
  if (!LANGS.includes(lang)) lang = DEFAULT_LOCALE;
  const [active, fallback] = await Promise.all([
    loadLocale(lang).catch(() => ({})),
    loadLocale(DEFAULT_LOCALE),
  ]);
  t = createTranslator({ locale: lang, messages: { [lang]: active, [DEFAULT_LOCALE]: fallback } });
  document.documentElement.lang = lang;
  $("opt-lang").value = lang;
  setPref("lang", lang);
  applyTexts();
  if (lastLobby && !$("lobby").hidden) renderLobby(lastLobby);
  if (lastView && !$("table").hidden) showTable(lastView);
}

function applyTheme(name) {
  const theme = THEMES.includes(name) ? name : THEMES[0];
  document.documentElement.dataset.theme = theme;
  $("opt-theme").value = theme;
  setPref("theme", theme);
}

function applySound(on) {
  $("toggle-sound").setAttribute("aria-pressed", String(on));
  setMuted(!on);
  setPref("sound", on ? "on" : "off");
}

$("opt-lang").addEventListener("change", (e) => setLanguage(e.target.value));
$("opt-theme").addEventListener("change", (e) => applyTheme(e.target.value));
$("toggle-sound").addEventListener("click", () =>
  applySound($("toggle-sound").getAttribute("aria-pressed") !== "true"));

// Clic discret sur les actions principales de l'accueil et du salon.
["create", "start", "copy-code", "copy-link"].forEach((id) =>
  $(id)?.addEventListener("click", sndClick));

$("create").addEventListener("click", createRoom);
// Champ vide : on prend le code du lien d'invitation (#salle=...) s'il y en a un.
$("join-form").addEventListener("submit", (e) => {
  e.preventDefault();
  joinRoom($("code").value.trim() || getRoomIdFromLocation() || "");
});

// Les boutons de copie gardent leur icône : on affiche une coche pendant 1,5 s.
const flashCopied = (btn) => {
  btn.classList.add("copied");
  setTimeout(() => btn.classList.remove("copied"), 1500);
};
$("copy-code").addEventListener("click", async () => {
  await navigator.clipboard.writeText(lobbyCode);
  flashCopied($("copy-code"));
});
$("copy-link").addEventListener("click", async () => {
  await navigator.clipboard.writeText(lobbyLink);
  flashCopied($("copy-link"));
});
$("toggle-code").addEventListener("click", () => {
  codeShown = !codeShown;
  paintCode();
});

// Réglages du salon (hôte uniquement : les contrôles sont désactivés pour les autres).
$("seats-minus").addEventListener("click", () =>
  session?.authority.setSettings({ maxPlayers: lastLobby.settings.maxPlayers - 1 }));
$("seats-plus").addEventListener("click", () =>
  session?.authority.setSettings({ maxPlayers: lastLobby.settings.maxPlayers + 1 }));
$("opt-score").addEventListener("change", (e) => session?.authority.setSettings({ targetScore: Number(e.target.value) }));

$("start").addEventListener("click", () => {
  if (isHost) session?.authority.startMatch();
});

// Pré-remplit pseudo + code si l'URL porte #salle=... : coller le lien suffit.
$("name").value = savedName();
$("code").value = ""; // le code n'est jamais pré-rempli : seul le pseudo est mémorisé

// Démarrage : préférences sauvegardées, puis traductions (repli français).
applyTheme(readTheme());
applySound(soundEnabled());
const browserLang = getLocale();
await setLanguage(getPref("lang", LANGS.includes(browserLang) ? browserLang : DEFAULT_LOCALE));
