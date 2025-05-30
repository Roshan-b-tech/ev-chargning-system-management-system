<script setup lang="ts">
import { ref, watch } from 'vue'
import { stationStatusOptions, connectorTypes, powerOutputOptions } from '../../config'

const props = defineProps<{
  initialFilters?: {
    status: string
    connectorType: string
    minPower: number
  }
}>()

const emit = defineEmits<{
  (e: 'filter', filters: { status: string; connectorType: string; minPower: number }): void
  (e: 'reset'): void
}>()

const filters = ref({
  status: props.initialFilters?.status || '',
  connectorType: props.initialFilters?.connectorType || '',
  minPower: props.initialFilters?.minPower || 0
})

const resetFilters = () => {
  filters.value = {
    status: '',
    connectorType: '',
    minPower: 0
  }
  emit('reset')
}

watch(filters, (newFilters) => {
  emit('filter', newFilters)
}, { deep: true })
</script>

<template>
  <div class="bg-white p-4 rounded-lg shadow-md">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-neutral-900">Filters</h3>
      <button @click="resetFilters" class="text-sm text-primary-600 hover:text-primary-800">
        Reset all
      </button>
    </div>

    <div class="space-y-4">
      <!-- Status Filter -->
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">
          Station Status
        </label>
        <select v-model="filters.status" class="input">
          <option value="">All Statuses</option>
          <option v-for="option in stationStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Connector Type Filter -->
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">
          Connector Type
        </label>
        <select v-model="filters.connectorType" class="input">
          <option value="">All Connector Types</option>
          <option v-for="type in connectorTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <!-- Power Output Filter -->
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">
          Minimum Power Output
        </label>
        <select v-model="filters.minPower" class="input">
          <option value="0">All Power Outputs</option>
          <option v-for="option in powerOutputOptions" :key="`${option.min}-${option.max}`" :value="option.min">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>