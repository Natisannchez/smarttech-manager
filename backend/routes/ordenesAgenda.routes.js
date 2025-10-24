// backend/routes/ordenesAgenda.routes.js
const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const config = require('../config');

// Conexión por request (mismo patrón que el resto)
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

/**
 * GET /api/ordenes-agenda
 * Lista de órdenes para la Agenda, con filtros opcionales:
 *  - ?estado=Ingresado|Asignada|En%20revisión...
 *  - ?desde=YYYY-MM-DD
 *  - ?hasta=YYYY-MM-DD
 *  - ?q=texto (cliente, código visible, técnico)
 */
router.get('/', connectDB, async (req, res) => {
  try {
    const { estado, desde, hasta, q } = req.query;
    const match = {};

    if (estado) match.estado = estado;

    if (desde || hasta) {
      match.fecha_ingreso = {};
      if (desde) match.fecha_ingreso.$gte = new Date(desde);
      if (hasta) {
        const d = new Date(hasta);
        d.setHours(23, 59, 59, 999);
        match.fecha_ingreso.$lte = d;
      }
    }

    // Pipeline sencillo; si más adelante quieren joins con clientes/técnicos lo agregan aquí
    const pipeline = [
      { $match: match },
      { $sort: { fecha_ingreso: -1 } },
    ];

    // Búsqueda textual básica sobre campos visibles (si llega q)
    if (q) {
      pipeline.unshift({
        $match: {
          $or: [
            { codigo_orden_visible: { $regex: q, $options: 'i' } },
            { descripcion_falla: { $regex: q, $options: 'i' } },
          ],
        },
      });
    }

    const data = await req.db.collection('ordenes_trabajo').aggregate(pipeline).toArray();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error listando órdenes para agenda:', error);
    res.status(500).json({ success: false, message: 'Error al listar órdenes' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

module.exports = router;
