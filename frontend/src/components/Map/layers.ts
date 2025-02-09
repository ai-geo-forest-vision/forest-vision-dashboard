import { IconLayer } from '@deck.gl/layers';
import type { PickingInfo } from '@deck.gl/core';
import type { Feature, Point } from 'geojson';
import type { TreeProperties, IconMapping } from '../../types';
import { Position, COORDINATE_SYSTEM } from '@deck.gl/core';

// Define the icon mapping for different tree species
const ICON_MAPPING: IconMapping = {
  sequoia: { x: 0, y: 0, width: 128, height: 128 },
  redwood: { x: 128, y: 0, width: 128, height: 128 },
  oak: { x: 256, y: 0, width: 128, height: 128 },
  eucalyptus: { x: 384, y: 0, width: 128, height: 128 },
  cypress: { x: 512, y: 0, width: 128, height: 128 }
};

export const createLayers = (
  data: Feature<Point, TreeProperties>[],
  onHover: (info: PickingInfo) => void
) => [
  new IconLayer<Feature<Point, TreeProperties>>({
    id: 'trees',
    data,
    pickable: true,
    iconAtlas: '/tree-satellite-sprites.png',
    iconMapping: ICON_MAPPING,
    getIcon: d => d.properties.species.toLowerCase(),
    sizeUnits: 'pixels',
    sizeScale: 1,
    sizeMinPixels: 10,
    sizeMaxPixels: 20,
    getSize: 5,
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    billboard: true,
    alphaCutoff: 0.05,
    getPosition: d => {
      const coords = d.geometry.coordinates;
      return Array.isArray(coords) && coords.length === 2 
        ? new Float32Array([coords[0], coords[1], 0]) 
        : new Float32Array([0, 0, 0]);
    },
    getColor: d => {
      const health = d.properties.healthScore;
      return [255, 255, 255, Math.max(100, health * 255)];
    },
    onHover,
    updateTriggers: {
      getIcon: [data],
      getColor: [data]
    }
  })
]; 