/**
 * Minimal ambient declaration for the OPTIONAL `pdfjs-dist` dependency.
 *
 * `pdfjs-dist` is deliberately not a declared dependency: readPdfFile() in
 * src/services/knowledgeExtractService.ts imports it dynamically and falls back
 * to a plain-text read when it is absent. This declaration types only the small
 * surface that file touches so the optional import type-checks without adding
 * the package to package.json.
 */
declare module 'pdfjs-dist' {
  export interface TextItem {
    str: string;
  }

  export interface TextContent {
    items: TextItem[];
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export const version: string;

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(src: { data: ArrayBuffer }): PDFDocumentLoadingTask;
}
