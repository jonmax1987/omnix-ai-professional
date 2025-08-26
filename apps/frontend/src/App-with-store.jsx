import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from './styles/theme';
import useStore from './store';

// Simple test component instead of complex Dashboard
const TestDashboard = () => (
  <div style={{ padding: '20px' }}>
    <h1>OMNIX AI Dashboard</h1>
    <p>Basic dashboard test</p>
  </div>
);

function App() {
  const { ui } = useStore();
  const currentTheme = lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <Router>
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<TestDashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;