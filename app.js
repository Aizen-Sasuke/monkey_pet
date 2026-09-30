/* Pixel sprites, one per stage. o outline, b body, l belly, a accent, e eye, c cheek, m mouth. */
const SPR = [
  [
    "....oooo....",
    "...obbbbo...",
    "..obbbbbbo..",
    "..obabbbbo..",
    ".obbbbbabbo.",
    ".obbbbbbbbo.",
    ".obbabbbbbo.",
    ".obbbbbbbbo.",
    "..obbbbbbo..",
    "...oooooo...",
  ],
  [
    "...oooooo...",
    "..obbbbbbo..",
    ".obbbbbbbbo.",
    ".obeebbeebo.",
    ".obbbbbbbbo.",
    ".obcbmmbcbo.",
    ".obbbbbbbbo.",
    "..obbbbbbo..",
    "...oooooo...",
  ],
  [
    "..oo....oo..",
    ".obbo..obbo.",
    ".obbbbbbbbo.",
    ".obbbbbbbbo.",
    ".obeebbeebo.",
    ".obbbbbbbbo.",
    ".obcbmmbcbo.",
    ".obbbllbbbo.",
    "..obbbbbbo..",
    "...oooooo...",
  ],
  [
    "..oo....oo..",
    ".obbo..obbo.",
    ".obbbbbbbbo.",
    ".obbbbbbbbo.",
    ".obeebbeebo.",
    ".obbbbbbbbo.",
    "obcbbmmbbcbo",
    "obbbbllbbbbo",
    ".obbbllbbbo.",
    "..obbbbbbo..",
    "..ooo..ooo..",
  ],
  [
    "....a..a....",
    "....aaaa....",
    "..oo....oo..",
    ".obbo..obbo.",
    ".obbbbbbbbo.",
    ".obeebbeebo.",
    ".obbbbbbbbo.",
    "obcbbmmbbcbo",
    "obbbbllbbbbo",
    ".obbbllbbbo.",
    "..obbbbbbo..",
    "..ooo..ooo..",
  ],
];
// Stage names, XP needed to reach them, and body colours.
const ST = [
  { n: "Egg", xp: 0, c: "#FFF0D9" },
  { n: "Hatchling", xp: 60, c: "#8FE3C2" },
  { n: "Kiddo", xp: 300, c: "#FFB3C7" },
  { n: "Teen", xp: 1000, c: "#FFA97A" },
  { n: "Legend", xp: 3000, c: "#B9A0FF" },
];
// Typing passages. Add your own here.
const P = [
  "the little pixel pet hops higher with every word you type so keep your fingers moving and feed it something tasty",
  "a quick brown fox jumps over the lazy dog while the sleepy keyboard waits for someone to press its shiny keys",
  "good typing is mostly rhythm so relax your shoulders keep your eyes on the words and let your fingers find the beat",
  "every tiny test adds up and one day you will look back at your streak and realize how far your hands have come",
  "small habits beat big bursts so type a little today and again tomorrow and watch your pet grow into a legend",
];
// Helpers and saved state
const $ = (id) => document.getElementById(id),
  KEY = "bit-v2";
const dk = (d) =>
  d.getFullYear() +
  "-" +
  String(d.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(d.getDate()).padStart(2, "0");
let S = fresh();
function fresh() {
  return { xp: 0, tests: 0, secs: 0, best: 0, log: {}, mt: null };
}
try {
  const x = JSON.parse(localStorage.getItem(KEY));
  if (x && x.log) S = x;
} catch (e) {}
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
};
const XP = () => S.xp + (S.mt ? S.mt.tests + Math.round(S.mt.secs / 60) : 0);
const stageOf = (xp) => ST.reduce((a, t, i) => (xp >= t.xp ? i : a), 0);
// Builds the SVG rects for stage i.
function svg(i) {
  const P2 = {
      o: "#4A2B55",
      b: ST[i].c,
      l: "#fff",
      a: i === 0 ? "#FFB3C7" : "#FFC93C",
      e: "#2A2450",
      c: "#FF7A9C",
      m: "#4A2B55",
    },
    r = SPR[i],
    y0 = 13 - r.length;
  let h = "";
  r.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== ".")
        h += `<rect x="${x}" y="${y + y0}" width="1" height="1" fill="${P2[ch]}"${ch === "l" ? ' fill-opacity=".55"' : ""}/>`;
    }),
  );
  return h;
}
// Consecutive days with at least one test (today may still be empty).
function streak() {
  let d = new Date(),
    n = 0;
  if (!S.log[dk(d)]) d.setDate(d.getDate() - 1);
  while (S.log[dk(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
// Days since the last test, used for Bit's mood.
function gap() {
  let d = new Date();
  for (let i = 0; i < 30; i++) {
    if (S.log[dk(d)]) return i;
    d.setDate(d.getDate() - 1);
  }
  return 99;
}
const lvl = (n) => (n === 0 ? 0 : n < 2 ? 1 : n < 4 ? 2 : n < 7 ? 3 : 4);
// Redraws the whole UI from saved state.
function render() {
  const xp = XP(),
    i = stageOf(xp),
    t = ST[i],
    nx = ST[i + 1],
    g = gap();
  $("pet").innerHTML = svg(i);
  $("stageName").textContent = t.n;
  const spd = g === 0 ? "0.8s" : g <= 1 ? "1.3s" : g <= 3 ? "1.9s" : "3s";
  $("pet").style.setProperty("--spd", spd);
  $("pet").style.filter = g > 3 && S.tests ? "grayscale(.6)" : "none";
  $("pet").classList.add("idle");
  $("say").textContent =
    !S.tests && !S.mt
      ? "Hi! Type the passage below to hatch me."
      : g === 0
        ? "That sounded great. Keep going!"
        : g === 1
          ? "Quiet today. One quick passage?"
          : g <= 3
            ? "My fingers are cold. Feed me a passage?"
            : "zzz... wake me with a passage.";
  $("fill").style.width =
    (nx ? Math.min(100, ((xp - t.xp) / (nx.xp - t.xp)) * 100) : 100) + "%";
  $("xpTxt").textContent = xp + " XP";
  $("nextTxt").textContent = nx ? nx.xp - xp + " XP to " + nx.n : "Max stage";
  const m = S.mt || { tests: 0, secs: 0, best: 0 };
  $("streak").textContent = streak();
  $("best").textContent = Math.round(Math.max(S.best, m.best));
  $("tests").textContent = S.tests + m.tests;
  $("mins").textContent = Math.round((S.secs + m.secs) / 60);
  $("path").innerHTML = ST.map(
    (s, k) =>
      `<li class="${xp >= s.xp ? "got" : ""}"><svg viewBox="0 0 12 13" shape-rendering="crispEdges" aria-hidden="true">${svg(k)}</svg><b>${s.n}</b>${s.xp} XP</li>`,
  ).join("");
  const now = new Date();
  let h = "";
  for (let k = 0; k < 140; k++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (139 - k));
    const n = S.log[dk(d)] || 0;
    h += `<i class="${k === 139 ? "t" : ""}" style="background:var(--l${lvl(n)})" title="${dk(d)}: ${n} test${n === 1 ? "" : "s"}"></i>`;
  }
  $("heat").innerHTML = h;
  $("user").value = S.mt ? S.mt.user : $("user").value;
  save();
}
// Typing test
let target = "",
  start = 0,
  typed = 0,
  good = 0,
  done = false;
const cap = $("cap");
function words() {
  const v = cap.value;
  $("words").innerHTML = [...target]
    .map(
      (c, i) =>
        `<span class="${i < v.length ? (v[i] === c ? "ok" : "bad") : i === v.length ? "cur" : ""}">${c}</span>`,
    )
    .join("");
}
function round() {
  target = P[Math.floor(Math.random() * P.length)];
  cap.value = "";
  cap.maxLength = target.length;
  start = 0;
  typed = good = 0;
  done = false;
  $("res").textContent = "Click here and start typing.";
  words();
}
function poke() {
  const k = $("keycap"),
    p = $("pet");
  k.classList.add("press");
  setTimeout(() => k.classList.remove("press"), 70);
  p.classList.remove("idle", "hop");
  void p.getBoundingClientRect();
  p.classList.add("hop");
  p.onanimationend = () => {
    p.classList.remove("hop");
    p.classList.add("idle");
  };
}
// Scores the round, awards XP, saves progress.
function finish() {
  done = true;
  const mins = Math.max((performance.now() - start) / 60000, 0.01),
    wpm = Math.round(target.length / 5 / mins),
    acc = Math.round((good / Math.max(typed, 1)) * 100),
    gain = 10 + Math.floor(wpm / 10),
    before = stageOf(XP());
  S.xp += gain;
  S.tests++;
  S.secs += Math.round(mins * 60);
  S.best = Math.max(S.best, wpm);
  const k = dk(new Date());
  S.log[k] = (S.log[k] || 0) + 1;
  const a = stageOf(XP());
  $("res").textContent =
    wpm +
    " WPM, " +
    acc +
    "% accuracy, +" +
    gain +
    " XP." +
    (a > before
      ? " Bit evolved into " + ST[a].n + "!"
      : " Press Enter for another.");
  render();
}
cap.addEventListener("input", (e) => {
  if (done) return;
  const v = cap.value;
  if (!start && v.length) start = performance.now();
  if (e.inputType && e.inputType.startsWith("insert")) {
    typed++;
    if (v[v.length - 1] === target[v.length - 1]) good++;
    poke();
  }
  words();
  if (v.length >= target.length) finish();
});
cap.addEventListener("keydown", (e) => {
  if (done && (e.key === "Enter" || e.key === "Tab")) {
    e.preventDefault();
    round();
  }
});
$("play").addEventListener("click", (e) => {
  if (e.target.id !== "again") cap.focus();
});
$("play").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target === $("play")) cap.focus();
});
$("again").onclick = () => {
  round();
  cap.focus();
};
// Optional: add public Monkeytype totals to Bit's XP.
async function sync() {
  const u = $("user").value.trim();
  if (!u) {
    $("msg").textContent = "Enter your Monkeytype username first.";
    return;
  }
  $("msg").textContent = "Syncing...";
  try {
    const r = await fetch(
      "https://api.monkeytype.com/users/" + encodeURIComponent(u) + "/profile",
    );
    if (!r.ok)
      throw new Error(
        r.status === 404
          ? "that username wasn't found"
          : "the server answered " + r.status,
      );
    const d = (await r.json()).data || {},
      ts = d.typingStats || {};
    let best = 0;
    (function w(x) {
      if (x && typeof x === "object") {
        if (typeof x.wpm === "number") best = Math.max(best, x.wpm);
        Object.values(x).forEach(w);
      }
    })(d.personalBests);
    const before = stageOf(XP());
    S.mt = {
      user: u,
      tests: ts.completedTests || 0,
      secs: ts.timeTyping || 0,
      best,
    };
    const a = stageOf(XP());
    $("msg").textContent =
      "Synced " +
      u +
      ": " +
      S.mt.tests +
      " tests." +
      (a > before ? " Bit evolved into " + ST[a].n + "!" : "");
  } catch (e) {
    $("msg").textContent =
      "Couldn't sync: " + e.message + ". Check the username and try again.";
  }
  render();
}
$("sync").onclick = sync;
$("user").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sync();
});
$("unsync").onclick = () => {
  S.mt = null;
  $("user").value = "";
  $("msg").textContent = "Disconnected.";
  render();
};
$("reset").onclick = () => {
  if (confirm("Reset Bit and all saved progress?")) {
    S = fresh();
    $("msg").textContent = "";
    round();
    render();
  }
};
round();
render();
