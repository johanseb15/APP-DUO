import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../api";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'lomitos',
    image_url: '',
    available: true
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.getMenuItems();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateProduct(editingItem.id, formData);
      } else {
        await api.createProduct(formData);
      }
      fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url,
      available: item.available
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await api.deleteProduct(itemId);
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'lomitos',
      image_url: '',
      available: true
    });
    setEditingItem(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Menú</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancelar' : 'Agregar Producto'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="menu-item-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  id="menu-item-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="menu-item-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  id="menu-item-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="menu-item-description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="menu-item-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="menu-item-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="menu-item-category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  <option value="lomitos">Lomitos</option>
                  <option value="hamburgers">Hamburguesas</option>
                  <option value="empanadas">Empanadas</option>
                </select>
              </div>
              <div>
                <label htmlFor="menu-item-image-url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Imagen
                </label>
                <input
                  id="menu-item-image-url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({...formData, available: e.target.checked})}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                Disponible
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                {editingItem ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.available ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              <p className="text-red-600 font-bold mb-3">${item.price.toLocaleString()}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;