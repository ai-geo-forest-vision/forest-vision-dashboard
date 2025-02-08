import type { Feature, Point } from 'geojson';
import type { TreeProperties } from './mockData';

export interface TreeLocation {
  latitude: number;
  longitude: number;
}

export const fetchTrees = async (): Promise<Feature<Point, TreeProperties>[]> => {
  try {
    const response = await fetch('/api/trees/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const treeLocations = await response.json();
    
    // Add debug logging
    console.log('Tree locations received:', treeLocations);
    
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