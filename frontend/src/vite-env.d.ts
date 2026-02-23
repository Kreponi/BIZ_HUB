/// <reference types="vite/client" />

declare module "*.png" {
  const pngSrc: string;
  export default pngSrc;
}

declare module "*.jpg" {
  const jpgSrc: string;
  export default jpgSrc;
}

declare module "*.jpeg" {
  const jpegSrc: string;
  export default jpegSrc;
}
