import { DrawingOptionsType, IDrawing, IDataModel } from "../Model";

export default class CanvasDrawing implements IDrawing {
  #element: HTMLElement;
  #width: number;
  #height: number;
  #colorDark: string;
  #colorLight: string;

  #canvasEl: HTMLCanvasElement;
  #canvasContext: CanvasRenderingContext2D;
  #imageEl: HTMLImageElement;

  constructor(
    el: HTMLElement,
    { width, height, colorDark, colorLight }: DrawingOptionsType
  ) {
    this.#element = el;
    this.#width = width;
    this.#height = height;
    this.#colorDark = colorDark;
    this.#colorLight = colorLight;

    // Initialize canvas element
    this.#canvasEl = document.createElement("canvas");
    this.#canvasEl.width = this.#width;
    this.#canvasEl.height = this.#height;
    this.#canvasContext = <CanvasRenderingContext2D>(
      this.#canvasEl.getContext("2d")
    );
    this.#element.appendChild(this.#canvasEl);

    // Initialize image element
    this.#imageEl = document.createElement("img");
    this.#imageEl.alt = "Scan me!";
    this.#imageEl.style.display = "none";
    this.#element.appendChild(this.#imageEl);
  }

  draw(model: IDataModel): void {
    let count = model.getModuleCount();
    let width = this.#width / count;
    let height = this.#height / count;
    let roundedWidth = Math.round(width);
    let roundedHeight = Math.round(height);

    this.#imageEl.style.display = "none";
    this.clear();

    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        let isDark = model.isDark(row, col);
        let left = col * width;
        let top = row * height;
        this.#canvasContext.strokeStyle = isDark
          ? this.#colorDark
          : this.#colorLight;
        this.#canvasContext.lineWidth = 1;
        this.#canvasContext.fillStyle = isDark
          ? this.#colorDark
          : this.#colorLight;
        this.#canvasContext.fillRect(left, top, width, height);

        this.#canvasContext.strokeRect(
          Math.floor(left) + 0.5,
          Math.floor(top) + 0.5,
          roundedWidth,
          roundedHeight
        );

        this.#canvasContext.strokeRect(
          Math.ceil(left) - 0.5,
          Math.ceil(top) - 0.5,
          roundedWidth,
          roundedHeight
        );
      }
    }
  }

  clear(): void {
    this.#canvasContext.clearRect(
      0,
      0,
      this.#canvasEl.width,
      this.#canvasEl.height
    );
  }
}
