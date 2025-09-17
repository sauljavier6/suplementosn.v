 // src/services/syncService.ts
import { getItems } from "./loyverseApi";
import Product from "../models/Product";

export const syncItems = async () => {
  let cursor: string | undefined = undefined;
  let totalSaved = 0;

  do {
    const data = await getItems(cursor) as { items: any[]; cursor?: string };
    const items = data.items;
    cursor = data.cursor;

    for (const item of items) {
      // Guardar o actualizar Product
      const [product, created] = await Product.upsert({
        id: item.id,
        item_name: item.item_name || "Sin nombre",
        category_id: item.category_id || "N/A", 
        form: "N/A",
        color: "",
        image_url: item.image_url || "",
      }, {
        returning: true,
      });
    }

    totalSaved += items.length;
  } while (cursor);

  return totalSaved;
};