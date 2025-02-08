import { ScatterplotLayer } from '@deck.gl/layers';
import type { PickingInfo } from '@deck.gl/core';
import type { Feature, Point } from 'geojson';
import type { TreeProperties } from '../../services/mockData';
import { COORDINATE_SYSTEM } from '@deck.gl/core';

const HEALTH_COLORS: Record<string, [number, number, number, number]> = {
  EXCELLENT: [0, 255, 0, 200] as [number, number, number, number],
  GOOD: [150, 255, 0, 200] as [number, number, number, number],
  FAIR: [255, 255, 0, 200] as [number, number, number, number],
  POOR: [255, 150, 0, 200] as [number, number, number, number],
  CRITICAL: [255, 0, 0, 200] as [number, number, number, number]
};

const getHealthColor = (score: number): [number, number, number, number] => {
  if (score >= 0.9) return HEALTH_COLORS.EXCELLENT;
  if (score >= 0.75) return HEALTH_COLORS.GOOD;
  if (score >= 0.6) return HEALTH_COLORS.FAIR;
  if (score >= 0.4) return HEALTH_COLORS.POOR;
  return HEALTH_COLORS.CRITICAL;
};

export const createLayers = (
  data: Feature<Point, TreeProperties>[],
  onHover: (info: PickingInfo) => void
) => {
  // Debug log to verify coordinates
  console.log('Tree coordinates sample:', data.slice(0, 5).map(d => d.geometry.coordinates));

  return [
    new ScatterplotLayer({
      id: 'trees',
      data,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 3,
      radiusMaxPixels: 15,
      lineWidthMinPixels: 1,
      getPosition: (d: Feature<Point, TreeProperties>) => {
        const coords = d.geometry.coordinates as [number, number];
        // Additional coordinate validation
        if (!Array.isArray(coords) || coords.length !== 2 || 
            !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
          console.warn('Invalid coordinates:', coords);
          return [0, 0];
        }
        return coords;
      },
      getRadius: (d: Feature<Point, TreeProperties>) => Math.max(5, Math.min(10, d.properties.height / 3)),
      getFillColor: (d: Feature<Point, TreeProperties>) => getHealthColor(d.properties.healthScore),
      getLineColor: [0, 0, 0],
      onHover,
      updateTriggers: {
        getPosition: data,
        getRadius: data,
        getFillColor: data
      }
    })
  ];
}; 