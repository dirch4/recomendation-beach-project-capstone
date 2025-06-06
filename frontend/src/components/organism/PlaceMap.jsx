import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const PlaceMap = ({ coordinates, place }) => (
  <div className="h-[450px] w-full rounded-lg overflow-hidden z-0 relative">
    <MapContainer center={coordinates} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} maxZoom={18}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="OpenStreetMap.HOT">
          <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="OpenTopoMap">
          <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Esri World Imagery (Satellite)">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="CartoDB Positron">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" />
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
    <p className="text-sm text-gray-500 mt-2">
      <span className="font-semibold">Address:</span> {place.address}
    </p>
  </div>
);