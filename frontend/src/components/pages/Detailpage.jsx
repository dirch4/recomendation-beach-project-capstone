import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import cleaned_data from '../../data/cleaned_data-asli_formatted.json';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation'; 
import 'swiper/css/pagination';
import 'swiper/css/autoplay';  

import { Navigation, Pagination, Autoplay } from 'swiper/modules'; 

import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const haversineDistance = (coords1, coords2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const DetailPage = () => {
    const swiperRef = useRef(null);
    const recommendationSwiperRef = useRef(null);
    const mainImageSwiperRef = useRef(null); // Tambahkan ini: Ref baru untuk main image swiper

    const { placeId } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();

    console.log("DetailPage: Objek User dari AuthContext:", user);
    console.log("DetailPage: isLoggedIn:", isLoggedIn);

    const [newFeedback, setNewFeedback] = useState({ rating: 0, comment: '' });
    // --- START: State untuk Modal dan Dropdown (direvisi) ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [reviewToEdit, setReviewToEdit] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null); // Pindahkan deklarasi ke sini
    // --- END: State untuk Modal dan Dropdown ---

    // Inisialisasi state feedbacks dari Local Storage
    const [feedbacks, setFeedbacks] = useState(() => {
        try {
            const storedFeedbacks = localStorage.getItem(`reviews_for_${placeId}`);
            const parsedFeedbacks = storedFeedbacks ? JSON.parse(storedFeedbacks) : [];

            // Add unique IDs to existing default reviews if they don't have one
            const defaultReviews = [
                { id: 'default-1', name: 'Dimas', rating: 4, comment: 'The place is very nice and clean. Service is also friendly.', timestamp: new Date().toISOString() },
                { id: 'default-2', name: 'Rina', rating: 5, comment: 'Beautiful scenery, perfect for family holidays.', timestamp: new Date().toISOString() },
                { id: 'default-3', name: 'Adi', rating: 4, comment: 'Complete facilities and affordable prices.', timestamp: new Date().toISOString() },
            ];

            if (parsedFeedbacks.length === 0) {
                return defaultReviews;
            }
            // Ensure all loaded feedbacks have an ID. If not, add one.
            // This also handles cases where user might have saved reviews without IDs from previous versions.
            return parsedFeedbacks.map(fb => ({ ...fb, id: fb.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }));
        } catch (error) {
            console.error("Failed to parse feedbacks from localStorage", error);
            // Fallback to default reviews if localStorage parsing fails
            return [
                { id: 'default-1', name: 'Dimas', rating: 4, comment: 'The place is very nice and clean. Service is also friendly.', timestamp: new Date().toISOString() },
                { id: 'default-2', name: 'Rina', rating: 5, comment: 'Beautiful scenery, perfect for family holidays.', timestamp: new Date().toISOString() },
                { id: 'default-3', name: 'Adi', rating: 4, comment: 'Complete facilities and affordable prices.', timestamp: new Date().toISOString() },
            ];
        }
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [placeId]);

    useEffect(() => {
        localStorage.setItem(`reviews_for_${placeId}`, JSON.stringify(feedbacks));
    }, [feedbacks, placeId]);

    const parseCoordinates = (coordString) => {
        if (!coordString || typeof coordString !== 'string') return [-6.2088, 106.8456]; // default Jakarta
        try {
            const [latStr, lngStr] = coordString.split(',');
            const lat = parseFloat(latStr.trim());
            const lng = parseFloat(lngStr.trim());
            return isNaN(lat) || isNaN(lng) ? [-6.2088, 106.8456] : [lat, lng];
        } catch {
            return [-6.2088, 106.8456];
        }
    };

    const handleStarClick = (rating) => setNewFeedback({ ...newFeedback, rating });

    const place = cleaned_data.find(p => p.place_id === placeId);
    if (!place) return <div className="p-6 text-center text-red-500">Tourist place not found.</div>;

    const coordinates = parseCoordinates(place.coordinates);

    // Tambahkan ini: Siapkan array gambar untuk carousel utama
    const mainImages = [];
    if (place.image_urls && typeof place.image_urls === 'string') {
        const urls = place.image_urls.split(',').map(url => url.trim()).filter(url => url !== '');
        mainImages.push(...urls);
    }
    // Jika masih kurang dari 3 foto, tambahkan featured_image atau placeholder
    while (mainImages.length < 3) {
        mainImages.push(place.featured_image || '/placeholder-image.jpg');
    }
    // Batasi maksimum, misalnya 5 gambar (opsional, tergantung data Anda)
    const finalMainImages = mainImages.slice(0, 5);


    const recommendedPlaces = cleaned_data
        .filter((p) => p.place_id !== placeId && p.coordinates)
        .map((p) => ({
            ...p,
            distance: haversineDistance(coordinates, parseCoordinates(p.coordinates)),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

    const currentUserName = isLoggedIn && user && user.name ? user.name : 'Anonymous User';

    const handleSubmitReview = (e) => {
        e.preventDefault();
        console.log("DetailPage (before submit): User object from useAuth:", user);
        console.log("DetailPage (before submit): currentUserName used for review:", currentUserName);

        if (!isLoggedIn) {
            alert('You have to log in to leave a review!');
            navigate('/login');
            return;
        }

        if (newFeedback.comment.trim() === '' || newFeedback.rating === 0) {
            alert('Please rate and write your comments.');
            return;
        }

        const newReview = {
            id: `review-${Date.now()}`, // Unique ID for new reviews
            name: currentUserName,
            rating: newFeedback.rating,
            comment: newFeedback.comment.trim(),
            timestamp: new Date().toISOString()
        };

        setFeedbacks([newReview, ...feedbacks]);
        setNewFeedback({ rating: 0, comment: '' });
        if (swiperRef.current) {
            swiperRef.current.slideTo(0);
        }
    };

    // --- New functions for Edit/Delete (menggunakan useCallback) ---
    const handleDeleteClick = useCallback((review) => {
        setReviewToDelete(review);
        setShowDeleteModal(true);
    }, []);

    const confirmDelete = useCallback(() => {
        setFeedbacks(feedbacks.filter(fb => fb.id !== reviewToDelete.id));
        setShowDeleteModal(false);
        setReviewToDelete(null);
    }, [feedbacks, reviewToDelete]); // dependencies for useCallback

    const handleEditClick = useCallback((review) => {
        setReviewToEdit({ ...review }); // Copy to allow local edits
        setShowEditModal(true);
    }, []);

    const handleEditInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setReviewToEdit(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleEditStarClick = useCallback((rating) => {
        setReviewToEdit(prev => ({ ...prev, rating }));
    }, []);

    const submitEdit = useCallback((e) => {
        e.preventDefault();
        if (reviewToEdit.comment.trim() === '' || reviewToEdit.rating === 0) {
            alert('Please rate and write your comments.');
            return;
        }
        setFeedbacks(feedbacks.map(fb =>
            fb.id === reviewToEdit.id ? { ...reviewToEdit, timestamp: new Date().toISOString() } : fb
        ));
        setShowEditModal(false);
        setReviewToEdit(null);
    }, [feedbacks, reviewToEdit]);

return (
    <div className="p-6 shadow-md max-w-4xl mx-auto bg-gradient-to-b from-[#dcefff] to-white">

        {/* Back button */}
        <div className="flex items-center space-x-2 mb-8">
            <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sky-900 rounded hover:text-sky-600 transition text-2xl font-semibold"
            >
                ← Back
            </button>
        </div>

        {/* Place detail */}
        <section className="max-w-6xl mx-auto p-6 bg-white rounded-md shadow-md mt-4">
            {/* START: Swiper untuk Foto Utama */}
            {/* Container untuk Swiper utama, mengatur tinggi dan lebar dengan Tailwind */}
            <div className="w-full h-[450px] md:h-[550px] rounded-xl mb-4 overflow-hidden relative z-10"> {/* Tambahkan z-10 */}
                <Swiper
                    ref={mainImageSwiperRef}
                    modules={[Navigation, Pagination, Autoplay]}
                    slidesPerView={1}
                    spaceBetween={0}
                    navigation
                    pagination={{ clickable: true }}
                    loop={finalMainImages.length > 1}
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                    }}
                    // Mengatur warna panah dan titik pagination langsung via style prop (variabel CSS Swiper)
                    style={{
                        '--swiper-navigation-color': '#fff', // Warna panah putih
                        '--swiper-pagination-color': '#fff', // Warna titik pagination putih
                        '--swiper-pagination-bullet-inactive-color': 'rgba(255,255,255,0.5)', // Warna titik non-aktif semi-transparan
                        '--swiper-navigation-size': '30px', // Ukuran panah, bisa disesuaikan
                    }}
                    className="w-full h-full" // Swiper mengisi container div
                >
                    {finalMainImages.map((imageUrl, index) => (
                        <SwiperSlide key={index}>
                            <img
                                src={imageUrl}
                                alt={`${place.name} - Image ${index + 1}`}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            {/* END: Swiper untuk Foto Utama */}

            <h1 className="text-4xl font-bold text-gray-800">{place.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{place.description}</p>
            <div className="flex items-center mt-2">
                <span className="text-yellow-500 text-xl">⭐ {place.rating}</span>
                <span className="text-gray-500 ml-2">({place.reviews} reviews)</span>
            </div>

            {/* Map */}
            <div className="mt-8">
                <h2 className="text-3xl font-bold mb-4 text-center">Location</h2>
                {/* Z-index 0 agar tidak menimpa Swiper utama jika ada overlap */}
                <div className="h-[450px] w-full rounded-lg overflow-hidden z-0 relative">
                    <MapContainer center={coordinates} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} maxZoom={18}>
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="OpenStreetMap">
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="OpenStreetMap.HOT">
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="OpenTopoMap">
                                <TileLayer
                                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                                    attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Esri World Imagery (Satellite)">
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="CartoDB Positron">
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CartoDB</a>'
                                />
                            </LayersControl.BaseLayer>
                        </LayersControl>
                        <Marker position={coordinates}>
                            <Popup>
                                <div className="max-w-xs">
                                    <h3 className="font-bold text-lg">{place.name}</h3>
                                    <p className="text-sm text-gray-600">{place.address}</p>
                                    <a href={place.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                                        Open in Google Maps
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

        {/* Reviews */}
        <section className="max-w-6xl mx-auto py-10 px-6 bg-white mt-10 rounded-md shadow-md">
            <h1 className="text-4xl font-bold text-center">Customer Reviews</h1>
            <p className="font-normal mt-3 mb-8 text-center text-gray-600">
                Don't just trust us, trust our customers
            </p>

            <Swiper
                loop
                modules={[Autoplay]} 
                slidesPerView={1}
                spaceBetween={20}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                className="mySwiper cursor-pointer"
            >
                {feedbacks.map((feedback, index) => (
                    <SwiperSlide key={feedback.id || `${feedback.name}-${feedback.timestamp || index}`}>
                        <div className="bg-white border p-6 rounded-md shadow-md h-[220px] flex flex-col justify-between relative">
                            {isLoggedIn && user && user.name === feedback.name && (
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={() => setOpenDropdownId(openDropdownId === feedback.id ? null : feedback.id)}
                                        className="text-gray-500 hover:text-gray-800 text-xl font-bold focus:outline-none"
                                    >
                                        &#x22EF;
                                    </button>
                                    {openDropdownId === feedback.id && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-10">
                                            <button
                                                onClick={() => { handleEditClick(feedback); setOpenDropdownId(null); }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => { handleDeleteClick(feedback); setOpenDropdownId(null); }}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <div className="font-semibold text-lg text-gray-800">{feedback.name}</div>
                                <div className="flex items-center text-yellow-600 mt-2 mb-2">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <span key={i} className={`text-2xl ${feedback.rating >= i + 1 ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                                    ))}
                                </div>
                                <p className="text-gray-600 line-clamp-4">{feedback.comment}</p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
                {feedbacks.length === 0 && (
                    <SwiperSlide>
                        <div className="p-6 text-center text-gray-500">
                            There are no reviews for this place yet. Be the first!
                        </div>
                    </SwiperSlide>
                )}
            </Swiper>
        </section>

        {/* Review form */}
        <section className="max-w-6xl mx-auto px-6 py-8 bg-white rounded-md shadow-md mt-8 mb-8">
            <h1 className="text-4xl font-bold text-center">Please Leave Your Review</h1>
            <p className="font-normal mt-5 mb-10 text-center text-gray-600">Share your experience visiting this place</p>

            <form
                onSubmit={handleSubmitReview}
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
                        placeholder={isLoggedIn ? "Write your review here..." : "Login untuk menulis review..."}
                        value={newFeedback.comment}
                        onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows="5"
                        required
                        disabled={!isLoggedIn}
                    />
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className={`px-8 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${isLoggedIn ? 'bg-sky-900 text-sky-100 hover:bg-sky-700 focus:ring-blue-500' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                        disabled={!isLoggedIn}
                    >
                        {isLoggedIn ? 'Submit Review' : 'Login untuk Submit Review'}
                    </button>
                </div>
            </form>
        </section>


            {/* Recommendations */}
        <section className="max-w-6xl mx-auto py-10 px-6 mt-10">
            <h1 className="text-4xl font-bold text-center">Recommended For You</h1>
            <p className="font-normal mt-5 mb-10 text-center text-gray-600">Other tourist spots you might like</p>

            <Swiper
                loop
                modules={[Autoplay]}
                slidesPerView={1}
                spaceBetween={20}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                onSwiper={(swiper) => (recommendationSwiperRef.current = swiper)}
                className="mySwiper cursor-pointer"
            >
                {recommendedPlaces.map((recPlace) => (
                    <SwiperSlide key={recPlace.place_id} className="h-full">
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col min-h-[600px]">
                            <img
                                src={recPlace.featured_image}
                                alt={recPlace.name}
                                className="w-full h-48 object-cover"
                                onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                            />
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{recPlace.name}</h3>
                                <div className="flex items-center mb-2">
                                    <span className="text-yellow-500">⭐ {recPlace.rating}</span>
                                    <span className="text-gray-500 ml-2">({recPlace.reviews} reviews)</span>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-3">{recPlace.description || 'Description not available'}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {recPlace.review_keywords && recPlace.review_keywords.split(', ').slice(0, 3).map((keyword, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">{keyword}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <a
                                        href={recPlace.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        View Map
                                    </a>
                                    <Link
                                        to={`/detail/${recPlace.place_id}`}
                                        className="bg-sky-900 text-sky-100 hover:bg-sky-700 px-4 py-2 rounded-md transition-colors text-sm"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h2>
                    <p className="text-gray-700 mb-6">Are you sure you want to delete this review?</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Review Modal */}
        {showEditModal && reviewToEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Your Review</h2>

                    <form onSubmit={submitEdit}>
                        <div className="flex justify-center space-x-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    className={`text-4xl ${reviewToEdit.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                    onClick={() => handleEditStarClick(star)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <textarea
                                name="comment"
                                placeholder="Edit your review here..."
                                value={reviewToEdit.comment}
                                onChange={handleEditInputChange}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                rows="6"
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-sky-900 text-white rounded-md hover:bg-sky-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
);
};

export default DetailPage;