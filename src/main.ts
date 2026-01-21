import { Options, Palette } from "./_types";

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

  static testColorValue(value?: any) {
    return (
      value != null &&
      !isNaN(parseInt(typeof value === "string" ? value : String(value)))
    );
  }

  static useAutoSaturate(value?: number) {
    return value === 0 || (value && Huerific.testColorValue(value))
      ? value
      : Huerific.STEP;
  }

  static useContext(value?: number, levels?: number) {
    const l = levels ?? Huerific.LEVELS;

    return this.testColorValue(value) && value !== undefined && value <= l
      ? value || 0
      : l - Math.round(l / Huerific.SCALE);
  }

  static useHue(hue?: number, multiplier?: number, shift?: number) {
    const h = Huerific.testColorValue(hue) && hue ? hue : 0;
    let clamp = h;

    if (multiplier && !isNaN(multiplier)) {
      clamp = h - (shift ?? Huerific.OFFSET) * multiplier;
    }

    clamp = clamp < 0 ? this.from(clamp) : this.to(clamp);

    return clamp;
  }

  static useHueShift(value?: number, levels?: number, angle?: number) {
    const delta = (angle ?? Huerific.ANGLE) / (levels || Huerific.LEVELS);
    const shift = (Huerific.testColorValue(value) && value) || Huerific.SHIFT;

    return shift && shift < delta ? shift : Huerific.OFFSET;
  }

  static useOffset(value?: number) {
    return value === 0 || (value && Huerific.testColorValue(value))
      ? value
      : Huerific.OFFSET;
  }

  static useLevels(value?: number) {
    return value === 0 || (value && Huerific.testColorValue(value))
      ? value
      : Huerific.LEVELS;
  }

  static useLightness(value?: number) {
    return Huerific.testColorValue(value) ? (value ?? undefined) : undefined;
  }

  static useSaturation(value?: number, base?: number) {
    const saturation = base ?? Huerific.SATURATION;

    return Huerific.testColorValue(value) &&
      value !== undefined &&
      value < (base ?? saturation)
      ? (value ?? saturation)
      : saturation;
  }

  static useSaturationIndex(levels?: number, context?: number) {
    return Math.round((levels || 1) / (context || 1) / Huerific.SCALE);
  }

  static from(value?: number): number {
    if (value == null) {
      return 0;
    }

    return value < 0 ? Huerific.from(Huerific.ANGLE + value) : value;
  }

  static to(value?: number): number {
    if (value == null) {
      return 0;
    }

    return value > Huerific.ANGLE ? this.to(value - Huerific.ANGLE) : value;
  }

  levels: number;
  context: number;
  offset: number;
  autoSaturate: number;
  hueShift: number;

  constructor(options?: Options) {
    this.levels = Huerific.useLevels(options?.levels);
    this.context = Huerific.useContext(options?.context);
    this.offset = Huerific.useOffset(options?.offset);
    this.autoSaturate = Huerific.useAutoSaturate(options?.autoSaturate);
    this.hueShift = Huerific.useHueShift(options?.hueShift);
  }

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
