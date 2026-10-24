/* =========================================================
   COURBE DE VITESSE (continue)
   ========================================================= */

const ACC = 0.10, DEC = 0.28, POW = 4;
const V = 1 / (ACC / 2 + (1 - ACC - DEC) + DEC / POW);

function ease(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    if (t < ACC) return V * t * t / (2 * ACC);
    if (t < 1 - DEC) return V * (ACC / 2 + (t - ACC));
    const p = (t - (1 - DEC)) / DEC;
    const before = V * (ACC / 2 + (1 - DEC - ACC));
    return before + (V * DEC / POW) * (1 - Math.pow(1 - p, POW));
}

const REDUCED = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SLOTS = 8;


/* =========================================================
   ODOMÈTRE (un dé)
   ========================================================= */

class Odometer {

    constructor(element, sides, o) {
        this.element = element;
        this.sides   = sides;
        this.o       = o;

        this.cell = o.cell;
        this.T    = o.cell * o.peekTop;      // hauteur visible au-dessus
        this.position = sides - 1;           // affiche la valeur "sides"
        this.frame = null;
        this.finish = null;

        element.innerHTML =
            '<div class="window"><div class="roller"></div></div>' +
            '<div class="separator top"></div><div class="separator bottom"></div>';

        this.roller = element.querySelector(".roller");
        this.slots = [];
        for (let k = 0; k < SLOTS; k++) {
            const el = document.createElement("div");
            el.className = "number";
            el._i = null;
            this.roller.appendChild(el);
            this.slots.push(el);
        }

        this.setPosition(this.position);
    }

    get value() { return this.valueAt(Math.round(this.position)); }

    valueAt(i) {
        return (((i % this.sides) + this.sides) % this.sides) + 1;
    }

    /* Perspective : échelle s(d) et position y(d) (intégrale de s) */
    shape(d) {
        const a = Math.abs(d);
        const k = 1 - (d < 0 ? this.o.topScale : this.o.bottomScale);
        const s = 1 - k * Math.min(a, 1);
        const integral = a <= 1
            ? a - k * a * a / 2
            : (1 - k / 2) + (1 - k) * (a - 1);
        return { y: d < 0 ? -integral : integral, s };
    }

    setPosition(position) {
        this.position = position;
        const base = Math.floor(position) - 3;
        const c = this.cell;

        for (let k = 0; k < SLOTS; k++) {
            const i  = base + k;
            const el = this.slots[((i % SLOTS) + SLOTS) % SLOTS];

            if (el._i !== i) {
                el._i = i;
                el.textContent = this.valueAt(i);
            }

            const d = i - position;
            const { y, s } = this.shape(d);

            el.style.transform =
                `translate3d(0, ${this.T + y * c}px, 0) scaleY(${s})`;

            const near = Math.max(0, 1 - Math.abs(d));
            el.style.textShadow =
                `0 0 ${(c * .04 + c * .13 * near).toFixed(1)}px rgba(var(--gold), ${(0.08 + 0.5 * near).toFixed(2)})`;
        }
    }

    /* Affichage immédiat, sans animation */
    set(value) {
        this.cancel();
        this.setPosition(Math.round(this.position) + ((value - this.value + this.sides) % this.sides));
    }

    cancel() {
        if (this.frame !== null) cancelAnimationFrame(this.frame);
        this.frame = null;
        if (this.finish) { this.finish(null); this.finish = null; }   // ancien lancer : null
    }

    /* Retourne une Promise résolue avec "result" à l'arrêt */
    roll(result) {
        this.cancel();

        return new Promise((resolve) => {
            this.finish = resolve;

            const startPos = this.position;
            const from     = Math.round(startPos);
            const current  = this.valueAt(from);
            const dir      = Math.random() < 0.5 ? 1 : -1;

            let delta = dir === 1
                ? (result - current + this.sides) % this.sides
                : (current - result + this.sides) % this.sides;
            if (delta === 0) delta = this.sides;

            const turns = REDUCED ? 1 : (this.sides === 6 ? 4 : 5);
            const end   = from + (turns * this.sides + delta) * dir;
            const dur   = (this.sides === 6 ? 1450 : 1350) * (REDUCED ? 0.35 : 1);
            const t0    = performance.now();

            let lastRound = from;

            const animate = (now) => {
                const t = Math.min((now - t0) / dur, 1);
                this.setPosition(startPos + (end - startPos) * ease(t));

                const r = Math.round(this.position);
                if (r !== lastRound) {
                    lastRound = r;
                    if (this.o.onTick) this.o.onTick(this);
                }

                if (t < 1) { this.frame = requestAnimationFrame(animate); return; }

                this.frame = null;
                this.setPosition(end);

                this.element.classList.remove("settled");
                void this.element.offsetWidth;
                this.element.classList.add("settled");

                // Retirer la classe apres le flash : sinon, quand l'UI regenere le
                // plateau (render -> innerHTML) et reinsere la tray dans le DOM,
                // l'animation CSS repart a chaque render (flash intempestif a
                // chaque clic, meme hors lancer / tour adverse).
                this.element.addEventListener("animationend",
                    () => this.element.classList.remove("settled"), { once: true });

                if (this.o.onSettle) this.o.onSettle(this, result);

                this.finish = null;
                resolve(result);
            };

            this.frame = requestAnimationFrame(animate);
        });
    }
}


/* =========================================================
   PLATEAU (plusieurs dés)
   =========================================================
   new DiceTray(element, [6, 4], options)

   options (toutes facultatives) :
     cell         taille de la case centrale en px        (56)
     topScale     hauteur de la case du dessus, 0..1      (.72)
     bottomScale  hauteur de la case du dessous, 0..1     (.50)
     peekTop      partie visible au-dessus, en cases      (.55)
     peekBottom   partie visible au-dessous, en cases     (.40)
     onTick(die)           à chaque chiffre qui défile
     onSettle(die, value)  quand un dé s'arrête
   ========================================================= */

export class DiceTray {

    constructor(container, sidesList = [6, 4], options = {}) {
        const o = Object.assign({
            cell: 56,
            topScale: .72,
            bottomScale: .50,
            peekTop: .55,
            peekBottom: .40
        }, options);

        this.container = container;
        container.classList.add("dice-tray");
        container.style.setProperty("--cell", o.cell + "px");
        container.style.setProperty("--T", (o.cell * o.peekTop) + "px");
        container.style.setProperty("--B", (o.cell * o.peekBottom) + "px");

        container.innerHTML = '<div class="center-line"></div>';

        this.dice = sidesList.map((sides) => {
            const el = document.createElement("div");
            el.className = "die";
            container.appendChild(el);
            return new Odometer(el, sides, o);
        });
    }

    /* roll([5, 2]) -> Promise<[5, 2]>.  Sans argument : tirage aléatoire. */
    roll(results) {
        return Promise.all(this.dice.map((die, i) => {
            const r = results && results[i] != null
                ? results[i]
                : Math.floor(Math.random() * die.sides) + 1;
            return die.roll(r);
        }));
    }

    set(values) { this.dice.forEach((die, i) => die.set(values[i])); }

    get values() { return this.dice.map((d) => d.value); }
}