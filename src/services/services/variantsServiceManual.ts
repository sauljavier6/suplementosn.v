// src/services/syncService.ts
import Stock from "../../models/Stock";
import { getVariants } from "../loyverseApi";
import { sleep } from "../../utils/sleep";

export const syncVariants = async () => {
  let cursor: string | undefined = undefined;
  let totalSaved = 0;

  do {
    const data = await getVariants(cursor) as {
      variants: any[];
      cursor?: string;
    };

    const variants = data.variants || [];
    cursor = data.cursor;

    for (const variant of variants) {
      await Stock.upsert(
        {
          variant_id: variant.variant_id || "Sin variante",
          item_id: variant.item_id || "N/A",
          barcode: variant.barcode || "N/A",
          sku: variant.sku || "N/A",
          option1_value: variant.option1_value || null,
          default_price: variant.default_price || 0.0,
        },
        { returning: true }
      );
    }

    totalSaved += variants.length;

    // ⏳ pausa entre páginas (IMPORTANTE)
    await sleep(500);

  } while (cursor);

  return totalSaved;
};
