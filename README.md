# 🎨 Huerific
Huerific is a utility for generating HSL color palettes from a single base color. It produces arrays of [hue, saturation, lightness] values, optionally adjusted for visual balance across steps. The generator supports fixed or dynamic lightness gradients, controlled hue shifts, and optional saturation adjustments.

Palettes are discrete and structured: each step is generated deterministically based on the provided options, making palettes predictable and suitable for theme systems, CSS variables, or design tools.

## Overview

Huerific palettes are organized around three main principles: levels, context, and gradient type:

- **Levels:** The number of steps in the palette. Each step represents a distinct color derived from the base hue and rules. More levels give finer gradations; fewer levels produce stronger, more contrasting steps.
- **Context:** The anchor point within the palette that serves as the reference for gradient generation. Steps above and the context adjust lightness and saturation relative to this anchor, ensuring smooth transitions and balanced visual weight.
- **Fixed Gradient:** Generates a uniform descending lightness ramp when no specific lightness value is provided.
- **Dynamic Gradient:** Generates a gradient centered on a provided lightness value, transitioning to darker and lighter steps above and below the context.
- **Hue Shift:** Optionally offsets hue across palette steps to introduce natural variation and prevent monotony in long sequences.
- **Auto Saturation:** Optionally increases or decreases saturation at the edges of the palette to maintain visual balance and vibrancy.

## How it works
Huerific generates palettes in a stepwise, deterministic manner:

- **Step Calculation:** The generator determines how many steps to produce and where the central context lies.
- **Lightness Gradient:** Depending on whether a base lightness is provided, a fixed or dynamic gradient is created.
- **Hue Adjustment:** Hue shifts are applied per step if configured.
- **Saturation Adjustment:** Optional auto-saturation is applied near the edges to maintain perceptual consistency.

The final palette is returned as an array of [hue, saturation, lightness] values.


## API
The palette generator is configured via the constructor:

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

| Option         | Type   | Description                                                                           |
| -------------- | ------ | ------------------------------------------------------------------------------------- |
| `levels`       | number | Number of color steps in the palette. Defaults to 9.                                  |
| `context`      | number | Anchor step within the palette. Steps are balanced around this point. Defaults to 5.  |
| `hueShift`     | number | Hue rotation per step. Adds subtle variation across the palette. Defaults to 1.       |
| `autoSaturate` | number | Optional adjustment applied to saturation at palette edges. Defaults to 0 (disabled). |
| `offset`       | number | Optional lightness offset used for gradient calculation. Defaults to 0.               |

##### Levels
Defines the number of steps generated. More steps create smoother gradients, fewer steps create stronger contrasts.

##### Context
Determines the central anchor for the lightness gradient. Steps above and below this index are calculated relative to this anchor, ensuring balanced transitions in lightness.

##### Hue Shift
Applies a small rotational change in hue across palette steps. Useful for avoiding uniform hues and introducing natural variety.

##### Auto Saturate
Adjusts saturation automatically at the extremes of the palette. Positive values increase vibrancy, negative values reduce intensity, depending on the palette configuration.

##### Offset
Optional lightness anchor for generating dynamic gradients. When provided, the gradient centers around this value; otherwise, a fixed descending ramp is used.