# Bit by Bit

Petit jeu de puzzle relaxant, sans pub. Des porteurs (fourmis, crabes, fées, renards…) démontent
une fresque en pixel art, pixel par pixel. On pose leurs boîtes sur une ligne aux places limitées :
si plus personne ne peut atteindre un pixel de sa couleur, la colonie est coincée.

JavaScript « vanilla » en modules ES, sans bundler : le dossier se dépose tel quel sur GitHub Pages.

## Lancer en local

Les modules ES ne marchent pas en ouvrant `index.html` directement (`file://`) : il faut un petit serveur.

- avec VS Code : extension **Live Server**, clic droit sur `index.html` → *Open with Live Server* ;
- ou en ligne de commande : `npm run serve`, puis ouvrir l'adresse affichée.

Tests (Node 18+) : `npm test`.

## Arborescence

```
index.html                 squelette de la page
locales/                   textes de l'interface, un fichier par langue (fr.json, en.json)
styles/
  base.css                 couleurs par défaut (thème Nuit), police, boutons
  layout.css               barre du haut, plateau, colonne de droite
  components.css           fenêtre de fin, cartes, files de boîtes
  themes/
    classic.css            Palais, Rubis
    escapades.css          Plage, Forêt, Jardin
    seasons.css            Printemps, Été, Automne, Hiver
    festive.css            Halloween, Noël
assets/                    dessins SVG des décors (branche de cerisier, pétales, flocons)
src/
  main.js                  point d'entrée : branchements, reprise, boucle d'animation
  config.js                réglages (vitesses, délais, clés de sauvegarde)
  storage.js               localStorage sans plantage
  dom.js                   raccourcis DOM
  i18n.js                  traducteur générique (le même que Grid of Greed)
  data/
    colors.js              palette des pixels (une lettre = une couleur)
    maps.js                les fresques
    levels.js              difficulté selon le niveau
    skins.js               les thèmes : groupe, équipe de porteurs, probabilités
  core/                    règles pures, sans navigateur (testées avec node)
    grid.js                pixels atteignables, ramassage
    generator.js           fabrication de niveaux faisables mais piégeux
  game/
    state.js               état partagé (partie, dimensions, couleurs, vitesse, thème)
    geometry.js            repères du plateau
    pathfinding.js         trajets des porteurs
    session.js             déroulement : lancer, poser une boîte, avancer, gagner, perdre
  render/
    canvas.js              taille du canvas et primitives de dessin
    board.js               dessin du plateau (cadre, pixels, boîtes)
    carriers/              un fichier par thème pour dessiner ses porteurs
      index.js             registre espèce → dessin
  ui/
    panel.js               colonne de droite et files de boîtes
    overlay.js             fenêtre de fin de fresque
    skin.js                changement de thème
    lang.js                changement de langue, traduction du HTML (data-i18n)
tests/                     tests node (règles, générateur, données)
```

## Recettes

**Ajouter une fresque** : une entrée de plus dans `src/data/maps.js` (un `id` et la grille), puis son nom
sous `map.<id>` dans chaque fichier de `locales/`. Grille carrée, une lettre par couleur de
`src/data/colors.js`, `.` pour une case vide. `npm test` vérifie la forme, les couleurs et les traductions.

**Ajouter un thème** :
1. ses variables de couleur et son décor dans un fichier de `styles/themes/`
   (`:root[data-skin="montheme"] { --bg: …; --card: …; --accent: …; --line: …; --txt: …; --mut: … }`) ;
2. une ligne dans `src/data/skins.js` (groupe, équipe, porteurs) ; la liste déroulante se met à jour seule ;
3. son nom sous `skin.<clé>` dans chaque fichier de `locales/` (et `rules.<équipe>` si c'est une nouvelle équipe).

**Ajouter une espèce de porteur** : une fonction de dessin dans `src/render/carriers/`
(debout, centrée en 0,0, 30 unités = 1 case), puis son nom dans `src/render/carriers/index.js`,
et enfin dans la liste `carriers` du thème voulu.

**Ajouter une langue** : copie `locales/en.json` en `locales/xx.json`, traduis les valeurs (pas les clés),
puis ajoute `xx: 'Nom de la langue'` dans `LANGS` (`src/ui/lang.js`). `npm test` signale toute clé oubliée.

**Régler la difficulté** : `src/data/levels.js` (places sur la ligne, mélange des files) ;
les vitesses et délais sont dans `src/config.js`.
