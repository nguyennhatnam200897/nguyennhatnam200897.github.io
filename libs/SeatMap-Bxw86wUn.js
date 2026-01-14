import { s as l, t as r } from "./store-Bhpolobi.js";
function g(e, { createEffect: s, onCleanup: d }) {
  const o = (a) => {
    const t = a.target.closest("button[data-id]");
    t && r(t.dataset.id);
  };
  e.gridContainer.addEventListener("click", o), s(() => {
    const a = l(), t = e.gridContainer.children;
    for (let n of t) {
      const i = n.dataset.id;
      a.includes(i) ? n.className = "w-10 h-10 rounded text-xs font-bold transition-all transform scale-110 bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]" : n.className = "w-10 h-10 rounded text-xs font-bold transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600";
    }
  }), d(() => {
    e.gridContainer.removeEventListener("click", o), console.log("SeatMap cleanup done");
  });
}
export {
  g as default
};
