<template>
  <apexchart
    :type="type"
    :height="height"
    :width="width"
    :options="mergedOptions"
    :series="series"
  />
</template>

<script setup>
import { computed } from 'vue';
import apexchart from 'vue3-apexcharts';

const props = defineProps({
    type: {
        type: String,
        default: 'line'
    },
    height: {
        type: [String, Number],
        default: 'auto'
    },
    width: {
        type: [String, Number],
        default: '100%'
    },
    options: {
        type: Object,
        default: () => ({})
    },
    series: {
        type: Array,
        required: true
    }
});

const mergedOptions = computed(() => ({
    ...props.options,
    chart: {
        ...props.options.chart,
        type: props.type,
        height: props.height,
        width: props.width,
        toolbar: {
            show: false
        },
        zoom: {
            enabled: false
        }
    }
}));
</script>
