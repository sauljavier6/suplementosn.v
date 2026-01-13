// src/services/syncService.ts
import Product from "../../models/Product";
import { getItems } from "./loyverseApiManual";
import { sleep } from "../../utils/sleep";
import { retryOn429 } from "../../utils/retryOn429";

export const syncItems = async () => {
  let cursor: string | undefined = undefined;
  let totalSaved = 0;

  do {
    const data = await retryOn429(() =>
      getItems(cursor)
    ) as { items: any[]; cursor?: string };

    cursor = data.cursor;

    for (const item of data.items) {
      await Product.upsert({
        id: item.id,
        item_name: item.item_name || "Sin nombre",
        category_id: item.category_id || "N/A",
        form: "N/A",
        color: "",
        image_url: item.image_url || "",
      });
    }

    totalSaved += data.items.length;

    // ⏳ pausa entre páginas
    await sleep(500);

  } while (cursor);

  return totalSaved;
};
