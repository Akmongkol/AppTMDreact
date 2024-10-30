// Import React and Suspense
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//SEO
import { HelmetProvider, Helmet } from 'react-helmet-async';

const LazyMapComponent = React.lazy(() => import('./components/Map'));
const LazyNotfoundComponent = React.lazy(() => import('./Notfound'));

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<div>&nbsp;</div>}>
        <Helmet>
            <title>Weather Forecast TMD แผนที่พยากรณ์อากาศ กรมอุตุนิยมวิทยา</title>
            <meta name="google-site-verification" content="koV_gK4fkVLaDcKSZc2o42IzIUDFoOMWtVsrgyoWCHQ" />
            <meta name="description" content="แผนที่พยากรณ์อากาศ ปริมาณฝนสะสมราย 3 ชั่วโมง อุณหภูมิ ความชื้น ความกดอากาศ เรดาห์ ดาวเทียม" />
            <meta name="keywords" content="พยากรณ์อากาศ, แผนที่, สภาพอากาศ, กรมอุตุนิยมวิทยา, weather, forecast, map, wxmap, wxmaptmd " />
          </Helmet>
          <Routes>
            <Route path="/" element={<LazyMapComponent />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<LazyNotfoundComponent />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
