import { ThemeProvider } from 'styled-components';
import { lightTheme } from './styles/theme';

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <div style={{ padding: '20px' }}>
        <h1>OMNIX AI - Test</h1>
        <p>Testing basic functionality...</p>
      </div>
    </ThemeProvider>
  );
}

export default App;