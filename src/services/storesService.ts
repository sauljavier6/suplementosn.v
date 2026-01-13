import { getStores } from "./loyverseApi";
import Store from "../models/Store";
import LoyverseSyncState from "../models/LoyverseSyncState";
import { sleep } from "../utils/sleep";

export const syncStores = async () => {
  const state = await LoyverseSyncState.findByPk(1);
  if (!state) {
    throw new Error("SyncState no inicializado");
  }

  let cursor: string | undefined;
  let totalSaved = 0;
  let maxUpdatedAt = new Date(state.last_stores_sync);

  do {
    const data = await getStores(
      cursor,
      state.last_stores_sync.toISOString()
    );

    cursor = data.cursor;

    for (const inv of data.inventory_levels) {
      await Store.upsert(
        {
          store_id: inv.store_id,
          variant_id: inv.variant_id,
          store_variant_key: `${inv.store_id}_${inv.variant_id}`,
          in_stock: inv.in_stock ?? 0,
          updated_at: new Date(inv.updated_at),
        },
        {
          conflictFields: ["store_variant_key"],
          returning: false,
        }
      );

      const updated = new Date(inv.updated_at);
      if (updated > maxUpdatedAt) {
        maxUpdatedAt = updated;
      }
    }

    totalSaved += data.inventory_levels.length;

    // 🧯 evitar rate-limit
    await sleep(300);

  } while (cursor);

  await state.update({ last_stores_sync: maxUpdatedAt });

  console.log(`✅ Inventory sincronizado: ${totalSaved}`);
  return totalSaved;
};
