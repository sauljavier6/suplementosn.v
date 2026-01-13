// src/services/syncService.ts
import Store from "../../models/Store";
import { getStores } from "./loyverseApiManual";
import { sleep } from "../../utils/sleep";

export const syncStores = async () => {
  let cursor: string | undefined = undefined;
  let totalSaved = 0;

  do {
    const data = await getStores(cursor) as {
      inventory_levels: any[];
      cursor?: string;
    };

    const inventoryLevels = data.inventory_levels || [];
    cursor = data.cursor;

    for (const inventory of inventoryLevels) {
      await Store.upsert(
        {
          store_id: inventory.store_id,
          variant_id: inventory.variant_id,
          store_variant_key: `${inventory.store_id}_${inventory.variant_id}`,
          in_stock: inventory.in_stock ?? 0,
          updated_at: inventory.updated_at
            ? new Date(inventory.updated_at)
            : new Date(),
        },
        {
          conflictFields: ["store_variant_key"], // 🔑 CLAVE
          returning: false,
        }
      );
    }

    totalSaved += inventoryLevels.length;

    // ⏳ pausa entre páginas
    await sleep(500);

  } while (cursor);

  return totalSaved;
};
