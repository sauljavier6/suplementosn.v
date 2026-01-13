// ================= ITEMS =================
export interface LoyverseItem {
  id: string;
  item_name: string;
  category_id?: string;
  image_url?: string;
  updated_at: string;
}

export interface LoyverseItemsResponse {
  items: LoyverseItem[];
  cursor?: string;
}

// ================= VARIANTS =================
export interface LoyverseVariant {
  variant_id: string;
  item_id: string;
  barcode?: string;
  sku?: string;
  option1_value?: string;
  default_price?: number;
  updated_at: string;
}

export interface LoyverseVariantsResponse {
  variants: LoyverseVariant[];
  cursor?: string;
}

// ================= INVENTORY =================
export interface LoyverseInventory {
  store_id: string;
  variant_id: string;
  in_stock: number;
  updated_at: string;
}

export interface LoyverseInventoryResponse {
  inventory_levels: LoyverseInventory[];
  cursor?: string;
}
