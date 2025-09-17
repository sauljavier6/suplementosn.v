import axios from "axios";

const loyverseApi = axios.create({
  baseURL: process.env.LOYVERSE_API,
  headers: {
    Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
  },
});

// Ejemplo de función para traer items con paginación
export const getItems = async (cursor?: string) => {
  const response = await loyverseApi.get("/items", {
    params: {
      limit: 12,
      show_deleted: false,
      ...(cursor ? { cursor } : {}),
    },
  });

  return response.data;
};

export const getVariants = async (cursor?: string) => {
  const response = await loyverseApi.get("/variants", {
    params: {
      limit: 12,
      show_deleted: false,
      ...(cursor ? { cursor } : {}),
    },
  });

  return response.data;
};

export const getStores = async (cursor?: string) => {
  const response = await loyverseApi.get("/inventory", {
    params: {
      limit: 12,
      show_deleted: false,
      ...(cursor ? { cursor } : {}),
    },
  });

  return response.data;
};

export default loyverseApi;
