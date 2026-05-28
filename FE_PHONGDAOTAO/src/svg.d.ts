/// <reference types="vite/client" />

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module 'crypto-js' {
  const CryptoJS: any;
  export default CryptoJS;
}

declare module 'file64' {
  export function fileToBase64(file: File): Promise<string>;
}
