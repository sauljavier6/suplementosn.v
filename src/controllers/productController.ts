// src/controllers/loyverseController.ts
import cloudinary from "../config/cloudinary";
import Product from "../models/Product";
import Stock from "../models/Stock";
import Store from "../models/Store";
import { Op } from "sequelize";
import nodemailer from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { runSync } from "../services/sync.service";
import { syncItems } from "../services/services/productServiceManual";
import { syncVariants } from "../services/services/variantsServiceManual";
import { syncStores } from "../services/services/storeServiceManual";

export const syncDataManual = async (req: any, res: any) => {
  try {
    const items = await syncItems();
    const variants = await syncVariants();
    const stores = await syncStores();

    return res.status(200).json({
      message: "Sincronización completa",
      items,
      variants,
      stores
    });

  } catch (error) {
    console.error("Error sincronizando datos:", error);
    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

export const syncData = async (req: any, res: any) => {
  try {
    const result = await runSync();

    return res.status(200).json({
      message: `Sincronizados: 
      Items: ${result.items}, 
      Variantes: ${result.variants}, 
      Stock Tiendas: ${result.stores}`,
      ...result,
    });

  } catch (error) {
    console.error("Error sincronizando datos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getProducts = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const { rows: products, count } = await Product.findAndCountAll({
      offset,
      limit,
      order: [["ID_Product", "ASC"]],
      include: [
        {
          model: Stock,
          required: true,
          include: [
            {
              model: Store,
              where: {
                in_stock: { [Op.gt]: 0 },
              },
              required: true,
            },
          ],
        },
      ],
      distinct: true,
    });

    const productsWithTotalStock = products.map((product) => {
    const prodJSON = product.toJSON();

    let totalInStock = 0;

    if (prodJSON.stock) {
        prodJSON.stock.forEach((stockItem: any) => {
        if (stockItem.stores && stockItem.stores.length > 0) {
            totalInStock += stockItem.stores.reduce(
            (sum: number, store: any) => sum + Number(store.in_stock),
            0
            );
        }
        });
    }

    return {
        ...prodJSON,
        totalInStock,
    };
    });


    res.json({
      data: productsWithTotalStock,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};


export const getProductById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id },
      include: [
        {
          model: Stock,
          required: true,
          include: [
            {
              model: Store,
              where: { in_stock: { [Op.gt]: 0 } },
              required: true,
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const productJSON = product.toJSON();

    let totalProductStock = 0;

    const stocksWithTotal = productJSON.stock.map((stockItem: any) => {
      let totalVariantStock = 0;

      if (stockItem.stores && stockItem.stores.length > 0) {
        totalVariantStock = stockItem.stores.reduce(
          (sum: number, store: any) => sum + Number(store.in_stock),
          0
        );
      }

      totalProductStock += totalVariantStock;

      return {
        ...stockItem,
        totalVariantStock,
      };
    });

    const productWithStockTotals = {
      ...productJSON,
      stock: stocksWithTotal,
      totalProductStock,
    };

    res.json({ data: productWithStockTotals });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ message: "Error al obtener producto" });
  }
};


export const getProductByCategory = async (req: any, res: any) => {
  try {
    const { categoria } = req.params;
    const talla = req.query.talla as string | null;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const offset = (page - 1) * limit;

    // --- Construimos condiciones dinámicas ---
    const productWhere: any = {};
    const stockWhere: any = {};

    if (categoria) {
      productWhere.category_id = categoria;
    }

    if (talla) {
      stockWhere.option1_value = talla;
    }

    const { rows: products, count } = await Product.findAndCountAll({
      offset,
      limit,
      order: [["ID_Product", "ASC"]],
      where: Object.keys(productWhere).length ? productWhere : undefined,
      include: [
        {
          model: Stock,
          required: true,
          where: Object.keys(stockWhere).length ? stockWhere : undefined,
          include: [
            {
              model: Store,
              where: {
                in_stock: { [Op.gt]: 0 },
              },
              required: true,
            },
          ],
        },
      ],
      distinct: true,
    });

    // --- Calcular stock total ---
    const productsWithTotalStock = products.map((product) => {
      const prodJSON = product.toJSON();

      let totalInStock = 0;

      if (prodJSON.stock) {
        prodJSON.stock.forEach((stockItem: any) => {
          if (stockItem.stores && stockItem.stores.length > 0) {
            totalInStock += stockItem.stores.reduce(
              (sum: number, store: any) => sum + Number(store.in_stock),
              0
            );
          }
        });
      }

      return {
        ...prodJSON,
        totalInStock,
      };
    });

    res.json({
      data: productsWithTotalStock,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      pageSize: limit, 
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

export const getProductByBusqueda = async (req: any, res: any) => {
    
  try {
    const busqueda  = req.params.busqueda;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const offset = (page - 1) * limit;

    // --- Construimos condiciones dinámicas ---
    const productWhere: any = {};

    if (busqueda) {
    productWhere.item_name = {
        [Op.iLike]: `%${busqueda}%`
    };
    }

    const { rows: products, count } = await Product.findAndCountAll({
      offset,
      limit,
      order: [["ID_Product", "ASC"]],
      where: Object.keys(productWhere).length ? productWhere : undefined,
      include: [
        {
          model: Stock,
          required: true,
          include: [
            {
              model: Store,
              where: {
                in_stock: { [Op.gt]: 0 },
              },
              required: true,
            },
          ],
        },
      ],
      distinct: true,
    });

    // --- Calcular stock total ---
    const productsWithTotalStock = products.map((product) => {
      const prodJSON = product.toJSON();

      let totalInStock = 0;

      if (prodJSON.stock) {
        prodJSON.stock.forEach((stockItem: any) => {
          if (stockItem.stores && stockItem.stores.length > 0) {
            totalInStock += stockItem.stores.reduce(
              (sum: number, store: any) => sum + Number(store.in_stock),
              0
            );
          }
        });
      }

      return {
        ...prodJSON,
        totalInStock,
      };
    });

    res.json({
      data: productsWithTotalStock,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      pageSize: limit, 
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};



export const getImages = async (req: any, res: any) => {
  const { folder } = req.params;
  console.log('entro a cloudinary', folder)

  if (!folder) {
    return res.status(400).json({ message: "Debe especificar el nombre de la carpeta" });
  }

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `productos/${folder}`,
      max_results: 5,
    });

    console.log('result',result)

    res.json(result.resources);
  } catch (error) {
    console.error("Error obteniendo imágenes de Cloudinary:", error);
    res.status(500).json({ message: "Error al obtener imágenes" });
  }
}


export const postEmail = async (req: any, res: any) => {
  const { email } = req.body;

    const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    } as SMTPTransport.Options);


  const mailOptions = {
    from: email,
    to: process.env.SMTP_USER,
    subject: '🎉 ¡Solicitud de suscripción a promociones!',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <h2 style="color: #0077cc;">Solicitud de suscripción a promociones</h2>
        <p>Hola,</p>
        <p>El siguiente usuario desea recibir promociones:</p>
        <p>
          <strong>Correo:</strong> <a href="mailto:${email}" style="color: #0077cc;">${email}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.9em; color: #666;">
          Este es un mensaje automático de suscripción.<br/>
          Saludos,<br/>
          <em>Tu Sitio Web</em>
        </p>
      </div>
    `,
  };

  const userMailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: '✅ ¡Gracias por suscribirte a nuestras promociones!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4CAF50;">¡Gracias por suscribirte!</h2>
        <p>Hola,</p>
        <p>Hemos recibido tu solicitud para recibir promociones. Pronto comenzarás a recibir nuestras mejores ofertas directamente en tu correo.</p>
        <br />
        <p>Si tú no realizaste esta solicitud, por favor ignora este mensaje.</p>
        <hr />
        <p style="font-size: 12px; color: #888;">Este es un mensaje automático. No respondas a este correo.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(userMailOptions);
    res.status(200).json({ email, mgs: "success" });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
}


export const deleteImage = async (req: any, res: any) => {
  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ message: "El campo 'public_id' es requerido" });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "not found") {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    res.json({ message: "Imagen eliminada correctamente", result });
  } catch (error) {
    console.error("Error eliminando imagen de Cloudinary:", error);
    res.status(500).json({ message: "Error eliminando la imagen" });
  }
}