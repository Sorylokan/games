- Cliquer un pion adverse pour l’attaquer.
- Avoir un sélecteru de thème qui permet de changer l'apparence du site.
- Il y a-t-il vraiment besoin d'un bouton "commencer" si lancer les des est l'action qui suit ? L'ancer les dés pourrait à la fois comencer ET lancer les dés...
- cas spécifique : Quand "Borrowing Without Asking - Steal an Equipment card from any character." arrive et qu'aucun joueur n'a d'équipement, ça bloque le jeu.
- On a réglé le saut du joueurs mais la zone où le joueur va est sélectionné avant que les dés ne finisse dannoncer le résultat; 
- On a réglé le temps avant le dépalacement avec l'odometre mais pas le temps pour les dégats.
- virer le nombre de dégats que prenne les joueurs.
- Ne pas afficher "soit-meme" dans la liste des joueurs
- *Cliquer un pion pour attaquer* → bon point d’interactivité, ajouter cette fonction tout en gardant les boutons « Attaquer X ».

Note pour correctif :
- Finger Bullet > Your attack range becomes every Area except your own. | Probleme : je peut attaquer tout le monde, meme la personne qui sur la meme zone que moi
- Au moment ou on lance les des pour choisur une nouvelle zone avant le déplacement, le cadre de la carte vers laquelle on se dirige s'illumine. | Probleme : elle s'illumine avant que les dés n'ai fini de tourner.
- Le joueru peut résoudre la zone où il se dirige avant d'y être (en lien avec le point precedent)
- Mettre l'info de pioche White, Black ou Notification dans les log (historique de partie)

"Console" affiche :
```
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 close listeners added. Use emitter.setMaxListeners() to increase limit
    u moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    addListener moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    on moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14082
    once moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    pipe moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    B moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    D moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    P moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    O moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    N moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    <anonymous> moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    <anonymous> moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    <anonymous> moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    <anonymous> moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
contentscript.js:14083:34280
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 end listeners added. Use emitter.setMaxListeners() to increase limit
    u moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    addListener moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    on moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14082
    O moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    B moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    D moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    P moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    O moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    N moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14063
    <anonymous> moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    <anonymous> moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    <anonymous> moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
    <anonymous> moz-extension://ce94f799-1805-47ed-9e73-f480791814cf/scripts/contentscript.js:14083
contentscript.js:14083:34280
ObjectMultiplex - orphaned data for stream "background-liveness" 2 contentscript.js:14083:448977
ObjectMultiplex - orphaned data for stream "metamask-multichain-provider" 4 inpage.js;:1:28380
Firefox ne peut établir de connexion avec le serveur à l’adresse wss://koru.bitcointxoko.org/. 5 utils.ts:158:20
[FTM] NETWORK REQUEST start-turn. app.js:47:39
[FTM] CLICK Resolve pending reaction: CHOOSE_MOVEMENT_DESTINATION. app.js:47:39
[FTM] NETWORK REQUEST area-action. app.js:47:39
[FTM] NETWORK REQUEST attack. app.js:47:39
[FTM] NETWORK REQUEST end-turn. app.js:47:39
Firefox ne peut établir de connexion avec le serveur à l’adresse wss://koru.bitcointxoko.org/.
```

PLUS TARD :
- *Sélecteur de thème* → faisable proprement plus tard (variables CSS déjà en place).
> QUESTION : meme la structure HTML peut-être changée ? je pense à l'agencement de la page, si on veut que sur un thème comme "Desktop 2004" affiche tout dans des fenetres sur le coté, mais que le thème "casino" affiche les joueurs autour du plateau de jeux comme à une table de poker, ça change bien plus que le css

rémarque IA:
oui aussi, mais il faut le prévoir dès maintenant. Tu as raison : « Desktop 2004 » en fenêtres latérales et « casino » en table de poker avec joueurs autour du plateau, ce n’est pas qu’une question de couleurs — l’agencement change, donc le HTML change. La bonne façon de ne pas se piéger :

Garder un seul modèle de données : à partir du state, on produit des blocs logiques réutilisables (le plateau, la main/équipement, la liste des joueurs, le dock d’action, le journal). Chaque bloc est une petite fonction de rendu.
Un thème = un gabarit qui place ces blocs différemment (fenêtres à droite, ou joueurs en cercle autour de la table), plus sa feuille de style. Le CSS du thème ne redéfinit que l’apparence; le placement vient du gabarit.
Le thème choisi = une classe sur le conteneur racine (<main class="game-screen theme-casino">) + éventuellement un data-layout pour les réorganisations que le CSS seul ne fait pas.
Si on écrit le rendu d’aujourd’hui en blocs propres dès le départ, ajouter « casino » plus tard = écrire un gabarit et une feuille, sans retoucher à la logique. C’est pour ça que je le rangerais après les correctifs de gameplay de ta liste : poser cette structure maintenant, sans encore écrire un second thème, évitera de tout réécrire quand tu dessineras les cartes.