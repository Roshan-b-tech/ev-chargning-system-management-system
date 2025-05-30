<script setup lang="ts">
import { ref } from 'vue'
import type { ChargingStation } from '../../types/chargingStation'

const props = defineProps<{
  station: ChargingStation
}>()

console.log('StationCard: Received station object:', JSON.stringify(props.station, null, 2))

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete'): void
}>()

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-success-500'
    case 'inactive':
      return 'bg-neutral-400'
    case 'maintenance':
      return 'bg-warning-500'
    default:
      return 'bg-neutral-400'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'inactive':
      return 'Inactive'
    case 'maintenance':
      return 'Maintenance'
    default:
      return 'Unknown'
  }
}

const getPowerLevelClass = (power: number) => {
  if (power < 11) return 'bg-green-100 text-green-800'
  if (power < 50) return 'bg-blue-100 text-blue-800'
  if (power < 150) return 'bg-purple-100 text-purple-800'
  return 'bg-red-100 text-red-800'
}
</script>

<template>
  <div class="card hover:shadow-lg transition-all group">
    <div class="flex justify-between items-start">
      <h3 class="text-lg font-semibold text-neutral-900">{{ station.name }}</h3>
      <div class="flex items-center space-x-1">
        <span :class="`inline-block w-3 h-3 rounded-full ${getStatusColor(station.status)}`"></span>
        <span class="text-sm text-neutral-600">{{ getStatusText(station.status) }}</span>
      </div>
    </div>
    
    <div class="mt-2 text-sm text-neutral-600">
      <div class="flex items-center mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
        <span>
          <template v-if="station.location && station.location.coordinates && station.location.coordinates.length >= 2">
            {{ station.location.coordinates[1].toFixed(6) }}, {{ station.location.coordinates[0].toFixed(6) }}
            <span v-if="station.location.address" class="block text-neutral-500">{{ station.location.address }}</span>
          </template>
          <template v-else>
            Location data missing or incomplete
          </template>
        </span>
      </div>
    </div>
    
    <div class="mt-4 flex flex-wrap gap-2">
      <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPowerLevelClass(station.powerOutput)}`">
        {{ station.powerOutput }} kW
      </span>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
        {{ station.connectorType }}
      </span>
    </div>
    
    <div class="mt-4 pt-4 border-t border-neutral-200 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        @click="() => {
          console.log('StationCard: Edit button clicked for station:', props.station.id);
          emit('edit', props.station.id);
        }" 
        class="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit
      </button>
      <button 
        @click="emit('delete')" 
        class="text-error-600 hover:text-error-800 text-sm font-medium flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Delete
      </button>
    </div>
  </div>
</template>