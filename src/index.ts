import { Huerific } from "./Heurific";

const instance = new Huerific({
  context: 6,
  offset: 7,
  plugins: {
    hueShift: 0.64,
    autoSaturate: 2.66,
  },
});

const colors = {
  blue: [213, 94, 56],
  brown: [33, 27, 50],
  cyan: [188, 86, 53],
  lime: [82, 84, 67],
  green: [142, 70, 45],
  indigo: [235, 84, 67],
  violet: [239, 84, 67],
  orange: [37, 100, 52],
  purple: [271, 81, 56],
  pink: [329, 86, 70],
  red: [4, 72, 51],
  magenta: [341, 100, 55],
  teal: [172, 66, 50],
  yellow: [42, 95, 56],
};
// instance.generate(213, 94, 85).forEach((color) => {
//   const [h, s, l] = color;

//   console.log(
//     `<div style="background-color: hsl(${h}, ${s}%, ${l}%) width: 100px; height: 100px;"></div>`
//   );
// });

// instance.generate(213, 94, 56).forEach((color) => {
//   const [h, s, l] = color;

//   console.log(
//     `<div style="background-color: hsl(${h}, ${s}%, ${l}%); width: 100px; height: 100px;"></div>`
//   );
// });

Object.entries(colors).forEach(([key, value]) => {
  const [h, s, l] = value || [];

  console.log(key);

  if (h === undefined || s === undefined || l === undefined) {
    return;
  }

  instance.generate(h, s, l).forEach(([h, s, l]) => {
    console.log(
      `<div style="background-color: hsl(${h}, ${s}%, ${l}%); width: 100px; height: 100px;"></div>`
    );
  });
});
