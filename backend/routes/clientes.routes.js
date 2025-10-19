const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
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

// GET - Obtener todos los clientes
router.get('/', connectDB, async (req, res) => {
  try {
    const clientes = await req.db.collection('clientes').find({}).toArray();
    res.json({ success: true, data: clientes });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los clientes' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

// GET - Buscar cliente por DNI
router.get('/dni/:dni', connectDB, async (req, res) => {
  try {
    // Asegurarse de que el DNI es un string
    const dni = String(req.params.dni);
    
    console.log('Buscando cliente con DNI:', dni);
    
    const cliente = await req.db.collection('clientes').findOne({ dni });

    if (!cliente) {
      console.log('Cliente no encontrado para DNI:', dni);
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente no encontrado' 
      });
    }

    console.log('Cliente encontrado:', cliente);
    res.json({ success: true, data: cliente });
  } catch (error) {
    console.error('Error buscando cliente:', error);
    res.status(500).json({ success: false, message: 'Error al buscar el cliente' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

// POST - Crear nuevo cliente
router.post('/', connectDB, async (req, res) => {
  try {
    const { dni, nombre_apellido, telefono, domicilio, tipo_cliente, nombre_empresa } = req.body;

    // Validar campos requeridos
    if (!dni || !nombre_apellido || !tipo_cliente) {
      return res.status(400).json({
        success: false,
        message: 'DNI, nombre y apellido, y tipo de cliente son campos obligatorios'
      });
    }

    // Verificar si el cliente ya existe
    const clienteExistente = await req.db.collection('clientes').findOne({ dni });
    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con ese DNI'
      });
    }

    const nuevoCliente = {
      dni,
      nombre_apellido,
      telefono,
      domicilio,
      tipo_cliente,
      nombre_empresa,
      fecha_registro: new Date()
    };

    const result = await req.db.collection('clientes').insertOne(nuevoCliente);
    
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: { ...nuevoCliente, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ success: false, message: 'Error al crear el cliente' });
  } finally {
    if (req.dbClient) req.dbClient.close();
  }
});

module.exports = router;