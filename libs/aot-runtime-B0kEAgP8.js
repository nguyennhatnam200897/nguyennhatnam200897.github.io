const U = (e, t, r) => {
  const n = e[t];
  return n ? typeof n == "function" ? n() : Promise.resolve(n) : new Promise((s, o) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(
      o.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + t + (t.split("/").length !== r ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
const P = (e, t) => e === t, d = {
  equals: P
};
let k = x;
const f = 1, m = 2, L = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var u = null;
let y = null, j = null, l = null, i = null, c = null, g = 0;
function q(e, t) {
  const r = l, n = u, s = e.length === 0, o = n, a = s ? L : {
    owned: null,
    cleanups: null,
    context: o ? o.context : null,
    owner: o
  }, C = s ? e : () => e(() => _(() => p(a)));
  u = a, l = null;
  try {
    return h(C, !0);
  } finally {
    l = r, u = n;
  }
}
function Y(e, t) {
  t = t ? Object.assign({}, d, t) : d;
  const r = {
    value: e,
    observers: null,
    observerSlots: null,
    comparator: t.equals || void 0
  }, n = (s) => (typeof s == "function" && (s = s(r.value)), T(r, s));
  return [A.bind(r), n];
}
function H(e, t, r) {
  k = V;
  const n = O(e, t, !1, f);
  (!r || !r.render) && (n.user = !0), c ? c.push(n) : b(n);
}
function z(e, t, r) {
  r = r ? Object.assign({}, d, r) : d;
  const n = O(e, t, !0, 0);
  return n.observers = null, n.observerSlots = null, n.comparator = r.equals || void 0, b(n), A.bind(n);
}
function _(e) {
  if (l === null) return e();
  const t = l;
  l = null;
  try {
    return e();
  } finally {
    l = t;
  }
}
function F(e) {
  return u === null || (u.cleanups === null ? u.cleanups = [e] : u.cleanups.push(e)), e;
}
function A() {
  if (this.sources && this.state)
    if (this.state === f) b(this);
    else {
      const e = i;
      i = null, h(() => w(this), !1), i = e;
    }
  if (l) {
    const e = this.observers ? this.observers.length : 0;
    l.sources ? (l.sources.push(this), l.sourceSlots.push(e)) : (l.sources = [this], l.sourceSlots = [e]), this.observers ? (this.observers.push(l), this.observerSlots.push(l.sources.length - 1)) : (this.observers = [l], this.observerSlots = [l.sources.length - 1]);
  }
  return this.value;
}
function T(e, t, r) {
  let n = e.value;
  return (!e.comparator || !e.comparator(n, t)) && (e.value = t, e.observers && e.observers.length && h(() => {
    for (let s = 0; s < e.observers.length; s += 1) {
      const o = e.observers[s], a = y && y.running;
      a && y.disposed.has(o), (a ? !o.tState : !o.state) && (o.pure ? i.push(o) : c.push(o), o.observers && N(o)), a || (o.state = f);
    }
    if (i.length > 1e6)
      throw i = [], new Error();
  }, !1)), t;
}
function b(e) {
  if (!e.fn) return;
  p(e);
  const t = g;
  R(e, e.value, t);
}
function R(e, t, r) {
  let n;
  const s = u, o = l;
  l = u = e;
  try {
    n = e.fn(t);
  } catch (a) {
    return e.pure && (e.state = f, e.owned && e.owned.forEach(p), e.owned = null), e.updatedAt = r + 1, D(a);
  } finally {
    l = o, u = s;
  }
  (!e.updatedAt || e.updatedAt <= r) && (e.updatedAt != null && "observers" in e ? T(e, n) : e.value = n, e.updatedAt = r);
}
function O(e, t, r, n = f, s) {
  const o = {
    fn: e,
    state: n,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: t,
    owner: u,
    context: u ? u.context : null,
    pure: r
  };
  return u === null || u !== L && (u.owned ? u.owned.push(o) : u.owned = [o]), o;
}
function v(e) {
  if (e.state === 0) return;
  if (e.state === m) return w(e);
  if (e.suspense && _(e.suspense.inFallback)) return e.suspense.effects.push(e);
  const t = [e];
  for (; (e = e.owner) && (!e.updatedAt || e.updatedAt < g); )
    e.state && t.push(e);
  for (let r = t.length - 1; r >= 0; r--)
    if (e = t[r], e.state === f)
      b(e);
    else if (e.state === m) {
      const n = i;
      i = null, h(() => w(e, t[0]), !1), i = n;
    }
}
function h(e, t) {
  if (i) return e();
  let r = !1;
  t || (i = []), c ? r = !0 : c = [], g++;
  try {
    const n = e();
    return $(r), n;
  } catch (n) {
    r || (c = null), i = null, D(n);
  }
}
function $(e) {
  if (i && (x(i), i = null), e) return;
  const t = c;
  c = null, t.length && h(() => k(t), !1);
}
function x(e) {
  for (let t = 0; t < e.length; t++) v(e[t]);
}
function V(e) {
  let t, r = 0;
  for (t = 0; t < e.length; t++) {
    const n = e[t];
    n.user ? e[r++] = n : v(n);
  }
  for (t = 0; t < r; t++) v(e[t]);
}
function w(e, t) {
  e.state = 0;
  for (let r = 0; r < e.sources.length; r += 1) {
    const n = e.sources[r];
    if (n.sources) {
      const s = n.state;
      s === f ? n !== t && (!n.updatedAt || n.updatedAt < g) && v(n) : s === m && w(n, t);
    }
  }
}
function N(e) {
  for (let t = 0; t < e.observers.length; t += 1) {
    const r = e.observers[t];
    r.state || (r.state = m, r.pure ? i.push(r) : c.push(r), r.observers && N(r));
  }
}
function p(e) {
  let t;
  if (e.sources)
    for (; e.sources.length; ) {
      const r = e.sources.pop(), n = e.sourceSlots.pop(), s = r.observers;
      if (s && s.length) {
        const o = s.pop(), a = r.observerSlots.pop();
        n < s.length && (o.sourceSlots[a] = n, s[n] = o, r.observerSlots[n] = a);
      }
    }
  if (e.tOwned) {
    for (t = e.tOwned.length - 1; t >= 0; t--) p(e.tOwned[t]);
    delete e.tOwned;
  }
  if (e.owned) {
    for (t = e.owned.length - 1; t >= 0; t--) p(e.owned[t]);
    e.owned = null;
  }
  if (e.cleanups) {
    for (t = e.cleanups.length - 1; t >= 0; t--) e.cleanups[t]();
    e.cleanups = null;
  }
  e.state = 0;
}
function W(e) {
  return e instanceof Error ? e : new Error(typeof e == "string" ? e : "Unknown error", {
    cause: e
  });
}
function D(e, t = u) {
  throw W(e);
}
const E = /* @__PURE__ */ new Map(), I = new IntersectionObserver((e) => {
  e.forEach((t) => {
    if (t.isIntersecting) {
      const r = t.target;
      I.unobserve(r), S(r);
    }
  });
}, { rootMargin: "100px" });
function G(e) {
  if (e.__hoverInit) return;
  e.__hoverInit = !0;
  let t;
  const r = 200, n = () => {
    t = setTimeout(() => {
      o(), S(e);
    }, r);
  }, s = () => {
    clearTimeout(t);
  }, o = () => {
    e.removeEventListener("mouseenter", n), e.removeEventListener("mouseleave", s);
  };
  e.addEventListener("mouseenter", n), e.addEventListener("mouseleave", s);
}
if (typeof document < "u") {
  const e = (t) => {
    const r = t.type === "pointerdown" && t.isPrimary && t.button === 0, n = t.type === "keydown" && (t.key === "Enter" || t.key === " ");
    if (!r && !n) return;
    const s = t.target.closest('[data-on="click"][data-src]');
    if (s) {
      if (s.__isLoading) {
        t.preventDefault(), t.stopImmediatePropagation();
        return;
      }
      s.__isLoading = !0, s.tagName, S(s).finally(() => {
        setTimeout(() => s.__isLoading = !1, 500);
      });
    }
  };
  document.addEventListener("pointerdown", e), document.addEventListener("keydown", e), document.addEventListener("click", (t) => {
    t.target.closest('[data-on="click"][data-src]') && t.preventDefault();
  });
}
function K(e) {
  e.querySelectorAll('[data-on="visible"]').forEach((t) => I.observe(t)), e.querySelectorAll('[data-on="hover"]').forEach((t) => G(t));
}
async function S(e) {
  const t = e.dataset.src, r = e.dataset.target, n = r ? document.querySelector(r) : e;
  if (!n) {
    console.warn(`⚠️ Target not found: ${r}`);
    return;
  }
  try {
    n.classList.add("animate-pulse", "opacity-60", "pointer-events-none");
    const s = await fetch(t);
    if (!s.ok) throw new Error(`HTTP ${s.status}`);
    const o = await s.text();
    n.innerHTML = o, M(n);
  } catch (s) {
    console.error("Fetch error:", s);
  } finally {
    n.classList.remove("animate-pulse", "opacity-60", "pointer-events-none");
  }
}
function Q(e) {
  const t = {}, r = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT);
  let n = r.currentNode;
  for (; n; )
    n.hasAttribute("data-r") && (t[n.getAttribute("data-r")] = n), n !== e && n.hasAttribute("data-cmp"), n = r.nextNode();
  return t;
}
async function M(e = document) {
  const t = e.querySelectorAll("[data-cmp]");
  for (const r of t) {
    if (r.__hydrated) continue;
    const n = r.dataset.cmp;
    try {
      if (!E.has(n)) {
        const a = await U(/* @__PURE__ */ Object.assign({ "../chunks/SeatMap.js": () => import("./SeatMap-Bxw86wUn.js"), "../chunks/TicketSummary.js": () => import("./TicketSummary-6umi6YW0.js") }), `../chunks/${n}.js`, 3);
        E.set(n, a.default);
      }
      const s = E.get(n), o = Q(r);
      r.__dispose = q((a) => (s(o, { createEffect: H, onCleanup: F }), a)), r.__hydrated = !0;
    } catch (s) {
      console.error(`❌ Hydrate fail: ${n}`, s);
    }
  }
  K(e);
}
typeof window < "u" && document.addEventListener("DOMContentLoaded", () => M());
export {
  Y as a,
  z as b,
  q as c,
  M as h
};
