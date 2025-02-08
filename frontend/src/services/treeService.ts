import type { Feature, Point } from 'geojson';
import type { TreeProperties } from './mockData';

export interface TreeLocation {
  latitude: number;
  longitude: number;
}

export const fetchTrees = async (
  percentage: number = 1.0, // 0.0 to 1.0 decimal
  treeDensity: number = 0.01 // trees per square meter
): Promise<Feature<Point, TreeProperties>[]> => {
  try {
    // Debug the actual values being sent
    console.log('Sending request with:', {
      percentage,
      trees_per_square_meter: treeDensity
    });
    
    // Make sure to encode the parameters properly
    const params = new URLSearchParams({
      percentage: percentage.toString(),
      trees_per_square_meter: treeDensity.toString()
    });
    
    const response = await fetch(`/api/trees/?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const treeLocations = await response.json();
    
    // Add debug logging
    console.log(`Fetching trees with density: ${treeDensity} trees/m²`);
    console.log('Tree locations received:', treeLocations.length);
    
    // Ensure treeLocations is an array
    const locationsArray = Array.isArray(treeLocations) ? treeLocations : [];
    
    // Convert backend format to GeoJSON format
    return locationsArray.map((location: TreeLocation, index) => {
      const treeTypes = ['sequoia', 'redwood', 'oak', 'eucalyptus', 'cypress'];
      const randomType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
      
      // Generate realistic random properties
      const height = 20 + Math.random() * 30; // 20-50m
      const diameter = 0.5 + Math.random() * 2.5; // 0.5-3m
      const age = Math.round(height * 2.5 + Math.random() * 20);
      const healthScore = 0.5 + Math.random() * 0.5;
      const crownDiameter = Math.max(5, diameter * 3 + Math.random() * 5); // Crown spread based on trunk diameter
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        properties: {
          id: `tree_${index + 1}`,
          name: `Tree #${index + 1}`,
          species: randomType,
          height,
          diameter,
          age,
          healthScore,
          crownDiameter,
          lastInspection: '2024-01-15',
          carbonSequestration: Math.round(height * diameter * 50)
        }
      };
    });
  } catch (error) {
    console.error('Error fetching trees:', error);
    return [];
  }
}; 