class m {
  permutation;
  constructor(t = 0) {
    this.permutation = this.generatePermutation(t);
  }
  generatePermutation(t) {
    const i = [];
    for (let n = 0; n < 256; n++)
      i[n] = n;
    for (let n = 255; n > 0; n--) {
      const s = Math.floor(t * (n + 1) % (n + 1));
      [i[n], i[s]] = [i[s], i[n]], t = t * 16807 % 2147483647;
    }
    return [...i, ...i];
  }
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  lerp(t, i, n) {
    return t + n * (i - t);
  }
  grad(t, i, n) {
    const s = t & 3, e = s < 2 ? i : n, o = s < 2 ? n : i;
    return ((s & 1) === 0 ? e : -e) + ((s & 2) === 0 ? o : -o);
  }
  noise(t, i) {
    const n = Math.floor(t) & 255, s = Math.floor(i) & 255;
    t -= Math.floor(t), i -= Math.floor(i);
    const e = this.fade(t), o = this.fade(i), a = this.permutation[n] + s, c = this.permutation[a], l = this.permutation[a + 1], r = this.permutation[n + 1] + s, d = this.permutation[r], u = this.permutation[r + 1];
    return this.lerp(
      this.lerp(
        this.grad(this.permutation[c], t, i),
        this.grad(this.permutation[d], t - 1, i),
        e
      ),
      this.lerp(
        this.grad(this.permutation[l], t, i - 1),
        this.grad(this.permutation[u], t - 1, i - 1),
        e
      ),
      o
    );
  }
}
class p {
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
  /**
   * Check if the animation is currently running.
   */
  get isAnimating() {
    return this.animationId !== null;
  }
  constructor(t, i) {
    this.canvas = t;
    const n = t.getContext("2d");
    if (!n)
      throw new Error("Could not get 2D context from canvas.");
    this.ctx = n, this.options = {
      pattern: i.pattern,
      characters: i.characters,
      speed: i.speed,
      fontSize: i.fontSize || 12,
      fontFamily: i.fontFamily || "monospace",
      color: i.color || "#00ff00",
      backgroundColor: i.backgroundColor || "#000000",
      animated: i.animated !== void 0 ? i.animated : !0
    }, this.perlin = new m(), this.setupCanvas();
  }
  setupCanvas() {
    this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`, this.ctx.textBaseline = "top";
    const t = this.ctx.measureText("M");
    this.charWidth = t.width, this.charHeight = this.options.fontSize, this.cols = Math.floor(this.canvas.width / this.charWidth), this.rows = Math.floor(this.canvas.height / this.charHeight);
  }
  getNoiseFunction() {
    switch (this.options.pattern) {
      case "perlin":
        return (t, i, n) => this.perlin.noise(t * 0.1, i * 0.1 + n);
      case "wave":
        return (t, i, n) => Math.sin(t * 0.1 + n) * Math.cos(i * 0.1 + n * 0.5);
      case "rain":
        return (t, i, n) => Math.sin(i * 0.2 + n * 2) * Math.cos(t * 0.05);
      case "static":
        return () => Math.random() * 2 - 1;
      default:
        return () => 0;
    }
  }
  render(t) {
    this.ctx.fillStyle = this.options.backgroundColor, this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.ctx.fillStyle = this.options.color;
    const i = this.getNoiseFunction(), n = (t - this.startTime) * this.options.speed;
    for (let s = 0; s < this.rows; s++)
      for (let e = 0; e < this.cols; e++) {
        const a = (i(e, s, n) + 1) / 2, c = Math.floor(a * this.options.characters.length), l = Math.max(0, Math.min(c, this.options.characters.length - 1)), r = this.options.characters[l], d = e * this.charWidth, u = s * this.charHeight;
        this.ctx.fillText(r, d, u);
      }
  }
  /**
   * Start the animation.
   */
  start() {
    if (this.animationId !== null)
      return;
    this.startTime = performance.now();
    const t = (i) => {
      this.render(i), this.animationId = requestAnimationFrame(t);
    };
    this.animationId = requestAnimationFrame(t);
  }
  /**
   * Stop the animation.
   */
  stop() {
    this.animationId !== null && (cancelAnimationFrame(this.animationId), this.animationId = null);
  }
  /**
   * Update animation options.
   */
  updateOptions(t) {
    this.options = { ...this.options, ...t }, this.setupCanvas();
  }
  /**
   * Resize the canvas and recalculate grid.
   */
  resize(t, i) {
    this.canvas.width = t, this.canvas.height = i, this.setupCanvas();
  }
}
function f(h) {
  const t = document.createElement("canvas");
  t.style.position = "fixed", t.style.top = "0", t.style.left = "0", t.style.width = "100%", t.style.height = "100%", t.style.zIndex = "-1", t.style.pointerEvents = "none", t.width = window.innerWidth, t.height = window.innerHeight, document.body.appendChild(t);
  const i = new p(t, h), n = () => {
    t.width = window.innerWidth, t.height = window.innerHeight, i.resize(t.width, t.height);
  };
  return window.addEventListener("resize", n), i;
}
export {
  p as ASCIIGround,
  f as createFullPageBackground,
  p as default
};
