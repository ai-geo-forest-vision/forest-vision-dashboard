import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map as MapGL } from 'react-map-gl';
import { ViewState, ForestData } from '../../types';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';

// Mapbox token from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE: ViewState = {
  longitude: -122.4,
  latitude: 37.8,
  zoom: 11,
  pitch: 30,
  bearing: 0
};

// Mock data - replace with actual API calls
const MOCK_FOREST_DATA: ForestData[] = [
  {
    id: '1',
    coordinates: [-122.4, 37.8],
    properties: {
      name: 'Forest Area 1',
      area: 1000,
      treeCount: 500,
      healthScore: 0.8
    }
  }
];

export const MapView = () => {
  const deckRef = useRef<any>(null);
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);

  const onViewStateChange = useCallback(
    ({ viewState: newViewState }: any) => {
      setViewState(newViewState);
    },
    []
  );

  // Memoize layers to prevent unnecessary recreation
  const layers = useMemo(() => [
    new ScatterplotLayer({
      id: 'forest-points',
      data: MOCK_FOREST_DATA,
      getPosition: (d: ForestData) => d.coordinates,
      getFillColor: (d: ForestData) => [0, 255 * d.properties.healthScore, 0],
      getRadius: (d: ForestData) => Math.sqrt(d.properties.area),
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 3,
      radiusMaxPixels: 30,
    }),
    new HexagonLayer({
      id: 'hexagon-layer',
      data: MOCK_FOREST_DATA,
      getPosition: (d: ForestData) => d.coordinates,
      radius: 1000,
      elevationScale: 100,
      extruded: true,
      pickable: true,
    })
  ], []);

  // Cleanup WebGL context on unmount
  useEffect(() => {
    return () => {
      if (deckRef.current) {
        // @ts-ignore - _deck exists on the DeckGL instance
        const deck = deckRef.current._deck;
        if (deck) {
          deck.finalize();
        }
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <DeckGL
        ref={deckRef}
        viewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={onViewStateChange}
      >
        <MapGL
          reuseMaps
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>
    </div>
  );
}; 