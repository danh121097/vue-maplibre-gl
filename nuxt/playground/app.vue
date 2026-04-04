<template>
  <div>
    <h1>nuxt-maplibre-gl Playground</h1>
    <ClientOnly>
      <Maplibre :options="mapOptions" style="height: 500px; width: 100%">
        <Marker :lnglat="[0, 0]" :draggable="true" />
      </Maplibre>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const mapOptions = ref({
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});
</script>
