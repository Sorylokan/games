// Réglages du jeu, regroupés ici pour pouvoir les ajuster sans fouiller le code.

export const BASE_SPEED = 6.5;   // cases par seconde pour un porteur (avant son multiplicateur d'espèce)
export const SPAWN_MS = 130;     // délai entre deux porteurs qui sortent d'une même boîte
export const MAX_OUT = 5;        // porteurs dehors en même temps par boîte
export const BOX_OPEN_MS = 280;  // délai entre la pose d'une boîte et la sortie du premier porteur
export const BOX_CLOSE_MS = 500; // durée de l'effacement d'une boîte vidée
export const QUEUE_COUNT = 3;    // nombre de files de boîtes

// Clés de sauvegarde dans le navigateur. Le préfixe « pc- » date de « Petite Colonie » :
// on le garde pour que la progression des joueurs survive au renommage.
export const STORAGE = {
  level: 'pc-level',
  best: 'pc-best',
  skin: 'pc-skin',
  lang: 'pc-lang',
};
