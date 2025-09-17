 // src/services/syncService.ts
import { getStores } from "./loyverseApi";
import Store from "../models/Store";

export const syncStores = async () => {
  let cursor: string | undefined = undefined;
  let totalSaved = 0;

    do {
      // Traer inventario desde la API
      const data = await getStores(cursor) as { inventory_levels: any[]; cursor?: string };
      const inventoryLevels = data.inventory_levels || [];
      cursor = data.cursor;

      for (const inventory of inventoryLevels) {
        // Guardar o actualizar cada registro de Store
        await Store.upsert(
          {
            store_id: inventory.store_id || "N/A",
            variant_id: inventory.variant_id || "N/A",
            in_stock: inventory.in_stock ?? 0,
            updated_at: inventory.updated_at ? new Date(inventory.updated_at) : new Date(),
          },
          { returning: true }
        );
      }

      totalSaved += inventoryLevels.length;
    } while (cursor);

  return totalSaved;
};
