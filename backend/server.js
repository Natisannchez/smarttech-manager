const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/app_pagos';

// Middleware
app.use(cors());
app.use(express.json());

let db;

// Conectar a MongoDB
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then(client => {
    console.log('🟢 Conectado a MongoDB - SmartTech Manager');
    
    // Seleccionar la base de datos
    db = client.db('app_pagos');
    
    console.log(`📊 Base de datos: ${db.databaseName}`);
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

// =================== RUTAS DE AUTENTICACIÓN ===================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Por ahora, login simple sin base de datos
    if (username === 'admin' && password === 'admin123') {
      res.json({
        success: true,
        user: {
          username: 'admin',
          nombre: 'Administrador',
          email: 'admin@smarttech.com',
          rol: 'admin'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

// =================== RUTAS DE CLIENTES ===================

app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await db.collection('clientes').find({}).toArray();
    res.json(clientes);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const clienteData = {
      ...req.body,
      fechaRegistro: new Date(),
      activo: true
    };
    
    const result = await db.collection('clientes').insertOne(clienteData);
    const nuevoCliente = { _id: result.insertedId, ...clienteData };
    
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(400).json({ error: error.message });
  }
});

// =================== RUTA DE SALUD ===================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SmartTech Manager API funcionando',
    timestamp: new Date(),
    database: db ? 'Conectado' : 'Desconectado'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 API disponible en: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});
