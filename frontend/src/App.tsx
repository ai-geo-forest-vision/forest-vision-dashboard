import { MapView } from './components/Map/Map';
import { ControlPanel } from './components/ControlPanel';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';

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
  const [selectedParkingType, setSelectedParkingType] = useState<string>('all');
  const [treeDensity, setTreeDensity] = useState<number>(0.01); // Default 0.01 trees per square meter

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
          <MapView 
            parkingType={selectedParkingType}
            treeDensity={treeDensity}
          />
          <ControlPanel 
            selectedParkingType={selectedParkingType}
            onParkingTypeChange={setSelectedParkingType}
            treeDensity={treeDensity}
            onTreeDensityChange={setTreeDensity}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
