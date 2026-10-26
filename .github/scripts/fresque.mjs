// Bit by Bit mural suggestions, run by .github/workflows/fresque.yml.
//   check   → validates the issue's code, writes comment.md (reply to the issue)
//   accept  → adds the mural to community.js, writes pr-title.txt and pr-body.md (or comment.md if refused)
// Issue content comes in through env vars (ISSUE_BODY, ISSUE_NUMBER, ISSUE_AUTHOR). Anyone can write it,
// so it never goes into a shell command or into game code unescaped.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { decodeMural, encodeMural, pixelCount, cleanName } from '../../BitByBit/src/core/mural-code.js';

const COMMUNITY_FILE = 'BitByBit/src/data/community.js';
const PLAY_URL = 'https://sorylokan.github.io/games/BitByBit/#play=';
const ACCEPT_LABEL = 'accepted'; // must match .github/workflows/fresque.yml
const CODE_RE = /BB[12]-[A-Za-z0-9_-]+/;

// GitHub issue form answers: "### Question" blocks followed by the answer.
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

// Reads the code (even wrapped in spaces or backticks) and the display name.
export function readProposal(body, githubLogin) {
  const fields = parseForm(body);
  const code = answer(fields, 'Code').match(CODE_RE)?.[0] ?? null;
  const mural = code && decodeMural(code);
  const author = cleanName(answer(fields, 'Pseudo')).replace(/[`*_[\]\\]/g, '').slice(0, 30) || githubLogin;
  // Re-encoded from the decoded mural: canonical form, cleaned name.
  return mural ? { ok: true, mural, author, code: encodeMural(mural) } : { ok: false, author };
}

const summary = ({ mural, code }) => {
  const N = mural.map.length, colors = new Set(mural.map.join('').replace(/\./g, '')).size;
  return `**${mural.name || 'Untitled'}**: ${N}×${N}, ${pixelCount(mural.map)} pixels, ${colors} color(s), ` +
    `${mural.slots} slots.\n\n` +
    `[▶ Play this mural / Jouer cette fresque](${PLAY_URL}${code})`;
};

const BAD_CODE = '❌ I can\'t read the mural code. Make sure it\'s **complete** (it starts with `BB2-` or `BB1-` and can be very ' +
  'long), then edit the issue: I\'ll check again.\n\n' +
  '❌ Je n\'arrive pas à lire le code de la fresque. Vérifie qu\'il est **complet**, puis modifie le ticket : je revérifierai.';

function output(key, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

function main(mode) {
  const p = readProposal(process.env.ISSUE_BODY, process.env.ISSUE_AUTHOR || 'anonymous');
  const number = Number(process.env.ISSUE_NUMBER) || 0;
  const community = readFileSync(COMMUNITY_FILE, 'utf8');
  // Compared decoded: the same mural may be stored as an older BB1 code.
  const codes = community.match(new RegExp(CODE_RE.source, 'g')) ?? [];
  const already = p.ok && codes.some((c) => { const m = decodeMural(c); return m && encodeMural(m) === p.code; });

  if (mode === 'check') {
    writeFileSync('comment.md', !p.ok ? BAD_CODE
      : `✅ Valid code / code valide. ${summary(p)}\n\n` +
        (already ? 'ℹ️ This mural is already in the game.'
          : `To accept it, add the \`${ACCEPT_LABEL}\` label: a pull request will be opened automatically.`));
    return;
  }

  if (mode === 'accept') {
    if (!p.ok || already) {
      writeFileSync('comment.md', !p.ok ? BAD_CODE : 'ℹ️ This mural is already in the game: nothing to add.');
      output('ok', 'false');
      return;
    }
    // New line at the top of the list (newest first). JSON.stringify escapes quotes.
    const marker = 'export const COMMUNITY = [\n';
    if (!community.includes(marker)) throw new Error(`Marker not found in ${COMMUNITY_FILE}`);
    const line = `  { author: ${JSON.stringify(p.author)}, code: ${JSON.stringify(p.code)} }, // issue #${number}\n`;
    writeFileSync(COMMUNITY_FILE, community.replace(marker, marker + line));
    const title = `Community mural: ${p.mural.name || 'Untitled'} (by ${p.author})`;
    writeFileSync('pr-title.txt', title.replace(/[\r\n]/g, ' '));
    writeFileSync('pr-body.md', `Adds the mural suggested in #${number}.\n\n${summary(p)}\n\nCloses #${number}`);
    output('ok', 'true');
    return;
  }

  throw new Error('Expected mode: check or accept');
}

main(process.argv[2]);
