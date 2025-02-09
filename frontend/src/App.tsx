import { MapView } from './components/Map/Map';
import { ControlPanel } from './components/ControlPanel';
import { ImpactMetrics } from './components/ImpactMetrics';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState, useEffect } from 'react';
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
  const [treeDensity, setTreeDensity] = useState<number>(0.01);
  const [landPercentage, setLandPercentage] = useState<number>(1.0);
  const [speciesDistribution, setSpeciesDistribution] = useState<Record<Species, number>>({
    coast_live_oak: 0.4,
    monterey_pine: 0.3,
    redwood: 0.3,
    california_buckeye: 0,
    western_sycamore: 0,
    london_plane: 0
  });
  const [conversionResults, setConversionResults] = useState<{
    asphalt_removal_cost: number;
    trees_planted_per_species: Record<Species, number>;
    total_maintenance_cost: number;
    total_co2_reduction_kg: number;
  } | null>(null);

  useEffect(() => {
    const fetchConversionResults = async () => {
      try {
        const response = await fetch('http://localhost:5003/asphalt-conversion/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            asphalt_sqft: asphaltArea,
            species_distribution: speciesDistribution,
            spacing_sqft_per_tree: 100.0,
            cost_removal_per_sqft: 10.0,
            maintenance_years: 5
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setConversionResults(data);
        }
      } catch (error) {
        console.error('Error fetching conversion results:', error);
      }
    };

    fetchConversionResults();
  }, [asphaltArea, speciesDistribution]);

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
            treeDensity={treeDensity}
            landPercentage={landPercentage}
          />
          <ImpactMetrics conversionResults={conversionResults} />
          <ControlPanel 
            onAsphaltAreaChange={setAsphaltArea}
            onSpeciesDistributionChange={setSpeciesDistribution}
            onTreeDensityChange={setTreeDensity}
            onLandPercentageChange={setLandPercentage}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
