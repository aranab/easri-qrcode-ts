let instance: Logger;

class Logger {
  #EXP_TABLE: number[] = new Array(256);
  #LOG_TABLE: number[] = new Array(256);

  #init() {
    for (let i = 0; i < 8; i++) {
      this.#EXP_TABLE[i] = 1 << i;
    }

    for (let i = 8; i < 256; i++) {
      this.#EXP_TABLE[i] =
        this.#EXP_TABLE[i - 4] ^
        this.#EXP_TABLE[i - 5] ^
        this.#EXP_TABLE[i - 6] ^
        this.#EXP_TABLE[i - 8];
    }

    for (let i = 0; i < 255; i++) {
      this.#LOG_TABLE[this.#EXP_TABLE[i]] = i;
    }
  }

  constructor() {
    if (!instance) {
      this.#init();
      instance = this;
    }
    return instance;
  }

  glog(num: number): number {
    if (num < 1) {
      throw new Error(`glog(${num})`);
    }
    return this.#LOG_TABLE[num];
  }

  gexp(num: number): number {
    while (num < 0) {
      num += 255;
    }

    while (num >= 256) {
      num -= 255;
    }
    return this.#EXP_TABLE[num];
  }
}

const logger = Object.freeze(new Logger());
export default logger;
