import { Options } from "./_types";

export class Heurific {
  static RANGE = 1;
  static SCALE = 1 + 1 / (1 + 1 / 2);

  static LEVELS = 9;
  static OFFSET = 3;
  static SATURATION = 100;

  static ANGLE = 360;
  static SHIFT = 0;

  static testColorValue(value?: any) {
    return (
      value != null &&
      !isNaN(parseInt(typeof value === "string" ? value : String(value)))
    );
  }

  static useAutoSaturate(value?: number) {
    return value === 0 || (value && Heurific.testColorValue(value))
      ? value
      : Heurific.SATURATION;
  }

  static useContext(value?: number, levels?: number) {
    const l = levels ?? Heurific.LEVELS;

    return this.testColorValue(value) && value <= l
      ? value || 0
      : l - Math.round(l / Heurific.SCALE);
  }

  static useHueShift(value?: number, levels?: number, angle?: number) {
    const delta = (angle ?? Heurific.ANGLE) / (levels || Heurific.LEVELS);
    const shift = (Heurific.testColorValue(value) && value) || Heurific.SHIFT;

    return shift && shift < delta ? shift : Heurific.OFFSET;
  }

  static useOffset(value?: number) {
    return value === 0 || (value && Heurific.testColorValue(value))
      ? value
      : Heurific.OFFSET;
  }

  static useLevels(value?: number) {
    return value === 0 || (value && Heurific.testColorValue(value))
      ? value
      : Heurific.LEVELS;
  }

  static useLightness(value?: number) {
    return Heurific.testColorValue(value) ? (value ?? undefined) : undefined;
  }

  static useSaturation(value?: number, base?: number) {
    const saturation = base ?? Heurific.SATURATION;

    return Heurific.testColorValue(value) && value < (base ?? saturation)
      ? (value ?? saturation)
      : saturation;
  }

  static useSaturationIndex(value?: number) {
    return Math.round((levels || 1) / (value || 1) / Heurific.SCALE);
  }

  static from(value?: number) {
    if (value == null) {
      return 0;
    }

    return value < 0 ? Heurific.from(Heurific.ANGLE + value) : value;
  }

  static to(value?: number): number {
    if (value == null) {
      return 0;
    }

    return value > Heurific.ANGLE ? this.to(value - Heurific.ANGLE) : value;
  }

  constructor(options?: Options) {}
}
