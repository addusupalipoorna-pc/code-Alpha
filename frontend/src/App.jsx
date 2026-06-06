import HomePage from './pages/HomePage.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import useLocalStorage from './hooks/useLocalStorage.js';
import { useEffect, useState } from 'react';

function AnimatedRoutes({ children }) {
  const [fm, setFm] = useState(null);

  useEffect(() => {
    let mounted = true;
    import('framer-motion').then((m) => { if (mounted) setFm(m); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  if (!fm) return <div>{children}</div>;

  const AnimatePresence = fm.AnimatePresence || fm.animatePresence || fm.default?.AnimatePresence;
  const motion = fm.motion || fm.default?.motion || fm;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const [history, setHistory] = useLocalStorage('translator_history', []);
  const [route, setRoute] = useState(window.location.hash.replace('#', '') || '/');

  useEffect(() => {
    const handler = () => setRoute(window.location.hash.replace('#', '') || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return (
    <ThemeProvider>
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-slate-900 text-white px-3 py-2 rounded">Skip to content</a>
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 relative">
        {/* Global earth overlays so background matches across all pages */}
        <div className="earth-overlay" aria-hidden />
        <div className="earth-animated-gradient" aria-hidden />
        <div className="mx-auto w-full max-w-7xl">
          <SiteHeader />
          <AnimatedRoutes>
            {route === '/signin' ? (
              <SignIn />
            ) : route === '/signup' ? (
              <SignUp />
            ) : (
              <HomePage history={history} setHistory={setHistory} />
            )}
          </AnimatedRoutes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
