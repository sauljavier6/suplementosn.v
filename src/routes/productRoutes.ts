// src/routes/loyverseRoutes.ts
import { Router } from "express";
import { deleteImage, getImages, getProductByBusqueda, getProductByCategory, getProductById, getProducts, postEmail, syncDataManual } from "../controllers/productController";

const router = Router();

router.get("/", syncDataManual);
router.get("/catalogo/:categoria", getProductByCategory);
router.get("/catalogo", getProducts);
router.get("/producto/:id", getProductById);
router.get("/images/:folder", getImages);
router.get("/busqueda/:busqueda", getProductByBusqueda);

router.post("/email", postEmail);
router.delete("/deleteimagen", deleteImage);

export default router;
