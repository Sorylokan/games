// Theme registry. To add a theme:
//   1. src/themes/<id>.js: texts + render(on, idx) drawing a cell as SVG (on = to fix, off = solved);
//   2. src/ui/theme-<id>.css: colors, fonts, decoration (variables listed in styles.css);
//   3. one line below.
export const THEMES = [
  { id: "kittens", css: "./src/ui/theme-kittens.css", load: () => import("./kittens.js") },
  { id: "puppies", css: "./src/ui/theme-puppies.css", load: () => import("./puppies.js") },
  { id: "grumpy", css: "./src/ui/theme-grumpy.css", load: () => import("./grumpy.js") },
  { id: "garden", css: "./src/ui/theme-garden.css", load: () => import("./garden.js") },
  { id: "nightfall", css: "./src/ui/theme-nightfall.css", load: () => import("./nightfall.js") }
];
