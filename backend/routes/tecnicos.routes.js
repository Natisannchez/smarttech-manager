const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');

// Middleware para conectar a MongoDB
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

// GET - Obtener todos los técnicos ordenados por nombre_apellido
router.get('/', connectDB, async (req, res) => {
    try {
        const tecnicos = await req.db.collection('tecnicos')
            .find({})
            .sort({ nombre_apellido: 1 })
            .toArray();
        res.json({ success: true, data: tecnicos });
    } catch (error) {
        console.error('Error al obtener técnicos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener la lista de técnicos' });
    } finally {
        if (req.dbClient) req.dbClient.close();
    }
});

// POST - Crear un nuevo técnico
router.post('/', connectDB, async (req, res) => {
    try {
        const { dni, nombre_apellido, telefono, direccion } = req.body;
        // Validar campos requeridos
        if (!dni || !nombre_apellido) {
            return res.status(400).json({ success: false, message: 'DNI y nombre/apellido son campos requeridos' });
        }
        // Verificar si el DNI ya existe
        const tecnicoExistente = await req.db.collection('tecnicos').findOne({ dni });
        if (tecnicoExistente) {
            return res.status(400).json({ success: false, message: 'Ya existe un técnico con ese DNI' });
        }
        const nuevoTecnico = {
            dni,
            nombre_apellido,
            telefono,
            direccion,
            activo: true // Por defecto activo
        };
        const result = await req.db.collection('tecnicos').insertOne(nuevoTecnico);
        res.status(201).json({ success: true, message: 'Técnico creado exitosamente', data: { ...nuevoTecnico, _id: result.insertedId } });
    } catch (error) {
        console.error('Error al crear técnico:', error);
        res.status(500).json({ success: false, message: 'Error al crear el técnico' });
    } finally {
        if (req.dbClient) req.dbClient.close();
    }
});

// PUT - Actualizar datos de un técnico
router.put('/:dni', connectDB, async (req, res) => {
    try {
        const { dni } = req.params;
        const { nombre_apellido, telefono, direccion } = req.body;
        if (!nombre_apellido) {
            return res.status(400).json({ success: false, message: 'El nombre/apellido es requerido' });
        }
        // Convertir el DNI a número para la comparación
        const dniNum = parseInt(dni);
        const result = await req.db.collection('tecnicos').updateOne(
            { dni: dniNum },
            { $set: { nombre_apellido, telefono, direccion } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Técnico no encontrado' });
        }
        res.json({ success: true, message: 'Técnico actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar técnico:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el técnico' });
    } finally {
        if (req.dbClient) req.dbClient.close();
    }
});

// PATCH - Cambiar estado de un técnico
router.patch('/:dni/toggle-estado', connectDB, async (req, res) => {
    try {
        const { dni } = req.params;
        // Convertir el DNI a número para la comparación
        const dniNum = parseInt(dni);
        // Primero obtenemos el estado actual
        const tecnico = await req.db.collection('tecnicos').findOne({ dni: dniNum });
        if (!tecnico) {
            return res.status(404).json({ success: false, message: 'Técnico no encontrado' });
        }
        // Invertimos el estado
        const nuevoEstado = !tecnico.activo;
        const result = await req.db.collection('tecnicos').updateOne(
            { dni: dniNum },
            { $set: { activo: nuevoEstado } }
        );
        res.json({ success: true, message: `Técnico ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`, data: { activo: nuevoEstado } });
    } catch (error) {
        console.error('Error al cambiar estado del técnico:', error);
        res.status(500).json({ success: false, message: 'Error al cambiar el estado del técnico' });
    } finally {
        if (req.dbClient) req.dbClient.close();
    }
});

module.exports = router;
