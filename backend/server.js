const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const config = require('./config');
const PORT = config.PORT;
const MONGODB_URI = config.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

let db;

// Función para iniciar el servidor
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 API disponible en: http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  });
};

// Conectar a MongoDB
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then(client => {
    console.log('🟢 Conectado a MongoDB - SmartTech Manager');
    
    // Seleccionar la base de datos
    db = client.db('smarttech');
    
    console.log(`📊 Base de datos: ${db.databaseName}`);
    
    // Configurar las rutas con la conexión a la base de datos
    configureRoutes(db);
    
    // Iniciar el servidor una vez conectado a la base de datos
    startServer();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    console.error('Detalles del error:', err.stack);
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

// =================== RUTAS ===================
const clientesRoutes = require('./routes/clientes.routes');
app.use('/api/clientes', clientesRoutes);

// =================== RUTA DE SALUD ===================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'El servidor está funcionando correctamente' });
});

// =================== RUTAS DE CLIENTES ===================
app.get('/api/clientes/dni/:dni', async (req, res) => {
  try {
    const cliente = await db.collection('clientes').findOne({ dni: req.params.dni });
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error buscando cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// =================== RUTAS DE TÉCNICOS ===================
const tecnicosRoutes = require('./routes/tecnicos.routes');
app.use('/api/tecnicos', tecnicosRoutes);

// =================== CONFIGURACIÓN DE RUTAS ===================
const configureRoutes = (database) => {
  // Rutas de productos
  const productosRoutes = require('./routes/productos.routes');
  productosRoutes.initDB(database);
  app.use('/api/productos', productosRoutes);

  // Rutas de clientes
  app.use('/api/clientes', clientesRoutes);

  // Rutas de técnicos
  app.use('/api/tecnicos', tecnicosRoutes);

  // Rutas de órdenes
  app.use('/api/ordenes', ordenesRoutes);
};

// =================== RUTAS DE ÓRDENES DE TRABAJO ===================
const ordenesRoutes = require('./routes/ordenesTrabajo.routes');
app.use('/api/ordenes', ordenesRoutes);


// =================== RUTA DE SALUD ===================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SmartTech Manager API funcionando',
    timestamp: new Date(),
    database: db ? 'Conectado' : 'Desconectado'
  });
});

// El servidor se inicia en la función startServer después de la conexión a MongoDB
