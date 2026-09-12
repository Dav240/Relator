import { invoke } from "@tauri-apps/api/core";

import { ensureFileExtension } from "../file/path";

type ExportMode = "image" | "pdf";
type ExportFormat = "jpeg" | "pdf" | "png" | "svg" | "webp";

type ExportDiagramOptions = {
  format: ExportFormat;
  path: string;
};

type ExportRender = {
  bytes: number[];
  height: number;
  previewUrl: string;
  width: number;
};

type ExportPreview = ExportRender & {
  format: ExportFormat;
};

const EXPORT_TARGET_SELECTOR = '[data-relator-export-target="diagram"]';
const EXPORT_PIXEL_RATIO = 2;
const EXPORT_QUALITY = 0.95;

function getExportTarget() {
  const element = document.querySelector<HTMLElement>(EXPORT_TARGET_SELECTOR);

  if (!element) {
    throw new Error("Could not find the diagram to export.");
  }

  return element;
}

function getExportSize(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();

  return {
    height: Math.max(1, Math.round(bounds.height)),
    width: Math.max(1, Math.round(bounds.width)),
  };
}

async function blobToBytes(blob: Blob) {
  return Array.from(new Uint8Array(await blob.arrayBuffer()));
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("error", () => reject(reader.error));
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBytes(dataUrl: string) {
  const response = await fetch(dataUrl);

  return blobToBytes(await response.blob());
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality = EXPORT_QUALITY,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (nextBlob) {
          resolve(nextBlob);
          return;
        }

        reject(new Error(`Could not create ${mimeType} export.`));
      },
      mimeType,
      quality,
    );
  });
}

async function createPdfExport(element: HTMLElement): Promise<ExportRender> {
  const [{ toPng }, { jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);
  const { height, width } = getExportSize(element);
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: EXPORT_PIXEL_RATIO,
  });
  const pdf = new jsPDF({
    compress: true,
    format: [width, height],
    orientation: width >= height ? "landscape" : "portrait",
    unit: "px",
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);

  return {
    bytes: Array.from(new Uint8Array(pdf.output("arraybuffer"))),
    height,
    previewUrl: dataUrl,
    width,
  };
}

async function renderExport(element: HTMLElement, format: ExportFormat) {
  if (format === "pdf") {
    return createPdfExport(element);
  }

  const htmlToImage = await import("html-to-image");
  const { height, width } = getExportSize(element);

  if (format === "svg") {
    const previewUrl = await htmlToImage.toSvg(element, {
      cacheBust: true,
    });

    return {
      bytes: await dataUrlToBytes(previewUrl),
      height,
      previewUrl,
      width,
    };
  }

  if (format === "jpeg") {
    const previewUrl = await htmlToImage.toJpeg(element, {
      cacheBust: true,
      pixelRatio: EXPORT_PIXEL_RATIO,
      quality: EXPORT_QUALITY,
    });

    return {
      bytes: await dataUrlToBytes(previewUrl),
      height: height * EXPORT_PIXEL_RATIO,
      previewUrl,
      width: width * EXPORT_PIXEL_RATIO,
    };
  }

  if (format === "webp") {
    const canvas = await htmlToImage.toCanvas(element, {
      cacheBust: true,
      pixelRatio: EXPORT_PIXEL_RATIO,
    });
    const blob = await canvasToBlob(canvas, "image/webp");

    return {
      bytes: await blobToBytes(blob),
      height: canvas.height,
      previewUrl: await blobToDataUrl(blob),
      width: canvas.width,
    };
  }

  const previewUrl = await htmlToImage.toPng(element, {
    cacheBust: true,
    pixelRatio: EXPORT_PIXEL_RATIO,
  });

  return {
    bytes: await dataUrlToBytes(previewUrl),
    height: height * EXPORT_PIXEL_RATIO,
    previewUrl,
    width: width * EXPORT_PIXEL_RATIO,
  };
}

async function saveExportBytes(path: string, bytes: number[]) {
  return invoke<string>("save_export_file", { bytes, path });
}

async function exportDiagram({ format, path }: ExportDiagramOptions) {
  const exportTarget = getExportTarget();
  const exportPath = ensureFileExtension(path.trim(), format);
  const { bytes } = await renderExport(exportTarget, format);

  return saveExportBytes(exportPath, bytes);
}

async function createExportPreview(format: ExportFormat): Promise<ExportPreview> {
  const exportTarget = getExportTarget();
  const exportRender = await renderExport(exportTarget, format);

  return {
    ...exportRender,
    format,
  };
}

export { createExportPreview, exportDiagram };
export type { ExportDiagramOptions, ExportFormat, ExportMode, ExportPreview };
