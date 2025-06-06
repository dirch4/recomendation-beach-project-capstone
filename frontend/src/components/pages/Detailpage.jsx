import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import cleaned_data from '../../data/data_forDB_pretty.json';
import { DetailTemplate } from '../templates/DetailTemplate';

const haversineDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const parseCoordinates = (coordString) => {
  if (!coordString || typeof coordString !== 'string') return [-6.2088, 106.8456];
  try {
    const [latStr, lngStr] = coordString.split(',');
    const lat = parseFloat(latStr.trim());
    const lng = parseFloat(lngStr.trim());
    return isNaN(lat) || isNaN(lng) ? [-6.2088, 106.8456] : [lat, lng];
  } catch {
    return [-6.2088, 106.8456];
  }
};

const DetailPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const swiperRef = useRef(null);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [newFeedback, setNewFeedback] = useState({ rating: 0, comment: '' });
  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const stored = localStorage.getItem(`reviews_for_${placeId}`);
      const parsed = stored ? JSON.parse(stored) : [];
      if (parsed.length === 0) {
        return [
          { id: '1', name: 'Dimas', rating: 4, comment: 'Great place.', timestamp: new Date().toISOString() },
        ];
      }
      return parsed.map(fb => ({ ...fb, id: fb.id || `temp-${Date.now()}-${Math.random().toString(36).slice(2)}` }));
    } catch {
      return [];
    }
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, [placeId]);
  useEffect(() => { localStorage.setItem(`reviews_for_${placeId}`, JSON.stringify(feedbacks)); }, [feedbacks, placeId]);

  const place = cleaned_data.find(p => p.place_id === placeId);
  if (!place) return <div className="p-6 text-center text-red-500">Tourist place not found.</div>;

  const coordinates = parseCoordinates(place.coordinates);
  const mainImages = place.image_urls?.split(',').map(u => u.trim()).filter(Boolean) || [];
  while (mainImages.length < 3) mainImages.push(place.featured_image || '/placeholder-image.jpg');
  const finalMainImages = mainImages.slice(0, 5);

  const recommendedPlaces = cleaned_data
    .filter((p) => p.place_id !== placeId && p.coordinates)
    .map((p) => ({ ...p, distance: haversineDistance(coordinates, parseCoordinates(p.coordinates)) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10);

  const handleStarClick = (rating) => setNewFeedback({ ...newFeedback, rating });

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isLoggedIn) return navigate('/login');
    if (!newFeedback.comment.trim() || newFeedback.rating === 0) return;
    const review = {
      id: `review-${Date.now()}`,
      name: user?.name || 'Anonymous',
      rating: newFeedback.rating,
      comment: newFeedback.comment.trim(),
      timestamp: new Date().toISOString()
    };
    setFeedbacks([review, ...feedbacks]);
    setNewFeedback({ rating: 0, comment: '' });
    swiperRef.current?.slideTo(0);
  };

  const handleEditClick = useCallback((review) => {
    setSelectedReview(review);
    setEditModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((review) => {
    setSelectedReview(review);
    setDeleteModalOpen(true);
  }, []);

  return (
    <DetailTemplate
      place={place}
      finalMainImages={finalMainImages}
      coordinates={coordinates}
      recommendedPlaces={recommendedPlaces}
      isLoggedIn={isLoggedIn}
      user={user}
      newFeedback={newFeedback}
      setNewFeedback={setNewFeedback}
      handleStarClick={handleStarClick}
      handleSubmitReview={handleSubmitReview}
      feedbacks={feedbacks}
      swiperRef={swiperRef}
      openDropdownId={openDropdownId}
      setOpenDropdownId={setOpenDropdownId}
      handleEditClick={handleEditClick}
      handleDeleteClick={handleDeleteClick}
      editModalOpen={editModalOpen}
      setEditModalOpen={setEditModalOpen}
      deleteModalOpen={deleteModalOpen}
      setDeleteModalOpen={setDeleteModalOpen}
      selectedReview={selectedReview}
      setSelectedReview={setSelectedReview}
      setFeedbacks={setFeedbacks}
    />
  );
};

export default DetailPage;