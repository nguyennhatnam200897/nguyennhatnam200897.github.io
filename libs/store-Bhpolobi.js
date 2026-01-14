import { c as g, a as S, b as o } from "./aot-runtime-B0kEAgP8.js";
const i = g(() => {
  const [t, a] = S([]), c = 75e3, n = o(() => t().length * c), l = o(() => t().length);
  return { selectedSeats: t, totalPrice: n, seatCount: l, toggleSeat: (e) => {
    const s = t();
    s.includes(e) ? a(s.filter((r) => r !== e)) : a([...s, e]);
  } };
}), { selectedSeats: f, totalPrice: m, seatCount: C, toggleSeat: E } = i;
export {
  C as a,
  m as b,
  f as s,
  E as t
};
