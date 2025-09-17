import { Router } from 'express';
import productRoutes from './productRoutes';
import authRoutes from './authRoutes';


const router = Router();

// Prefijos para cada grupo de rutas
router.use('/productos', productRoutes);
router.use('/sesion', authRoutes);

export default router;
