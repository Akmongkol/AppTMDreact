import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Map from './components/Map'
import NotFound from './NotFound';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Map />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
  )
}

export default App
