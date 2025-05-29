import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import cleaned_data from '../../data/cleaned_data-asli_formatted.json';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Navigation, Pagination } from 'swiper/modules';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Atur icon marker leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Komponen untuk mengatasi masalah resize peta
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}

const DetailPage = () => {
  const swiperRef = useRef(null);
  const recommendationSwiperRef = useRef(null);
  const { placeId } = useParams();

  const [newFeedback, setNewFeedback] = useState({ rating: 0, comment: '' });

  const parseCoordinates = (coordString) => {
    if (!coordString || typeof coordString !== 'string') return [-6.2088, 106.8456];
    try {
      const [latStr, lngStr] = coordString.split(',');
      const lat = parseFloat(latStr.trim());
      const lng = parseFloat(lngStr.trim());
      if (isNaN(lat) || isNaN(lng)) throw new Error('Invalid coordinate values');
      return [lat, lng];
    } catch {
      return [-6.2088, 106.8456];
    }
  };

  const handleStarClick = (rating) => {
    setNewFeedback({ ...newFeedback, rating });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [placeId]);

  const place = cleaned_data.find(p => p.place_id === placeId);
  const recommendedPlaces = cleaned_data.filter(p => p.place_id !== placeId).slice(0, 10);

  const [feedbacks, setFeedbacks] = useState([
    { name: 'Dimas', rating: 4, comment: 'Tempatnya sangat bagus dan bersih. Pelayanan juga ramah.' },
    { name: 'Rina', rating: 5, comment: 'Pemandangan indah, cocok untuk liburan keluarga.' },
    { name: 'Adi', rating: 4, comment: 'Fasilitas lengkap dan harga terjangkau.' },
  ]);

  if (!place) {
    return <div className="p-6 text-center text-red-500">tourist attraction not found</div>;
  }

  const coordinates = parseCoordinates(place.coordinates);

  return (
    <div className="p-6 bg-gradient-to-b from-[#dcefff] to-white mx-auto max-w-screen-lg">

      {/* DETAIL TEMPAT */}
      <section className="max-w-6xl mx-auto p-6 bg-white rounded-md shadow-md mt-8">
        <img
          src={place.featured_image}
          alt={place.name}
          className="w-full max-h-[500px] object-cover rounded-xl mb-4"
          onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
        />
        <h1 className="text-4xl font-bold text-gray-800">{place.name}</h1>
        <p className="text-lg text-gray-600 mt-2">{place.description || 'Deskripsi tidak tersedia.'}</p>
        <div className="flex items-center mt-2">
          <span className="text-yellow-500 text-xl">⭐ {place.rating}</span>
          <span className="text-gray-500 ml-2">({place.reviews} ulasan)</span>
        </div>

        {/* PETA */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-4 text-center">Location</h2>
          <div className="h-[450px] w-full rounded-lg overflow-hidden relative z-0">
            <MapContainer center={coordinates} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <MapResizer />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={coordinates}>
                <Popup>
                  <div className="max-w-xs">
                    <h3 className="font-bold text-lg">{place.name}</h3>
                    <p className="text-sm text-gray-600">{place.address}</p>
                    <a href={place.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                      open in google maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-semibold">Address:</span> {place.address}
          </p>
        </div>
      </section>

      {/* ULASAN */}
      <section className="max-w-6xl mx-auto py-10 px-6 bg-white mt-10 rounded-md shadow-md">
        <h1 className="text-4xl font-bold text-center">customer review</h1>
        <p className="font-normal mt-3 mb-8 text-center text-gray-600">Don't take our word for it, trust our customers.</p>

        <Swiper
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="my-6"
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {[...(place.review || []), ...feedbacks].map((item, index) => (
            <SwiperSlide key={index} className="h-auto">
              <div className="flex h-full">
                <div className="bg-white border p-6 rounded-md shadow-md flex flex-col justify-between w-full h-full">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    <div className="flex items-center mb-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < item.rating ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 whitespace-pre-line">{item.comment}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* FORM ULASAN */}
      <section className="max-w-6xl mx-auto px-6 py-8 bg-white rounded-md shadow-md mt-8 mb-8">
        <h1 className="text-4xl font-bold text-center">Give your review</h1>
        <p className="font-normal mt-5 mb-10 text-center text-gray-600">Share your experience visiting this place.</p>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newFeedback.comment.length < 10) {
              alert("Comment must be at least 10 characters");
              return;
            }
            if (newFeedback.rating > 0) {
              setFeedbacks([
                ...feedbacks,
                { name: 'Pengunjung', rating: newFeedback.rating, comment: newFeedback.comment },
              ]);
              setNewFeedback({ rating: 0, comment: '' });
              swiperRef.current?.slideTo(0);
            }
          }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`text-4xl ${newFeedback.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                onClick={() => handleStarClick(star)}
              >
                ★
              </button>
            ))}
          </div>
          <div className="mb-6">
            <textarea
              placeholder="Write your review here..."
              value={newFeedback.comment}
              onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="5"
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              send a review
            </button>
          </div>
        </form>
      </section>

      {/* REKOMENDASI */}
      <section className="max-w-6xl mx-auto py-10 px-6 mt-10">
        <h1 className="text-4xl font-bold text-center">Recommendations For You</h1>
        <p className="font-normal mt-5 mb-10 text-center text-gray-600">Other tourist attractions that you might like</p>

        <Swiper
          loop
          modules={[Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          onSwiper={(swiper) => (recommendationSwiperRef.current = swiper)}
          className="mySwiper cursor-pointer"
        >
          {recommendedPlaces.map((recPlace) => (
            <SwiperSlide key={recPlace.place_id} className='h-auto'>
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                <img
                  src={recPlace.featured_image}
                  alt={recPlace.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                />
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{recPlace.name}</h3>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">⭐ {recPlace.rating}</span>
                    <span className="text-gray-500 ml-2">({recPlace.reviews} Reviews)</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">{recPlace.description || 'Deskripsi tidak tersedia'}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recPlace.review_keywords?.split(', ').slice(0, 3).map((keyword, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">{keyword}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <a href={recPlace.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    See the map
                  </a>
                  <Link to={`/detail/${recPlace.place_id}`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
};

export default DetailPage;
