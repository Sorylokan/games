// Registre des thèmes (même principe que FTM : une ligne ici + son fichier CSS).
//
// Pour ajouter un thème (jardin fleuri, pelouse à nettoyer...) :
//   1. créer src/themes/<id>.js  : textes + render(on, idx) qui dessine une case en SVG
//      (on = true : case « à corriger » ; on = false : case « gagnée ») ;
//   2. créer src/ui/theme-<id>.css : variables de couleurs, polices, décor
//      (voir theme-kittens.css pour la liste des variables) ;
//   3. ajouter une ligne ci-dessous.
// Le moteur (src/game/engine.js) et l'interface (src/ui/app.js) ne changent pas.
export const THEMES = [
  { id: "kittens", css: "./src/ui/theme-kittens.css", load: () => import("./kittens.js") },
  { id: "puppies", css: "./src/ui/theme-puppies.css", load: () => import("./puppies.js") },
  { id: "grumpy", css: "./src/ui/theme-grumpy.css", load: () => import("./grumpy.js") },
  { id: "garden", css: "./src/ui/theme-garden.css", load: () => import("./garden.js") },
  { id: "nightfall", css: "./src/ui/theme-nightfall.css", load: () => import("./nightfall.js") }
];
