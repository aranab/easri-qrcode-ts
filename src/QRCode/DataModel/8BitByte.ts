import { IBitByte, IBitBuffer } from "../Model";
import { QRMode } from "../Utilities";

export default class _8BitByte implements IBitByte {
  #data: string;
  #parsedData: number[] = [];

  mode: number = QRMode.MODE_8BIT_BYTE;

  constructor(data: string) {
    this.#data = data;

    let dataArray = [];
    for (let i = 0; i < this.#data.length; i++) {
      let byteArray = [];
      let code = this.#data.charCodeAt(i);

      if (code > 0x10000) {
        byteArray[0] = 0xf0 | ((code & 0x1c0000) >>> 18);
        byteArray[1] = 0x80 | ((code & 0x3f000) >>> 12);
        byteArray[2] = 0x80 | ((code & 0xfc0) >>> 6);
        byteArray[3] = 0x80 | (code & 0x3f);
      } else if (code > 0x800) {
        byteArray[0] = 0xe0 | ((code & 0xf000) >>> 12);
        byteArray[1] = 0x80 | ((code & 0xfc0) >>> 6);
        byteArray[2] = 0x80 | (code & 0x3f);
      } else if (code > 0x80) {
        byteArray[0] = 0xc0 | ((code & 0x7c0) >>> 6);
        byteArray[1] = 0x80 | (code & 0x3f);
      } else {
        byteArray[0] = code;
      }

      dataArray.push(byteArray);
    }

    this.#parsedData = Array.prototype.concat.apply([], dataArray);

    if (this.#parsedData.length !== this.#data.length) {
      this.#parsedData.unshift(191);
      this.#parsedData.unshift(187);
      this.#parsedData.unshift(239);
    }
  }

  getLength(): number {
    return this.#parsedData.length;
  }

  write(buffer: IBitBuffer): void {
    for (let data of this.#parsedData) {
      buffer.put(data, 8);
    }
  }
}
