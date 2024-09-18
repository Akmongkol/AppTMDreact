import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Map from './components/Map'
import Notfound from './Notfound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Map />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
