import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../api";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    delivery_fee: '',
    estimated_time: '',
    active: true
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await api.getDeliveryZones();
      setZones(response.data);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await api.updateDeliveryZone(editingZone.id, formData);
      } else {
        await api.createDeliveryZone(formData);
      }
      fetchZones();
      resetForm();
    } catch (error) {
      console.error('Error saving delivery zone:', error);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      delivery_fee: zone.delivery_fee.toString(),
      estimated_time: zone.estimated_time,
      active: zone.active
    });
    setShowForm(true);
  };

  const handleDelete = async (zoneId) => {
    if (window.confirm('¿Está seguro de eliminar esta zona?')) {
      try {
        await api.deleteDeliveryZone(zoneId);
        fetchZones();
      } catch (error) {
        console.error('Error deleting delivery zone:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      delivery_fee: '',
      estimated_time: '',
      active: true
    });
    setEditingZone(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Zonas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancelar' : 'Nueva Zona'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingZone ? 'Editar Zona' : 'Nueva Zona'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="zone-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  id="zone-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="zone-delivery-fee" className="block text-sm font-medium text-gray-700 mb-1">
                  Costo de Envío
                </label>
                <input
                  id="zone-delivery-fee"
                  type="number"
                  step="0.01"
                  value={formData.delivery_fee}
                  onChange={(e) => setFormData({...formData, delivery_fee: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-500"
                />
              </div>
              <div>
                <label htmlFor="zone-estimated-time" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo Estimado
                </label>
                <input
                  id="zone-estimated-time"
                  type="text"
                  value={formData.estimated_time}
                  onChange={(e) => setFormData({...formData, estimated_time: e.target.value})}
                  placeholder="30-45 min"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Activa
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                {editingZone ? 'Actualizar' : 'Crear'}
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
        {zones.map(zone => (
          <div key={zone.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{zone.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                zone.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {zone.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <p className="text-gray-600 mb-2">Envío: ${zone.delivery_fee.toLocaleString()}</p>
            <p className="text-gray-600 mb-4">Tiempo: {zone.estimated_time}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(zone)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(zone.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZoneManagement;