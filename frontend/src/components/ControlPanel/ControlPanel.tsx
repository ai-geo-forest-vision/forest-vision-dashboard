import { Box, Paper, Slider, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { Species, CALIFORNIA_SPECIES } from '../../types';

interface ControlPanelProps {
  onAsphaltAreaChange: (area: number) => void;
  onSpeciesDistributionChange: (distribution: Record<Species, number>) => void;
}

export const ControlPanel = ({
  onAsphaltAreaChange,
  onSpeciesDistributionChange
}: ControlPanelProps) => {
  const [asphaltArea, setAsphaltArea] = useState<number>(1000);
  // Store percentages internally (0-100)
  const [speciesDistribution, setSpeciesDistribution] = useState<Record<Species, number>>({
    coast_live_oak: 40,
    monterey_pine: 30,
    redwood: 30,
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

  const formatArea = (value: number) => {
    return `${value.toLocaleString()} sq ft`;
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
    
    // Convert percentages to decimals (0-1) for the backend
    const decimalDistribution = Object.entries(newDistribution).reduce((acc, [key, value]) => {
      acc[key as Species] = value / 100;
      return acc;
    }, {} as Record<Species, number>);
    
    onSpeciesDistributionChange(decimalDistribution);
  };

  useEffect(() => {
    const fetchConversionResults = async () => {
      try {
        // Convert percentages to decimals for the API call
        const decimalDistribution = Object.entries(speciesDistribution).reduce((acc, [key, value]) => {
          acc[key as Species] = value / 100;
          return acc;
        }, {} as Record<Species, number>);

        const response = await fetch('http://localhost:5003/asphalt-conversion/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            asphalt_sqft: asphaltArea,
            species_distribution: decimalDistribution,
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

  // Calculate total percentage
  const totalPercentage = Object.values(speciesDistribution).reduce((sum, val) => sum + val, 0);

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
        Species Distribution
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography gutterBottom>Asphalt Area to Convert</Typography>
        <Slider
          value={asphaltArea}
          onChange={(_, newValue) => {
            setAsphaltArea(newValue as number);
            onAsphaltAreaChange(newValue as number);
          }}
          min={100}
          max={10000}
          step={100}
          valueLabelDisplay="auto"
          valueLabelFormat={formatArea}
          marks={[
            { value: 100, label: '100' },
            { value: 5000, label: '5k' },
            { value: 10000, label: '10k' }
          ]}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
          Area: {formatArea(asphaltArea)}
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography gutterBottom>Species Distribution</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total: {totalPercentage}%
        </Typography>
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
      </Box>

      {conversionResults && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
            Impact Metrics
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Asphalt Removal Cost
            </Typography>
            <Typography variant="h6" sx={{ color: '#4CAF50', mt: 1 }}>
              ${conversionResults.asphalt_removal_cost.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Total Maintenance Cost (5 years)
            </Typography>
            <Typography variant="h6" sx={{ color: '#81C784', mt: 1 }}>
              ${conversionResults.total_maintenance_cost.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              CO₂ Reduction (5 years)
            </Typography>
            <Typography variant="h6" sx={{ color: '#81C784', mt: 1 }}>
              {conversionResults.total_co2_reduction_kg.toLocaleString()} kg
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Trees to be Planted:
            </Typography>
            {Object.entries(conversionResults.trees_planted_per_species).map(([species, count]) => (
              <Typography key={species} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {CALIFORNIA_SPECIES[species as Species]}: {count}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}; 