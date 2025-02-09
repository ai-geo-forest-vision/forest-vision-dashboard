import { MapView } from './components/Map/Map';
import { ControlPanel } from './components/ControlPanel';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import { Species } from './types';

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
  const [asphaltArea, setAsphaltArea] = useState<number>(1000);
  const [speciesDistribution, setSpeciesDistribution] = useState<Record<Species, number>>({
    coast_live_oak: 0.4,
    monterey_pine: 0.3,
    redwood: 0.3,
    california_buckeye: 0,
    western_sycamore: 0,
    london_plane: 0
  });

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
          <ControlPanel 
            onAsphaltAreaChange={setAsphaltArea}
            onSpeciesDistributionChange={setSpeciesDistribution}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
