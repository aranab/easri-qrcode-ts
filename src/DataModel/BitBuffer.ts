import { IBitBuffer } from "../Model";

export default class BitBuffer implements IBitBuffer {
  #length = 0;
  buffer: number[] = [];

  constructor() {}

  get(index: number): boolean {
    let bufferIndex = Math.floor(index / 8);
    return ((this.buffer[bufferIndex] >>> (7 - (index % 8))) & 1) === 1;
  }

  put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  getLengthInBits(): number {
    return this.#length;
  }

  putBit(bit: boolean): void {
    let bufferIndex = Math.floor(this.#length / 8);

    if (this.buffer.length <= bufferIndex) {
      this.buffer.push(0);
    }

    if (bit) {
      this.buffer[bufferIndex] |= 0x80 >>> this.#length % 8;
    }

    this.#length++;
  }
}
