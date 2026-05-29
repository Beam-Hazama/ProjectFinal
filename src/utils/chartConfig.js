
export const salesChartOptions = (categories) => ({
  chart: {
    id: "revenue-bar-chart",
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "inherit",
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  xaxis: {
    categories: categories,
    labels: { style: { colors: "#64748b", fontSize: "12px" } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (value) => `฿${value.toLocaleString()}`,
      style: { colors: "#64748b", fontSize: "12px" },
    },
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
  },
  dataLabels: { enabled: false },
  plotOptions: {
    bar: { 
      borderRadius: 6, 
      columnWidth: "45%",
      distributed: false,
      colors: {
        ranges: [{ from: 0, to: 1000000, color: '#4f46e5' }]
      }
    },
  },
  colors: ["#4f46e5"],
  tooltip: {
    theme: 'dark',
    x: { show: true },
    y: { 
      formatter: (val) => "฿" + val.toLocaleString(),
      title: { formatter: () => 'ยอดขาย: ' }
    },
    marker: { show: true },
    style: { fontSize: '12px' }
  },
});

export const salesByRestaurantChartOptions = (categories) => ({
  chart: {
    id: "restaurant-sales-bar-chart",
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "inherit",
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  xaxis: {
    categories: categories,
    labels: { 
      style: { colors: "#64748b", fontSize: "12px" },
      trim: true,
      rotate: -45
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (value) => `฿${value.toLocaleString()}`,
      style: { colors: "#64748b", fontSize: "12px" },
    },
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
  },
  dataLabels: { enabled: false },
  plotOptions: {
    bar: { 
      borderRadius: 6, 
      columnWidth: "45%",
      distributed: true,
    },
  },
  colors: [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#14b8a6", "#f43f5e"
  ],
  tooltip: {
    theme: 'dark',
    x: { show: true },
    y: { 
      formatter: (val) => "฿" + val.toLocaleString(),
      title: { formatter: () => 'ยอดขาย: ' }
    },
    marker: { show: true },
    style: { fontSize: '12px' }
  },
  legend: { show: false }
});

export const categoryChartOptions = (labels) => ({
  chart: {
    id: "category-donut-chart",
    fontFamily: "inherit",
    zoom: { enabled: false },
  },
  labels: labels,
  stroke: { width: 0 },
  colors: [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ],
  legend: { 
    position: "bottom",
    fontFamily: 'inherit',
    labels: { colors: '#64748b' },
    markers: { radius: 12 }
  },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: "75%",
        labels: {
          show: true,
          name: { 
            show: true,
            fontSize: '14px',
            color: '#64748b',
            offsetY: -10
          },
          value: { 
            show: true, 
            fontSize: '24px',
            fontWeight: '900',
            color: '#1e293b',
            offsetY: 10,
            formatter: (val) => val 
          },
          total: {
            show: true,
            showAlways: true,
            label: "เมนูทั้งหมด",
            fontSize: '12px',
            color: '#94a3b8',
            formatter: (w) =>
              w.globals.seriesTotals.reduce((a, b) => a + b, 0),
          },
        },
      },
    },
  },
  tooltip: {
    theme: 'dark',
    fillSeriesColor: false
  }
});

export const peakHoursChartOptions = (categories) => ({
  chart: {
    id: "peak-hours-chart",
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "inherit",
    type: "area",
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 3 },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    categories: categories,
    labels: { style: { colors: "#64748b", fontSize: "10px" } },
    tooltip: { enabled: false },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: "#64748b", fontSize: "12px" },
      formatter: (val) => Math.floor(val),
    },
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
  },
  colors: ["#f59e0b"],
  tooltip: { 
    theme: 'dark',
    x: { show: true },
    y: { 
      formatter: (val) => val + " ออเดอร์",
      title: { formatter: () => 'ความหนาแน่น: ' }
    } 
  },
});

export const successGaugeOptions = (value) => ({
  chart: {
    height: 280,
    type: 'radialBar',
    fontFamily: 'inherit'
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        margin: 0,
        size: '70%',
        background: '#fff',
        image: undefined,
        imageOffsetX: 0,
        imageOffsetY: 0,
        position: 'front',
      },
      track: {
        background: '#f1f5f9',
        strokeWidth: '67%',
        margin: 0, // margin is in pixels
      },
      dataLabels: {
        show: true,
        name: {
          offsetY: -10,
          show: true,
          color: '#64748b',
          fontSize: '13px',
          fontWeight: 'bold'
        },
        value: {
          formatter: function(val) {
            return parseInt(val) + "%";
          },
          color: '#1e293b',
          fontSize: '30px',
          fontWeight: '900',
          show: true,
        }
      }
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'horizontal',
      shadeIntensity: 0.5,
      gradientToColors: [value < 90 ? '#ef4444' : '#10b981'],
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100]
    }
  },
  stroke: {
    lineCap: 'round'
  },
  labels: ['Success Rate'],
  colors: [value < 90 ? '#f87171' : '#34d399'],
});

export const forecastChartOptions = (categories, splitIndex) => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'inherit',
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  stroke: {
    width: [3, 2],
    curve: 'smooth',
    dashArray: [0, 6]
  },
  fill: {
    type: ['gradient', 'solid'],
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.4,
      opacityFrom: 0.3,
      opacityTo: 0.05,
    }
  },
  colors: ['#4f46e5', '#f59e0b'],
  markers: {
    size: [3, 3],
    strokeWidth: 0,
    hover: { size: 6 }
  },
  xaxis: {
    categories,
    labels: { style: { colors: '#64748b', fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (val) => val === null ? '' : '฿' + Math.round(val).toLocaleString(),
      style: { colors: '#64748b', fontSize: '11px' }
    }
  },
  annotations: {
    xaxis: [{
      x: categories[splitIndex - 1],
      borderColor: '#94a3b8',
      strokeDashArray: 4,
      label: {
        text: 'วันนี้',
        style: { color: '#fff', background: '#64748b', fontSize: '10px', fontWeight: 700 }
      }
    }]
  },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    labels: { colors: '#64748b' }
  },
  tooltip: {
    theme: 'dark',
    shared: true,
    intersect: false,
    y: { formatter: (val) => val === null ? '-' : '฿' + Math.round(val).toLocaleString() }
  },
  dataLabels: { enabled: false }
});

export const menuMatrixOptions = (avgProfit, avgQuantity) => ({
  chart: {
    height: 450,
    type: 'bubble',
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  dataLabels: { enabled: false },
  fill: { opacity: 0.8 },
  xaxis: {
    tickAmount: 5,
    type: 'numeric',
    title: { text: 'ปริมาณที่ขายได้ (Popularity)', style: { fontWeight: '900', color: '#64748b' } },
    labels: { style: { colors: '#64748b' } },
    axisBorder: { show: false },
  },
  yaxis: {
    title: { text: 'กำไรต่อชิ้น (Profit Margin)', style: { fontWeight: '900', color: '#64748b' } },
    labels: { 
      style: { colors: '#64748b' },
      formatter: (val) => '฿' + Math.round(val)
    }
  },
  annotations: {
    xaxis: [{
      x: avgQuantity,
      borderColor: '#94a3b8',
      label: { text: 'Average Volume', style: { color: '#fff', background: '#94a3b8' } }
    }],
    yaxis: [{
      y: avgProfit,
      borderColor: '#94a3b8',
      label: { text: 'Average Profit', style: { color: '#fff', background: '#94a3b8' } }
    }]
  },
  colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'], // Star, Plowhorse, Puzzle, Dog
  tooltip: {
    theme: 'dark',
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
      return '<div class="p-3 bg-slate-900 text-white rounded-lg border border-slate-700 shadow-xl">' +
        '<div class="font-black text-[10px] uppercase mb-2 text-slate-400">' + w.globals.seriesNames[seriesIndex] + '</div>' +
        '<div class="font-black text-sm mb-1">' + data[3] + '</div>' +
        '<div class="flex gap-4 text-[10px] font-bold">' +
        '<span>ขายได้: <span class="text-indigo-400">' + data[0] + ' ชิ้น</span></span>' +
        '<span>กำไร/ชิ้น: <span class="text-emerald-400">฿' + Math.round(data[1]) + '</span></span>' +
        '</div>' +
        '</div>';
    }
  },
  legend: { position: 'top', horizontalAlign: 'center' },
  grid: { borderColor: '#f1f5f9' }
});
