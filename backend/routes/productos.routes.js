const express = require('express');
const router = express.Router();
let db;

// Función para inicializar la base de datos
const initDB = (database) => {
  db = database;
};

// GET - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await db.collection('productos')
      .find({})
      .sort({ tipo_producto: 1 })
      .toArray();

    res.json({ success: true, data: productos });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los productos' });
  }
});

// POST - Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    // Verificar si la base de datos está inicializada
    if (!db) {
      console.error('La base de datos no está inicializada');
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor'
      });
    }

    console.log('Datos recibidos:', req.body);
    const { numero_serie, tipo_producto, marca, modelo } = req.body;

    // Validación de campos obligatorios
    if (!numero_serie || !tipo_producto) {
      console.log('Faltan campos obligatorios:', { numero_serie, tipo_producto });
      return res.status(400).json({
        success: false,
        message: 'El número de serie y tipo de producto son obligatorios'
      });
    }

    try {
      // Verificar si el número de serie ya existe
      const existente = await db.collection('productos').findOne({ 
        numero_serie: String(numero_serie).trim() 
      });
      
      if (existente) {
        console.log('Producto existente encontrado:', existente);
        return res.status(409).json({
          success: false,
          message: 'Ya existe un producto con ese número de serie'
        });
      }

      const nuevoProducto = {
        numero_serie: String(numero_serie).trim(),
        tipo_producto: String(tipo_producto).toLowerCase().trim(),
        marca: marca ? String(marca).trim() : '',
        modelo: modelo ? String(modelo).trim() : '',
        activo: true,
        fecha_creacion: new Date()
      };

      console.log('Intentando crear nuevo producto:', nuevoProducto);
      const result = await db.collection('productos').insertOne(nuevoProducto);
      
      console.log('Producto creado exitosamente:', result);
      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: { ...nuevoProducto, _id: result.insertedId }
      });
    } catch (dbError) {
      console.error('Error en operación de base de datos:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error al crear producto:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear el producto',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT - Actualizar un producto
router.put('/:numero_serie', async (req, res) => {
  try {
    const { numero_serie } = req.params;
    const { tipo_producto, marca, modelo } = req.body;

    // Validar datos requeridos
    if (!tipo_producto) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de producto es obligatorio'
      });
    }

    const result = await db.collection('productos').updateOne(
      { numero_serie },
      { 
        $set: { 
          tipo_producto: String(tipo_producto).toLowerCase().trim(),
          marca: marca ? String(marca).trim() : '',
          modelo: modelo ? String(modelo).trim() : '',
          fecha_actualizacion: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar el producto',
      error: error.message 
    });
  }
});

// GET - Buscar producto por número de serie
router.get('/serie/:numero_serie', async (req, res) => {
  try {
    const { numero_serie } = req.params;
    const producto = await db.collection('productos').findOne({ numero_serie });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error al buscar producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al buscar el producto',
      error: error.message 
    });
  }
});

// PATCH - Activar/desactivar producto
router.patch('/:numero_serie/toggle-estado', async (req, res) => {
  try {
    const { numero_serie } = req.params;
    const producto = await db.collection('productos').findOne({ numero_serie });

    if (!producto) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }

    const nuevoEstado = !producto.activo;
    await db.collection('productos').updateOne(
      { numero_serie },
      { 
        $set: { 
          activo: nuevoEstado,
          fecha_actualizacion: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: `Producto ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
      data: { activo: nuevoEstado }
    });
  } catch (error) {
    console.error('Error al cambiar estado de producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cambiar estado del producto',
      error: error.message 
    });
  }
});

module.exports = router;
module.exports.initDB = initDB;