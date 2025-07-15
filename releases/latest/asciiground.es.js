class u {
  permutation;
  constructor(i = 0) {
    this.permutation = this.generatePermutation(i);
  }
  generatePermutation(i) {
    const t = [];
    for (let a = 0; a < 256; a++) t[a] = a;
    for (let a = 255; a > 0; a--) {
      const e = Math.floor(i * (a + 1) % (a + 1));
      [t[a], t[e]] = [t[e], t[a]], i = i * 16807 % 2147483647;
    }
    return [...t, ...t];
  }
  fade(i) {
    return i * i * i * (i * (i * 6 - 15) + 10);
  }
  lerp(i, t, a) {
    return i + a * (t - i);
  }
  grad(i, t, a) {
    const e = i & 3, s = e < 2 ? t : a, l = e < 2 ? a : t;
    return ((e & 1) === 0 ? s : -s) + ((e & 2) === 0 ? l : -l);
  }
  noise(i, t) {
    const a = Math.floor(i) & 255, e = Math.floor(t) & 255;
    i -= Math.floor(i), t -= Math.floor(t);
    const s = this.fade(i), l = this.fade(t), r = this.permutation[a] + e, o = this.permutation[r], c = this.permutation[r + 1], n = this.permutation[a + 1] + e, h = this.permutation[n], d = this.permutation[n + 1];
    return this.lerp(
      this.lerp(
        this.grad(this.permutation[o], i, t),
        this.grad(this.permutation[h], i - 1, t),
        s
      ),
      this.lerp(
        this.grad(this.permutation[c], i, t - 1),
        this.grad(this.permutation[d], i - 1, t - 1),
        s
      ),
      l
    );
  }
}
function f() {
  const p = [
    [12448, 12543],
    // Katakana
    [12352, 12447],
    // Hiragana
    [19968, 20096]
    // Some Kanji (short range for visual effect)
  ], [i, t] = p[Math.floor(Math.random() * p.length)];
  return String.fromCharCode(Math.floor(Math.random() * (t - i)) + i);
}
class m {
  canvas;
  ctx;
  options;
  animationId = null;
  startTime = 0;
  perlin;
  cols = 0;
  rows = 0;
  charWidth = 0;
  charHeight = 0;
  japanRainDrops = [];
  rainDropDensity = 0.9;
  get isAnimating() {
    return this.animationId !== null;
  }
  constructor(i, t) {
    this.canvas = i;
    const a = i.getContext("2d");
    if (!a) throw new Error("Could not get 2D context from canvas.");
    this.ctx = a, this.options = {
      pattern: t.pattern,
      characters: t.characters,
      speed: t.speed,
      fontSize: t.fontSize || 12,
      fontFamily: t.fontFamily || "monospace",
      color: t.color || "#00ff00",
      backgroundColor: t.backgroundColor || "#000000",
      animated: t.animated !== void 0 ? t.animated : !0,
      direction: t.direction || "down",
      amplitudeX: t.amplitudeX ?? 1,
      amplitudeY: t.amplitudeY ?? 1,
      frequency: t.frequency ?? 1,
      noiseScale: t.noiseScale ?? 0.1,
      rainDensity: t.rainDensity ?? 0.9,
      rainDirection: t.rainDirection ?? "vertical"
    }, this.rainDropDensity = this.options.rainDensity, this.perlin = new u(), this.setupCanvas(), this.options.pattern === "japan-rain" && this.initJapanRain();
  }
  setupCanvas() {
    this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`, this.ctx.textBaseline = "top";
    const i = this.ctx.measureText("Ｍ");
    this.charWidth = i.width, this.charHeight = this.options.fontSize, this.cols = Math.floor(this.canvas.width / this.charWidth), this.rows = Math.floor(this.canvas.height / this.charHeight);
  }
  getNoiseFunction() {
    const { noiseScale: i, direction: t, amplitudeX: a, amplitudeY: e, frequency: s, rainDirection: l } = this.options;
    switch (this.options.pattern) {
      case "perlin":
        return (r, o, c) => {
          let n = r, h = o;
          switch (t) {
            case "left":
              n = -r;
              break;
            case "right":
              n = r;
              break;
            case "up":
              h = -o;
              break;
            case "down":
              h = o;
              break;
          }
          return this.perlin.noise(n * i, h * i + c);
        };
      case "wave":
        return (r, o, c) => {
          let n = c * s, h = r, d = o;
          switch (t) {
            case "left":
              n = -n;
              break;
            case "right":
              n = n;
              break;
            case "up":
              n = -n;
              break;
            case "down":
              n = n;
              break;
          }
          return Math.sin(h * 0.1 * a + n) * Math.cos(d * 0.1 * e + n * 0.5);
        };
      case "rain":
        return (r, o, c) => {
          let n = 0;
          switch (l) {
            case "vertical":
              n = 0;
              break;
            case "diagonal-left":
              n = Math.PI / 4;
              break;
            case "diagonal-right":
              n = -Math.PI / 4;
              break;
          }
          const h = Math.cos(n), d = Math.sin(n);
          return Math.sin((o * d + r * h) * 0.2 + c * 2) * Math.cos(r * 0.05);
        };
      case "static":
        return () => Math.random() * 2 - 1;
      default:
        return () => 0;
    }
  }
  initJapanRain() {
    this.japanRainDrops = [], this.rainDropDensity = this.options.rainDensity ?? 0.9;
    for (let i = 0; i < this.cols; i++)
      if (Math.random() < this.rainDropDensity) {
        const t = Math.floor(Math.random() * 20) + 8, a = Array.from({ length: t }, () => f());
        this.japanRainDrops.push({
          col: i,
          y: Math.floor(Math.random() * this.rows),
          speed: 0.5 + Math.random() * 1.2,
          chars: a,
          length: t,
          age: 0
        });
      }
  }
  updateJapanRainDrops() {
    for (const t of this.japanRainDrops) {
      if (t.y += t.speed * this.options.speed, t.age += this.options.speed, Math.random() < 0.04) {
        let a = Math.floor(Math.random() * t.length);
        t.chars[a] = f();
      }
      t.y - t.length > this.rows && (t.y = -Math.floor(Math.random() * 8), t.length = Math.floor(Math.random() * 20) + 8, t.chars = Array.from({ length: t.length }, () => f()), t.speed = 0.5 + Math.random() * 1.2, t.age = 0);
    }
    const i = Math.floor(this.cols * this.rainDropDensity);
    for (; this.japanRainDrops.length < i; ) {
      const t = this.japanRainDrops.length % this.cols, a = Math.floor(Math.random() * 20) + 8, e = Array.from({ length: a }, () => f());
      this.japanRainDrops.push({
        col: t,
        y: Math.floor(Math.random() * this.rows),
        speed: 0.5 + Math.random() * 1.2,
        chars: e,
        length: a,
        age: 0
      });
    }
    this.japanRainDrops.length > i && (this.japanRainDrops.length = i);
  }
  renderJapanRain() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (const i of this.japanRainDrops)
      for (let t = 0; t < i.length; t++) {
        const a = i.chars[t], e = i.col * this.charWidth, s = (Math.floor(i.y) - t) * this.charHeight;
        s < 0 || s > this.canvas.height || (t === 0 ? this.ctx.fillStyle = "#ccffcc" : t < 3 ? this.ctx.fillStyle = this.options.color || "#00ff00" : this.ctx.fillStyle = "rgba(0,255,0,0.7)", this.ctx.fillText(a, e, s));
      }
  }
  render(i) {
    if (this.options.pattern === "japan-rain") {
      this.updateJapanRainDrops(), this.renderJapanRain();
      return;
    }
    this.ctx.fillStyle = this.options.backgroundColor, this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.ctx.fillStyle = this.options.color;
    const t = this.getNoiseFunction(), a = (i - this.startTime) / 1e3 * this.options.speed;
    for (let e = 0; e < this.rows; e++)
      for (let s = 0; s < this.cols; s++) {
        const r = (t(s, e, a) + 1) / 2, o = Math.floor(r * this.options.characters.length), c = Math.max(0, Math.min(o, this.options.characters.length - 1)), n = this.options.characters[c], h = s * this.charWidth, d = e * this.charHeight;
        this.ctx.fillText(n, h, d);
      }
  }
  start() {
    if (this.animationId !== null) return;
    this.startTime = performance.now();
    const i = (t) => {
      this.render(t), this.animationId = requestAnimationFrame(i);
    };
    this.animationId = requestAnimationFrame(i);
  }
  stop() {
    this.animationId !== null && (cancelAnimationFrame(this.animationId), this.animationId = null);
  }
  updateOptions(i) {
    this.options = { ...this.options, ...i }, typeof i.rainDensity == "number" && (this.rainDropDensity = i.rainDensity), this.setupCanvas(), this.options.pattern === "japan-rain" && this.initJapanRain();
  }
  resize(i, t) {
    this.canvas.width = i, this.canvas.height = t, this.setupCanvas(), this.options.pattern === "japan-rain" && this.initJapanRain();
  }
}
function g(p) {
  const i = document.createElement("canvas");
  i.style.position = "fixed", i.style.top = "0", i.style.left = "0", i.style.width = "100%", i.style.height = "100%", i.style.zIndex = "-1", i.style.pointerEvents = "none", i.width = window.innerWidth, i.height = window.innerHeight, document.body.appendChild(i);
  const t = new m(i, p), a = () => {
    i.width = window.innerWidth, i.height = window.innerHeight, t.resize(i.width, i.height);
  };
  return window.addEventListener("resize", a), t;
}
export {
  m as ASCIIGround,
  g as createFullPageBackground,
  m as default
};
