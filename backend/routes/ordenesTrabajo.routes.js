const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');

// Middleware de conexión
const connectDB = async (req, res, next) => {
  try {
    const client = await MongoClient.connect(config.MONGODB_URI);
    req.dbClient = client;
    req.db = client.db('smarttech');
    next();
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    res.status(500).json({ success: false, message: 'Error de conexión a la base de datos' });
  }
};

// Función para generar ID incremental
async function getNextSequence(db, name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { 
      returnDocument: 'after',
      upsert: true 
    }
  );
  return result.value.seq;
}

// GET - Obtener todas las órdenes con información de cliente y producto
router.get('/', connectDB, async (req, res) => {
  try {
    const ordenes = await req.db.collection('ordenes_trabajo').aggregate([
      {
        $lookup: {
          from: 'clientes',
          localField: 'cliente_dni',
          foreignField: 'dni',
          as: 'cliente'
        }
      },
      {
        $lookup: {
          from: 'productos',
          localField: 'producto_numero_serie',
          foreignField: 'numero_serie',
          as: 'producto'
        }
      },
      {
        $unwind: '$cliente'
      },
      {
        $unwind: '$producto'
      },
      {
        $sort: { fecha_ingreso: -1 }
      }
    ]).toArray();

    res.json({ success: true, data: ordenes });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las órdenes de trabajo' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

// POST - Crear nueva orden
router.post('/', connectDB, async (req, res) => {
  try {
    const { 
      cliente_dni, 
      producto_numero_serie, 
      descripcion_falla, 
      codigo_orden_visible_manual 
    } = req.body;

    // Validar campos requeridos
    if (!cliente_dni || !producto_numero_serie || !descripcion_falla) {
      return res.status(400).json({
        success: false,
        message: 'El DNI del cliente, número de serie del producto y descripción de falla son obligatorios'
      });
    }

    // Buscar cliente
    const cliente = await req.db.collection('clientes').findOne({ dni: cliente_dni });
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Buscar producto
    const producto = await req.db.collection('productos').findOne({ numero_serie: producto_numero_serie });
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Generar id_orden y código visible
    let id_orden = await getNextSequence(req.db, 'ordenes_trabajo');
    let codigo_orden_visible;

    if (cliente.tipo_cliente === 'empresa') {
      if (!codigo_orden_visible_manual) {
        return res.status(400).json({
          success: false,
          message: 'Debe ingresar un número de orden externo para clientes empresa'
        });
      }
      codigo_orden_visible = codigo_orden_visible_manual;

      // Verificar si ya existe una orden con ese código
      const ordenExistente = await req.db.collection('ordenes_trabajo').findOne({ codigo_orden_visible });
      if (ordenExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una orden con ese número de orden externo'
        });
      }
    } else {
      codigo_orden_visible = String(id_orden);
    }

    const nuevaOrden = {
      id_orden,
      codigo_orden_visible,
      cliente_dni,
      producto_numero_serie,
      fecha_ingreso: new Date(),
      descripcion_falla,
      estado: 'Ingresado',
      historial: [{
        fecha: new Date(),
        estado: 'Ingresado',
        descripcion: 'Orden creada'
      }]
    };

    const result = await req.db.collection('ordenes_trabajo').insertOne(nuevaOrden);
    
    res.status(201).json({
      success: true,
      message: 'Orden de trabajo creada exitosamente',
      data: { ...nuevaOrden, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ success: false, message: 'Error al crear la orden de trabajo' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

// PUT - Actualizar una orden
router.put('/:id', connectDB, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, descripcion_falla } = req.body;

    const result = await req.db.collection('ordenes_trabajo').updateOne(
      { codigo_orden_visible: id },
      { $set: { estado, descripcion_falla } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden de trabajo no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Orden de trabajo actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la orden de trabajo' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

// DELETE - Eliminar una orden
router.delete('/:id', connectDB, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.db.collection('ordenes_trabajo').deleteOne({ codigo_orden_visible: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden de trabajo no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Orden de trabajo eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la orden de trabajo' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

module.exports = router;