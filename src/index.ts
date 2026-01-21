import { Options, Palette } from "./_types";

/**
 * Huerific
 *
 * A utility for generating HSL color palettes based on hue,
 * saturation, and calculated lightness gradients.
 *
 * The generator supports:
 * - Fixed or dynamic lightness gradients
 * - Context-aware hue shifting
 * - Automatic saturation adjustment
 *
 * Output palettes are arrays of `[hue, saturation, lightness]`.
 */
export class Huerific {
  static RANGE = 1;
  static SCALE = 1 + 1 / (1 + 1 / 2);

  static LEVELS = 9;
  static OFFSET = 3;
  static SATURATION = 100;

  static LIMIT = 100;
  static ANGLE = 360;
  static SHIFT = 0;
  static STEP = Math.PI;

  /**
   * Checks whether a value can be interpreted as a numeric color value.
   */
  static testColorValue(value?: any) {
    return (
      value != null &&
      !isNaN(parseInt(typeof value === "string" ? value : String(value)))
    );
  }

  /**
   * Resolves auto-saturation behavior.
   * Returns the provided value if valid, otherwise a default step.
   */
  static useAutoSaturate(value?: number) {
    return value === 0 || (value && Huerific.testColorValue(value))
      ? value
      : Huerific.STEP;
  }

  /**
   * Resolves the context index within the available levels.
   */
  static useContext(value?: number, levels?: number) {
    const l = levels ?? Huerific.LEVELS;

    return this.testColorValue(value) && value !== undefined && value <= l
      ? value || 0
      : l - Math.round(l / Huerific.SCALE);
  }

  /**
   * Computes a hue value with optional shifting and wrapping.
   */
  static useHue(hue?: number, multiplier?: number, shift?: number) {
    const h = Huerific.testColorValue(hue) && hue ? hue : 0;
    let clamp = h;

    if (multiplier && !isNaN(multiplier)) {
      clamp = h - (shift ?? Huerific.OFFSET) * multiplier;
    }

    clamp = clamp < 0 ? this.from(clamp) : this.to(clamp);

    return clamp;
  }

  /**
   * Determines the hue shift step based on palette levels and angle.
   */
  static useHueShift(value?: number, levels?: number, angle?: number) {
    const delta = (angle ?? Huerific.ANGLE) / (levels || Huerific.LEVELS);
    const shift = (Huerific.testColorValue(value) && value) || Huerific.SHIFT;

    return shift && shift < delta ? shift : Huerific.OFFSET;
  }

  /**
   * Resolves the lightness offset.
   */
  static useOffset(value?: number) {
    return value === 0 || (value && Huerific.testColorValue(value))
      ? value
      : Huerific.OFFSET;
  }

  /**
   * Resolves the number of palette levels.
   */
  static useLevels(value?: number) {
    return value === 0 || (value && Huerific.testColorValue(value))
      ? value
      : Huerific.LEVELS;
  }

  /**
   * Resolves a valid lightness value or returns undefined.
   */
  static useLightness(value?: number) {
    return Huerific.testColorValue(value) ? (value ?? undefined) : undefined;
  }

  /**
   * Resolves saturation, clamping it to a base value.
   */
  static useSaturation(value?: number, base?: number) {
    const saturation = base ?? Huerific.SATURATION;

    return Huerific.testColorValue(value) &&
      value !== undefined &&
      value < (base ?? saturation)
      ? (value ?? saturation)
      : saturation;
  }

  /**
   * Calculates the saturation adjustment index based on scale.
   */
  static useSaturationIndex(levels?: number, context?: number) {
    return Math.round((levels || 1) / (context || 1) / Huerific.SCALE);
  }

  /**
   * Wraps a hue value from negative space into the valid angle range.
   */
  static from(value?: number): number {
    if (value == null) {
      return 0;
    }

    return value < 0 ? Huerific.from(Huerific.ANGLE + value) : value;
  }

  /**
   * Wraps a hue value exceeding the angle limit back into range.
   */
  static to(value?: number): number {
    if (value == null) {
      return 0;
    }

    return value > Huerific.ANGLE ? this.to(value - Huerific.ANGLE) : value;
  }

  // Total number of palette levels
  levels: number;

  // Context position within the palette
  context: number;

  // Lightness offset
  offset: number;

  // Auto-saturation adjustment amount
  autoSaturate: number;

  // Hue shift step size
  hueShift: number;

  constructor(options?: Options) {
    this.levels = Huerific.useLevels(options?.levels);
    this.context = Huerific.useContext(options?.context);
    this.offset = Huerific.useOffset(options?.offset);
    this.autoSaturate = Huerific.useAutoSaturate(options?.autoSaturate);
    this.hueShift = Huerific.useHueShift(options?.hueShift);
  }

  /**
   * Generates an HSL palette.
   *
   * @param hue Base hue value
   * @param saturation Base saturation value
   * @param lightness Optional fixed lightness anchor
   */
  generate(hue: number, saturation: number, lightness?: number) {
    const gradient = Huerific.useLightness(lightness)
      ? this.generateDynamicGradient(lightness)
      : this.generateFixedGradient();

    const palette = Array.from<Palette>({ length: gradient.length });

    for (let i = 0; i < palette.length; i++) {
      const index = i + 1;

      const multiplier = this.hueShift ? this.context - index : 0;
      const h = Math.floor(
        Huerific.useHue(hue, this.hueShift ? multiplier : 0, this.hueShift),
      );

      let s = Huerific.useSaturation(saturation);

      if (this.autoSaturate && index <= Huerific.useSaturationIndex()) {
        s = Huerific.useSaturation(s + this.autoSaturate);
      } else if (
        this.autoSaturate &&
        this.levels - index < Huerific.useAutoSaturate(this.autoSaturate)
      ) {
        s = Huerific.useSaturation(s - this.autoSaturate);
      }

      palette[i] = [h, s, gradient[i]];
    }

    return palette;
  }

  /**
   * Generates a dynamic lightness gradient centered on a given value.
   */
  generateDynamicGradient(lightness?: number) {
    const l = Huerific.useLightness(lightness) || 0;

    const delta = (l - this.offset) / (this.levels - this.context);
    const edge =
      (Huerific.LIMIT - l - this.offset) / (this.context - Huerific.RANGE);
    const gradient = Array.from<number>({ length: this.levels });

    for (let i = 0; i < gradient.length; i++) {
      const index = i + 1;
      if (index < this.context) {
        if (delta > edge) {
          gradient[i] = l + edge * (this.context - index);

          continue;
        }

        gradient[i] = l + delta * (this.context - index);

        continue;
      } else if (index === this.context) {
        gradient[i] = l;

        continue;
      }

      gradient[i] = l - delta * (index - this.context);
    }

    return gradient;
  }

  /**
   * Generates a fixed descending lightness gradient.
   */
  generateFixedGradient() {
    const delta =
      (Huerific.LIMIT - this.offset) / (this.levels - Huerific.RANGE);

    let index = 0;

    const gradient = Array.from<number>({ length: this.levels });

    for (let index = gradient.length - 1; index >= 0; index--) {
      const shade = delta * index ? delta * index : this.offset;
      gradient[index] = Math.round(shade);
    }

    return gradient;
  }
}
