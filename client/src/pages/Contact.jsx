import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000); // reset after 5s
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-display text-5xl mb-6">Get in Touch</h1>
        <p className="text-zinc-400 text-lg">
          Have a question about an order, want to sell your collection, or just want to talk sneakers? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="md:col-span-1 space-y-8">
          <div className="glass p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-gold/10 p-3 rounded-xl text-gold shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200 mb-1">Our Store</h3>
              <p className="text-zinc-400 text-sm">123 Sneaker Avenue<br/>New York, NY 10012</p>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-gold/10 p-3 rounded-xl text-gold shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200 mb-1">Email Us</h3>
              <p className="text-zinc-400 text-sm">support@sneakervault.com<br/>info@sneakervault.com</p>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-gold/10 p-3 rounded-xl text-gold shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200 mb-1">Call Us</h3>
              <p className="text-zinc-400 text-sm">+1 (555) 123-4567<br/>Mon-Fri, 9am-6pm EST</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 glass rounded-3xl p-8 md:p-12">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center text-center py-20"
              >
                <CheckCircle2 size={64} className="text-gold mb-6" />
                <h2 className="font-display text-3xl mb-4">Message Sent!</h2>
                <p className="text-zinc-400">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">Name</label>
                    <input required type="text" className="w-full bg-ink-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/30" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">Email</label>
                    <input required type="email" className="w-full bg-ink-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/30" placeholder="john@example.com" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">Subject</label>
                  <select className="w-full bg-ink-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/30">
                    <option>Order Inquiry</option>
                    <option>Product Question</option>
                    <option>Returns & Exchanges</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">Message</label>
                  <textarea required rows="6" className="w-full bg-ink-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/30 resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button type="submit" className="btn-gold w-full py-4 text-sm font-semibold tracking-wide">
                  Send Message
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
