import React, { useState, useEffect } from 'react';

const SearchBar = ({ menuItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(storedHistory);
  }, []);

  const saveSearchTerm = (term) => {
    if (term && !searchHistory.includes(term)) {
      const newHistory = [term, ...searchHistory.slice(0, 4)]; // Keep last 5 searches
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const filteredSuggestions = menuItems.filter(item =>
        item.name.toLowerCase().includes(term.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions(searchHistory);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    saveSearchTerm(suggestion);
  };

  return (
    <div className="relative mb-6">
      <input
        type="text"
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={handleSearchChange}
        onBlur={() => setTimeout(() => setSuggestions([]), 100)} // Hide suggestions on blur
        onFocus={() => searchTerm.length === 0 && setSuggestions(searchHistory)} // Show history on focus
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item, index) => (
            <li 
              key={item.id || `history-${index}`}
              className="p-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(item.name || item)}
            >
              {item.name || item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
