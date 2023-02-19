import { Huerific } from "./Heurific";

const instance = new Huerific({
  context: 7,
  plugins: {
    hueShift: 1.6,
    autoSaturate: 2,
  },
});

console.log(instance.generate(211, 32, 15));
