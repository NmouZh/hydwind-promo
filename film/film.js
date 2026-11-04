// 宣传片时间轴：给定 t（秒），把画面设成那一帧的状态。
// 每一帧都是纯函数结果，所以可以逐帧截图，不会因为掉帧而抖。

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// 和官网 token 同一组缓动：--md-sys-motion-easing-standard / -emphasized-decelerate
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const fx = (s) => ((ax * s + bx) * s + cx) * s;
  const dfx = (s) => (3 * ax * s + 2 * bx) * s + cx;
  const fy = (s) => ((ay * s + by) * s + cy) * s;
  return (x) => {
    let s = x;
    for (let i = 0; i < 8; i += 1) {
      const err = fx(s) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = dfx(s);
      if (Math.abs(d) < 1e-6) break;
      s -= err / d;
    }
    return fy(clamp(s));
  };
}

const std = bezier(0.2, 0, 0, 1);
const decel = bezier(0.05, 0.7, 0.1, 1);
const accel = bezier(0.3, 0, 0.8, 0.15);

const seg = (t, a, b) => clamp((t - a) / (b - a));

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const scenes = {
  s1: { start: 0.0, end: 3.0 },
  s2: { start: 3.0, end: 6.2 },
  s3: { start: 6.2, end: 9.6 },
  s4: { start: 9.6, end: 12.4 },
  s5: { start: 12.4, end: 15.0, hold: true },
};

const FADE_IN = 0.45;
const FADE_OUT = 0.45;

// 进入/退出：往上浮一点点，配同样的缓动
// hold===true 表示这一场不淡出（尾卡要一直停到最后一帧）
function place(el, t, { start, end, hold }, dirIn = 22, dirOut = 18) {
  if (!el) return;
  const inP = start > 0 ? decel(seg(t, start, start + FADE_IN)) : 1;
  const outP = hold ? 0 : accel(seg(t, end - FADE_OUT, end));
  const opacity = inP * (1 - outP);
  const y = (1 - inP) * dirIn - outP * dirOut;
  el.style.opacity = String(opacity);
  el.style.transform = y === 0 ? "none" : `translateY(${y.toFixed(2)}px)`;
  el.style.visibility = opacity <= 0.002 ? "hidden" : "visible";
}

// 场景内的单个元素：时间轴自己定
function rise(el, t, a, b, dy = 16, ease = decel) {
  if (!el) return;
  const p = ease(seg(t, a, b));
  el.style.opacity = String(p);
  el.style.transform = p >= 1 ? "none" : `translateY(${((1 - p) * dy).toFixed(2)}px)`;
}

const el = {
  s1: $("#s1"),
  s2: $("#s2"),
  s3: $("#s3"),
  s4: $("#s4"),
  s5: $("#s5"),
  rows: $$("#s3 .row"),
};

function render(t) {
  Object.entries(scenes).forEach(([key, span]) => {
    place(el[key], t, span, key === "s1" ? 0 : 22, key === "s5" ? 0 : 18);
  });

  // ---- S1 片头 ----
  const t1 = t - scenes.s1.start;
  rise($("#s1 [data-a=eye]"), t1, 0.05, 0.75, 12);
  rise($("#s1 [data-a=hero]"), t1, 0.12, 0.95, 26);
  rise($("#s1 [data-a=lede]"), t1, 0.62, 1.35, 14);
  rise($("#s1 [data-a=addr]"), t1, 0.9, 1.6, 12);
  const rule = $("#s1 [data-a=rule]");
  rule.style.width = `${(520 * decel(seg(t1, 0.45, 1.25))).toFixed(1)}px`;

  // ---- S2 首页 ----
  const t2 = t - scenes.s2.start;
  rise($("#s2 [data-a=eye]"), t2, 0.1, 0.7, 12);
  rise($("#s2 [data-a=title]"), t2, 0.18, 0.85, 18);
  rise($("#s2 [data-a=text]"), t2, 0.3, 1.0, 14);
  const f2 = $("#s2 [data-a=frame]");
  const f2p = decel(seg(t2, 0.05, 1.0));
  f2.style.opacity = String(f2p);
  f2.style.transform = `translateY(${((1 - f2p) * 26).toFixed(2)}px) scale(${(0.975 + 0.025 * f2p).toFixed(4)})`;
  const shot2 = $("#s2 [data-a=shot]");
  const slow2 = seg(t2, 0.0, 3.2);
  shot2.style.transform = `scale(${(1.02 + 0.055 * slow2).toFixed(4)}) translateY(${(-8 * slow2).toFixed(2)}px)`;

  // ---- S3 事实清单 ----
  const t3 = t - scenes.s3.start;
  rise($("#s3 [data-a=eye]"), t3, 0.08, 0.65, 12);
  rise($("#s3 [data-a=title]"), t3, 0.15, 0.8, 16);
  el.rows.forEach((row, i) => {
    const a = 0.45 + i * 0.26;
    rise(row, t3, a, a + 0.5, 14);
    row.style.transform += ` translateX(${((1 - decel(seg(t3, a, a + 0.5))) * 10).toFixed(2)}px)`;
  });

  // ---- S4 进服四步 ----
  const t4 = t - scenes.s4.start;
  rise($("#s4 [data-a=eye]"), t4, 0.1, 0.7, 12);
  rise($("#s4 [data-a=title]"), t4, 0.18, 0.85, 18);
  rise($("#s4 [data-a=text]"), t4, 0.3, 1.0, 14);
  const f4 = $("#s4 [data-a=frame]");
  const f4p = decel(seg(t4, 0.05, 1.0));
  f4.style.opacity = String(f4p);
  f4.style.transform = `translateY(${((1 - f4p) * 26).toFixed(2)}px) scale(${(0.975 + 0.025 * f4p).toFixed(4)})`;
  const shot4 = $("#s4 [data-a=shot]");
  const slow4 = seg(t4, 0.0, 2.9);
  shot4.style.transform = `scale(${(1.06 - 0.045 * slow4).toFixed(4)}) translateY(${(-6 + 6 * slow4).toFixed(2)}px)`;

  // ---- S5 尾卡 ----
  const t5 = t - scenes.s5.start;
  rise($("#s5 [data-a=eye]"), t5, 0.15, 0.75, 12);
  rise($("#s5 [data-a=addr]"), t5, 0.25, 0.95, 22);
  rise($("#s5 [data-a=sub]"), t5, 0.5, 1.15, 14);
  rise($("#s5 [data-a=line]"), t5, 0.6, 1.2, 8);
  rise($("#s5 [data-a=close]"), t5, 0.85, 1.5, 16);
  rise($("#s5 [data-a=brand]"), t5, 0.75, 1.35, 12);
  rise($("#s5 [data-a=fine]"), t5, 1.0, 1.6, 10);
}

window.__renderAt = (t) => {
  render(t);
  return true;
};

window.__ready = async () => {
  await document.fonts.ready;
  const imgs = $$("img");
  await Promise.all(
    imgs.map((img) =>
      img.complete ? Promise.resolve() : new Promise((r) => (img.onload = img.onerror = r)),
    ),
  );
  render(0);
  return true;
};

window.__duration = 15.0;
render(0);
