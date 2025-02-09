import { Box, Paper, Typography } from '@mui/material';
import { Species, CALIFORNIA_SPECIES } from '../../types';

interface ImpactMetricsProps {
  conversionResults: {
    asphalt_removal_cost: number;
    trees_planted_per_species: Record<Species, number>;
    total_maintenance_cost: number;
    total_co2_reduction_kg: number;
  } | null;
}

export const ImpactMetrics = ({ conversionResults }: ImpactMetricsProps) => {
  if (!conversionResults) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        left: 20,
        top: 20,
        width: 300,
        p: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" gutterBottom>
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
    </Paper>
  );
}; 