import { MapView } from './components/Map/Map';
import { ControlPanel } from './components/ControlPanel';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#81C784',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            position: 'relative',
          }}
        >
          <MapView />
          <ControlPanel />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
