import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
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

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
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
      </Layout>
    </BrowserRouter>
  );
}
