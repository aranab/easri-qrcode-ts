import {
  OptionsType,
  InputOptionsType,
  IDataModel,
  IDrawing,
  ErrorCorrectLevelType,
} from "./Model";
import { QRDataModel } from "./DataModel";
import { Drawing } from "./Drawing";
import {
  getTypeNumber,
  isInvalidString,
  isOnlySpaces,
  QRErrorCorrectLevel,
} from "./Utilities";

export default class QRCode {
  #element: HTMLElement;
  #text: string;

  #options = <OptionsType>{};

  #qrDataModel: IDataModel;
  #drawing: IDrawing;

  constructor(
    element: HTMLElement | string,
    text: string,
    {
      width = 256,
      height = 256,
      colorDark = "#000000",
      colorLight = "#ffffff",
      useSvg = false,
    }: InputOptionsType
  ) {
    if (typeof element === "string") {
      try {
        let htmlElement = isOnlySpaces(element)
          ? null
          : document.querySelector<HTMLElement>(element);
        if (htmlElement === null) {
          throw new Error(`(${element}): HTML element is not found.`);
        }
        this.#element = htmlElement;
      } catch (error) {
        throw error;
      }
    } else {
      this.#element = element;
    }

    if (isInvalidString(text)) {
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
