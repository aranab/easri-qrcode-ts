# Asri QR Code Generator
Cross-browser with HTML5 Canvas, SVG and Table tag QR Code generator using TypeScript. This repository has no external module dependencies. The development has been initiated by vite module bundler. 

## Build Command
- Development dependencies install `> npm install`
- Run the development `> npm run dev`
- Build the project (generate dist folder) `> npm run build`


## Basic Usages
```typescript
  let app = document.querySelector<HTMLDivElement>("#app");
  if (app !== null) {
    const qrCode = new QRCode(app, "demo text");
  }
```

- With some options

```typescript
  let text = document.querySelector<HTMLInputElement>("#input");
  let app = document.querySelector<HTMLDivElement>("#app");
  if (text === null || text.value === "") return;  

  if (app !== null) {
    const qrCode = new QRCode(app, text.value, {
      width: 128,
      height: 128,
      useSvg: true,
      colorDark: "#0d6efd",
      colorLight: "#ffffff"
    });
  }
  text.value = "";
```

- Some methods

```typescript
qrCode.clear(); // clear the code.
qrCode.makeCode("another text"); // make another code.
```

## Browser Compatibility
IE6~10, Chrome, Firefox, Safari, Opera, Mobile Safari, Android, iOS, etc.

## Inspiration Repository
[qrcodejs](https://github.com/davidshimjs/qrcodejs)

## License
MIT License

