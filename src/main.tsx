import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import emailjs from '@emailjs/browser';
import App from './App.tsx';
import './index.css';

// Initialize EmailJS with your public key
emailjs.init({
  publicKey: '5HEEp0L5Vyz6qEWRM',
  blockHeadless: false, // Required for development environment
  limitRate: true
});

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
      retry: 1, // Only retry once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

// Preload critical assets
const preloadAssets = () => {
  // Preload important images or other assets here
  const preloadLinks = [
    // Add any critical assets to preload
  ];
  
  preloadLinks.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = url.endsWith('.js') ? 'script' : 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Execute preloading
preloadAssets();

// Create root with error boundary
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);