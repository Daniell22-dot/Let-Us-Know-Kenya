import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './HomePage';
import PodcastPage from './PodcastPage';
import BlogPage from './BlogPage';
import ResourcesPage from "./ResourcesPage";
import StartupPage from './StartupPage';
import ResearchPage from './ResearchPage';
import WatchlistPage from './WatchlistPage';
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