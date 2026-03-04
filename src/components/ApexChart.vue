<template>
    <div ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

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

const chartRef = ref(null);
let chart = null;

const initChart = () => {
    if (chart) {
        chart.destroy();
    }

    if (!window.ApexCharts) {
        console.error('ApexCharts not found. Make sure the CDN script is loaded.');
        return;
    }

    const config = {
        ...props.options,
        chart: {
            ...props.options.chart,
            type: props.type,
            height: props.height,
            width: props.width
        },
        series: props.series
    };

    chart = new window.ApexCharts(chartRef.value, config);
    chart.render();
};

onMounted(() => {
    // Wait slightly to ensure window.ApexCharts is available if script loading is slow
    if (window.ApexCharts) {
        initChart();
    } else {
        const checkInterval = setInterval(() => {
            if (window.ApexCharts) {
                clearInterval(checkInterval);
                initChart();
            }
        }, 100);
        // Timeout after 5 seconds
        setTimeout(() => clearInterval(checkInterval), 5000);
    }
});

onUnmounted(() => {
    if (chart) {
        chart.destroy();
    }
});

watch(() => props.series, (newSeries) => {
    if (chart) {
        chart.updateSeries(newSeries);
    }
}, { deep: true });

watch(() => props.options, (newOptions) => {
    if (chart) {
        chart.updateOptions({
            ...newOptions,
            chart: {
                ...newOptions.chart,
                type: props.type,
                height: props.height,
                width: props.width
            }
        });
    }
}, { deep: true });
</script>
