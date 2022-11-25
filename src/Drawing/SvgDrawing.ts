import { DrawingOptionsType, IDrawing, IDataModel } from "../Model";

export default class SvgDrawing implements IDrawing {
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

  #makeSVG(
    tag: string,
    attributesObj: { readonly [index: string]: string }
  ): SVGElement {
    let el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (let property in attributesObj) {
      if (attributesObj.hasOwnProperty(property)) {
        el.setAttribute(property, attributesObj[property]);
      }
    }
    return el;
  }

  draw(model: IDataModel): void {
    let count = model.getModuleCount();
    let width = Math.floor(this.#width / count);
    let height = Math.floor(this.#height / count);

    this.clear();

    let svg = this.#makeSVG("svg", {
      viewBox: `0 0 ${count} ${count}`,
      width: `${width}`,
      height: `${height}`,
      fill: this.#colorLight,
    });

    svg.setAttributeNS(
      "http://www.w3.org/2000/xmlns/",
      "xmlns:xlink",
      "http://www.w3.org/1999/xlink"
    );

    this.#element.appendChild(svg);

    svg.appendChild(
      this.#makeSVG("rect", {
        fill: this.#colorLight,
        width: "100%",
        height: "100%",
      })
    );

    svg.appendChild(
      this.#makeSVG("rect", {
        fill: this.#colorDark,
        width: "1",
        height: "1",
        id: "template",
      })
    );

    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (model.isDark(row, col)) {
          let child = this.#makeSVG("use", {
            x: `${col}`,
            y: `${row}`,
          });
          child.setAttributeNS(
            "http://www.w3.org/1999/xlink",
            "href",
            "#template"
          );
          svg.appendChild(child);
        }
      }
    }
  }

  clear(): void {
    while (this.#element.hasChildNodes()) {
      let lastChild = this.#element.lastChild;
      if (lastChild !== null) {
        this.#element.removeChild(lastChild);
      }
    }
  }
}
