import { IPolynomial } from "../Model";
import logger from "./Logger";

export default class Polynomial implements IPolynomial {
  numbers: number[] = [];

  constructor(numbers: number[], shift: number) {
    if (numbers.length === undefined) {
      throw new Error(`${numbers.length}/${shift}`);
    }

    let offset = 0;
    while (offset < numbers.length && numbers[offset] === 0) {
      offset++;
    }

    this.numbers = new Array(numbers.length - offset + shift);

    for (let i = 0; i < numbers.length - offset; i++) {
      this.numbers[i] = numbers[i + offset];
    }
  }

  get getLength(): number {
    return this.numbers.length;
  }

  get(index: number): number {
    return this.numbers[index];
  }

  multiply(instance: IPolynomial): IPolynomial {
    let num: number[] = new Array(this.getLength + instance.getLength - 1);

    for (let i = 0; i < this.getLength; i++) {
      for (let j = 0; j < instance.getLength; j++) {
        num[i + j] ^= logger.gexp(
          logger.glog(this.get(i)) + logger.glog(instance.get(j))
        );
      }
    }

    return new Polynomial(num, 0);
  }

  mod(instance: IPolynomial): IPolynomial {
    if (this.getLength - instance.getLength < 0) {
      return this;
    }

    let ratio = logger.glog(this.get(0)) - logger.glog(instance.get(0));
    let num: number[] = new Array(this.getLength);

    for (let i = 0; i < this.getLength; i++) {
      num[i] = this.get(i);
    }

    for (let i = 0; i < instance.getLength; i++) {
      num[i] ^= logger.gexp(logger.glog(instance.get(i)) + ratio);
    }

    return new Polynomial(num, 0).mod(instance);
  }
}
