export type InputOptionsType = {
  width?: number;
  height?: number;
  colorDark?: string;
  colorLight?: string;
  useSvg?: boolean;
};

export type OptionsType = {
  width: number;
  height: number;
  typeNumber: number;
  colorDark: string;
  colorLight: string;
  useSvg: boolean;
  errorCorrectLevel: ErrorCorrectLevelType;
};

export type DrawingOptionsType = {
  width: number;
  height: number;
  colorDark: string;
  colorLight: string;
};

export type QRModeType = {
  MODE_NUMBER: number;
  MODE_ALPHA_NUM: number;
  MODE_8BIT_BYTE: number;
  MODE_KANJI: number;
};

export type ErrorCorrectLevelType = 0 | 1 | 2 | 3;

export type QRErrorCorrectLevelType = {
  L: Number;
  M: number;
  Q: number;
  H: number;
};

export type MaskPatternType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type QRMaskPatternType = {
  PATTERN000: number;
  PATTERN001: number;
  PATTERN010: number;
  PATTERN011: number;
  PATTERN100: number;
  PATTERN101: number;
  PATTERN110: number;
  PATTERN111: number;
};

export type QRCodeLimitLengthType = number[][];

export interface IBitBuffer {
  buffer: number[];
  get(index: number): boolean;
  put(num: number, length: number): void;
  getLengthInBits(): number;
  putBit(bit: boolean): void;
}

export interface IBitByte {
  mode: number;
  getLength(): number;
  write(buffer: IBitBuffer): void;
}

export interface IPolynomial {
  numbers: number[];
  getLength: number;
  get(index: number): number;
  multiply(instance: IPolynomial): IPolynomial;
  mod(instance: IPolynomial): IPolynomial;
}

export interface IDataModel {
  addData(data: string): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
  make(): void;
}

export interface IDrawing {
  draw(model: IDataModel): void;
  clear(): void;
}
