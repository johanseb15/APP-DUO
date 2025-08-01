import React from 'react';

const MenuCategories = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { id: 'all', name: 'Todo', icon: '🍽️' },
    { id: 'lomitos', name: 'Lomitos', icon: '🥪' },
    { id: 'hamburgers', name: 'Hamburguesas', icon: '🍔' },
    { id: 'empanadas', name: 'Empanadas', icon: '🥟' }
  ];

  return (
    <div className="flex overflow-x-auto pb-2 mb-6 space-x-4">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 transform hover:scale-105 category-pill ${
            activeCategory === category.id
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-105'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default MenuCategories;
