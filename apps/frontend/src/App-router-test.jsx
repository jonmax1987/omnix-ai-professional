import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const TestPage = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1 style={{ color: '#2563eb' }}>OMNIX AI</h1>
    <p>✅ React is working!</p>
    <p>✅ React Router is working!</p>
    <p>The application is running successfully.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;