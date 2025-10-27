// backend/routes/agenda.routes.js
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
 * GET /api/agenda
 * Lista la agenda (asignaciones) simple
 */
router.get('/', connectDB, async (req, res) => {
  try {
    const pipeline = [
      { $sort: { fecha_revision: 1 } },
      {
        $lookup: {
          from: 'ordenes_trabajo',
          localField: 'codigo_orden_visible',
          foreignField: 'codigo_orden_visible',
          as: 'orden'
        }
      },
      { $unwind: { path: '$orden', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'clientes',
          localField: 'orden.cliente_dni',
          foreignField: 'dni',
          as: 'cliente'
        }
      },
      { $unwind: { path: '$cliente', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'tecnicos',
          localField: 'tecnico_dni',
          foreignField: 'dni',
          as: 'tecnico'
        }
      },
      { $unwind: { path: '$tecnico', preserveNullAndEmptyArrays: true } }
    ];
    const data = await req.db.collection('agenda').aggregate(pipeline).toArray();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error listando agenda:', error);
    res.status(500).json({ success: false, message: 'Error al listar agenda' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

/**
 * POST /api/agenda
 * Crea una asignación (programar una orden)
 * body: { codigo_orden_visible, tecnico_dni, fecha_revision }
 */
router.post('/', connectDB, async (req, res) => {
  try {
    const { codigo_orden_visible, tecnico_dni, fecha_revision, id_orden, codigo } = req.body;
    const cod = codigo_orden_visible || codigo || id_orden;
    if (!cod || !tecnico_dni || !fecha_revision) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    // Traer orden y cliente para poder calcular fecha_limite
    const orden = await req.db.collection('ordenes_trabajo').findOne({
      $or: [
        { codigo_orden_visible: cod },
        { id_orden: cod },
        { codigo: cod },
        { _id: cod }
      ]
    });
    if (!orden) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

    const cliente = await req.db.collection('clientes').findOne({ dni: orden.cliente_dni });
    if (!cliente) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

    // Lógica de días hábiles por tipo de cliente
    const addBusinessDays = (start, days) => {
      const d = new Date(start);
      let added = 0;
      while (added < days) {
        d.setDate(d.getDate() + 1);
        const day = d.getDay(); // 0 dom, 6 sáb
        if (day !== 0 && day !== 6) added++;
      }
      return d;
    };

    const mapaPlazo = {
      'Hospital Italiano': 2,
      'Mercantil Andina': 3,
      'Scrapfree': 5,
      'particular': 7,
      'Particular': 7,
    };
    const plazo = mapaPlazo[cliente.nombre_empresa] ?? mapaPlazo[cliente.tipo_cliente] ?? 7;
    const fecha_limite = addBusinessDays(orden.fecha_ingreso, plazo);

    // Insertar en agenda
    const asignacion = {
      codigo_orden_visible: orden.codigo_orden_visible,
      tecnico_dni,
      fecha_revision: new Date(fecha_revision),
      fecha_limite,
      creada_en: new Date(),
    };
    await req.db.collection('agenda').insertOne(asignacion);

    // Actualizar estado de la orden
    await req.db.collection('ordenes_trabajo').updateOne(
      { codigo_orden_visible: orden.codigo_orden_visible },
      {
        $set: { estado: 'Asignada' },
        $push: {
          historial: {
            fecha: new Date(),
            estado: 'Asignada',
            descripcion: `Asignada a técnico ${tecnico_dni} para revisión`,
          },
        },
      }
    );

    res.status(201).json({ success: true, message: 'Asignación creada', data: asignacion });
  } catch (error) {
    console.error('Error creando asignación:', error);
    res.status(500).json({ success: false, message: 'Error al crear asignación' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

module.exports = router;