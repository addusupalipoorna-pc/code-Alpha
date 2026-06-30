import HomePage from './pages/HomePage.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import PageLoader from './components/PageLoader.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import useLocalStorage from './hooks/useLocalStorage.js';
import { useEffect, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

function AnimatedRoutes({ children }) {
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handler = () => setRoute(window.location.hash.replace('#', '') || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return (
    <ThemeProvider>
      {/* Dynamic Page Loader */}
      <PageLoader onComplete={() => setLoaded(true)} />

      {/* Premium custom cursor and noise effects */}
      {loaded && (
        <>
          <CustomCursor />
          <div className="noise-overlay" aria-hidden />
        </>
      )}

      <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-slate-900 text-white px-3 py-2 rounded">Skip to content</a>
      
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden bg-[#03030d]">
        {/* Global aurora gradients */}
        <div className="aurora-bg-container" aria-hidden>
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
        </div>
        <div className="earth-overlay" aria-hidden />
        <div className="earth-animated-gradient" aria-hidden />

        <div className="mx-auto w-full max-w-7xl relative z-10">
          <SiteHeader />
          {loaded && (
            <AnimatedRoutes>
              {route === '/signin' ? (
                <SignIn />
              ) : route === '/signup' ? (
                <SignUp />
              ) : (
                <HomePage history={history} setHistory={setHistory} />
              )}
            </AnimatedRoutes>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
