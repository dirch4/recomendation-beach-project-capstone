import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import cleaned_data from '../../data/cleaned_data.json';

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('keyword') || '';

  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [debouncedTerm, setDebouncedTerm] = useState(initialKeyword);
  const [minRating, setMinRating] = useState(0);

  // Debounce pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredPlaces = cleaned_data.filter(place =>
    place.name.toLowerCase().includes(debouncedTerm.toLowerCase()) &&
    place.rating >= minRating
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Cari tempat wisata <span className="text-blue-600">{debouncedTerm}</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari pantai atau lokasi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={0}>Rating berapa saja</option>
          <option value={4}>Minimal 4.0</option>
          <option value={4.5}>Minimal 4.5</option>
        </select>
      </div>

      {filteredPlaces.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">Tidak ditemukan hasil untuk <strong>{debouncedTerm}</strong>.</p>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlaces.map((place) => (
            <div
              key={place.place_id}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col transition-transform hover:scale-[1.02] hover:shadow-lg"
            >
              <img
                src={place.featured_image}
                alt={place.name}
                onError={(e) => (e.target.src = '/fallback-image.jpg')}
                className="w-full h-48 object-cover mb-3 rounded-xl"
              />
              <h2 className="text-lg font-semibold text-gray-800 mb-1">{place.name}</h2>

              <p className="text-sm text-gray-600 mb-2">
                {place.description && place.description !== '-'
                  ? place.description
                  : 'Belum ada deskripsi tersedia untuk tempat ini.'}
              </p>

              <p className="text-sm text-yellow-600 mb-2">
                ⭐ {place.rating} ({place.reviews.toLocaleString()} ulasan)
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {place.review_keywords.split(', ').map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-500 mb-2">
                <strong>Alamat:</strong> {place.address}
              </p>

              <div className="mt-auto flex justify-between items-center">
                <a
                  href={place.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Lihat di Google Maps
                </a>

                <a
                  href={`/detail/${place.place_id}`}
                  className="bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-600 transition"
                >
                  Detail
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
