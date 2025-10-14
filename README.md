# SmartTech Manager

Proyecto universitario - Sistema de gestión para Smart Tech Mendoza

## ¿Qué es esto?

Este es nuestro proyecto final de la facultad. Creamos un sistema web para un servicio técnico real de Mendoza que repara equipos electrónicos. 

El problema que resolvemos es que actualmente no pueden diferenciar bien entre clientes comunes y empresas grandes (aseguradoras, hospitales), lo que les genera desorganización y atrasos.

## ¿Qué hace el sistema?

- **Maneja dos tipos de clientes**: Personas comunes y empresas
- **Crea órdenes de trabajo**: Para organizar las reparaciones
- **Muestra un panel principal**: Con números importantes del día
- **Sistema de login**: Para que solo personal autorizado entre
- **Se adapta al celular**: Funciona en cualquier dispositivo

## ¿Qué usamos para hacerlo?

**Frontend (lo que ve el usuario):**
- Vue 3 - Framework de JavaScript
- Vite - Para desarrollo rápido
- CSS - Para que se vea bonito

**Backend (servidor):**
- Node.js con Express
- MongoDB - Base de datos
- APIs REST

## ¿Cómo instalar?

**1. Clonar el proyecto:**
```bash
git clone [URL del repo]
cd smarttech-manager
```

**2. Instalar dependencias:**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

**3. Configurar MongoDB:**
```bash
# Instalar MongoDB
winget install --id MongoDB.Server -e

# Iniciar servicio
net start MongoDB
```

**4. Ejecutar todo:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## ¿Cómo probar?

1. Abre http://localhost:5173
2. Usuario: `admin` o `dev` o `MaxiG`
3. Contraseñas: `Recursos2025`, `pruebas12345`, `maxigg545`

## El caso real

**Smart Tech Mendoza** es un servicio técnico en Guaymallén que repara equipos para:
- Clientes particulares (gente común)
- Empresas grandes (seguros, hospitales)

Nuestro sistema les permite organizarse mejor y dar mejor servicio.

## Integrantes del grupo

[Agregar nombres aquí]

## Estado del proyecto

- ✅ Login funcionando
- ✅ Dashboard básico
- ✅ Conexión a base de datos
- 🚧 Gestión de clientes (en desarrollo)
- 📋 Órdenes de trabajo (pendiente)

---
*Proyecto de Ingeniería de Software - 2025*