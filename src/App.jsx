// Import React and Suspense
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


const LazyMapComponent = React.lazy(() => import('./components/Map'));
const LazyNotfoundComponent = React.lazy(() => import('./Notfound'));

function App() {
  return (
    <BrowserRouter>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<LazyMapComponent />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<LazyNotfoundComponent/>} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
