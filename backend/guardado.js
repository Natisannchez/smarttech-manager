const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/guardado';

// Middleware
app.use(cors());
app.use(express.json());

let db;

// Conectar a MongoDB
MongoClient.connect(MONGODB_URI)
  .then(client => {
    console.log('Conectado a MongoDB');
    db = client.db();
  })
  .catch(error => {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  });

// Rutas de la API
app.post('/api/calendario', async (req, res) => {
    try {
        const { equipo, fecha, asistencias, periodo } = req.body;
        
        // Documento a guardar en MongoDB
        const documento = {
            equipo: equipo,
            fechaGuardado: new Date(fecha),
            periodo: periodo,
            asistencias: asistencias,
            timestamp: new Date()
        };
        
        // Guardar en la colección "calendario"
        const resultado = await db.collection('calendario').insertOne(documento);
        
        res.status(200).json({
            success: true,
            mensaje: 'Asistencias guardadas correctamente',
            id: resultado.insertedId
        });
        
    } catch (error) {
        console.error('Error al guardar asistencias:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error interno del servidor',
            error: error.message
        });
    }
});
