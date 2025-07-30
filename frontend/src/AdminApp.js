import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Package, List, Settings, LogOut, Utensils, Bell } from 'lucide-react';
import { login, setAuthToken } from './api.js';

// Placeholder Components
const Dashboard = () => (
  <div className="p-8">
    <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
    <p>Welcome to the admin dashboard!</p>
  </div>
);

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const user = JSON.parse(localStorage.getItem('admin_user'));
  const restaurantSlug = user?.restaurant_slug;

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(restaurantSlug),
        getCategories(restaurantSlug),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantSlug) {
      fetchProductsAndCategories();
    }
  }, [restaurantSlug]);

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(restaurantSlug, productId);
        fetchProductsAndCategories(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete product');
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (currentProduct) {
        await updateProduct(restaurantSlug, currentProduct.id, productData);
      } else {
        await createProduct(restaurantSlug, productData);
      }
      setIsModalOpen(false);
      fetchProductsAndCategories(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product');
    }
  };

  if (loading) return <div className="p-8">Loading products...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Product Management</h2>
      <button
        onClick={handleAddProduct}
        className="bg-red-600 text-white px-4 py-2 rounded-md mb-6 hover:bg-red-700"
      >
        Add New Product
      </button>

      {products.length === 0 ? (
        <p>No products found. Add some!</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{product.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {categories.find(cat => cat.id === product.category_id)?.name || 'N/A'}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">${product.price.toFixed(2)}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${product.is_available ? 'text-green-900' : 'text-red-900'}`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${product.is_available ? 'bg-green-200' : 'bg-red-200'}`}></span>
                      <span className="relative">{product.is_available ? 'Yes' : 'No'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button onClick={() => handleEditProduct(product)} className="text-red-600 hover:text-red-900 mr-3">Edit</button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ProductModal
          product={currentProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

const ProductModal = ({ product, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category_id: '',
    is_available: true,
    is_popular: false,
    is_vegetarian: false,
    is_vegan: false,
    allergens: [],
    preparation_time: 15,
    sizes: [],
    toppings: [],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        image: product.image || '',
        category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
        is_available: product.is_available !== undefined ? product.is_available : true,
        is_popular: product.is_popular !== undefined ? product.is_popular : false,
        is_vegetarian: product.is_vegetarian !== undefined ? product.is_vegetarian : false,
        is_vegan: product.is_vegan !== undefined ? product.is_vegan : false,
        allergens: product.allergens || [],
        preparation_time: product.preparation_time || 15,
        sizes: product.sizes || [],
        toppings: product.toppings || [],
      });
    } else if (categories.length > 0) {
      setFormData(prev => ({ ...prev, category_id: categories[0].id }));
    }
  }, [product, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAllergenChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      allergens: checked
        ? [...prev.allergens, value]
        : prev.allergens.filter(allergen => allergen !== value),
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const addSize = () => {
    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, { name: '', price: 0 }] }));
  };

  const removeSize = (index) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));
  };

  const handleToppingChange = (index, field, value) => {
    const newToppings = [...formData.toppings];
    newToppings[index][field] = value;
    setFormData(prev => ({ ...prev, toppings: newToppings }));
  };

  const addTopping = () => {
    setFormData(prev => ({ ...prev, toppings: [...prev.toppings, { name: '', price: 0, is_vegetarian: false }] }));
  };

  const removeTopping = (index) => {
    setFormData(prev => ({ ...prev, toppings: prev.toppings.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const commonInputClasses = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";
  const commonLabelClasses = "block text-gray-700 text-sm font-bold mb-2";

  const allAllergens = ['Gluten', 'Lactose', 'Nuts', 'Soy', 'Eggs', 'Fish', 'Shellfish'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{product ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={commonLabelClasses} htmlFor="name">Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={commonInputClasses} required />
            </div>
            <div>
              <label className={commonLabelClasses} htmlFor="price">Price</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className={commonInputClasses} step="0.01" required />
            </div>
            <div>
              <label className={commonLabelClasses} htmlFor="category_id">Category</label>
              <select name="category_id" id="category_id" value={formData.category_id} onChange={handleChange} className={commonInputClasses} required>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={commonLabelClasses} htmlFor="image">Image URL</label>
              <input type="text" name="image" id="image" value={formData.image} onChange={handleChange} className={commonInputClasses} />
            </div>
          </div>

          <div className="mb-4">
            <label className={commonLabelClasses} htmlFor="description">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} className={`${commonInputClasses} h-24`} required></textarea>
          </div>

          {/* Checkboxes for product attributes */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="inline-flex items-center">
              <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} className="form-checkbox h-5 w-5 text-red-600" />
              <span className="ml-2 text-gray-700">Available</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" name="is_popular" checked={formData.is_popular} onChange={handleChange} className="form-checkbox h-5 w-5 text-red-600" />
              <span className="ml-2 text-gray-700">Popular</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" name="is_vegetarian" checked={formData.is_vegetarian} onChange={handleChange} className="form-checkbox h-5 w-5 text-red-600" />
              <span className="ml-2 text-gray-700">Vegetarian</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" name="is_vegan" checked={formData.is_vegan} onChange={handleChange} className="form-checkbox h-5 w-5 text-red-600" />
              <span className="ml-2 text-gray-700">Vegan</span>
            </label>
          </div>

          {/* Allergens */}
          <div className="mb-4">
            <label className={commonLabelClasses}>Allergens</label>
            <div className="grid grid-cols-3 gap-2">
              {allAllergens.map(allergen => (
                <label key={allergen} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={allergen}
                    checked={formData.allergens.includes(allergen)}
                    onChange={handleAllergenChange}
                    className="form-checkbox h-5 w-5 text-red-600"
                  />
                  <span className="ml-2 text-gray-700">{allergen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-4 border p-4 rounded-md">
            <h3 className="text-lg font-bold mb-2">Sizes</h3>
            {formData.sizes.map((size, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Size Name (e.g., Small)"
                  value={size.name}
                  onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                  className={commonInputClasses}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={size.price}
                  onChange={(e) => handleSizeChange(index, 'price', parseFloat(e.target.value) || 0)}
                  className={commonInputClasses}
                  step="0.01"
                />
                <button type="button" onClick={() => removeSize(index)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addSize} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2">Add Size</button>
          </div>

          {/* Toppings */}
          <div className="mb-6 border p-4 rounded-md">
            <h3 className="text-lg font-bold mb-2">Toppings</h3>
            {formData.toppings.map((topping, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Topping Name (e.g., Extra Cheese)"
                  value={topping.name}
                  onChange={(e) => handleToppingChange(index, 'name', e.target.value)}
                  className={commonInputClasses}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={topping.price}
                  onChange={(e) => handleToppingChange(index, 'price', parseFloat(e.target.value) || 0)}
                  className={commonInputClasses}
                  step="0.01"
                />
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={topping.is_vegetarian}
                    onChange={(e) => handleToppingChange(index, 'is_vegetarian', e.target.checked)}
                    className="form-checkbox h-5 w-5 text-red-600"
                  />
                  <span className="ml-2 text-gray-700">Vegetarian</span>
                </label>
                <button type="button" onClick={() => removeTopping(index)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addTopping} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2">Add Topping</button>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const user = JSON.parse(localStorage.getItem('admin_user'));
  const restaurantSlug = user?.restaurant_slug;

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategories(restaurantSlug);
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantSlug) {
      fetchCategories();
    }
  }, [restaurantSlug]);

  const handleAddCategory = () => {
    setCurrentCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(restaurantSlug, categoryId);
        fetchCategories(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete category');
      }
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (currentCategory) {
        await updateCategory(restaurantSlug, currentCategory.id, categoryData);
      } else {
        await createCategory(restaurantSlug, categoryData);
      }
      setIsModalOpen(false);
      fetchCategories(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save category');
    }
  };

  if (loading) return <div className="p-8">Loading categories...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Category Management</h2>
      <button
        onClick={handleAddCategory}
        className="bg-red-600 text-white px-4 py-2 rounded-md mb-6 hover:bg-red-700"
      >
        Add New Category
      </button>

      {categories.length === 0 ? (
        <p>No categories found. Add some!</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Icon</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Active</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{category.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{category.icon}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{category.description || '-'}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{category.display_order}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${category.is_active ? 'text-green-900' : 'text-red-900'}`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${category.is_active ? 'bg-green-200' : 'bg-red-200'}`}></span>
                      <span className="relative">{category.is_active ? 'Yes' : 'No'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button onClick={() => handleEditCategory(category)} className="text-red-600 hover:text-red-900 mr-3">Edit</button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <CategoryModal
          category={currentCategory}
          onSave={handleSaveCategory}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

const CategoryModal = ({ category, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        icon: category.icon || '',
        description: category.description || '',
        display_order: category.display_order || 0,
        is_active: category.is_active !== undefined ? category.is_active : true,
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const commonInputClasses = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";
  const commonLabelClasses = "block text-gray-700 text-sm font-bold mb-2";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{category ? 'Edit Category' : 'Add New Category'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={commonLabelClasses} htmlFor="name">Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={commonInputClasses} required />
          </div>
          <div className="mb-4">
            <label className={commonLabelClasses} htmlFor="icon">Icon (e.g., 🍕)</label>
            <input type="text" name="icon" id="icon" value={formData.icon} onChange={handleChange} className={commonInputClasses} />
          </div>
          <div className="mb-4">
            <label className={commonLabelClasses} htmlFor="description">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} className={`${commonInputClasses} h-20`}></textarea>
          </div>
          <div className="mb-4">
            <label className={commonLabelClasses} htmlFor="display_order">Display Order</label>
            <input type="number" name="display_order" id="display_order" value={formData.display_order} onChange={handleChange} className={commonInputClasses} />
          </div>
          <div className="mb-6">
            <label className="inline-flex items-center">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="form-checkbox h-5 w-5 text-red-600" />
              <span className="ml-2 text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const user = JSON.parse(localStorage.getItem('admin_user'));
  const restaurantSlug = user?.restaurant_slug;

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrders(restaurantSlug);
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantSlug) {
      fetchOrders();
    }
  }, [restaurantSlug]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(restaurantSlug, orderId, newStatus);
      fetchOrders(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update order status');
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Order Management</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order #</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{order.order_number}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{order.customer.name}</p>
                    <p className="text-gray-600 whitespace-no-wrap text-xs">{order.customer.phone}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">${order.total.toFixed(2)}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${order.status === 'delivered' ? 'text-green-900' : order.status === 'cancelled' ? 'text-red-900' : 'text-yellow-900'}`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${order.status === 'delivered' ? 'bg-green-200' : order.status === 'cancelled' ? 'bg-red-200' : 'bg-yellow-200'}`}></span>
                      <span className="relative">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button onClick={() => setSelectedOrder(order)} className="text-red-600 hover:text-red-900 mr-3">View</button>
                    <select
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      value={order.status}
                      className="border rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Order #{order.order_number}</h2>
        <div className="mb-4">
          <h3 className="font-semibold">Customer Info:</h3>
          <p>Name: {order.customer.name}</p>
          <p>Phone: {order.customer.phone}</p>
          <p>Address: {order.customer.delivery_address}</p>
          {order.customer.email && <p>Email: {order.customer.email}</p>}
          {order.customer.delivery_notes && <p>Notes: {order.customer.delivery_notes}</p>}
        </div>
        <div className="mb-4">
          <h3 className="font-semibold">Items:</h3>
          <ul>
            {order.items.map((item, index) => (
              <li key={index} className="mb-2 border-b pb-2 last:border-b-0">
                <p>{item.quantity}x {item.product_name} - ${item.total_price.toFixed(2)}</p>
                {item.customization && (
                  <div className="text-sm text-gray-600 ml-4">
                    {item.customization.size && <p>Size: {item.customization.size}</p>}
                    {item.customization.toppings && item.customization.toppings.length > 0 && (
                      <p>Toppings: {item.customization.toppings.join(', ')}</p>
                    )}
                    {item.customization.special_instructions && <p>Instructions: {item.customization.special_instructions}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <p className="font-semibold">Subtotal: ${order.subtotal.toFixed(2)}</p>
          <p className="font-semibold">Delivery Fee: ${order.delivery_fee.toFixed(2)}</p>
          <p className="text-xl font-bold">Total: ${order.total.toFixed(2)}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold">Status:</h3>
          <select
            onChange={(e) => onUpdateStatus(order.id, e.target.value)}
            value={order.status}
            className="border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsScreen = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('admin_user'));
  const restaurantSlug = user?.restaurant_slug;

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRestaurantBySlug(restaurantSlug);
      setSettings(response.data.settings);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantSlug) {
      fetchSettings();
    }
  }, [restaurantSlug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await updateRestaurant(restaurantSlug, { settings });
      alert('Settings updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save settings');
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  if (!settings) return <div className="p-8">No settings found.</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Restaurant Settings</h2>
      <form onSubmit={handleSaveSettings} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="min_order_amount">Minimum Order Amount</label>
          <input type="number" name="min_order_amount" id="min_order_amount" value={settings.min_order_amount} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" step="0.01" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="delivery_fee">Delivery Fee</label>
          <input type="number" name="delivery_fee" id="delivery_fee" value={settings.delivery_fee} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" step="0.01" />
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input type="checkbox" name="is_open" checked={settings.is_open} onChange={handleChange} className="form-checkbox h-5 w-5 text-red-600" />
            <span className="ml-2 text-gray-700">Is Open</span>
          </label>
        </div>
        <div className="mb-6">
          <label className="inline-flex items-center">
            <input type="checkbox" name="accept_cash" checked={settings.accept_cash} onChange={handleChange} className="form-checkbox h-5 w-5 text-red-600" />
            <span className="ml-2 text-gray-700">Accept Cash</span>
          </label>
        </div>
        <div className="mb-6">
          <label className="inline-flex items-center">
            <input type="checkbox" name="accept_cards" checked={settings.accept_cards} onChange={handleChange} className="form-checkbox h-5 w-5 text-red-600" />
            <span className="ml-2 text-gray-700">Accept Cards</span>
          </label>
        </div>

        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

const PushNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    icon: '',
    url: '',
  });

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSentNotifications();
      setNotifications(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotificationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await sendPushNotification(notificationForm);
      setNotificationForm({ title: '', body: '', icon: '', url: '' });
      fetchNotifications(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send notification');
    }
  };

  if (loading) return <div className="p-8">Loading notifications...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Push Notifications</h2>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Send New Notification</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
            <input type="text" name="title" id="title" value={notificationForm.title} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="body">Body</label>
            <textarea name="body" id="body" value={notificationForm.body} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24" required></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icon">Icon URL (Optional)</label>
            <input type="text" name="icon" id="icon" value={notificationForm.icon} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">URL (Optional)</label>
            <input type="text" name="url" id="url" value={notificationForm.url} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Send Notification
          </button>
        </form>
      </div>

      <h3 className="text-xl font-bold mb-4">Sent Notifications</h3>
      {notifications.length === 0 ? (
        <p>No notifications sent yet.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Body</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif) => (
                <tr key={notif.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{notif.title}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{notif.body}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{new Date(notif.sent_at).toLocaleString()}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(username, password, restaurantSlug);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="restaurantSlug">Restaurant Slug</label>
            <input
              type="text"
              id="restaurantSlug"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={restaurantSlug}
              onChange={(e) => setRestaurantSlug(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_access_token');
    const storedUser = localStorage.getItem('admin_user');
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (username, password, restaurantSlug) => {
    const response = await login(username, password, restaurantSlug);
    const { access_token, user: userData } = response.data;
    localStorage.setItem('admin_access_token', access_token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setAuthToken(access_token);
    setUser(userData);
    setIsAuthenticated(true);
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-red-600">Admin Panel</h1>
          {user && <p className="text-sm text-gray-500 mt-1">{user.restaurant_name}</p>}
        </div>
        <nav className="flex-grow p-4">
          <ul>
            <li className="mb-2">
              <Link to="/admin/dashboard" className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200">
                <Home className="w-5 h-5 mr-3" /> Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/products" className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200">
                <Package className="w-5 h-5 mr-3" /> Products
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/categories" className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200">
                <List className="w-5 h-5 mr-3" /> Categories
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/orders" className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200">
                <Utensils className="w-5 h-5 mr-3" /> Orders
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/notifications" className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200">
                <Bell className="w-5 h-5 mr-3" /> Notifications
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link to="/admin/settings" className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200 mb-2">
            <Settings className="w-5 h-5 mr-3" /> Settings
          </Link>
          <button onClick={handleLogout} className="flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors duration-200">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/settings" element={<SettingsScreen />} />
          <Route path="/admin/notifications" element={<PushNotifications />} />
          {/* Redirect to dashboard by default */}
          <Route path="/admin/*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}