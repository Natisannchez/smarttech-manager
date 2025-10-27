const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const config = require('./config');
const PORT = config.PORT;
const MONGODB_URI = config.MONGODB_URI;

// =================== MIDDLEWARE ===================
app.use(cors());
app.use(express.json());

let db;

// =================== IMPORTAR RUTAS ===================
const clientesRoutes       = require('./routes/clientes.routes');
const tecnicosRoutes       = require('./routes/tecnicos.routes');
const ordenesRoutes        = require('./routes/ordenes.routes');
const ordenesAgendaRoutes  = require('./routes/ordenesAgenda.routes'); // nuevo
const agendaRoutes         = require('./routes/agenda.routes');        // nuevo

// =================== FUNCIÓN PARA INICIAR SERVER ===================
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 API disponible en: http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  });
};

// =================== CONEXIÓN A MONGODB ===================
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then(client => {
    console.log('🟢 Conectado a MongoDB - SmartTech Manager');
    db = client.db('smarttech');
    console.log(`📊 Base de datos: ${db.databaseName}`);

    // Configurar rutas con conexión activa
    configureRoutes(db);

    // Iniciar servidor
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

    // Login simple
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

// =================== CONFIGURACIÓN DE RUTAS ===================
const configureRoutes = (database) => {
  // Productos (requiere initDB)
  const productosRoutes = require('./routes/productos.routes');
  productosRoutes.initDB(database);
  app.use('/api/productos', productosRoutes);

  // Clientes
  app.use('/api/clientes', clientesRoutes);

  // Técnicos
  app.use('/api/tecnicos', tecnicosRoutes);

  // Órdenes de trabajo CRUD
  app.use('/api/ordenes', ordenesRoutes);

  // Listados y filtros de agenda
  app.use('/api/ordenes-agenda', ordenesAgendaRoutes);

  // Programar y listar agenda
  app.use('/api/agenda', agendaRoutes);
};

// =================== RUTA DE SALUD ===================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SmartTech Manager API funcionando',
    timestamp: new Date(),
    database: db ? 'Conectado' : 'Desconectado'
  });
});

// El servidor se inicia en startServer() después de la conexión
