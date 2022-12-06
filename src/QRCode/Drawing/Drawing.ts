import { IDrawing, OptionsType } from "../Model";
import CanvasDrawing from "./CanvasDrawing";
import SvgDrawing from "./SvgDrawing";
import TableDrawing from "./TableDrawing";
import { isSupportCanvas } from "../Utilities";

export default class Drawing {
  #element: HTMLElement;
  #options = <OptionsType>{};

  constructor(el: HTMLElement, options: OptionsType) {
    this.#element = el;
    this.#options = options;
  }

  selectedTools(): IDrawing {
    let drawingTools;

    if (this.#options.useSvg) {
      drawingTools = SvgDrawing;
    } else {
      drawingTools = isSupportCanvas() ? CanvasDrawing : TableDrawing;
    }

    return new drawingTools(this.#element, {
      width: this.#options.width,
      height: this.#options.height,
      colorDark: this.#options.colorDark,
      colorLight: this.#options.colorLight,
    });
  }
}
