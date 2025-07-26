# DUO Previa PWA 🍔

> **Progressive Web App para delivery de comida rápida en Córdoba, Argentina**

Una aplicación web progresiva completa para DUO Previa, especializada en lomitos, hamburguesas y empanadas con delivery en Córdoba. Incluye sistema de pedidos, dashboard de administración y notificaciones push.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![PWA](https://img.shields.io/badge/PWA-Ready-orange)

## 🌟 Características Principales

### Para Clientes
- 📱 **PWA Completa**: Instalable como app nativa
- 🍽️ **Menú Interactivo**: Categorizado por lomitos, hamburguesas y empanadas
- 🛒 **Carrito Inteligente**: Con selector de zonas y cálculo automático
- 📱 **Checkout WhatsApp**: Envío directo del pedido formateado
- 🔔 **Notificaciones Push**: Promociones y horarios de apertura
- 📍 **Zonas de Delivery**: Córdoba Centro, Nueva Córdoba, Cerro de las Rosas, Güemes
- 💰 **Precios en Pesos**: Adaptado al mercado argentino

### Para Administradores
- 🔐 **Dashboard Seguro**: Autenticación JWT
- 🍔 **Gestión de Menú**: CRUD completo de productos
- 📋 **Gestión de Pedidos**: Filtrado y actualización de estados
- 📍 **Gestión de Zonas**: Configuración de precios y tiempos
- 🔔 **Envío de Notificaciones**: Sistema de push con plantillas
- 📊 **Historial Completo**: Pedidos y notificaciones enviadas

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.0.0** - UI Library
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **React Router DOM** - Routing
- **Service Worker** - PWA Features

### Backend
- **FastAPI** - Python Web Framework
- **Motor** - Async MongoDB Driver
- **PyJWT** - Authentication
- **Pydantic** - Data Validation
- **Python-dotenv** - Environment Variables

### Base de Datos
- **MongoDB** - NoSQL Database
- **Collections**: menu_items, orders, delivery_zones, admin_users, push_subscriptions

### DevOps
- **Docker Ready** - Containerización
- **Nginx** - Reverse Proxy
- **Let's Encrypt** - SSL Certificates

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
# Node.js 16+
node --version

# Python 3.9+
python --version

# MongoDB (local o Atlas)
mongod --version
```

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd duo-previa-pwa
```

### 2. Configurar Backend
```bash
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

**Archivo `.env`:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=duo_previa
JWT_SECRET=your_super_secret_key_here
```

### 3. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend
```

**Archivo `.env`:**
```env
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=443
```

### 4. Inicializar Base de Datos
```bash
# Desde el directorio backend
python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

async def init_db():
    # La inicialización se hace automáticamente via API
    print('Base de datos lista')

asyncio.run(init_db())
"
```

## 🎯 Ejecución en Desarrollo

### Backend
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```
🌐 Backend disponible en: `http://localhost:8000`

### Frontend
```bash
cd frontend
npm start
```
🌐 Frontend disponible en: `http://localhost:3000`

### Inicializar Datos de Ejemplo
```bash
curl -X POST http://localhost:8000/api/initialize-data
```

## 🔑 Credenciales por Defecto

### Admin Dashboard
- **URL**: `/admin`
- **Email**: `admin@duoprevia.com`
- **Password**: `admin123`

⚠️ **Importante**: Cambiar credenciales en producción

## 📱 Funcionalidades del Cliente

### Navegación del Menú
1. **Página Principal**: Hero con branding argentino
2. **Categorías**: Todo, Lomitos, Hamburguesas, Empanadas
3. **Productos**: Cards con imágenes, descripciones y precios
4. **Carrito**: Modal con gestión completa

### Proceso de Pedido
1. **Seleccionar productos** → Agregar al carrito
2. **Elegir zona de delivery** → Cálculos automáticos
3. **Completar datos** → Información del cliente
4. **WhatsApp Checkout** → Mensaje formateado automático

### PWA Features
- **Instalación**: Prompt automático para instalar
- **Offline**: Cache de recursos principales
- **Notificaciones**: Suscripción con permisos

## 🔧 Panel de Administración

### Acceso
```
http://localhost:3000/admin
```

### Secciones

#### 1. Gestión de Menú
- ✅ Crear nuevos productos
- ✅ Editar existentes (nombre, precio, descripción, categoría, imagen)
- ✅ Eliminar productos
- ✅ Gestión de disponibilidad

#### 2. Gestión de Pedidos
- ✅ Ver todos los pedidos
- ✅ Filtrar por estado (pendiente, confirmado, preparando, entregado, cancelado)
- ✅ Actualizar estados
- ✅ Ver detalles completos del cliente

#### 3. Gestión de Zonas
- ✅ Crear/editar zonas de delivery
- ✅ Configurar precios de envío
- ✅ Establecer tiempos estimados
- ✅ Activar/desactivar zonas

#### 4. Notificaciones Push
- ✅ Plantillas predefinidas
- ✅ Notificaciones personalizadas
- ✅ Historial de envíos
- ✅ Gestión de suscriptores

## 🧪 Testing

### Backend Testing
```bash
cd backend
python ../backend_test.py
```

**Tests Incluidos:**
- ✅ Endpoints de menú y categorías
- ✅ Sistema de pedidos
- ✅ Zonas de delivery
- ✅ Autenticación admin
- ✅ CRUD de productos
- ✅ Gestión de órdenes
- ✅ Push notifications

### Frontend Testing (Manual)
- ✅ Responsive design (móvil/desktop)
- ✅ Funcionalidad del carrito
- ✅ Integración WhatsApp
- ✅ Dashboard administrativo
- ✅ PWA installation
- ✅ Push notifications

## 🌐 Deployment

### Opciones Recomendadas

#### 1. Vercel + Railway (Fácil)
```bash
# Frontend en Vercel
cd frontend
npx vercel --prod

# Backend en Railway
# Conectar repo GitHub a Railway
# Variables de entorno: MONGO_URL, DB_NAME
```

#### 2. Docker + VPS
```bash
# Construir imágenes
docker build -t duo-previa-backend ./backend
docker build -t duo-previa-frontend ./frontend

# Docker Compose
docker-compose up -d
```

#### 3. Manual en VPS
```bash
# Nginx + PM2 + MongoDB
sudo apt install nginx mongodb
npm install -g pm2

# Configurar reverse proxy
sudo nginx -t && sudo systemctl reload nginx
```

### Variables de Producción
```env
# Backend
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=duo_previa_prod
JWT_SECRET=super_secure_production_key

# Frontend
REACT_APP_BACKEND_URL=https://api.duoprevia.com
```

## 📊 Estructura del Proyecto

```
duo-previa-pwa/
├── backend/
│   ├── server.py              # FastAPI app principal
│   ├── requirements.txt       # Dependencias Python
│   └── .env                   # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── App.js            # Componente principal React
│   │   ├── App.css           # Estilos Tailwind
│   │   └── index.js          # Entry point
│   ├── public/
│   │   ├── manifest.json     # PWA manifest
│   │   ├── sw.js            # Service Worker
│   │   └── index.html       # HTML template
│   ├── package.json         # Dependencias Node
│   └── .env                 # Variables de entorno
├── backend_test.py          # Tests automatizados
├── test_result.md          # Resultados de testing
└── README.md               # Este archivo
```

## 🔄 API Endpoints

### Públicos
```http
GET    /api/menu                    # Obtener menú completo
GET    /api/menu/category/{cat}     # Menú por categoría
GET    /api/delivery-zones          # Zonas de delivery
POST   /api/orders                  # Crear pedido
POST   /api/push/subscribe          # Suscribirse a notificaciones
POST   /api/initialize-data         # Inicializar datos de ejemplo
```

### Admin (Requieren autenticación)
```http
POST   /api/admin/login             # Login admin
GET    /api/admin/me                # Info admin actual
POST   /api/admin/menu              # Crear producto
PUT    /api/admin/menu/{id}         # Actualizar producto
DELETE /api/admin/menu/{id}         # Eliminar producto
GET    /api/admin/orders            # Listar pedidos
PUT    /api/admin/orders/{id}/status # Actualizar estado
POST   /api/admin/delivery-zones    # Crear zona
PUT    /api/admin/delivery-zones/{id} # Actualizar zona
DELETE /api/admin/delivery-zones/{id} # Eliminar zona
POST   /api/admin/push/send         # Enviar notificación
GET    /api/admin/push/notifications # Historial notificaciones
```

## 🎨 Diseño y Branding

### Colores
- **Primario**: `#dc2626` (Rojo DUO Previa)
- **Secundario**: `#b91c1c` (Rojo Oscuro)
- **Éxito**: `#25d366` (Verde WhatsApp)
- **Fondo**: `#f9fafb` (Gris Claro)

### Tipografía
- **Principal**: Inter, -apple-system, BlinkMacSystemFont
- **Pesos**: 400 (normal), 600 (semibold), 700 (bold)

### Componentes
- **Cards**: Sombras suaves, bordes redondeados
- **Botones**: Transiciones suaves, estados hover
- **Formularios**: Focus states accesibles
- **Layout**: Responsive grid, mobile-first

## 🔔 Push Notifications

### Configuración del Service Worker
```javascript
// Subscription
navigator.serviceWorker.ready.then(registration => {
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_VAPID_KEY'
  });
});
```

### Envío desde Admin
1. **Plantillas**: Apertura, promociones, nuevos productos
2. **Personalización**: Título, mensaje, ícono, URL
3. **Historial**: Tracking de notificaciones enviadas

## 📱 WhatsApp Integration

### Formato del Mensaje
```
🍔 *PEDIDO DUO PREVIA* 🍔

📋 *DETALLE DEL PEDIDO:*
• Lomito Completo x2 - $9,000
• Hamburguesa DUO x1 - $4,200

💰 *RESUMEN:*
Subtotal: $13,200
Envío (Centro): $300
*TOTAL: $13,500*

👤 *DATOS DEL CLIENTE:*
Nombre: Juan Pérez
Teléfono: +54 351 123-4567
Zona: Centro
Dirección: Av. Colón 123, Centro, Córdoba

⏰ Tiempo estimado: 20-30 min
```

## 🛡️ Seguridad

### Implementadas
- ✅ JWT Authentication
- ✅ Password hashing (SHA-256)
- ✅ CORS configurado
- ✅ Input validation (Pydantic)
- ✅ SQL injection prevention (MongoDB)

### Recomendaciones para Producción
- 🔒 HTTPS obligatorio
- 🔒 Rate limiting
- 🔒 Input sanitization
- 🔒 Environment variables
- 🔒 Regular security updates

## 📈 Métricas y Analytics

### Implementar
- **Google Analytics**: Tracking de conversiones
- **Sentry**: Error monitoring
- **MongoDB Compass**: Database monitoring
- **Uptime Robot**: Availability monitoring

## 🤝 Contribución

### Desarrollo Local
1. Fork del repositorio
2. Crear branch para feature
3. Desarrollar y testear
4. Pull request con descripción detallada

### Estándares de Código
- **Python**: PEP 8, type hints
- **JavaScript**: ESLint, Prettier
- **CSS**: Tailwind utilities
- **Commits**: Conventional commits

## 🐛 Troubleshooting

### Errores Comunes

#### Backend no inicia
```bash
# Verificar MongoDB
mongod --version
sudo systemctl status mongodb

# Verificar puerto
lsof -i :8000
```

#### Frontend no conecta
```bash
# Verificar variables de entorno
cat frontend/.env

# Verificar CORS
curl -I http://localhost:8000/api/menu
```

#### PWA no instala
```bash
# Verificar HTTPS en producción
# Verificar manifest.json
# Verificar service worker registration
```

## 📄 Licencia

Este proyecto es parte del portafolio de desarrollo. Contacta para uso comercial.

## 📞 Contacto

**Proyecto**: DUO Previa PWA  
**Desarrollado para**: Córdoba, Argentina  
**Stack**: React + FastAPI + MongoDB  
**Año**: 2024  

---

### 🎉 ¡Listo para servir los mejores lomitos de Córdoba!

**Demo**: [Ver aplicación en vivo](#)  
**Admin**: [Panel de administración](#)  
**Documentación**: [API Docs](#)

---

*Hecho con ❤️ en Córdoba, Argentina* 🇦🇷