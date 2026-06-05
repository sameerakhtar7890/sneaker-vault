import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

function pad(n) { return String(n).padStart(2, '0'); }

function formatDay(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatMonth(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function buildDayLabels(start, end) {
  const labels = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cur <= last) {
    labels.push(formatDay(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return labels;
}

function buildMonthLabels(start, end) {
  const labels = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    labels.push(formatMonth(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return labels;
}

function mergeSeries(labels, rows, valueKey) {
  const map = Object.fromEntries(rows.map(r => [r._id, r[valueKey] || 0]));
  return labels.map(l => Math.round((map[l] || 0) * 100) / 100);
}

/**
 * GET /api/analytics/overview
 */
export const getOverview = asyncHandler(async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    paidOrders,
    revenueAgg,
    monthRevenueAgg,
    products,
    users,
    statusBreakdown,
    paymentBreakdown,
    topProducts,
    lowStockCount,
    lowStockProducts
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ payment_status: 'paid' }),
    Order.aggregate([
      { $match: { payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_price' } } }
    ]),
    Order.aggregate([
      { $match: { payment_status: 'paid', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$total_price' } } }
    ]),
    Product.countDocuments(),
    User.countDocuments({ isAdmin: { $ne: true } }),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $group: { _id: '$payment_status', count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { payment_status: 'paid' } },
      { $unwind: '$cart_items' },
      {
        $group: {
          _id: '$cart_items.name',
          units: { $sum: '$cart_items.qty' },
          revenue: { $sum: { $multiply: ['$cart_items.price', '$cart_items.qty'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]),
    Product.countDocuments({ stock: { $lte: 5 } }),
    Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).lean()
  ]);

  const recentOrders = await Order.find({})
    .populate('user_id', 'name email')
    .sort('-createdAt')
    .limit(5)
    .lean();

  res.json({
    stats: {
      revenue: revenueAgg[0]?.total || 0,
      monthRevenue: monthRevenueAgg[0]?.total || 0,
      orders: totalOrders,
      paidOrders,
      products,
      users,
      lowStockCount
    },
    statusBreakdown: statusBreakdown.map(s => ({ status: s._id, count: s.count })),
    paymentBreakdown: paymentBreakdown.map(p => ({ status: p._id, count: p.count })),
    topProducts: topProducts.map(p => ({
      name: p._id,
      units: p.units,
      revenue: Math.round(p.revenue * 100) / 100
    })),
    recentOrders,
    lowStockProducts
  });
});

/**
 * GET /api/analytics/sales?range=7d|30d|12m
 */
export const getSalesChart = asyncHandler(async (req, res) => {
  const range = req.query.range || '30d';
  const now = new Date();
  let start;
  let dateFormat;
  let labels;

  if (range === '7d') {
    start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    dateFormat = '%Y-%m-%d';
    labels = buildDayLabels(start, now);
  } else if (range === '12m') {
    start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    dateFormat = '%Y-%m';
    labels = buildMonthLabels(start, now);
  } else {
    start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    dateFormat = '%Y-%m-%d';
    labels = buildDayLabels(start, now);
  }

  const rows = await Order.aggregate([
    {
      $match: {
        payment_status: 'paid',
        createdAt: { $gte: start }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        revenue: { $sum: '$total_price' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    range,
    labels,
    revenue: mergeSeries(labels, rows, 'revenue'),
    orders: mergeSeries(labels, rows, 'orders')
  });
});
