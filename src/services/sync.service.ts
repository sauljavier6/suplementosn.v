import { syncItems } from "./productService";
import { syncVariants } from "./variantService";
import { syncStores } from "./storesService";

export const runSync = async () => {
  console.log("🔄 Sync: Items");
  const items = await syncItems();

  console.log("🔄 Sync: Variants");
  const variants = await syncVariants();

  console.log("🔄 Sync: Stock por tienda");
  const stores = await syncStores();

  return {
    items,
    variants,
    stores,
  };
};
