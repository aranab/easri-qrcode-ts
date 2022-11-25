import {
  OptionsType,
  InputOptionsType,
  IDataModel,
  IDrawing,
  ErrorCorrectLevelType,
} from "./Model";
import { QRDataModel } from "./DataModel";
import { Drawing } from "./Drawing";
import { getTypeNumber, QRErrorCorrectLevel } from "./Utilities";

export default class QRCode {
  #element: HTMLElement;
  #text: string;

  #options = <OptionsType>{};

  #qrDataModel: IDataModel;
  #drawing: IDrawing;

  constructor(
    el: HTMLElement | string,
    text: string,
    {
      width = 256,
      height = 256,
      colorDark = "#000000",
      colorLight = "#ffffff",
      useSvg = false,
    }: InputOptionsType
  ) {
    if (typeof el === "string") {
      let htmlElement = document.querySelector<HTMLElement>(el);
      if (htmlElement === null) {
        throw new Error(`(${el}): HTML element is not found.`);
      }
      this.#element = htmlElement;
    } else {
      this.#element = el;
    }

    if (typeof text !== "string" || /^\s*$/.test(text)) {
      throw new Error(`(${text}): Text must be string datatype.`);
    }

    this.#text = text;
    this.#options.width = width;
    this.#options.height = height;
    this.#options.colorDark = colorDark;
    this.#options.colorLight = colorLight;
    this.#options.useSvg = useSvg;
    this.#options.errorCorrectLevel = <ErrorCorrectLevelType>(
      QRErrorCorrectLevel.H
    );

    this.#qrDataModel = new QRDataModel(
      getTypeNumber(this.#text, this.#options.errorCorrectLevel),
      this.#options.errorCorrectLevel
    );

    this.#drawing = new Drawing(this.#element, this.#options).selectedTools();
    this.makeCode(this.#text);
  }

  makeCode(text: string): void {
    this.#qrDataModel.addData(text);
    this.#qrDataModel.make();
    this.#element.title = text;
    this.#drawing.draw(this.#qrDataModel);
  }

  clear(): void {
    this.#drawing.clear();
  }
}
