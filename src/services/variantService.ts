import { getVariants } from "./loyverseApi";
import Stock from "../models/Stock";
import LoyverseSyncState from "../models/LoyverseSyncState";

export const syncVariants = async () => {
  const state =
    (await LoyverseSyncState.findByPk(1)) ??
    (await LoyverseSyncState.create({
      id: 1,
      last_items_sync: new Date(0),
      last_variants_sync: new Date(0),
      last_stores_sync: new Date(0),
    }));

  let cursor: string | undefined;
  let totalSaved = 0;
  let maxUpdatedAt = new Date(state.last_variants_sync);

  do {
    const data = await getVariants(
      cursor,
      state.last_variants_sync.toISOString()
    );

    cursor = data.cursor;

    for (const variant of data.variants) {
      await Stock.upsert({
        variant_id: variant.variant_id,
        item_id: variant.item_id,
        barcode: variant.barcode || null,
        sku: variant.sku || null,
        option1_value: variant.option1_value || null,
        default_price: variant.default_price ?? 0,
        updated_at: new Date(variant.updated_at),
      });

      const updated = new Date(variant.updated_at);
      if (updated > maxUpdatedAt) {
        maxUpdatedAt = updated;
      }
    }

    totalSaved += data.variants.length;

    // 🧯 evitar rate-limit
    await new Promise(r => setTimeout(r, 300));

  } while (cursor);

  await state.update({ last_variants_sync: maxUpdatedAt });

  console.log(`✅ Variants sincronizados: ${totalSaved}`);
  return totalSaved;
};
