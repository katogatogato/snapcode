declare const Tesseract: {
  recognize(
    image: string | HTMLImageElement | HTMLCanvasElement | File | Blob,
    langs?: string,
    options?: Record<string, unknown>
  ): Promise<{
    data: { text: string; confidence: number };
  }>;
};

interface OcrResult {
  text: string;
  confidence: number;
}

type ProgressCallback = (progress: number, status: string) => void;

function extractText(
  imageSource: File | Blob,
  onProgress?: ProgressCallback
): Promise<OcrResult> {
  const url = URL.createObjectURL(imageSource);

  if (onProgress) {
    onProgress(0, "Loading image...");
  }

  return Tesseract.recognize(url, "eng", {
    logger: (info: { status: string; progress: number }) => {
      if (onProgress && info.progress !== undefined) {
        const pct = Math.round(info.progress * 100);
        onProgress(pct, info.status);
      }
    },
  })
    .then((result) => {
      if (onProgress) {
        onProgress(100, "Complete");
      }
      return {
        text: result.data.text,
        confidence: result.data.confidence,
      };
    })
    .finally(() => {
      URL.revokeObjectURL(url);
    });
}
