import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const DEFAULTS = {
  eyebrow: 'SS25 · LIMITED RELEASE',
  title: 'Step Into \nQuiet Luxury.',
  description: "A curated vault of rare, hand-finished sneakers from the world's most uncompromising houses.",
  btnText: 'Explore the Vault',
  btnLink: '/shop',
  secondaryBtnText: 'Featured',
  secondaryBtnLink: '/shop?featured=true',
  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80'
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  })
};

export default function Hero() {
  const [cms, setCms] = useState(DEFAULTS);

  useEffect(() => {
    api.get('/hero')
      .then(r => {
        const d = r.data;
        setCms({
          eyebrow:          d.eyebrow          || DEFAULTS.eyebrow,
          title:            d.title            || DEFAULTS.title,
          description:      d.description      || DEFAULTS.description,
          btnText:          d.btnText          || DEFAULTS.btnText,
          btnLink:          d.btnLink          || DEFAULTS.btnLink,
          secondaryBtnText: d.secondaryBtnText || DEFAULTS.secondaryBtnText,
          secondaryBtnLink: d.secondaryBtnLink || DEFAULTS.secondaryBtnLink,
          image:            d.image            || DEFAULTS.image,
        });
      })
      .catch(() => {
        // silently fall back to hardcoded defaults if API is offline
      });
  }, []);

  const titleLines = cms.title.split('\n');

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-28 grid md:grid-cols-2 gap-12 items-center relative">
        <motion.div
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.p custom={0} variants={fadeUp} className="section-eyebrow">
            {cms.eyebrow}
          </motion.p>

          <motion.h1 custom={1} variants={fadeUp} className="font-display text-5xl md:text-7xl leading-[1.05]">
            {titleLines.map((line, i) => (
              <span key={i}>
                {i === titleLines.length - 1
                  ? <span className="gradient-text">{line}</span>
                  : <>{line}<br /></>
                }
              </span>
            ))}
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} className="text-zinc-400 max-w-md text-lg leading-relaxed">
            {cms.description}
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
            <Link to={cms.btnLink} className="btn-gold">{cms.btnText}</Link>
            <Link to={cms.secondaryBtnLink} className="btn-ghost">{cms.secondaryBtnText}</Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-gold/25 via-transparent to-indigo-500/10 rounded-[2rem] blur-2xl" />
            <img
              className="relative rounded-3xl shadow-card border border-white/10 w-full object-cover"
              src={cms.image}
              alt="Featured sneaker"
              onError={e => { e.currentTarget.src = DEFAULTS.image; }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
