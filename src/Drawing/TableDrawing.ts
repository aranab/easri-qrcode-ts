import { IDrawing, IDataModel, DrawingOptionsType } from "../Model";

export default class TableDrawing implements IDrawing {
  #element: HTMLElement;
  #width: number;
  #height: number;
  #colorDark: string;
  #colorLight: string;

  constructor(
    el: HTMLElement,
    { width, height, colorDark, colorLight }: DrawingOptionsType
  ) {
    this.#element = el;
    this.#width = width;
    this.#height = height;
    this.#colorDark = colorDark;
    this.#colorLight = colorLight;
  }

  draw(model: IDataModel): void {
    let count = model.getModuleCount();
    let width = Math.floor(this.#width / count);
    let height = Math.floor(this.#height / count);
    let html = ['<table style="border:0;border-collapse:collapse;"'];

    for (let row = 0; row < count; row++) {
      html.push("<tr>");
      for (let col = 0; col < count; col++) {
        html.push(
          `<td style="
            border:0;
            border-collapse:collapse;
            padding:0;
            margin:0;
            width:${width}px;
            height:${height}px;
            background-color:${
              model.isDark(row, col) ? this.#colorDark : this.#colorLight
            };">
          <td>`
        );
      }
      html.push("</tr>");
    }
    html.push("</table>");
    this.#element.innerHTML = html.join("");

    let elTable = this.#element.childNodes[0] as HTMLElement;
    let leftMarginTable = (this.#width - elTable.offsetWidth) / 2;
    let topMarginTable = (this.#height - elTable.offsetHeight) / 2;

    if (leftMarginTable > 0 && topMarginTable > 0) {
      elTable.style.margin = `${topMarginTable}px ${leftMarginTable}`;
    }
  }

  clear(): void {
    this.#element.innerHTML = "";
  }
}
