import { Huerific } from "./Heurific";

const instance = new Huerific({
  context: 1,
  plugins: {
    autoSaturate: 2,
  },
});

console.log(instance.generate(156, 77, 44));

console.log(instance.generate(156, 77));
