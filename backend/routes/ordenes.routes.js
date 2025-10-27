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

    // GET - Obtener todas las órdenes ordenadas por fecha_ingreso
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
                { $unwind: { path: '$cliente', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$producto', preserveNullAndEmptyArrays: true } },
                { $sort: { fecha_ingreso: -1 } }
            ]).toArray();
            res.json({ success: true, data: ordenes });
        } catch (error) {
            console.error('Error al obtener órdenes:', error);
            if (error && error.stack) {
                console.error('Stack:', error.stack);
            }
            res.status(500).json({ success: false, message: error.message || 'Error al obtener la lista de órdenes', error });
        } finally {
            if (req.dbClient) req.dbClient.close();
        }
    });

    // POST - Crear una nueva orden de trabajo
    router.post('/', connectDB, async (req, res) => {
    try {
        const {
        cliente_dni,
        producto_numero_serie,
        descripcion_falla,
        codigo_orden_visible_manual,
        fecha_ingreso,
        observaciones,
        estado
        } = req.body;

        // Validar campos requeridos
        if (!cliente_dni || !producto_numero_serie || !descripcion_falla) {
        return res.status(400).json({
            success: false,
            message: 'DNI, número de serie y descripción de falla son obligatorios'
        });
        }

        // Buscar cliente
        const cliente = await req.db.collection('clientes').findOne({ dni: String(cliente_dni).trim() });
        if (!cliente) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        // Buscar producto
        const producto = await req.db.collection('productos').findOne({ numero_serie: String(producto_numero_serie).trim() });
        if (!producto) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        // Generar código visible
        let codigo_orden_visible = cliente.tipo_cliente === 'empresa'
        ? codigo_orden_visible_manual
        : String(Date.now());

        // Validar código externo para empresa
        if (cliente.tipo_cliente === 'empresa' && !codigo_orden_visible_manual) {
        return res.status(400).json({
            success: false,
            message: 'Debe ingresar un número de orden externo para clientes empresa'
        });
        }

        // Verificar si ya existe una orden con ese código
        if (cliente.tipo_cliente === 'empresa') {
        const ordenExistente = await req.db.collection('ordenes_trabajo').findOne({ codigo_orden_visible: String(codigo_orden_visible).trim() });
        if (ordenExistente) {
            return res.status(400).json({
            success: false,
            message: 'Ya existe una orden con ese número de orden externo'
            });
        }
        }

        const nuevaOrden = {
        codigo_orden_visible: String(codigo_orden_visible).trim(),
        cliente_dni: String(cliente_dni).trim(),
        producto_numero_serie: String(producto_numero_serie).trim(),
        fecha_ingreso: fecha_ingreso ? new Date(fecha_ingreso) : new Date(),
        descripcion_falla: String(descripcion_falla).trim(),
        observaciones: observaciones || '',
        estado: estado || 'Ingresado',
        historial: [{
            fecha: new Date(),
            estado: estado || 'Ingresado',
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
        res.status(500).json({ success: false, message: error.message || 'Error al crear la orden de trabajo' });
    } finally {
        if (req.dbClient) req.dbClient.close();
    }
    });

    // PUT - Actualizar una orden de trabajo
    router.put('/:id', connectDB, async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, descripcion_falla, observaciones } = req.body;

        const result = await req.db.collection('ordenes_trabajo').updateOne(
        { codigo_orden_visible: id },
        { $set: { estado, descripcion_falla, observaciones } }
        );

        if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: 'Orden de trabajo no encontrada' });
        }

        res.json({ success: true, message: 'Orden de trabajo actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar orden:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la orden de trabajo' });
    } finally {
        if (req.dbClient) req.dbClient.close();
    }
    });

    // DELETE - Eliminar una orden de trabajo
    router.delete('/:id', connectDB, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.db.collection('ordenes_trabajo').deleteOne({ codigo_orden_visible: id });
        if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Orden de trabajo no encontrada' });
        }
        res.json({ success: true, message: 'Orden de trabajo eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar orden:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar la orden de trabajo' });
    } finally {
        if (req.dbClient) req.dbClient.close();
    }
    });

    module.exports = router;
