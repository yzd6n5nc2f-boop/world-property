import type { ImageAiEnhancementRequestStub, ImageAiEnhancementResponseStub } from "./imageAi.types";

export interface ImageAiClient {
  enhance(request: ImageAiEnhancementRequestStub): Promise<ImageAiEnhancementResponseStub>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const imageAiClientStub: ImageAiClient = {
  async enhance(request) {
    await delay(600);

    const seed = Math.abs(
      Array.from(request.imageUrl)
        .map((char) => char.charCodeAt(0))
        .reduce((acc, value) => acc + value, 0)
    );

    return {
      originalUrl: request.imageUrl,
      enhancedUrl: `https://picsum.photos/seed/enhanced-${seed}/1200/800`,
      profile: request.profile
    };
  }
};
