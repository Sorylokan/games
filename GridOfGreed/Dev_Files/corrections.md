## Acceuil :

* J'aime pas l'écran du salon. surtout avec deux gros bouton "Copier le code" et "Copier le lien" sont l'un en dessous de l'autre. J'aimerai :
  - Scinder en 2 blocs, gauche et droite.
    - Bloc de gauche :
      - En titre : remplacer "Salon [ABCD-1234]" par "Table de jeu :"
      - Le code de la salle (pas dans un champ de text) en gros avec un svg de "copier" à coté
      - Le lien d'invitation en petit avec un svg "copier" à coté
      - Le nombre de place de 2 à 8
      - Optionnel : Choisir quand la partie se termine (La partie de fini quand un joueur dépasse les {50,100,150,200} points)
    - Bloc de droite :
      - La liste des personne qui a rejoin le salon (avec "place libre" à l'instar de FTM)
      - Une pastille "◆" à gauche du pseudo de l'hôte, (et quand on hover la pastille ça précise "Hôte de la partie")
      - le bouton pour lancer la partie.

## Interface globale :

* Pouvoir choisir la langue
* Activer/désactiver les sons (pas encore implémenté mais ça le sera)
* Changer le thème (je pense que je changerai juste l'ambiance colorimétrique, donc rien de fou)
* Scinder en 2 zones (3) :
  - Top-bar (nom du jeu + choix des langue, du thème des sons) (c'est la 3eme zones mentionné a la ligne au dessus)
  - Bloc de gauche :
    - Table de jeu en 3x3
  - Bloc de droite :
    - Une colone avec :
      - Les scores,
      - Historique des scores,
      - Liste des joueurs, une pastille de couleurs pour chaque joueur, listé dans l'ordre du tour.
      - Information sur la partie (se termine quand un joueur à ou dépasse x points)
  - INFO : un écran classique qui affiche un naviateur en plein ecran c'est en moyenne 1920 par 950.
    - On prend la hauteur en 100%.
    - La top-bar prend sa place (on va dire 70px = il reste 880)
    - On prend la largeur en 80% (10% de chaque coté), soit 1920-20%=1536px
    - On prend 526px pour en faire la colone de droite, 1536-526=1010px
    - On prend 1000px pour la table.
    - On met les 10px restant en gap avec la colonde droite.
    - Zone de 1000*880 à découper en 3x3=9 zones.

*__Note__ : Les informations indidué ne sont qu'indicative d'un écran 16:9 1080p. Convertir en pourcentage.*
* Dimensions de référence (1920×950)
  - Top-bar : 7,37 % de la hauteur (≈ 70 px)
  - Zone principale : 92,63 % de la hauteur (≈ 880 px)
  - Largeur utile : 80 % de l'écran (≈ 1536 px), avec 10 % de marge de chaque côté
  - Table : 65,10 % de la zone utile (≈ 1000 px)
  - Gap : 0,65 % (≈ 10 px)
  - Colonne droite : 34,24 % (≈ 526 px)
  - Table : ratio ≈ 1,136:1, soit 1000×880 px
  - Table divisée en 3×3 : chaque zone = 33,33 % de la largeur et de la hauteur

## Table 3x3

[TL][TM][TR]
[ML][MM][MR]
[BL][BM][BR]

TL, ML, BL : alignés horizontalement à gauche
TM, MM, BM : alignés horizontalement au centre
TR, MR, BR : alignés horizontalement à droite

TL, ML, BL : alignés verticalement au centre
TR, MR, BR : alignés verticalement au centre
TM : aligné verticalement en haut
MM : aligné verticalement au centre
BM : aligné verticalement en bas

## Comportement mécanique

Le joueur commence son tour en cliquant sur la pioche ou la défausse.

* *Pioche* :
- Le joueur clique sur la pioche : la première tuile est dévoilée.
- Le choix est définitif : il ne peut plus sélectionner la défausse.
- Clic sur une tuile de sa grille :
  - La tuile piochée remplace la tuile sélectionnée.
  - La tuile remplacée part en défausse.
- Clic sur la défausse :
  - La tuile piochée part en défausse.
  - Le joueur doit retourner une tuile de sa grille.

* Défausse :
- Le joueur clique sur la défausse : il sélectionne la tuile visible.
- Recliquer sur la défausse annule son choix et lui permet de piocher à nouveau.
- Clic sur une tuile de sa grille :
  - La tuile de la défausse remplace la tuile sélectionnée.
  - La tuile remplacée part en défausse.

Quand c'est notre tour :
- Au survole de la défausse, ça montre le dos des tuiles
- Quand on a sélectionner la pioche ou la défausse, en survolant nos tuiles visible sur notre grille ça montre le dos des tuiles