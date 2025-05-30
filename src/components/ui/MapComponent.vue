<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { ChargingStation } from '../../types/chargingStation';
import 'leaflet/dist/leaflet.css';

let leaflet: any;
let map: any;
let markers: any[] = [];

const mapContainer = ref<HTMLElement | null>(null);
const isMapInitialized = ref(false);

const props = defineProps<{
  stations: ChargingStation[]
  selectedStationId?: string | null
  interactive?: boolean
}>();

const emit = defineEmits<{
  (e: 'selectStation', stationId: string): void
  (e: 'mapClick', location: { latitude: number; longitude: number }): void
}>();

const initMap = async () => {
  if (typeof window !== 'undefined' && !leaflet) {
    leaflet = await import('leaflet');
  }
  
  if (!mapContainer.value || isMapInitialized.value) return;
  
  // Initialize the map
  map = leaflet.map(mapContainer.value).setView([40, -95], 4); // Default to US
  
  // Add tile layer (OpenStreetMap)
  leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Set up click handler if interactive
  if (props.interactive) {
    map.on('click', (e: any) => {
      emit('mapClick', {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    });
  }
  
  isMapInitialized.value = true;
  
  // Add markers for initial stations
  updateMarkers();
};

const updateMarkers = () => {
  if (!map || !leaflet) return;
  
  // Clear existing markers
  markers.forEach(marker => marker.remove());
  markers = [];
  
  // Add new markers
  props.stations.forEach(station => {
    // MongoDB uses [longitude, latitude] format
    const [longitude, latitude] = station.location.coordinates;
    
    let markerColor = '#3f9142'; // Default green for available
    switch (station.status) {
      case 'in_use':
        markerColor = '#2563eb'; // Blue
        break;
      case 'maintenance':
        markerColor = '#f0b429'; // Yellow
        break;
      case 'offline':
        markerColor = '#616e7c'; // Gray
        break;
    }
    
    const markerIcon = leaflet.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-container">
          <div class="marker-pulse"></div>
          <div class="marker-dot" style="background-color: ${markerColor}"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    const isSelected = props.selectedStationId === station.id;
    
    // Create the marker with a popup
    const marker = leaflet.marker([latitude, longitude], {
      icon: markerIcon,
      title: station.name,
      zIndexOffset: isSelected ? 1000 : 0
    });
    
    // Create a more detailed popup
    const popupContent = `
      <div class="station-popup">
        <h3 class="font-bold text-lg mb-2">${station.name}</h3>
        <div class="space-y-2">
          <div class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(station.status)}">
              ${getStatusText(station.status)}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-neutral-500">Power:</span>
              <span class="font-medium">${station.powerOutput} kW</span>
            </div>
            <div>
              <span class="text-neutral-500">Connector:</span>
              <span class="font-medium">${station.connectorType}</span>
            </div>
          </div>
          ${station.location.address ? `
            <div class="text-sm">
              <span class="text-neutral-500">Address:</span>
              <span class="font-medium">${station.location.address}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'station-popup-container'
    });
    
    marker.on('click', () => {
      emit('selectStation', station.id);
    });
    
    // Auto-open popup if this is the selected station
    if (isSelected) {
      setTimeout(() => {
        marker.openPopup();
        map.setView([latitude, longitude], 15);
      }, 100);
    }
    
    marker.addTo(map);
    markers.push(marker);
  });
  
  // Fit bounds if we have markers and no selected station
  if (markers.length > 0 && !props.selectedStationId) {
    const group = new leaflet.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-success-100 text-success-800';
    case 'in_use':
      return 'bg-primary-100 text-primary-800';
    case 'maintenance':
      return 'bg-warning-100 text-warning-800';
    case 'offline':
      return 'bg-neutral-100 text-neutral-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return 'Available';
    case 'in_use': return 'In Use';
    case 'maintenance': return 'Under Maintenance';
    case 'offline': return 'Offline';
    default: return status;
  }
};

// Update markers when stations change
watch(() => props.stations, () => {
  updateMarkers();
}, { deep: true });

// Update selected marker when selectedStationId changes
watch(() => props.selectedStationId, () => {
  updateMarkers();
});

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
    isMapInitialized.value = false;
  }
});

const resetView = () => {
  if (!map) return;
  
  if (markers.length > 0) {
    const group = new leaflet.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
  } else {
    map.setView([40, -95], 4); // Default to US
  }
};

const locateMe = () => {
  if (!map || !navigator.geolocation) return;
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 13);
    },
    (error) => {
      console.error('Error getting location:', error);
    }
  );
};
</script>

<template>
  <div class="map-wrapper relative w-full h-full">
    <div ref="mapContainer" class="absolute inset-0 rounded-lg overflow-hidden shadow-lg"></div>
    <div class="map-controls absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button 
        v-if="props.interactive"
        @click="resetView"
        class="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="Reset View"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </button>
      <button 
        v-if="props.interactive"
        @click="locateMe"
        class="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="Locate Me"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style>
.map-wrapper {
  min-height: 400px;
  background-color: #f3f4f6;
}

.custom-marker {
  z-index: 1000;
}

.marker-container {
  position: relative;
  width: 24px;
  height: 24px;
}

.marker-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px currentColor;
}

.marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.2;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.2;
  }
  70% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
}

.station-popup-container .leaflet-popup-content-wrapper {
  border-radius: 0.5rem;
  padding: 0;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.station-popup-container .leaflet-popup-content {
  margin: 0;
  padding: 1rem;
}

.station-popup-container .leaflet-popup-tip {
  background: white;
}

.station-popup {
  min-width: 200px;
}

/* Custom map controls */
.leaflet-control-zoom {
  border: none !important;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
}

.leaflet-control-zoom a {
  background-color: white !important;
  color: #4b5563 !important;
  border: none !important;
  width: 30px !important;
  height: 30px !important;
  line-height: 30px !important;
  font-size: 16px !important;
}

.leaflet-control-zoom a:hover {
  background-color: #f9fafb !important;
  color: #1f2937 !important;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .map-wrapper {
    min-height: 300px;
  }
  
  .station-popup {
    min-width: 180px;
  }
  
  .leaflet-control-zoom {
    display: none;
  }
}
</style>