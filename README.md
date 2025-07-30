# Food PWA: Multi-Tenant Food Delivery Progressive Web App

## Project Overview

This project is a robust and scalable Progressive Web Application (PWA) designed for multi-tenant food delivery services. It features a customer-facing application for ordering food and a comprehensive admin dashboard for managing restaurants, menus, orders, and more. Built with a modern tech stack, it emphasizes modularity, performance, and a great user experience.

## Features

### Customer Application (Frontend)
*   **Modern & Responsive Design:** Built with React and Tailwind CSS for a seamless experience across devices.
*   **Interactive Menu:** Browse products categorized by various criteria.
*   **Smart Cart:** Add items, customize orders, and calculate totals.
*   **WhatsApp Checkout:** Direct order submission via WhatsApp with pre-formatted messages.
*   **PWA Capabilities:** Installable as a native app, offline support, and push notifications.

### Admin Dashboard (Frontend)
*   **Secure Login:** Authenticated access for restaurant administrators.
*   **Product Management:** Full CRUD (Create, Read, Update, Delete) operations for menu items, including details like prices, images, allergens, sizes, and toppings.
*   **Category Management:** Organize menu items into categories with custom icons and display order.
*   **Order Management:** View and update order statuses in real-time.
*   **Restaurant Settings:** Configure restaurant-specific details like delivery fees, minimum order amounts, and operating hours.
*   **Push Notifications:** Send and manage push notifications to customers.

### Backend API
*   **Multi-Tenancy:** Designed to support multiple independent restaurants, each with its own data and administration.
*   **Modular Architecture:** Clean separation of concerns with dedicated modules for authentication, database interactions, business logic (services), and API routing.
*   **Robust Authentication:** JWT-based authentication with access and refresh tokens, password hashing, and role-based access control (Admin, Superadmin).
*   **Scalable Data Models:** Comprehensive Pydantic models for restaurants, users, categories, products, orders, and push notifications.

## Tech Stack

### Frontend
*   **React:** UI Library
*   **Tailwind CSS:** Utility-first CSS framework for rapid styling
*   **Framer Motion:** Animation library for smooth UI transitions
*   **Lucide React:** Icon library
*   **Zustand:** State management library
*   **React Router DOM:** Declarative routing
*   **Axios:** HTTP client for API requests
*   **ESLint:** Code linting (using flat config)
*   **PWA:** Service Worker and Web App Manifest for installability and offline capabilities

### Backend
*   **FastAPI:** High-performance web framework for building APIs
*   **Python:** Programming language
*   **MongoDB (Motor):** Asynchronous Python driver for MongoDB
*   **python-jose:** JWT (JSON Web Token) implementation
*   **passlib:** Password hashing library
*   **python-dotenv:** For managing environment variables
*   **uvicorn:** ASGI server
*   **pytest:** Testing framework
*   **httpx:** Asynchronous HTTP client for testing
*   **pytest-asyncio:** Pytest plugin for asynchronous tests
*   **pytest-cov:** Test coverage reporting
*   **faker:** For generating fake data in tests
*   **asgi-lifespan:** For managing ASGI app lifespan in tests

### Database
*   **MongoDB:** NoSQL database for flexible data storage.

## Installation & Setup

### Prerequisites
*   Node.js (LTS recommended)
*   Python 3.9+
*   MongoDB (local instance or cloud service like MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/johanseb15/Duo-previa.git food-pwa
cd food-pwa
```

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```

**Create a `.env` file:**
Create a file named `.env` in the `backend/` directory and add your MongoDB connection string and JWT secret.
```
# .env
MONGO_URL=mongodb://localhost:27017
DB_NAME=food_pwa_db
JWT_SECRET_KEY=your_super_secret_key_here_replace_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30
```

**Install Python Dependencies:**
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt # For development and testing
```

### 3. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd ../frontend
```

**Create a `.env` file:**
Create a file named `.env` in the `frontend/` directory to configure the backend API URL.
```
# .env
REACT_APP_BACKEND_URL=http://localhost:8000
```

**Install Node.js Dependencies:**
```bash
npm install
```

## Usage

### Running the Backend
From the `backend/` directory:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The backend API will be available at `http://localhost:8000`.

### Running the Frontend
From the `frontend/` directory:
```bash
npm start
```
The customer application will be available at `http://localhost:3000`.
The admin dashboard will be available at `http://localhost:3000/admin`.

### Initializing Sample Data
To populate your database with sample data (a restaurant named "DUO Previa", categories, products, and a superadmin user), make a POST request to the `/initialize-data` endpoint.

**Default Superadmin Credentials (for initialization):**
*   **Username:** `superadmin`
*   **Password:** `admin123`
*   **Restaurant Slug:** `superadmin` (This is a dummy slug used only for superadmin login)

**Default Restaurant Admin Credentials (for "DUO Previa" after initialization):**
*   **Username:** `admin`
*   **Password:** `admin123`
*   **Restaurant Slug:** `duo-previa`

### Running Tests (Backend)
From the `backend/` directory:
```bash
pytest
```

## Project Structure

```
food-pwa/
├── backend/
│   ├── auth.py                 # Authentication logic (hashing, JWT)
│   ├── database.py             # MongoDB connection and utility functions
│   ├── dependencies.py         # FastAPI dependency injection (e.g., get_current_user)
│   ├── main.py                 # Main FastAPI application, router inclusion
│   ├── models.py               # Pydantic data models for all entities
│   ├── requirements.txt        # Python production dependencies
│   ├── requirements-dev.txt    # Python development/testing dependencies
│   ├── services.py             # Business logic for interacting with database
│   ├── .env                    # Environment variables (local)
│   ├── routers/                # API endpoint definitions (modularized)
│   │   ├── analytics.py
│   │   ├── auth.py
│   │   ├── categories.py
│   │   ├── initialization.py   # Endpoint for sample data setup
│   │   ├── orders.py
│   │   ├── products.py
│   │   └── push_notifications.py
│   └── tests/                  # Backend unit and integration tests
│       ├── conftest.py         # Pytest fixtures and test setup
│       ├── test_auth.py
│       ├── test_e2e_flows.py
│       └── test_main.py
├── frontend/
│   ├── public/                 # Public assets (index.html, manifest.json, etc.)
│   ├── src/                    # React source code
│   │   ├── App.js              # Customer-facing application
│   │   ├── AdminApp.js         # Admin dashboard application
│   │   ├── api.js              # Centralized API calls to backend
│   │   └── ...                 # Other React components, styles, etc.
│   ├── package.json            # Node.js dependencies and scripts
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── eslint.config.js        # ESLint flat configuration
└── README.md                   # This file
```