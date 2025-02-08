import type { FeatureCollection, Feature, Point } from 'geojson';

export interface TreeProperties {
  id: string;
  name: string;
  species: string;
  height: number;
  diameter: number;
  age: number;
  healthScore: number;
  lastInspection: string;
  carbonSequestration: number;
}

// Tree species for random assignment
const TREE_SPECIES = [
  { name: 'Giant Sequoia', species: 'Sequoiadendron giganteum', maxHeight: 50, maxDiameter: 3 },
  { name: 'Coastal Redwood', species: 'Sequoia sempervirens', maxHeight: 40, maxDiameter: 2.5 },
  { name: 'Valley Oak', species: 'Quercus lobata', maxHeight: 30, maxDiameter: 1.8 },
  { name: 'Blue Gum', species: 'Eucalyptus globulus', maxHeight: 35, maxDiameter: 2 },
  { name: 'Monterey Cypress', species: 'Cupressus macrocarpa', maxHeight: 25, maxDiameter: 1.5 }
];

// Sample coordinates from San Francisco
const COORDINATES = [
  [-122.4030617994, 37.7798804984],
  [-122.4173274019, 37.7853052997],
  [-122.4194, 37.7749],
  [-122.4184, 37.7739],
  [-122.4174, 37.7759],
  [-122.4164, 37.7769],
  [-122.4154, 37.7779],
  [-122.4144, 37.7789],
  [-122.4134, 37.7799],
  [-122.4124, 37.7809]
];

// Generate random tree data
const generateTreeData = (): Feature<Point, TreeProperties>[] => {
  return COORDINATES.map((coords, index) => {
    const species = TREE_SPECIES[Math.floor(Math.random() * TREE_SPECIES.length)];
    const height = Math.round(species.maxHeight * (0.7 + Math.random() * 0.3));
    const diameter = Math.round(species.maxDiameter * (0.6 + Math.random() * 0.4) * 10) / 10;
    const age = Math.round(height * 2.5 + Math.random() * 20);
    const healthScore = 0.5 + Math.random() * 0.5;
    const carbonSeq = Math.round(height * diameter * 50);

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coords
      },
      properties: {
        id: `tree_${index + 1}`,
        name: `${species.name} #${index + 1}`,
        species: species.species,
        height,
        diameter,
        age,
        healthScore,
        lastInspection: '2024-01-15',
        carbonSequestration: carbonSeq
      }
    };
  });
};

export const mockTreeData: FeatureCollection<Point, TreeProperties> = {
  type: 'FeatureCollection',
  features: generateTreeData()
}; 