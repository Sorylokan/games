// Propositions de fresques (Bit by Bit) : lancé par .github/workflows/fresque.yml.
//   node .github/scripts/fresque.mjs check   → vérifie le code du ticket, écrit comment.md (réponse au ticket)
//   node .github/scripts/fresque.mjs accept  → ajoute la fresque dans community.js, écrit pr-title.txt et pr-body.md
//                                              (ou comment.md si elle est refusée)
// Le contenu du ticket arrive par variables d'environnement (ISSUE_BODY, ISSUE_NUMBER, ISSUE_AUTHOR) :
// il est écrit par n'importe qui, donc jamais collé tel quel dans une commande ni dans le code du jeu.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { decodeMural, encodeMural, pixelCount, cleanName } from '../../BitByBit/src/core/mural-code.js';

const COMMUNITY_FILE = 'BitByBit/src/data/community.js';
const PLAY_URL = 'https://sorylokan.github.io/games/BitByBit/#play=';
const ACCEPT_LABEL = 'acceptée';

// Réponses d'un formulaire de ticket GitHub : des blocs « ### Question » suivis de la réponse.
export function parseForm(body) {
  const fields = {};
  for (const part of String(body ?? '').replace(/\r/g, '').split(/^###\s+/m).slice(1)) {
    const [title, ...rest] = part.split('\n');
    const value = rest.join('\n').trim();
    fields[title.trim()] = value === '_No response_' ? '' : value;
  }
  return fields;
}

const answer = (fields, start) => Object.entries(fields).find(([q]) => q.startsWith(start))?.[1] ?? '';

// Lit la proposition : le code (cherché dans la réponse, même entouré d'espaces ou de `), le pseudo affiché.
export function readProposal(body, githubLogin) {
  const fields = parseForm(body);
  const code = answer(fields, 'Code').match(/BB1-[A-Za-z0-9_-]+/)?.[0] ?? null;
  const mural = code && decodeMural(code);
  const author = cleanName(answer(fields, 'Pseudo')).replace(/[`*_[\]\\]/g, '').slice(0, 30) || githubLogin;
  // Code réécrit à partir de la fresque décodée : forme propre, nom nettoyé.
  return mural ? { ok: true, mural, author, code: encodeMural(mural) } : { ok: false, author };
}

const summary = ({ mural, code }) => {
  const N = mural.map.length, colors = new Set(mural.map.join('').replace(/\./g, '')).size;
  return `**${mural.name || 'Sans titre'}** : ${N}×${N}, ${pixelCount(mural.map)} pixels, ${colors} couleur(s).\n\n` +
    `[▶ Jouer cette fresque](${PLAY_URL}${code})`;
};

const BAD_CODE = '❌ Je n\'arrive pas à lire le code de la fresque. Vérifie qu\'il est **complet** ' +
  '(il commence par `BB1-` et peut être très long), puis modifie le ticket : je revérifierai.\n\n' +
  '❌ I can\'t read the mural code. Make sure it\'s **complete**, then edit the issue: I\'ll check again.';

function output(key, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

function main(mode) {
  const p = readProposal(process.env.ISSUE_BODY, process.env.ISSUE_AUTHOR || 'anonyme');
  const number = Number(process.env.ISSUE_NUMBER) || 0;
  const community = readFileSync(COMMUNITY_FILE, 'utf8');
  const already = p.ok && community.includes(p.code);

  if (mode === 'check') {
    writeFileSync('comment.md', !p.ok ? BAD_CODE
      : `✅ Code valide / valid code. ${summary(p)}\n\n` +
        (already ? 'ℹ️ Cette fresque est déjà dans le jeu.'
          : `Pour l'accepter : ajouter l'étiquette \`${ACCEPT_LABEL}\` (une pull request sera préparée automatiquement).`));
    return;
  }

  if (mode === 'accept') {
    if (!p.ok || already) {
      writeFileSync('comment.md', !p.ok ? BAD_CODE : 'ℹ️ Cette fresque est déjà dans le jeu : rien à ajouter.');
      output('ok', 'false');
      return;
    }
    // Nouvelle ligne en tête de la liste (les plus récentes en premier). JSON.stringify : guillemets échappés.
    const marker = 'export const COMMUNITY = [\n';
    if (!community.includes(marker)) throw new Error(`Repère introuvable dans ${COMMUNITY_FILE}`);
    const line = `  { author: ${JSON.stringify(p.author)}, code: ${JSON.stringify(p.code)} }, // ticket #${number}\n`;
    writeFileSync(COMMUNITY_FILE, community.replace(marker, marker + line));
    const title = `Fresque de la communauté : ${p.mural.name || 'Sans titre'} (par ${p.author})`;
    writeFileSync('pr-title.txt', title.replace(/[\r\n]/g, ' '));
    writeFileSync('pr-body.md', `Ajoute la fresque proposée dans #${number}.\n\n${summary(p)}\n\nCloses #${number}`);
    output('ok', 'true');
    return;
  }

  throw new Error('Mode attendu : check ou accept');
}

main(process.argv[2]);
