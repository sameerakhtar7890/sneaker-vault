import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function Success() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto text-center py-24 px-6">
      <CheckCircle2 className="mx-auto text-gold" size={64}/>
      <h1 className="font-display text-4xl mt-6">Welcome to the Vault.</h1>
      <p className="text-zinc-400 mt-3">Your order is confirmed. A receipt is on its way.</p>
      <Link to="/shop" className="btn-gold mt-8 inline-flex">Keep Shopping</Link>
    </motion.div>
  );
}
