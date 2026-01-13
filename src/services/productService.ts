import { getItems } from "./loyverseApi";
import Product from "../models/Product";
import LoyverseSyncState from "../models/LoyverseSyncState";

export const syncItems = async () => {
  // 1️⃣ Obtener o crear estado
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
  let maxUpdatedAt = new Date(state.last_items_sync);

  do {
    const data = await getItems(
      cursor,
      state.last_items_sync.toISOString()
    );

    cursor = data.cursor;

    for (const item of data.items) {
      await Product.upsert({
        id: item.id,
        item_name: item.item_name || "Sin nombre",
        category_id: item.category_id || "N/A",
        form: "N/A",
        color: "",
        image_url: item.image_url || "",
        updated_at: new Date(item.updated_at),
      });

      const updated = new Date(item.updated_at);
      if (updated > maxUpdatedAt) {
        maxUpdatedAt = updated;
      }
    }

    totalSaved += data.items.length;

    // 🧯 Anti rate-limit
    await new Promise(r => setTimeout(r, 300));

  } while (cursor);

  // 4️⃣ Guardar último sync real
  await state.update({ last_items_sync: maxUpdatedAt });

  console.log(`✅ Items sincronizados: ${totalSaved}`);
  return totalSaved;
};
