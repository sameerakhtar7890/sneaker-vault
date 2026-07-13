import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Truck, Package, ArrowLeft, RotateCcw, XCircle, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import ReturnRequestModal, { RETURN_STATUS_STYLE, REASON_LABELS } from '../components/ReturnRequestModal';

const STATUS_STEPS = ['created', 'processing', 'shipped', 'delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const trackEmail = searchParams.get('email') || '';

  const [order, setOrder] = useState(null);
  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    setError('');

    const orderParams = trackEmail ? { params: { email: trackEmail } } : {};
    const orderReq = api.get(`/orders/${id}`, orderParams);

    const returnReq = user
      ? api.get(`/returns/order/${id}`).catch(() => ({ data: null }))
      : Promise.resolve({ data: null });

    Promise.all([orderReq, returnReq])
      .then(([orderRes, returnRes]) => {
        setOrder(orderRes.data);
        setReturnReq(returnRes.data);
      })
      .catch(err => setError(err.response?.data?.message || 'Order not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id, trackEmail, user]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const params = trackEmail ? { params: { email: trackEmail } } : {};
      const { data } = await api.post(`/orders/${id}/cancel`, {}, params);
      setOrder(data.order);
      setCancelConfirm(false);
      addToast(
        data.refundIssued
          ? 'Order cancelled. A refund has been initiated to your original payment method.'
          : 'Order cancelled successfully.',
        'success'
      );
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h2 className="text-2xl mb-4">Order Not Found</h2>
      <p className="text-zinc-500 mb-8">{error}</p>
      <Link to={user ? '/profile' : '/shop'} className="btn-gold px-8 py-3">
        {user ? 'Return to Profile' : 'Back to Shop'}
      </Link>
    </div>
  );

  const currentStepIndex = STATUS_STEPS.indexOf(order.status) !== -1 ? STATUS_STEPS.indexOf(order.status) : 0;
  const isCancelled = order.status === 'cancelled';
  const isRefunded  = order.payment_status === 'refunded';

  // Can cancel: only 'created' status, and user has authorization
  const canCancelOrder = order.status === 'created' && (
    (user && !order.is_guest && order.user_id && order.user_id._id?.toString() === user._id?.toString()) ||
    (order.is_guest && trackEmail && trackEmail === order.confirmation_email) ||
    (user && order.user_id && order.user_id === user._id)
  );

  const canRequestReturn = user
    && !order.is_guest
    && order.status === 'delivered'
    && order.payment_status === 'paid'
    && !returnReq;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to={user ? '/profile' : '/shop'} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-gold transition mb-8 w-fit">
        <ArrowLeft size={16} /> {user ? 'Back to Profile' : 'Back to Shop'}
      </Link>

      <div className="glass rounded-3xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-gold tracking-[0.3em] text-xs mb-2">ORDER TRACKING</p>
            <h1 className="font-display text-4xl mb-1">#{order._id.substring(0, 8).toUpperCase()}</h1>
            <p className="text-zinc-400 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Payment Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold
                ${ isRefunded
                    ? 'bg-zinc-500/10 text-zinc-400'
                    : order.payment_status === 'paid'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                }`}>
                {isRefunded ? 'REFUNDED' : order.payment_status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Return status banner */}
        {returnReq && (
          <div className="mb-8 p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw size={16} className="text-gold" />
                  <span className="text-sm font-medium text-zinc-200">Return Request</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${RETURN_STATUS_STYLE[returnReq.status]}`}>
                    {returnReq.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">
                  Reason: {REASON_LABELS[returnReq.reason] || returnReq.reason}
                </p>
                {returnReq.description && (
                  <p className="text-sm text-zinc-500 mt-1">{returnReq.description}</p>
                )}
                {returnReq.admin_note && (
                  <p className="text-sm text-zinc-400 mt-2 pt-2 border-t border-white/5">
                    <span className="text-zinc-500">Admin note:</span> {returnReq.admin_note}
                  </p>
                )}
                {returnReq.refund_amount != null && returnReq.status === 'refunded' && (
                  <p className="text-sm text-green-400 mt-2">
                    Refund issued: ${returnReq.refund_amount.toFixed(2)}
                  </p>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                Submitted {new Date(returnReq.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Timeline */}
        {isCancelled ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-12 text-center">
            <XCircle size={32} className="mx-auto text-red-400 mb-3" />
            <h3 className="text-red-400 font-bold text-lg mb-2">Order Cancelled</h3>
            <p className="text-red-400/80 text-sm">
              This order has been cancelled and will not be shipped.
              {isRefunded && <span className="block mt-1 text-zinc-400">A refund has been initiated to your original payment method.</span>}
            </p>
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

          <div className="space-y-4">
            <div className="bg-ink-900/50 rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping Address</span>
                  <span className="text-right max-w-[60%]">
                    {order.shipping_address?.address}, {order.shipping_address?.city}
                  </span>
                </div>
                {order.subtotal != null && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                )}
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                    <span>-${order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {order.shipping_cost != null && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span>{order.shipping_cost > 0 ? `$${order.shipping_cost.toFixed(2)}` : 'Free'}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Total Amount</span>
                  <span className="text-zinc-100 font-semibold">${order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {canRequestReturn && (
              <button
                onClick={() => setModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gold/30
                           text-gold hover:bg-gold/10 transition text-sm font-medium"
              >
                <RotateCcw size={16} /> Request Return
              </button>
            )}

            {canCancelOrder && (
              <button
                onClick={() => setCancelConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30
                           text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
              >
                <XCircle size={16} /> Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      <ReturnRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        order={order}
        onSuccess={load}
      />

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setCancelConfirm(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong rounded-2xl p-8 max-w-sm w-full shadow-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <AlertTriangle size={22} className="text-red-400" />
                </div>
                <h2 className="font-display text-xl">Cancel Order?</h2>
              </div>
              <p className="text-zinc-400 text-sm mb-2 leading-relaxed">
                Are you sure you want to cancel this order?
              </p>
              {order.payment_status === 'paid' && (
                <p className="text-sm text-green-400 mb-6">
                  💳 A full refund will be issued to your original payment method.
                </p>
              )}
              {order.payment_status !== 'paid' && <div className="mb-6" />}
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirm(false)}
                  disabled={cancelling}
                  className="flex-1 btn-ghost text-sm py-2.5 disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Cancelling…</>
                  ) : (
                    <><XCircle size={15} /> Yes, Cancel</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
