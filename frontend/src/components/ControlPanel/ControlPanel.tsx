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

interface ParkingType {
  id: string;
  name: string;
  description: string;
}

const TREE_TYPES: TreeType[] = [
  { id: 'sequoia', name: 'Giant Sequoia', co2PerYear: 1000, albedoImpact: 0.35 },
  { id: 'redwood', name: 'Coastal Redwood', co2PerYear: 900, albedoImpact: 0.32 },
  { id: 'oak', name: 'Valley Oak', co2PerYear: 500, albedoImpact: 0.28 },
  { id: 'eucalyptus', name: 'Blue Gum', co2PerYear: 600, albedoImpact: 0.30 },
  { id: 'cypress', name: 'Monterey Cypress', co2PerYear: 400, albedoImpact: 0.25 },
];

const PARKING_TYPES: ParkingType[] = [
  { id: 'surface', name: 'Surface Parking Lots', description: 'Ground-level parking areas' },
  { id: 'garage', name: 'Parking Garages', description: 'Multi-level parking structures' },
  { id: 'street', name: 'Street Parking', description: 'On-street parking spaces' },
  { id: 'all', name: 'All Parking Types', description: 'All available parking spaces' },
];

interface ControlPanelProps {
  selectedParkingType: string;
  onParkingTypeChange: (parkingType: string) => void;
  treeDensity: number;
  onTreeDensityChange: (density: number) => void;
}

export const ControlPanel = ({ 
  selectedParkingType, 
  onParkingTypeChange,
  treeDensity,
  onTreeDensityChange
}: ControlPanelProps) => {
  const [selectedTreeType, setSelectedTreeType] = useState<string>(TREE_TYPES[0].id);
  const [previousCO2, setPreviousCO2] = useState<number>(0);
  const [previousAlbedo, setPreviousAlbedo] = useState<number>(0);

  const formatDensity = (value: number) => {
    return `${value.toFixed(3)} trees/m²`;
  };

  const selectedTree = TREE_TYPES.find(tree => tree.id === selectedTreeType) || TREE_TYPES[0];
  const selectedParking = PARKING_TYPES.find(type => type.id === selectedParkingType) || PARKING_TYPES[0];
  const estimatedArea = 1000 * 10000; // Fixed 1000 hectares in square meters
  const estimatedTrees = Math.floor(estimatedArea * treeDensity);
  const totalCO2Offset = (estimatedTrees * selectedTree.co2PerYear) / 1000; // Convert to metric tons
  const avgAlbedo = selectedTree.albedoImpact;

  // Calculate differences
  const co2Difference = totalCO2Offset - previousCO2;
  const albedoDifference = avgAlbedo - previousAlbedo;

  // Update previous values after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousCO2(totalCO2Offset);
      setPreviousAlbedo(avgAlbedo);
    }, 1000);
    return () => clearTimeout(timer);
  }, [totalCO2Offset, avgAlbedo]);

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
        <Typography gutterBottom>Tree Density</Typography>
        <Slider
          value={treeDensity}
          onChange={(_, newValue) => onTreeDensityChange(newValue as number)}
          min={0.001}
          max={0.02}
          step={0.001}
          valueLabelDisplay="auto"
          valueLabelFormat={formatDensity}
          marks={[
            { value: 0.001, label: '0.001' },
            { value: 0.01, label: '0.01' },
            { value: 0.02, label: '0.02' }
          ]}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
          Density: {formatDensity(treeDensity)}
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="parking-type-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Parking Type
          </InputLabel>
          <Select
            labelId="parking-type-label"
            value={selectedParkingType}
            label="Parking Type"
            onChange={(e) => onParkingTypeChange(e.target.value)}
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
            {PARKING_TYPES.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Area Coverage
          </Typography>
          <Typography variant="h6" sx={{ color: '#81C784', mt: 1 }}>
            {estimatedArea.toLocaleString()} square meters
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
          Estimated Trees: {estimatedTrees.toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
}; 