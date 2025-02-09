import { useRef, useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map as MapGL } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import type { PickingInfo } from '@deck.gl/core';
import type { Feature, Point } from 'geojson';
import type { ViewState as MapViewState } from 'react-map-gl';
import type { TreeProperties } from '../../types';
import { fetchTrees } from '../../services/treeService';
import { createLayers } from './layers';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type ViewState = MapViewState & {
  width: number;
  height: number;
};

// Center point calculated from the coordinates range
// Latitude range: 37.7398313013 to 37.7979671982
// Longitude range: -122.4667163023 to -122.398147199
const INITIAL_VIEW_STATE: ViewState = {
  longitude: -122.432431,  // Center of longitude range
  latitude: 37.768899,     // Center of latitude range
  zoom: 13,               // Adjusted zoom to show all points
  pitch: 0,
  bearing: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
  width: window.innerWidth,
  height: window.innerHeight
};

export const MapView = () => {
  const mapRef = useRef<MapRef>(null);
  const deckRef = useRef(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [hoveredFeature, setHoveredFeature] = useState<Feature<Point, TreeProperties> | null>(null);
  const [trees, setTrees] = useState<Feature<Point, TreeProperties>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [treeCount, setTreeCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }

      setViewState(prev => ({
        ...prev,
        width: window.innerWidth,
        height: window.innerHeight
      }));

      if (mapRef.current) {
        mapRef.current.resize();
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        setViewState(prev => ({
          ...prev,
          width: window.innerWidth,
          height: window.innerHeight
        }));
        
        if (mapRef.current) {
          mapRef.current.resize();
        }
        resizeTimeoutRef.current = null;
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadTrees = async () => {
      setIsLoading(true);
      try {
        const treeData = await fetchTrees(1.0, 0.01); // Use fixed values for now
        console.log('Loaded trees:', treeData.length);
        setTrees(treeData);
        setTreeCount(treeData.length);
      } catch (error) {
        console.error('Error loading trees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrees();
  }, []); // Only load once on mount

  const onHover = (info: PickingInfo) => {
    setHoveredFeature(info.object as Feature<Point, TreeProperties> | null);
  };

  const layers = useMemo(() => createLayers(trees, onHover), [trees]);

  // Update cursor style based on hover state
  useEffect(() => {
    const canvas = mapRef.current?.getMap()?.getCanvas();
    if (canvas) {
      canvas.style.cursor = hoveredFeature ? 'pointer' : 'grab';
    }
  }, [hoveredFeature]);

  // Cleanup WebGL context on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        const map = mapRef.current.getMap();
        if (map) {
          map.remove();
        }
      }
    };
  }, []);

  return (
    <DeckGL
      ref={deckRef}
      viewState={viewState}
      controller={true}
      layers={layers}
      onViewStateChange={({ viewState: nextViewState }) => {
        if ('longitude' in nextViewState && 'latitude' in nextViewState && 'zoom' in nextViewState) {
          setViewState(prev => ({
            ...prev,
            longitude: nextViewState.longitude,
            latitude: nextViewState.latitude,
            zoom: nextViewState.zoom,
            pitch: nextViewState.pitch ?? prev.pitch,
            bearing: nextViewState.bearing ?? prev.bearing
          }));
        }
      }}
      parameters={{
        blend: true
      }}
    >
      <MapGL
        ref={mapRef}
        reuseMaps
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      />
      {hoveredFeature && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1,
            pointerEvents: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            maxWidth: '300px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {hoveredFeature.properties.name}
          </div>
          <div>Species: {hoveredFeature.properties.species}</div>
          <div>Height: {hoveredFeature.properties.height}m</div>
          <div>Diameter: {hoveredFeature.properties.diameter}m</div>
          <div>Age: {hoveredFeature.properties.age} years</div>
          <div>Health: {(hoveredFeature.properties.healthScore * 100).toFixed(1)}%</div>
          <div>Carbon Seq.: {hoveredFeature.properties.carbonSequestration} kg/year</div>
          <div>Last Inspection: {hoveredFeature.properties.lastInspection}</div>
        </div>
      )}
      {isLoading ? (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            zIndex: 1000,
          }}
        >
          Loading trees...
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          Trees loaded: {treeCount}
        </div>
      )}
    </DeckGL>
  );
}; 