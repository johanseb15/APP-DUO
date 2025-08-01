# CordoEats PWA 🍔

> **Progressive Web App para delivery de comida en Córdoba, Argentina**

Una aplicación web progresiva completa para CordoEats, especializada en lomitos, hamburguesas y empanadas con delivery en Córdoba. Incluye sistema de pedidos, dashboard de administración y notificaciones push.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![PWA](https://img.shields.io/badge/PWA-Ready-orange)

## 🌟 Características Principales

### Para Clientes
- 📱 **PWA Completa**: Instalable como app nativa, con botón de instalación mejorado.
- 🍽️ **Menú Interactivo**: Categorizado por lomitos, hamburguesas y empanadas, con cards de productos mejoradas.
- 🛒 **Carrito Inteligente**: Con selector de zonas, cálculo automático y gestos de deslizamiento para eliminar ítems.
- 📱 **Checkout WhatsApp**: Envío directo del pedido formateado.
- 🔔 **Notificaciones Push**: Promociones y horarios de apertura, con notificaciones de actualización de la app.
- 📍 **Zonas de Delivery**: Detección de ubicación para sugerir zonas (requiere backend con datos geográficos).
- 💰 **Precios en Pesos**: Adaptado al mercado argentino.
- 🔍 **Búsqueda Avanzada**: Con historial y sugerencias.

### Para Administradores
- 🔐 **Dashboard Seguro**: Autenticación JWT.
- 🍔 **Gestión de Menú**: CRUD completo de productos.
- 📋 **Gestión de Pedidos**: Filtrado y actualización de estados.
- 📍 **Gestión de Zonas**: Configuración de precios y tiempos.
- 🔔 **Envío de Notificaciones**: Sistema de push con plantillas.
- 📊 **Historial Completo**: Pedidos y notificaciones enviadas.

## 🛠️ Stack Tecnológico

### Frontend
- **React** - UI Library
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **React Router DOM** - Routing
- **Service Worker** - PWA Features
- **Zustand** - State management library
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Python Web Framework
- **Python** - Programming language
- **Motor** - Async MongoDB Driver
- **PyJWT** - Authentication
- **Pydantic** - Data Validation
- **python-dotenv** - Environment Variables
- **uvicorn** - ASGI server
- **pytest** - Testing framework
- **httpx** - Asynchronous HTTP client for testing
- **pytest-asyncio** - Pytest plugin for asynchronous tests
- **pytest-cov** - Test coverage reporting
- **faker** - For generating fake data in tests
- **asgi-lifespan** - For managing ASGI app lifespan in tests

### Base de Datos
- **MongoDB** - NoSQL Database

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD Workflows
- **Vercel** - Frontend Deployment
- **Google Cloud Run** - Backend Deployment

## 🚀 Instalación y Configuración

### Prerrequisitos
*   Node.js (LTS recomendado, v18+)
*   Python 3.10+
*   MongoDB (instancia local o servicio en la nube como MongoDB Atlas)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/johanseb15/Duo-previa.git food-pwa
cd food-pwa
```

### 2. Configurar Backend
Navega al directorio `backend`:
```bash
cd backend
```

**Crea un archivo `.env`:**
Crea un archivo llamado `.env` en el directorio `backend/` y añade tu cadena de conexión de MongoDB, clave secreta JWT y otras configuraciones.
```
# .env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=food_pwa_db
JWT_SECRET_KEY=your_super_secret_key_here_replace_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30
```

**Instala las dependencias de Python:**
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt # Para desarrollo y testing
```

### 3. Configurar Frontend
Navega al directorio `frontend`:
```bash
cd ../frontend
```

**Crea un archivo `.env`:**
Crea un archivo llamado `.env` en el directorio `frontend/` para configurar la URL de la API del backend.
```
# .env
REACT_APP_BACKEND_URL=http://localhost:8000
```

**Instala las dependencias de Node.js:**
```bash
npm install
```

## Uso

### Ejecutar el Backend
Desde el directorio `backend/`:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
La API del backend estará disponible en: `http://localhost:8000`.

### Ejecutar el Frontend
Desde el directorio `frontend/`:
```bash
npm start
```
La aplicación para clientes estará disponible en: `http://localhost:3000`.
El panel de administración estará disponible en: `http://localhost:3000/admin`.

### Inicializar Datos de Ejemplo
Para poblar tu base de datos con datos de ejemplo (un restaurante llamado "CordoEats", categorías, productos y un usuario superadministrador), haz una solicitud POST al endpoint `/initialize-data`.

**Credenciales de Superadministrador por Defecto (para inicialización):**
*   **Usuario:** `superadmin`
*   **Contraseña:** `admin123`
*   **Slug del Restaurante:** `superadmin` (Este es un slug ficticio usado solo para el login del superadministrador)

**Credenciales de Administrador del Restaurante por Defecto (para "CordoEats" después de la inicialización):**
*   **Usuario:** `admin`
*   **Contraseña:** `admin123`
*   **Slug del Restaurante:** `cordoeats`

### Ejecutar Tests (Backend)
Desde el directorio `backend/`:
```bash
pytest
```

## Estructura del Proyecto

```
food-pwa/
├── backend/                  # Lógica del servidor (API)
│   ├── auth.py               # Lógica de autenticación (hashing, JWT)
│   ├── config.py             # Configuración de la aplicación (Pydantic Settings)
│   ├── database.py           # Conexión a MongoDB y funciones de utilidad
│   ├── dependencies.py       # Inyección de dependencias de FastAPI
│   ├── exceptions.py         # Excepciones personalizadas
│   ├── main.py               # Aplicación principal de FastAPI, inclusión de routers
│   ├── models.py             # Modelos de datos Pydantic
│   ├── requirements.txt      # Dependencias de producción de Python
│   ├── requirements-dev.txt  # Dependencias de desarrollo/testing de Python
│   ├── services.py           # Lógica de negocio para interactuar con la base de datos
│   ├── .env                  # Variables de entorno (local)
│   ├── Dockerfile            # Dockerfile para el backend
│   ├── routers/              # Definiciones de endpoints de API (modularizados)
│   │   ├── analytics.py
│   │   ├── auth.py
│   │   ├── categories.py
│   │   ├── initialization.py # Endpoint para la configuración de datos de ejemplo
│   │   ├── orders.py
│   │   ├── products.py
│   │   └── push_notifications.py
│   └── tests/                # Tests unitarios y de integración del backend
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_e2e_flows.py
│       └── test_main.py
├── frontend/                 # Aplicación del cliente y panel de administración
│   ├── public/               # Activos públicos (index.html, manifest.json, etc.)
│   ├── src/                  # Código fuente de React
│   │   ├── App.js            # Aplicación principal para clientes
│   │   ├── AdminApp.js       # Aplicación del panel de administración
│   │   ├── api.js            # Llamadas a la API centralizadas al backend
│   │   ├── components/       # Componentes reutilizables (MenuItem, CartItem, etc.)
│   │   └── ...               # Otros componentes React, estilos, etc.
│   ├── package.json          # Dependencias y scripts de Node.js
│   ├── tailwind.config.js    # Configuración de Tailwind CSS
│   └── eslint.config.js      # Configuración de ESLint
└── README.md                 # Este archivo
```

## Despliegue

### Opciones Recomendadas

#### 1. Vercel (Frontend) + Google Cloud Run (Backend)

**Frontend en Vercel:**
Conecta tu repositorio de GitHub a Vercel. Asegúrate de configurar las siguientes variables de entorno en Vercel:
*   `REACT_APP_BACKEND_URL`: La URL de tu servicio de backend desplegado en Google Cloud Run.

**Backend en Google Cloud Run:**
El despliegue se gestiona a través de GitHub Actions (`.github/workflows/gcloud-run.yml`). Asegúrate de configurar los siguientes secretos en tu repositorio de GitHub (en `Settings > Secrets > Actions`):
*   `GCP_PROJECT_ID`: El ID de tu proyecto de Google Cloud.
*   `GCP_SA_KEY`: La clave de tu cuenta de servicio de Google Cloud (en formato JSON).
*   `GCP_REGION`: La región donde quieres desplegar el servicio (ej. `us-central1`).
*   `MONGODB_URL`: La URL de conexión a tu base de datos MongoDB.
*   `JWT_SECRET_KEY`: La clave secreta para JWT.
*   `ACCESS_TOKEN_EXPIRE_MINUTES`: Tiempo de expiración del token de acceso en minutos.
*   `REFRESH_TOKEN_EXPIRE_DAYS`: Tiempo de expiración del token de refresco en días.
*   `DATABASE_NAME`: El nombre de tu base de datos MongoDB.

#### 2. Docker Compose (Local o VPS)

```bash
# Construir imágenes
docker build -t cordoeats-backend ./backend
docker build -t cordoeats-frontend ./frontend

# Ejecutar con Docker Compose (requiere docker-compose.yml)
# docker-compose up -d
```

### Variables de Producción
```env
# Backend
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/your_db_name
DATABASE_NAME=your_production_db_name
JWT_SECRET_KEY=super_secure_production_key
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Frontend
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing (Manual)
- ✅ Diseño responsivo (móvil/desktop)
- ✅ Funcionalidad del carrito (añadir, eliminar, actualizar cantidad, gestos de deslizamiento)
- ✅ Integración con WhatsApp
- ✅ Dashboard administrativo
- ✅ Instalación de PWA y notificaciones de actualización
- ✅ Notificaciones push
- ✅ Búsqueda de productos con historial
- ✅ Detección de ubicación (verificar logs de consola)

## 📞 Contacto

**Proyecto**: CordoEats PWA  
**Desarrollado para**: Córdoba, Argentina  
**Stack**: React + FastAPI + MongoDB  
**Año**: 2024  

---

### 🎉 ¡Listo para servir los mejores lomitos de Córdoba!

**Demo**: [Ver aplicación en vivo](https://app-duo-johanseb15.vercel.app/)  
**Admin**: [Panel de administración](https://app-duo-johanseb15.vercel.app/admin)  
**Documentación API**: [Docs](https://your-backend-cloud-run-url/docs)

---

*Hecho con ❤️ en Córdoba, Argentina* 🇦🇷