import {
  ErrorCorrectLevelType,
  IBitBuffer,
  IBitByte,
  IDataModel,
  MaskPatternType,
} from "../Model";
import _8bitByte from "./8BitByte";
import BitBuffer from "./BitBuffer";
import Polynomial from "./Polynomial";
import RSBlock from "./RSBlock";
import util from "./Util";

export default class QRDataModel implements IDataModel {
  #typeNumber: number;
  #errorCorrectLevel: ErrorCorrectLevelType;
  #modules: boolean[][] | null[][] = [];
  #moduleCount: number = 0;
  #dataCache: number[] | null = null;
  #dataList: IBitByte[] = [];

  static PAD0 = 0xec;
  static PAD1 = 0x11;

  static createData(
    typeNumber: number,
    errorCorrectLevel: ErrorCorrectLevelType,
    dataList: IBitByte[]
  ): number[] {
    let rsBlocks = RSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
    let buffer = new BitBuffer();

    for (let i = 0; i < dataList.length; i++) {
      let data = dataList[i];
      buffer.put(data.mode, 4);
      buffer.put(data.getLength(), util.getLengthInBits(data.mode, typeNumber));
      data.write(buffer);
    }

    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }

    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error(
        `code length overflow. (${buffer.getLengthInBits()}>${
          totalDataCount * 8
        })`
      );
    }

    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }

    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }

    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(QRDataModel.PAD0, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(QRDataModel.PAD1, 8);
    }

    return QRDataModel.createBytes(buffer, rsBlocks);
  }

  static createBytes(buffer: IBitBuffer, rsBlocks: RSBlock[]): number[] {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    let dcdata = new Array(rsBlocks.length);
    let ecdata = new Array(rsBlocks.length);

    for (let r = 0; r < rsBlocks.length; r++) {
      let dcCount = rsBlocks[r].dataCount;
      let ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);

      for (let i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }

      offset += dcCount;
      let rsPoly = util.getErrorCorrectPolynomial(
        <ErrorCorrectLevelType>ecCount
      );
      let rawPoly = new Polynomial(dcdata[r], rsPoly.getLength - 1);
      let modPoly = rawPoly.mod(rsPoly);

      ecdata[r] = new Array(rsPoly.getLength - 1);

      for (let i = 0; i < ecdata[r].length; i++) {
        let modIndex = i + modPoly.getLength - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }
    }

    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalCodeCount += rsBlocks[i].totalCount;
    }

    let data = new Array(totalCodeCount);
    let index = 0;
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data[index++] = dcdata[r][i];
        }
      }
    }

    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data[index++] = ecdata[r][i];
        }
      }
    }
    return data;
  }

  constructor(typeNumber: number, errorCorrectLevel: ErrorCorrectLevelType) {
    this.#typeNumber = typeNumber;
    this.#errorCorrectLevel = errorCorrectLevel;
  }

  #setupPositionProbePattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.#moduleCount <= row + r) {
        continue;
      }
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.#moduleCount <= col + c) {
          continue;
        }
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.#modules[row + r][col + c] = true;
        } else {
          this.#modules[row + r][col + c] = false;
        }
      }
    }
  }

  #getBestMaskPattern(): MaskPatternType {
    let minLostPoint = 0;
    let pattern: MaskPatternType = 0;
    for (let i = 0; i < 8; i++) {
      this.#makeImpl(true, <MaskPatternType>i);
      let lostPoint = util.getLostPoint(this);
      if (i === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = <MaskPatternType>i;
      }
    }
    return pattern;
  }

  #setupTimingPattern(): void {
    for (let r = 8; r < this.#moduleCount - 8; r++) {
      if (this.#modules[r][6] !== null) {
        continue;
      }
      this.#modules[r][6] = r % 2 === 0;
    }

    for (let c = 8; c < this.#moduleCount - 8; c++) {
      if (this.#modules[6][c] !== null) {
        continue;
      }
      this.#modules[6][c] = c % 2 === 0;
    }
  }

  #setupPositionAdjustPattern(): void {
    let pos = util.getPatternPosition(this.#typeNumber);
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        let row = pos[i];
        let col = pos[j];
        if (this.#modules[row][col] !== null) {
          continue;
        }
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
              this.#modules[row + r][col + c] = true;
            } else {
              this.#modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  #setupTypeNumber(test: boolean): void {
    let bits = util.getBCHTypeNumber(this.#typeNumber);
    for (let i = 0; i < 18; i++) {
      let mod = !test && ((bits >> i) & 1) === 1;
      this.#modules[Math.floor(i / 3)][(i % 3) + this.#moduleCount - 8 - 3] =
        mod;
    }
    for (let i = 0; i < 18; i++) {
      let mod = !test && ((bits >> i) & 1) === 1;
      this.#modules[(i % 3) + this.#moduleCount - 8 - 3][Math.floor(i / 3)] =
        mod;
    }
  }

  #setupTypeInfo(test: boolean, maskPattern: MaskPatternType): void {
    let data = (this.#errorCorrectLevel << 3) | maskPattern;
    let bits = util.getBCHTypeInfo(data);
    for (let i = 0; i < 15; i++) {
      let mod = !test && ((bits >> i) & 1) === 1;
      if (i < 6) {
        this.#modules[i][8] = mod;
      } else if (i < 8) {
        this.#modules[i + 1][8] = mod;
      } else {
        this.#modules[this.#moduleCount - 15 + i][8] = mod;
      }
    }
    for (let i = 0; i < 15; i++) {
      let mod = !test && ((bits >> i) & 1) === 1;
      if (i < 8) {
        this.#modules[8][this.#moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.#modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.#modules[8][15 - i - 1] = mod;
      }
    }
    this.#modules[this.#moduleCount - 8][8] = !test;
  }

  #mapData(data: number[], maskPattern: MaskPatternType): void {
    let inc = -1;
    let row = this.#moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    for (let col = this.#moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.#modules[row][col - c] === null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }
            let mask = util.getMask(maskPattern, row, col - c);
            if (mask) {
              dark = !dark;
            }
            this.#modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.#moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  #makeImpl(test: boolean, maskPattern: MaskPatternType): void {
    this.#moduleCount = this.#typeNumber * 4 + 17;
    this.#modules = new Array(this.#moduleCount);

    for (let row = 0; row < this.#moduleCount; row++) {
      this.#modules[row] = new Array(this.#moduleCount);
      for (let col = 0; col < this.#moduleCount; col++) {
        this.#modules[row][col] = null;
      }
    }

    this.#setupPositionProbePattern(0, 0);
    this.#setupPositionProbePattern(this.#moduleCount - 7, 0);
    this.#setupPositionProbePattern(0, this.#moduleCount - 7);
    this.#setupPositionAdjustPattern();
    this.#setupTimingPattern();
    this.#setupTypeInfo(test, maskPattern);

    if (this.#typeNumber >= 7) {
      this.#setupTypeNumber(test);
    }

    if (this.#dataCache === null) {
      this.#dataCache = QRDataModel.createData(
        this.#typeNumber,
        this.#errorCorrectLevel,
        this.#dataList
      );
    }

    this.#mapData(this.#dataCache, maskPattern);
  }

  addData(data: string): void {
    let newData = new _8bitByte(data);
    this.#dataList.push(newData);
    this.#dataCache = null;
  }

  getModuleCount(): number {
    return this.#moduleCount;
  }

  isDark(row: number, col: number): boolean {
    if (
      row < 0 ||
      this.#moduleCount <= row ||
      col < 0 ||
      this.#moduleCount <= col
    ) {
      throw new Error(`${row}, ${col}`);
    }

    return this.#modules[row][col] ?? false;
  }

  make(): void {
    this.#makeImpl(false, this.#getBestMaskPattern());
  }
}
