import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Loading from './components/Loading';
import './i18n';

const Home = lazy(() => import('./pages/Home'));
const MapPage = lazy(() => import('./pages/MapPage'));
const Districts = lazy(() => import('./pages/Districts'));
const DistrictDetail = lazy(() => import('./pages/DistrictDetail'));
const Alerts = lazy(() => import('./pages/Alerts'));
const SOS = lazy(() => import('./pages/SOS'));
const Cyclone = lazy(() => import('./pages/Cyclone'));
const Floods = lazy(() => import('./pages/Floods'));
const Earthquake = lazy(() => import('./pages/Earthquake'));
const Admin = lazy(() => import('./pages/Admin'));
const About = lazy(() => import('./pages/About'));

const EASE = [0.4, 0, 0.2, 1] as const;

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5, ease: EASE }}
      >
        <Suspense fallback={<Loading />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/districts" element={<Districts />} />
            <Route path="/district/:slug" element={<DistrictDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/cyclone" element={<Cyclone />} />
            <Route path="/floods" element={<Floods />} />
            <Route path="/earthquake" element={<Earthquake />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}
