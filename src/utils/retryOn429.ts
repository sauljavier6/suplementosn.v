// src/utils/retryOn429.ts
import { sleep } from "./sleep";

export const retryOn429 = async <T>(
  fn: () => Promise<T>,
  retries = 5
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (error.response?.status === 429 && retries > 0) {
      console.log("⏳ 429 detectado, esperando y reintentando...");
      await sleep(2000);
      return retryOn429(fn, retries - 1);
    }
    throw error;
  }
};
