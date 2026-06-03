import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Truck, Package, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

const STATUS_STEPS = ['created', 'processing', 'shipped', 'delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .catch(err => setError(err.response?.data?.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h2 className="text-2xl mb-4">Order Not Found</h2>
      <p className="text-zinc-500 mb-8">{error}</p>
      <Link to="/profile" className="btn-gold px-8 py-3">Return to Profile</Link>
    </div>
  );

  const currentStepIndex = STATUS_STEPS.indexOf(order.status) !== -1 ? STATUS_STEPS.indexOf(order.status) : 0;
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/profile" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-gold transition mb-8 w-fit">
        <ArrowLeft size={16} /> Back to Profile
      </Link>

      <div className="glass rounded-3xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-gold tracking-[0.3em] text-xs mb-2">ORDER TRACKING</p>
            <h1 className="font-display text-4xl mb-1">#{order._id.substring(0, 8).toUpperCase()}</h1>
            <p className="text-zinc-400 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Payment Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold
              ${order.payment_status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {order.payment_status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Timeline */}
        {isCancelled ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-12 text-center">
            <h3 className="text-red-400 font-bold text-lg mb-2">Order Cancelled</h3>
            <p className="text-red-400/80 text-sm">This order has been cancelled and will not be shipped.</p>
          </div>
        ) : (
          <div className="relative mb-16">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full hidden sm:block z-0" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gold -translate-y-1/2 rounded-full transition-all duration-1000 hidden sm:block z-0" 
              style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            
            <div className="flex flex-col sm:flex-row justify-between gap-8 sm:gap-0 relative z-10">
              {STATUS_STEPS.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const Icon = index === 0 ? Clock : index === 1 ? Package : index === 2 ? Truck : CheckCircle2;
                
                return (
                  <div key={step} className="flex sm:flex-col items-center gap-4 sm:gap-3 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-ink-950 shrink-0 transition-colors duration-500
                        ${isActive ? 'bg-gold text-ink-950' : 'bg-ink-900 text-zinc-500 border-white/10'}`}
                    >
                      <Icon size={20} />
                    </motion.div>
                    <div>
                      <p className={`text-sm font-bold capitalize transition-colors ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`}>
                        {step}
                      </p>
                      {index === currentStepIndex && (
                        <p className="text-xs text-gold mt-1 sm:absolute sm:w-32 sm:-ml-10">Current Status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details Grid */}
        <div className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-8">
          <div>
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.cart_items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-ink-900 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-zinc-200 text-sm">{item.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">Size: {item.size} • Qty: {item.qty}</p>
                  </div>
                  <p className="font-medium text-gold text-sm">${(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-ink-900/50 rounded-2xl p-6 border border-white/5 h-fit">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Shipping Address</span>
                <span className="text-right max-w-[60%]">{order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.postal_code}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total Amount</span>
                <span className="text-zinc-100 font-semibold">${order.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
