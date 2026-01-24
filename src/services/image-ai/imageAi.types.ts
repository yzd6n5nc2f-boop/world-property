export type ImageEnhancementProfile = "clarity" | "warmth" | "twilight";

export interface ImageAiEnhancementRequestStub {
  imageUrl: string;
  profile: ImageEnhancementProfile;
  listingId?: string;
}

export interface ImageAiEnhancementResponseStub {
  originalUrl: string;
  enhancedUrl: string;
  profile: ImageEnhancementProfile;
}

export const IMAGE_AI_PLACEHOLDER_PROVIDER = "image-ai-stub" as const;
