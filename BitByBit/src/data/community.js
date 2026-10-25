// Fresques de la communauté : propositions des joueurs, validées à la main
// (tickets GitHub « Bit by Bit : proposer une fresque »).
// Pour en accepter une : une ligne de plus, avec le pseudo et le code BB1-… copiés du ticket.
// Le nom de la fresque est déjà dans le code. Les plus récentes en premier.
import { decodeMural } from '../core/mural-code.js';

export const COMMUNITY = [
  // { author: 'Pseudo', code: 'BB1-…' },
];

// Fresques prêtes à jouer : { name, map, author }. Un code abîmé est ignoré (le test le signale).
export const communityMurals = () => COMMUNITY
  .map((e) => ({ ...decodeMural(e.code), author: e.author }))
  .filter((m) => m.map);
