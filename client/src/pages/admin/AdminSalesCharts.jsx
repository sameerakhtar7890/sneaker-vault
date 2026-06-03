import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../../utils/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const RANGES = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '12m', label: '12 Months' }
];

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#a1a1aa', boxWidth: 12, padding: 16 }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 15, 20, 0.95)',
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderWidth: 1,
      titleColor: '#fafafa',
      bodyColor: '#a1a1aa',
      padding: 12
    }
  },
  scales: {
    x: {
      ticks: { color: '#71717a', maxRotation: 45, minRotation: 0 },
      grid: { color: 'rgba(255,255,255,0.05)' }
    },
    y: {
      ticks: { color: '#71717a' },
      grid: { color: 'rgba(255,255,255,0.05)' }
    }
  }
};

function formatLabel(label, range) {
  if (range === '12m') {
    const [y, m] = label.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  const d = new Date(label + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_COLORS = {
  created:    '#71717a',
  processing: '#60a5fa',
  shipped:    '#c084fc',
  delivered:  '#4ade80',
  cancelled:  '#f87171'
};

const PAY_COLORS = {
  paid:    '#4ade80',
  pending: '#71717a',
  failed:  '#f87171'
};

export default function AdminSalesCharts({ statusBreakdown, paymentBreakdown, topProducts }) {
  const [range, setRange] = useState('30d');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/analytics/sales', { params: { range } })
      .then(r => setChartData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  const labels = chartData?.labels?.map(l => formatLabel(l, range)) || [];

  const revenueChart = chartData ? {
    labels,
    datasets: [{
      label: 'Revenue ($)',
      data: chartData.revenue,
      borderColor: '#d4af37',
      backgroundColor: 'rgba(212, 175, 55, 0.12)',
      fill: true,
      tension: 0.35,
      pointBackgroundColor: '#d4af37',
      pointBorderColor: '#0f0f14',
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  } : null;

  const ordersChart = chartData ? {
    labels,
    datasets: [{
      label: 'Orders',
      data: chartData.orders,
      backgroundColor: 'rgba(96, 165, 250, 0.7)',
      borderColor: '#60a5fa',
      borderWidth: 1,
      borderRadius: 6
    }]
  } : null;

  const statusChart = statusBreakdown?.length ? {
    labels: statusBreakdown.map(s => s.status),
    datasets: [{
      data: statusBreakdown.map(s => s.count),
      backgroundColor: statusBreakdown.map(s => STATUS_COLORS[s.status] || '#71717a'),
      borderWidth: 0,
      hoverOffset: 6
    }]
  } : null;

  const paymentChart = paymentBreakdown?.length ? {
    labels: paymentBreakdown.map(p => p.status),
    datasets: [{
      data: paymentBreakdown.map(p => p.count),
      backgroundColor: paymentBreakdown.map(p => PAY_COLORS[p.status] || '#71717a'),
      borderWidth: 0,
      hoverOffset: 6
    }]
  } : null;

  const topProductsChart = topProducts?.length ? {
    labels: topProducts.map(p => p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name),
    datasets: [{
      label: 'Revenue ($)',
      data: topProducts.map(p => p.revenue),
      backgroundColor: 'rgba(212, 175, 55, 0.65)',
      borderColor: '#d4af37',
      borderWidth: 1,
      borderRadius: 6
    }]
  } : null;

  return (
    <div className="space-y-6 mb-10">
      {/* Sales over time */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl">Sales Overview</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Revenue from paid orders</p>
          </div>
          <div className="flex gap-2">
            {RANGES.map(r => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                  ${range === r.id
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'text-zinc-400 border border-white/10 hover:border-white/20'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-64">
              {revenueChart && (
                <Line
                  data={revenueChart}
                  options={{
                    ...chartDefaults,
                    plugins: {
                      ...chartDefaults.plugins,
                      legend: { display: false }
                    },
                    scales: {
                      ...chartDefaults.scales,
                      y: {
                        ...chartDefaults.scales.y,
                        ticks: {
                          ...chartDefaults.scales.y.ticks,
                          callback: v => `$${v}`
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
            <div className="h-64">
              {ordersChart && (
                <Bar
                  data={ordersChart}
                  options={{
                    ...chartDefaults,
                    plugins: {
                      ...chartDefaults.plugins,
                      legend: { display: false }
                    }
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Breakdown row */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg mb-4">Order Status</h3>
          <div className="h-48 flex items-center justify-center">
            {statusChart ? (
              <Doughnut
                data={statusChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#a1a1aa', boxWidth: 10, padding: 12, font: { size: 11 } }
                    }
                  }
                }}
              />
            ) : (
              <p className="text-zinc-500 text-sm">No data</p>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg mb-4">Payment Status</h3>
          <div className="h-48 flex items-center justify-center">
            {paymentChart ? (
              <Doughnut
                data={paymentChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#a1a1aa', boxWidth: 10, padding: 12, font: { size: 11 } }
                    }
                  }
                }}
              />
            ) : (
              <p className="text-zinc-500 text-sm">No data</p>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg mb-4">Top Products</h3>
          <div className="h-48">
            {topProductsChart ? (
              <Bar
                data={topProductsChart}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      ticks: { color: '#71717a', callback: v => `$${v}` },
                      grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    y: {
                      ticks: { color: '#71717a', font: { size: 10 } },
                      grid: { display: false }
                    }
                  }
                }}
              />
            ) : (
              <p className="text-zinc-500 text-sm text-center pt-16">No sales yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
