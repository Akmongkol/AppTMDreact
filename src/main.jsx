import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx'
import './index.css'
import ReactGA from "react-ga4";



ReactGA.initialize("G-4L4H99E6B6");


ReactGA.send(
  {
    hitType: "pageview",
    page: window.location.pathname
  });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
    <App />
    </HelmetProvider>
  </StrictMode>,
)
