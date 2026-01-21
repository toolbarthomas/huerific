# 🎨 Huerific

Huerific is a small utility for generating HSL color palettes from a single base color.
It helps you create consistent, visually balanced gradients by handling hue wrapping, lightness distribution, and saturation adjustments automatically.

The output is a palette of `hue`, `saturation` & `lightness` values, ready to be converted to CSS, design tokens, or theme systems.

## Usage

```js
import { Huerific } from "huerific";

const huerific = new Huerific({
  levels: 9,
  context: 5,
  autoSaturate: 8,
  hueShift: 1,
});

const palette = huerific.generate(210, 80, 50);
```

## Properties

| Property             | Description                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| **Levels**           | Define how many color steps are generated in the palette.                                            |
| **Context**          | Anchor point position of the new palette.                                                            |
| **Hue Shift**        | Introduces natural controlled hue variation across the palette                                       |
| **Auto Saturate**    | Dynamically adjusts saturation at the edges of the palette.                                          |
| **Fixed Gradient**   | While no lightness value is provided, the class generates a fixed lightness ramp from dark to light. |
| **Dynamic Gradient** | Providing a lightness value creates a gradient palette centered around that value.                   |