import QRCode from "./QRCode";

let btn = document.getElementById('btn');

btn?.addEventListener("click", function (e) {
  e.preventDefault();
  let text = document.querySelector<HTMLInputElement>("#input");

  if (text === null || text.value === "") {
    return;
  }

  let app = document.querySelector<HTMLDivElement>("#app");

  if (app !== null) {
    new QRCode(app, text.value, { width: 128, height: 128, useSvg: false, colorDark: "#0d6efd" });
  }
  text.value = "";
});
