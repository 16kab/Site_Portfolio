import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import PageMeta from '../components/PageMeta';
import { ROUTES } from '../config';

export default function NotFound() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <PageMeta
        title="Page introuvable — Alexis Kabiche"
        description="Cette page n'existe pas ou a été déplacée."
        path="/404"
      />

      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-[120px]"
          animate={
            shouldReduceMotion
              ? { scale: 1, opacity: 0.4 }
              : {
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }
          }
          transition={{
            duration: 8,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 */}
          <motion.h1
            className="text-9xl md:text-[12rem] font-bold mb-8 bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent leading-none"
            animate={
              shouldReduceMotion
                ? undefined
                : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }
            }
            transition={{
              duration: 5,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            404
          </motion.h1>

          {/* Message */}
          <motion.p
            className="text-2xl md:text-3xl text-gray-400 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Page introuvable
          </motion.p>

          <motion.p
            className="text-lg text-gray-500 mb-12 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            La page que vous recherchez n'existe pas ou a été déplacée.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              to={ROUTES.HOME}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-cyan-400 text-black font-semibold rounded-full hover:bg-white transition-all duration-300"
              data-cursor="hover"
              data-cursor-text="Accueil"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-full hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
              data-cursor="hover"
            >
              <ArrowLeft className="w-5 h-5" />
              Page précédente
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
