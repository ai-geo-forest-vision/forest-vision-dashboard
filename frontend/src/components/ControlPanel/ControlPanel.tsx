import { Box, Paper, Slider, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from 'react';
import { Species, CALIFORNIA_SPECIES } from '../../types';

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface ControlPanelProps {
  onAsphaltAreaChange: (area: number) => void;
  onSpeciesDistributionChange: (distribution: Record<Species, number>) => void;
  onTreeDensityChange?: (density: number) => void;
  onLandPercentageChange?: (percentage: number) => void;
}

export const ControlPanel = ({
  onAsphaltAreaChange,
  onSpeciesDistributionChange,
  onTreeDensityChange,
  onLandPercentageChange
}: ControlPanelProps) => {
  // Internal state for immediate UI updates
  const [treeDensity, setTreeDensity] = useState<number>(0.01); // trees per square meter
  const [landPercentage, setLandPercentage] = useState<number>(100); // percentage of available land
  const [speciesDistribution, setSpeciesDistribution] = useState<Record<Species, number>>({
    coast_live_oak: 40,
    monterey_pine: 30,
    redwood: 30,
    california_buckeye: 0,
    western_sycamore: 0,
    london_plane: 0
  });

  // Debounced values
  const debouncedTreeDensity = useDebounce(treeDensity, 500);
  const debouncedLandPercentage = useDebounce(landPercentage, 500);
  const debouncedSpeciesDistribution = useDebounce(speciesDistribution, 500);

  const formatArea = (value: number) => {
    return `${value.toLocaleString()} sq ft`;
  };

  const handleTreeDensityChange = (newValue: number) => {
    setTreeDensity(newValue);
  };

  const handleLandPercentageChange = (newValue: number) => {
    setLandPercentage(newValue);
  };

  const handleSpeciesChange = (species: Species, newPercentage: number) => {
    const newDistribution = { ...speciesDistribution };
    newDistribution[species] = newPercentage;

    // Get all other species and their current total
    const otherSpecies = Object.keys(newDistribution).filter(s => s !== species) as Species[];
    const remainingPercentage = Math.max(0, 100 - newPercentage);
    const currentOtherSum = otherSpecies.reduce((sum, s) => sum + newDistribution[s], 0);

    if (currentOtherSum === 0) {
      // If all other species are 0, distribute remaining percentage equally
      const percentagePerSpecies = remainingPercentage / otherSpecies.length;
      otherSpecies.forEach(s => {
        newDistribution[s] = percentagePerSpecies;
      });
    } else {
      // Distribute remaining percentage proportionally based on current ratios
      const scaleFactor = remainingPercentage / currentOtherSum;
      otherSpecies.forEach(s => {
        newDistribution[s] = Math.round(newDistribution[s] * scaleFactor);
      });
    }

    // Round values to whole numbers
    Object.keys(newDistribution).forEach(key => {
      newDistribution[key as Species] = Math.round(newDistribution[key as Species]);
    });

    // Ensure total is exactly 100
    const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const diff = 100 - total;
      // Add/subtract the difference from the largest value
      const largestKey = Object.entries(newDistribution)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0] as Species;
      newDistribution[largestKey] += diff;
    }

    setSpeciesDistribution(newDistribution);
  };

  // Calculate total percentage
  const totalPercentage = Object.values(speciesDistribution).reduce((sum, val) => sum + val, 0);

  // Effect for tree density changes
  useEffect(() => {
    onTreeDensityChange?.(debouncedTreeDensity);
  }, [debouncedTreeDensity]);

  // Effect for land percentage changes
  useEffect(() => {
    onLandPercentageChange?.(debouncedLandPercentage / 100);
    const totalArea = 20670000 * (debouncedLandPercentage / 100);
    onAsphaltAreaChange(totalArea);
  }, [debouncedLandPercentage]);

  // Effect for species distribution changes
  useEffect(() => {
    const decimalDistribution = Object.entries(debouncedSpeciesDistribution).reduce((acc, [key, value]) => {
      acc[key as Species] = value / 100;
      return acc;
    }, {} as Record<Species, number>);
    
    onSpeciesDistributionChange(decimalDistribution);
  }, [debouncedSpeciesDistribution]);

  // Initial calculation of area when component mounts
  useEffect(() => {
    const initialArea = 206700000 * (landPercentage / 100);
    onAsphaltAreaChange(initialArea);
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        right: 20,
        top: 20,
        width: 300,
        p: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Tree Generation Settings
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography gutterBottom>Tree Density (trees/m²)</Typography>
        <Slider
          value={treeDensity}
          onChange={(_, newValue) => handleTreeDensityChange(newValue as number)}
          min={0.001}
          max={0.1}
          step={0.001}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => value.toFixed(3)}
          marks={[
            { value: 0.001, label: '0.001' },
            { value: 0.05, label: '0.05' },
            { value: 0.1, label: '0.1' }
          ]}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
          {treeDensity.toFixed(3)} trees/m²
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography gutterBottom>Available Land Usage</Typography>
        <Slider
          value={landPercentage}
          onChange={(_, newValue) => handleLandPercentageChange(newValue as number)}
          min={1}
          max={100}
          step={1}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
          marks={[
            { value: 1, label: '1%' },
            { value: 50, label: '50%' },
            { value: 100, label: '100%' }
          ]}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
          Using {landPercentage}% of available land ({((206700000 * landPercentage) / 100).toLocaleString()} sq ft)
        </Typography>
      </Box>

      <Accordion 
        sx={{ 
          mt: 4, 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'white',
          '&:before': {
            display: 'none',
          },
          '& .MuiAccordionSummary-root': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            color: 'white',
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="species-distribution-content"
          id="species-distribution-header"
        >
          <Box>
            <Typography variant="subtitle1">Species Distribution</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Total: {totalPercentage}%
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {Object.entries(CALIFORNIA_SPECIES).map(([key, name]) => (
            <Box key={key} sx={{ mt: 2 }}>
              <Typography variant="body2">
                {name} ({speciesDistribution[key as Species]}%)
              </Typography>
              <Slider
                value={speciesDistribution[key as Species]}
                onChange={(_, newValue) => handleSpeciesChange(key as Species, newValue as number)}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}; 