/**
 * Chart Configuration
 * ───────────────────
 * แยก UI styling ของ ApexCharts ออกจาก Store เพื่อลดความซับซ้อน
 * เน้นเฉพาะการจัดการข้อมูลใน Store และการแสดงผลในหน้า Config
 */

export const salesChartOptions = (categories) => ({
  chart: {
    id: "revenue-bar-chart",
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "inherit",
  },
  xaxis: {
    categories: categories,
    labels: { style: { colors: "#64748b", fontSize: "12px" } },
  },
  yaxis: {
    labels: {
      formatter: (value) => `฿${value.toLocaleString()}`,
      style: { colors: "#64748b", fontSize: "12px" },
    },
  },
  dataLabels: { enabled: false },
  plotOptions: {
    bar: { borderRadius: 6, columnWidth: "45%" },
  },
  colors: ["#4f46e5"],
  tooltip: {
    y: { formatter: (val) => "฿" + val.toLocaleString() },
  },
});

export const categoryChartOptions = (labels) => ({
  chart: {
    id: "category-donut-chart",
    fontFamily: "inherit",
    zoom: { enabled: false },
  },
  labels: labels,
  colors: [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ],
  legend: { position: "bottom" },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          name: { show: true },
          value: { show: true, formatter: (val) => val },
          total: {
            show: true,
            showAlways: true,
            label: "รวม",
            formatter: (w) =>
              w.globals.seriesTotals.reduce((a, b) => a + b, 0),
          },
        },
      },
    },
  },
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
  stroke: { curve: "smooth", width: 2 },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    categories: categories,
    labels: { style: { colors: "#64748b", fontSize: "10px" } },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: {
      style: { colors: "#64748b", fontSize: "12px" },
      formatter: (val) => Math.floor(val),
    },
  },
  colors: ["#f59e0b"],
  tooltip: { y: { formatter: (val) => val + " ออเดอร์" } },
});
