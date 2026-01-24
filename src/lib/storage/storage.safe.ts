/**
 * TODO: Provide safe storage access helpers that handle SSR and failures gracefully.
 */

export const safeStorageGetStub = (key: string): string | null => {
  void key;
  return null;
};

export const safeStorageSetStub = (key: string, value: string): void => {
  void key;
  void value;
};
