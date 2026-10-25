# Grid of Greed - instructions de développement

Jeu de cartes en ligne pour jouer entre amis, 2 à 8 joueurs, dans le navigateur, sans serveur.
Mêmes règles que le Skyjo de base (voir `Grid_of_greed_rules.md`), mais nom, visuels et interface propres.
Accroche : « Play safe. Or don't. »

Ce fichier fixe les contraintes pour toute personne ou IA qui modifie le code. En cas de doute, il prime sur les habitudes.

## 1. Principes

- Même façon de travailler que Free the Memes : même arborescence, mêmes noms de fichiers quand le rôle est le même.
- JavaScript natif en modules ES. **Aucun bundler, aucun framework.** Hébergement sur GitHub Pages.
- Tests avec le lanceur intégré de Node : `npm test` (= `node --test`).
- Commentaires du code en anglais, courts et directs (le dépôt est public). Messages d'erreur du moteur : en français.
- Une seule responsabilité par fichier, un fichier de test par module dans `tests/` (à plat).

## 2. Arborescence

```
src/
  data/       données pures (paquet, plages de couleur)
  game/       règles du jeu, sans DOM ni réseau
  networking/ réseau (à aligner sur celui de Free the Memes)
  ui/         affichage
  board-layout.js   placement des joueurs autour de la table (logique pure)
  i18n.js
tests/        un .test.js par module + helpers.js (aides, pas un test)
```

Dépendances autorisées, dans un seul sens :
`ui` -> `networking` -> `game` -> `data`.
`game` n'importe jamais `ui` ni `networking`. `data` n'importe rien.

## 3. Moteur de règles (`src/game/`)

- **Pur** : pas de DOM, pas de réseau, pas d'horloge, pas de `Math.random` appelé en dur. Le hasard passe par un paramètre `rng`.
- L'état est du JSON sérialisable. Une carte : `{ v, up }`. Une grille : 4 colonnes de 3 cartes, une colonne retirée vaut `null`.
- `dispatch(state, playerId, action, rng)` ne modifie jamais l'état reçu (copie avec `structuredClone`) et renvoie
  `{ ok: true, state, events }` ou `{ ok: false, error }`. Une action refusée ne lève pas d'exception.
- Actions : `initialReveal`, `drawPile`, `drawDiscard`, `swap`, `discardFlip`.
- `legalActions(state, playerId)` liste les coups possibles (pour l'interface et les bots).
- **L'hôte fait autorité.** Lui seul exécute `dispatch`. Les autres joueurs envoient des actions et reçoivent leur vue.
- **Information cachée** : on n'envoie jamais l'état brut. Chaque joueur reçoit `viewFor(state, playerId)` : cartes cachées, pioche et carte piochée par un autre joueur sont masquées.
- Les `events` servent au journal et aux animations. Ils ne contiennent pas d'information secrète (la valeur d'une carte piochée n'y figure qu'une fois posée ou défaussée).
- Invariant testé : il y a toujours 150 cartes au total (pioche + défausse + grilles + carte en main).

## 4. Décisions de règles (cas non couverts par le texte des règles)

| Cas | Décision |
|---|---|
| Égalité pour le premier joueur | Tirage au sort entre les ex æquo, à chaque manche |
| Pioche vide | La défausse est remélangée, sauf sa carte du dessus |
| Score de manche négatif | Il est ajouté tel quel : il fait baisser le total |
| Doublement du finisseur | Seulement si son score est positif et qu'un autre joueur a un score égal ou inférieur |
| Colonnes identiques au décompte | Cartes retournées, puis colonnes retirées, puis score compté |
| Égalité à la fin de partie | Victoire partagée |
| Fin de partie | Dès qu'un total atteint 100 ou plus, à la fin du décompte de la manche |

Toute modification de règle se fait dans `Grid_of_greed_rules.md`, puis dans le moteur, puis dans les tests, dans cet ordre.

## 5. Interface

**Cartes**
- Carré (ratio 1:1). Pas de chiffre dans les coins : la grille ne chevauche pas les cartes.
- Dos : fond sombre, cadre or, losange central. Direction visuelle retenue : « sombre ».
- Face : fond sombre, cadre et chiffre dans la couleur de la plage, grand chiffre au centre, rien d'autre.
- Pas de symbole d'accessibilité en plus : le chiffre suffit. Garder des couleurs qui diffèrent aussi par leur luminosité.

**Couleurs**

| Usage | Valeur |
|---|---|
| Fond de page | `#0c0b10` |
| Fond de carte | `#15131c` |
| Or (dos, cadres, joueur actif) | `#b8923a` |
| -2 et -1 | `#4a8cff` |
| 0 | `#6fd6e6` |
| 1 à 4 | `#5fcf80` |
| 5 à 8 | `#e9d24c` |
| 9 à 12 | `#ef5b5b` |

Point de vigilance : le jaune des 5 à 8 est proche de l'or. À surveiller sur fond de table.

**Plateau**
- Grille 3x3. Au centre : pioche et défausse. Les 8 cases du périmètre : les joueurs.
- Ta grille est toujours **en bas au centre**, à taille pleine. Les autres sont réduites : 70 % jusqu'à 4 joueurs, 60 % pour 5 et 6, 50 % pour 7 et 8.
- La colonne du milieu et la ligne du bas sont les plus grandes (elles portent ta grille). Les autres sont plus étroites.
- Ordre de jeu = sens horaire, en partant de toi (case du bas). Placement symétrique pour chaque nombre de joueurs :

| Joueurs | Cases occupées (dans l'ordre de jeu) |
|---|---|
| 2 | haut-milieu |
| 3 | haut-gauche, haut-droite |
| 4 | milieu-gauche, haut-milieu, milieu-droite |
| 5 | milieu-gauche, haut-gauche, haut-droite, milieu-droite |
| 6 | milieu-gauche, haut-gauche, haut-milieu, haut-droite, milieu-droite |
| 7 | bas-gauche, milieu-gauche, haut-gauche, haut-droite, milieu-droite, bas-droite |
| 8 | bas-gauche, milieu-gauche, haut-gauche, haut-milieu, haut-droite, milieu-droite, bas-droite |

- Chaque joueur voit le plateau depuis sa propre place : le placement se calcule côté client, en partant de lui.
- Joueur actif : cadre doré, sans animation qui déplace la mise en page.
- Taille minimale d'une carte lisible : environ 20 px. En dessous, prévoir « toucher une zone pour l'agrandir ».
- Respecter `prefers-reduced-motion`.
- Le journal met en avant les coups marquants (colonne retirée, finisseur doublé : « greedy puni »), pas chaque action.

## 6. Réseau

- Trystero / WebRTC, comme Free the Memes. Salle identifiée par un code dans l'URL (`#salle=...`) : créer et rejoindre doivent tenir en deux clics.
- L'interface réseau et l'hôte sont à **aligner sur `networking/` de Free the Memes** (`network-adapter.js`, `host-authority.js`...) avant d'écrire du code. Ne pas inventer une deuxième architecture.
- Prévoir dès le départ : déconnexion d'un joueur en pleine manche, déconnexion de l'hôte.

## 7. À ne pas faire

- Ne pas reprendre le nom « Skyjo », ni ses illustrations, ni le texte de sa règle officielle dans une version publiée.
- Ne pas mettre de logique de règles dans `ui/` ni de DOM dans `game/`.
- Ne pas envoyer d'état brut aux clients.
- Ne pas ajouter de dépendance ou de bundler sans en parler.

## 8. État d'avancement

- Fait : règles écrites, moteur complet avec 25 tests (dont 120 parties simulées), maquette visuelle de la table (`grid-of-greed-table.html`, affichage seulement).
- À faire, dans cet ordre : couche `networking/`, puis salon (créer / rejoindre), puis table jouable branchée sur le moteur, puis animations et journal.