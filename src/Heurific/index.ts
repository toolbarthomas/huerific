export type Hue = number;
export type Saturation = number;
export type Lightness = number;

export type Levels = number;
export type Context = number;
export type Offset = number;
export type Gradient = number[];
export type Swatch = [Hue, Saturation, Lightness];

export type HuerificOptions = {
  context?: Context;
  levels?: Levels;
  offset?: Offset;
  plugins?: {
    autoSaturate?: Saturation;
    hueShift?: Hue;
  };
};

/**
 * Huerific is a color utility that generate color swatches with the defined hue
 * value.
 */
export class Huerific {
  // Use the defined Saturation adjustment for the first and last Swatch.
  autoSaturate: Saturation;

  // The default saturation value to decrement from.
  baseSaturation: Saturation;

  // Defines the base color from the context index value.
  context: Context;

  // Increment with the defined Hue value for each Swatch.
  hueShift: Hue;

  // The amount of Swatches to generate.
  levels: Levels;

  // The minimum offset to use for the start and end value for each
  // color value.
  offset: Offset;

  // Defines the default multiplier for the Swatch generation.
  ratio: number;

  constructor(options?: HuerificOptions) {
    const { context, levels, offset, plugins } = options || {};
    const { autoSaturate, hueShift } = plugins || {};

    this.ratio = 1 + 1 / (1 + 1 / 2);
    this.levels = this._useLevels(levels);
    this.context = this._useContext(context);
    this.offset = this._useOffset(offset);

    this.autoSaturate = this._useAutoSaturate(autoSaturate);
    this.hueShift = this._useHueShift(hueShift);
    this.baseSaturation = 100;
  }

  // Use the autoSaturate value to adjust the first and last Gradient Swatch.
  _useAutoSaturate(value?: any): Saturation {
    return this._isColorValue(value)
      ? (value as Saturation)
      : this.baseSaturation;
  }

  // Use the defined parameter as context value
  _useContext(value?: any): Context {
    return this._isColorValue(value) && (value as number) <= this.levels
      ? value
      : this.levels - Math.round(this.levels / this.ratio);
  }

  // Use the defined parameter as Hue value
  _useHue(hue?: number, multiplier?: number): Hue {
    const h = this._isColorValue(hue) ? (hue as number) : 0;
    let xHue = h;

    if (multiplier && !isNaN(multiplier)) {
      xHue = h - this.hueShift * multiplier;
    }

    xHue = xHue < 0 ? this._start(xHue) : this._end(xHue);

    return xHue;
  }

  // Use the defined parameter as Hue value
  _useHueShift(value?: number): Hue {
    const maxDelta = 360 / this.levels;
    const v = this._isColorValue(value) ? (value as number) : 0;

    return v && v < maxDelta ? v : 3;
  }

  // Use the defined parameter as Gradient step.
  _useLevels(value?: any): Levels {
    return this._isColorValue(value) ? value : 9;
  }

  // Use the defined parameter as Lightness value.
  _useLightness(value?: any): Lightness | undefined {
    return this._isColorValue(value) ? (value as Lightness) : undefined;
  }

  // Use the defined parameter as offset value.
  _useOffset(value?: any): Offset {
    return this._isColorValue(value) ? (value as Offset) : 3;
  }

  // Use the defined parameter as Saturation value.
  _useSaturation(value?: any): Saturation {
    return this._isColorValue(value) && (value as number) <= this.baseSaturation
      ? value
      : this.baseSaturation;
  }

  // Use the base swatch index where the AutoSaturate will start from.
  _useSaturationIndex(): number {
    return Math.round((this.levels || 1) / (this.context || 1) / this.ratio);
  }

  // Check if the defined parameter is a valid color value.
  _isColorValue(value?: any): boolean {
    return value != null && !isNaN(parseInt(value));
  }

  // Ensures the defined value is within the Color value range.
  _end(value: number): number {
    return value > 360 ? this._end(value - 360) : value;
  }

  // Ensures the defined value is within the Color value range.
  _start(value: number): number {
    return value < 0 ? this._start(360 + value) : value;
  }

  // Generates a palette with color swatches in Hue values.
  generate(hue: Hue, saturation?: Saturation, lightness?: Lightness): Swatch[] {
    const gradient =
      this._useLightness(lightness) !== undefined
        ? this.generateDynamicGradient(lightness)
        : this.generateFixedGradient();

    const swatches = gradient.map((l, index: number) => {
      let i = index + 1;

      // Use the multiplier value if the HueShift plugin is enabled.
      const multiplier = this.hueShift ? this.context - i : 0;
      const h: Hue = Math.floor(
        this._useHue(hue, this.hueShift ? multiplier : 0)
      );

      let s = this._useSaturation(saturation);

      // Implements Auto Saturation
      if (this.autoSaturate && i <= this._useSaturationIndex()) {
        s = this._useSaturation(s + this.autoSaturate);
      } else if (
        this.autoSaturate &&
        this.levels - i < this._useSaturationIndex()
      ) {
        s = this._useSaturation(s - this.autoSaturate);
      }

      return [h, s, l] as Swatch;
    });

    return swatches;
  }

  // Generates a dynamic gradient with the defined lightness value.
  generateDynamicGradient(lightness?: Lightness): Gradient {
    let index: number = 0;

    const l = this._useLightness(lightness) || 0;

    // Use the delta value to increment each step.
    const delta = (l - this.offset) / (this.levels - this.context);

    // Use the edge to define the direction of increase or decrease of lightness.
    const edge = (100 - l - this.offset) / (this.context - 1);

    const gradient: Gradient = Array.from({
      length: this.levels,
    })
      .map(() => {
        index += 1;

        if (index < this.context) {
          if (delta > edge) {
            return l + edge * (this.context - index);
          } else {
            return l + delta * (this.context - index);
          }
        } else if (index === this.context) {
          return l;
        } else {
          return l - delta * (index - this.context);
        }
      })
      .map((v: number) => Math.round(v));

    return gradient;
  }

  // Generates a fixed gradient from min to max.
  generateFixedGradient(): Gradient {
    const delta = (100 - this.offset) / (this.levels - 1);
    let index = 0;

    const gradient: Gradient = Array.from({ length: this.levels })
      .map(() => {
        const shade = delta * index ? delta * index : this.offset;

        index += 1;

        return Math.round(shade);
      })
      .reverse();

    return gradient;
  }
}
