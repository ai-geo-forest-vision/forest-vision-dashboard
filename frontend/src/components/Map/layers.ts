import { ScatterplotLayer, IconLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import type { PickingInfo } from '@deck.gl/core';
import type { Feature, Point } from 'geojson';
import type { TreeProperties } from '../../services/mockData';

// Load tree icon
const ICON_MAPPING = {
  tree: { x: 0, y: 0, width: 128, height: 128, mask: true }
};

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
) => [
  new IconLayer({
    id: 'tree-icons',
    data,
    pickable: true,
    iconAtlas: '/tree.png',
    iconMapping: ICON_MAPPING,
    getIcon: () => 'tree',
    sizeScale: 15,
    getPosition: d => d.geometry.coordinates,
    getSize: d => Math.max(10, Math.min(20, d.properties.height / 2)),
    getColor: d => getHealthColor(d.properties.healthScore),
    onHover
  }),
  new HexagonLayer({
    id: 'tree-density',
    data,
    pickable: true,
    extruded: true,
    radius: 100,
    elevationScale: 10,
    getPosition: d => d.geometry.coordinates,
    colorRange: [
      [237, 248, 233],
      [186, 228, 179],
      [116, 196, 118],
      [49, 163, 84],
      [0, 109, 44]
    ],
    coverage: 0.8,
    upperPercentile: 90,
    opacity: 0.3
  })
]; 