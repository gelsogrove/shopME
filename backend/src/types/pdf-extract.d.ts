declare module 'pdf.js-extract' {
  export interface PDFExtractOptions {
    firstPage?: number;
    lastPage?: number;
    password?: string;
    verbosity?: number;
    normalizeWhitespace?: boolean;
    disableCombineTextItems?: boolean;
  }

  export interface PDFExtractText {
    x: number;
    y: number;
    w: number;
    h: number;
    str: string;
    dir: string;
    width: number;
    height: number;
    transform: number[];
    fontName: string;
  }

  export interface PDFExtractPage {
    pageInfo: {
      num: number;
      scale: number;
      rotation: number;
      offsetX: number;
      offsetY: number;
      width: number;
      height: number;
    };
    content: PDFExtractText[];
  }

  export interface PDFExtractResult {
    filename: string;
    meta: any;
    pages: PDFExtractPage[];
  }

  export class PDFExtract {
    constructor();
    extract(
      filePath: string,
      options: PDFExtractOptions,
      callback: (err: Error | null, data?: PDFExtractResult) => void
    ): void;
  }
} 