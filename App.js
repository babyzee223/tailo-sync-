import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SettingsPage from './SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
