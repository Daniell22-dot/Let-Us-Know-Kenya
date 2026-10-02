import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './HomePage';
import PodcastPage from './PodcastPage';
import BlogPage from './BlogPage';
import ResourcesPage from "./ResourcesPage";
import StartupPage from './StartupPage';
import ResearchPage from './ResearchPage';
import WatchlistPage from './WatchlistPage';

// Recharts is large, so the market dashboard is split into its own chunk and
// only downloaded by visitors who actually open it.
const MarketPage = lazy(() => import('./MarketPage'));
import SearchResultsPage from './SearchResultsPage';
import AboutPage from './AboutPage';
import LoginSuccess from './LoginSuccess';
import Header from './components/Header';
import Footer from './components/Footer';
import GlobalPodcastPlayer from './components/GlobalPodcastPlayer';
import { PodcastPlayerProvider } from './PodcastPlayerContext';
import { AuthProvider } from './AuthContext';
import './styles/public.css';

function PublicApp() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <PodcastPlayerProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/podcasts" element={<PodcastPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/market" element={
                  <Suspense fallback={
                    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
                      Loading market data&hellip;
                    </div>
                  }>
                    <MarketPage />
                  </Suspense>
                } />
                <Route path="/startups" element={<StartupPage />} />
                <Route path="/research" element={<ResearchPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login-success" element={<LoginSuccess />} />
              </Routes>
            </main>
            <Footer />
            <GlobalPodcastPlayer />
          </div>
        </PodcastPlayerProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default PublicApp;