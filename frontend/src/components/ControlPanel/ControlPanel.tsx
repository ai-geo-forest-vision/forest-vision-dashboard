import { Box, Paper, Slider, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface TreeType {
  id: string;
  name: string;
  co2PerYear: number;
  albedoImpact: number;
}

const TREE_TYPES: TreeType[] = [
  { id: 'sequoia', name: 'Giant Sequoia', co2PerYear: 1000, albedoImpact: 0.35 },
  { id: 'redwood', name: 'Coastal Redwood', co2PerYear: 900, albedoImpact: 0.32 },
  { id: 'oak', name: 'Valley Oak', co2PerYear: 500, albedoImpact: 0.28 },
  { id: 'eucalyptus', name: 'Blue Gum', co2PerYear: 600, albedoImpact: 0.30 },
  { id: 'cypress', name: 'Monterey Cypress', co2PerYear: 400, albedoImpact: 0.25 },
];

export const ControlPanel = () => {
  const [budget, setBudget] = useState<number>(1000000);
  const [selectedTreeType, setSelectedTreeType] = useState<string>(TREE_TYPES[0].id);
  const [previousBudget, setPreviousBudget] = useState<number>(budget);
  const [previousCO2, setPreviousCO2] = useState<number>(0);
  const [previousAlbedo, setPreviousAlbedo] = useState<number>(0);

  const formatBudget = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const selectedTree = TREE_TYPES.find(tree => tree.id === selectedTreeType) || TREE_TYPES[0];
  const estimatedTrees = Math.floor(budget / 1000); // Assuming $1000 per tree
  const totalCO2Offset = (estimatedTrees * selectedTree.co2PerYear) / 1000; // Convert to metric tons
  const avgAlbedo = selectedTree.albedoImpact;

  // Calculate differences
  const co2Difference = totalCO2Offset - previousCO2;
  const albedoDifference = avgAlbedo - previousAlbedo;

  // Update previous values after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousBudget(budget);
      setPreviousCO2(totalCO2Offset);
      setPreviousAlbedo(avgAlbedo);
    }, 1000);
    return () => clearTimeout(timer);
  }, [budget, totalCO2Offset, avgAlbedo]);

  const DifferenceIndicator = ({ value, unit }: { value: number; unit: string }) => {
    if (Math.abs(value) < 0.01) return null;
    const color = value > 0 ? '#4CAF50' : '#ff4444';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', color, ml: 1, fontSize: '0.8rem' }}>
        {value > 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
        {value > 0 ? '+' : ''}{value.toFixed(1)}{unit}
      </Box>
    );
  };

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
        Forest Management
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Typography gutterBottom>Yearly Budget Allocation</Typography>
        <Slider
          value={budget}
          onChange={(_, newValue) => setBudget(newValue as number)}
          min={100000}
          max={10000000}
          step={100000}
          valueLabelDisplay="auto"
          valueLabelFormat={formatBudget}
          marks={[
            { value: 100000, label: '$100k' },
            { value: 10000000, label: '$10M' }
          ]}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
          Current Yearly Budget: {formatBudget(budget)}
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="tree-type-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Tree Type
          </InputLabel>
          <Select
            labelId="tree-type-label"
            value={selectedTreeType}
            label="Tree Type"
            onChange={(e) => setSelectedTreeType(e.target.value)}
            sx={{
              color: 'white',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '.MuiSvgIcon-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          >
            {TREE_TYPES.map((tree) => (
              <MenuItem key={tree.id} value={tree.id}>
                {tree.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
          Yearly Impact Indicators
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            CO₂ Offset
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#4CAF50', mt: 1 }}>
              {totalCO2Offset.toFixed(1)} metric tons
            </Typography>
            <DifferenceIndicator value={co2Difference} unit=" mt" />
          </Box>
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Average Albedo Impact
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#81C784', mt: 1 }}>
              {(avgAlbedo * 100).toFixed(1)}%
            </Typography>
            <DifferenceIndicator value={albedoDifference * 100} unit="%" />
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
          Estimated Trees per Year: {estimatedTrees.toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
}; 