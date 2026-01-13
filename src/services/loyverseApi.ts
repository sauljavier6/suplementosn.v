import axios from "axios";
import {
  LoyverseItemsResponse,
  LoyverseVariantsResponse,
  LoyverseInventoryResponse,
} from "../types/loyverse";

const loyverseApi = axios.create({
  baseURL: process.env.LOYVERSE_API,
  headers: {
    Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
  },
});

// ================= ITEMS =================
export const getItems = async (
  cursor?: string,
  updatedAtMin?: string
): Promise<LoyverseItemsResponse> => {
  const response = await loyverseApi.get<LoyverseItemsResponse>("/items", {
    params: {
      //limit: 2000,
      show_deleted: false,
      ...(cursor ? { cursor } : {}),
      ...(updatedAtMin ? { updated_at_min: updatedAtMin } : {}),
    },
  });

  return response.data;
};

// ================= VARIANTS =================
export const getVariants = async (
  cursor?: string,
  updatedAtMin?: string
): Promise<LoyverseVariantsResponse> => {
  const response = await loyverseApi.get<LoyverseVariantsResponse>(
    "/variants",
    {
      params: {
        //limit: 250,
        show_deleted: false,
        ...(cursor ? { cursor } : {}),
        ...(updatedAtMin ? { updated_at_min: updatedAtMin } : {}),
      },
    }
  );

  return response.data;
};

// ================= INVENTORY =================
export const getStores = async (
  cursor?: string,
  updatedAtMin?: string
): Promise<LoyverseInventoryResponse> => {
  const response = await loyverseApi.get<LoyverseInventoryResponse>(
    "/inventory",
    {
      params: {
        //limit: 250,
        show_deleted: false,
        ...(cursor ? { cursor } : {}),
        ...(updatedAtMin ? { updated_at_min: updatedAtMin } : {}),
      },
    }
  );

  return response.data;
};
