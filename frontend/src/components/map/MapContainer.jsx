import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Compass, ZoomIn, ZoomOut, AlertTriangle, Droplets, ShieldCheck, Truck } from 'lucide-react';
import { useUIStore } from '../../features/useUIStore';

// Default basemap mode: 'carto' (Option A), 'osm' (Option B), 'none' (Option C)
export const MAP_BASEMAP_MODES = {
  CARTO: 'carto',
  OSM: 'osm',
  NONE: 'none'
};

export function MapContainer({
  center = [92.50, 26.00], // NER Centroid
  zoom = 6.8,
  pitch = 30,
  bearing = 0,
  vehicles = [],
  roadSegments = [],
  districts = [],
  highlightedRoute = null,
  candidateRoutes = [],
  basemapMode: propBasemapMode = 'carto',
  onVehicleClick = () => {},
  onRoadClick = () => {},
  className = '',
  height = '600px'
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const animationFrameRef = useRef(null);
  const popupRef = useRef(null);

  const { mapLayers } = useUIStore();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeBasemap, setActiveBasemap] = useState(propBasemapMode);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (propBasemapMode !== activeBasemap && !isOfflineFallback) {
      setActiveBasemap(propBasemapMode);
    }
  }, [propBasemapMode]);

  // Construct MapLibre Style based on selected Basemap mode
  const getStyleForMode = (mode) => {
    const baseStyle = {
      version: 8,
      sources: {},
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#0B1220'
          }
        }
      ]
    };

    if (mode === MAP_BASEMAP_MODES.CARTO) {
      baseStyle.sources['carto-raster-tiles'] = {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      };
      baseStyle.layers.push({
        id: 'carto-tiles-layer',
        type: 'raster',
        source: 'carto-raster-tiles',
        minzoom: 0,
        maxzoom: 19,
        paint: {
          'raster-opacity': 0.85,
          'raster-brightness-min': 0.0,
          'raster-brightness-max': 0.85,
          'raster-contrast': 0.15
        }
      });
    } else if (mode === MAP_BASEMAP_MODES.OSM) {
      baseStyle.sources['osm-raster-tiles'] = {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors'
      };
      baseStyle.layers.push({
        id: 'osm-tiles-layer',
        type: 'raster',
        source: 'osm-raster-tiles',
        minzoom: 0,
        maxzoom: 19,
        paint: {
          'raster-opacity': 0.65,
          'raster-saturation': -0.7,
          'raster-contrast': 0.2
        }
      });
    }
    // 'none' mode has no raster layer, relying solely on #0B1220 background and GeoJSON vector overlays

    return baseStyle;
  };

  // Initialize or Reinitialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      setMapLoaded(false);
    }

    const currentStyle = getStyleForMode(activeBasemap);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: currentStyle,
      center,
      zoom,
      pitch,
      bearing
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    // Handle tile loading errors gracefully with silent fallback to pure offline tactical canvas (Option C)
    map.on('error', (e) => {
      if (e && e.error && (e.error.status === 404 || e.error.status === 429 || e.error.message?.includes('tile'))) {
        console.warn('[MapEngine] Tile load failed, switching to guaranteed Option C tactical canvas.');
        if (activeBasemap !== MAP_BASEMAP_MODES.NONE) {
          setIsOfflineFallback(true);
          setActiveBasemap(MAP_BASEMAP_MODES.NONE);
        }
      }
    });

    map.on('load', () => {
      mapRef.current = map;
      setMapLoaded(true);

      // 1. Add Districts GeoJSON Source
      map.addSource('ner-districts-src', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: districts.map((d) => ({
            type: 'Feature',
            properties: d,
            geometry: {
              type: 'Polygon',
              coordinates: d.boundaryCoordinates?.length
                ? d.boundaryCoordinates
                : [
                    [
                      [d.centroid[0] - 0.2, d.centroid[1] - 0.2],
                      [d.centroid[0] + 0.2, d.centroid[1] - 0.2],
                      [d.centroid[0] + 0.2, d.centroid[1] + 0.2],
                      [d.centroid[0] - 0.2, d.centroid[1] + 0.2],
                      [d.centroid[0] - 0.2, d.centroid[1] - 0.2]
                    ]
                  ]
            }
          }))
        }
      });

      // District Fill Layer
      map.addLayer({
        id: 'districts-fill',
        type: 'fill',
        source: 'ner-districts-src',
        paint: {
          'fill-color': '#0369a1',
          'fill-opacity': 0.08
        }
      });

      // District Boundary Outline Layer
      map.addLayer({
        id: 'districts-boundary-line',
        type: 'line',
        source: 'ner-districts-src',
        paint: {
          'line-color': '#0284c7',
          'line-width': 1.8,
          'line-dasharray': [3, 2],
          'line-opacity': 0.7
        }
      });

      // 2. Add Road Network GeoJSON Source
      const roadFeatures = roadSegments.map((r) => ({
        type: 'Feature',
        properties: {
          segmentId: r.segmentId,
          name: r.name,
          status: (r.status || 'clear').toLowerCase(),
          currentRiskScore: r.currentRiskScore || 20,
          floodDepthM: r.floodDepthM || 0,
          blockageReason: r.blockageReason || '',
          roadType: r.roadType || 'Mountain Highway',
          avgSlopeDeg: r.avgSlopeDeg || 12,
          maxElevationM: r.maxElevationM || 750,
          lastVerifiedAt: r.lastVerifiedAt || new Date().toISOString()
        },
        geometry: r.geometry
      }));

      map.addSource('ner-roads-src', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: roadFeatures
        }
      });

      // 3. Flood Ops Pulsing Glow Layer (Line width: 12-14px for flood_depth > 0)
      map.addLayer({
        id: 'roads-flood-glow',
        type: 'line',
        source: 'ner-roads-src',
        filter: ['any', ['>', ['get', 'floodDepthM'], 0], ['==', ['get', 'status'], 'flooded']],
        paint: {
          'line-width': 14,
          'line-color': '#ef4444',
          'line-opacity': 0.6,
          'line-blur': 4
        }
      });

      // 4. Base Road Glow Layer
      map.addLayer({
        id: 'roads-glow',
        type: 'line',
        source: 'ner-roads-src',
        paint: {
          'line-width': 6,
          'line-opacity': 0.3,
          'line-color': [
            'match',
            ['get', 'status'],
            'flooded', '#ef4444',
            'blocked', '#ef4444',
            'restricted', '#f59e0b',
            'clear', '#22c55e',
            /* default */ [
              'case',
              ['>=', ['get', 'currentRiskScore'], 70], '#ef4444',
              ['>=', ['get', 'currentRiskScore'], 40], '#f59e0b',
              '#22c55e'
            ]
          ]
        }
      });

      // 5. Crisp Road Network Line (Status Colored)
      map.addLayer({
        id: 'roads-line',
        type: 'line',
        source: 'ner-roads-src',
        paint: {
          'line-width': 3.5,
          'line-color': [
            'match',
            ['get', 'status'],
            'flooded', '#ef4444',
            'blocked', '#ef4444',
            'restricted', '#f59e0b',
            'clear', '#22c55e',
            /* default */ [
              'case',
              ['>=', ['get', 'currentRiskScore'], 70], '#ef4444',
              ['>=', ['get', 'currentRiskScore'], 40], '#f59e0b',
              '#22c55e'
            ]
          ]
        }
      });

      // 6. Highlighted Dispatch Route Source & Layers
      map.addSource('highlighted-route-src', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: highlightedRoute?.geometry || { type: 'LineString', coordinates: [] }
        }
      });

      // Highlighted Route Glow
      map.addLayer({
        id: 'highlighted-route-glow',
        type: 'line',
        source: 'highlighted-route-src',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 10,
          'line-opacity': 0.45,
          'line-blur': 3
        }
      });

      // Highlighted Route Solid Underlay
      map.addLayer({
        id: 'highlighted-route-base',
        type: 'line',
        source: 'highlighted-route-src',
        paint: {
          'line-color': '#0284c7',
          'line-width': 5
        }
      });

      // Highlighted Route Animated Dash Overlay (Simulating Moving Convoy Progression)
      map.addLayer({
        id: 'highlighted-route-dash',
        type: 'line',
        source: 'highlighted-route-src',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 4,
          'line-dasharray': [0, 4, 3]
        }
      });

      // 7. Interactive Road Segment Hover & Click Popups
      map.on('mouseenter', 'roads-line', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'roads-line', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', 'roads-line', (e) => {
        if (!e.features || !e.features.length) return;
        const props = e.features[0].properties;
        const coordinates = e.lngLat;

        if (popupRef.current) {
          popupRef.current.remove();
        }

        const statusBadge =
          props.status === 'flooded' || props.status === 'blocked'
            ? '<span class="px-2 py-0.5 rounded bg-red-950/90 text-red-400 font-bold border border-red-700/80 text-[10px] uppercase animate-pulse">FLOODED / BLOCKED</span>'
            : props.status === 'restricted'
            ? '<span class="px-2 py-0.5 rounded bg-amber-950/90 text-amber-400 font-bold border border-amber-700/80 text-[10px] uppercase">RESTRICTED</span>'
            : '<span class="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 font-bold border border-emerald-700/80 text-[10px] uppercase">ALL CLEAR</span>';

        const floodDetail =
          Number(props.floodDepthM) > 0
            ? `<div class="flex items-center gap-1.5 text-red-300 font-bold text-xs bg-red-950/60 p-1.5 rounded border border-red-900/60 mt-1">
                 <svg class="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                 <span>Flood Water Depth: ${Number(props.floodDepthM).toFixed(2)} m</span>
               </div>`
            : '';

        const blockageReasonDetail = props.blockageReason
          ? `<p class="text-xs text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-900/40 mt-1 font-mono">${props.blockageReason}</p>`
          : '';

        const lastVerified = props.lastVerifiedAt
          ? new Date(props.lastVerifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Live Verified';

        const popupContent = document.createElement('div');
        popupContent.className = 'tactical-popup p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl text-slate-100 max-w-xs font-sans';
        popupContent.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="font-mono text-[10px] text-sky-400 font-bold">${props.segmentId || 'CORRIDOR'}</span>
              ${statusBadge}
            </div>
            <div>
              <h4 class="font-bold text-sm text-white">${props.name || 'NER Road Segment'}</h4>
              <p class="text-[11px] text-slate-400">${props.roadType || 'Mountain Corridor'}</p>
            </div>
            ${floodDetail}
            ${blockageReasonDetail}
            <div class="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div>
                <span class="text-slate-500 block">RISK INDEX</span>
                <b class="${Number(props.currentRiskScore) >= 70 ? 'text-red-400' : Number(props.currentRiskScore) >= 40 ? 'text-amber-400' : 'text-emerald-400'}">${props.currentRiskScore || 20}/100</b>
              </div>
              <div>
                <span class="text-slate-500 block">MAX ELEVATION</span>
                <b class="text-slate-200">${props.maxElevationM || 850} m</b>
              </div>
            </div>
            <div class="flex items-center justify-between text-[9px] text-slate-500 pt-1 font-mono">
              <span>Telemetry: ${lastVerified}</span>
              <span class="text-sky-400 font-bold">Bhuvan / NRSC Sync</span>
            </div>
          </div>
        `;

        popupRef.current = new maplibregl.Popup({ offset: 10, closeButton: true, className: 'tactical-maplibre-popup' })
          .setLngLat(coordinates)
          .setDOMContent(popupContent)
          .addTo(map);

        onRoadClick(props);
      });

      // 8. Setup Animation Loop for Flood Glow & Active Convoy Moving Dash
      let pulseStep = 0;
      let dashOffset = 0;

      const animateMap = () => {
        pulseStep = (pulseStep + 0.04) % (Math.PI * 2);
        dashOffset = (dashOffset + 1) % 64;

        if (mapRef.current && mapRef.current.getLayer('roads-flood-glow')) {
          // Oscillate opacity between 0.35 and 0.85
          const opacity = 0.35 + 0.5 * Math.abs(Math.sin(pulseStep));
          mapRef.current.setPaintProperty('roads-flood-glow', 'line-opacity', opacity);
        }

        if (mapRef.current && mapRef.current.getLayer('highlighted-route-dash')) {
          const dash1 = (dashOffset % 8);
          const dash2 = 8 - dash1;
          mapRef.current.setPaintProperty('highlighted-route-dash', 'line-dasharray', [dash1, 4, dash2]);
        }

        animationFrameRef.current = requestAnimationFrame(animateMap);
      };

      animateMap();
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (popupRef.current) {
        popupRef.current.remove();
      }
      map.remove();
    };
  }, [activeBasemap]);

  // Update Road segments source dynamically when data changes
  useEffect(() => {
    if (mapLoaded && mapRef.current && roadSegments.length > 0) {
      const src = mapRef.current.getSource('ner-roads-src');
      if (src) {
        const roadFeatures = roadSegments.map((r) => ({
          type: 'Feature',
          properties: {
            segmentId: r.segmentId,
            name: r.name,
            status: (r.status || 'clear').toLowerCase(),
            currentRiskScore: r.currentRiskScore || 20,
            floodDepthM: r.floodDepthM || 0,
            blockageReason: r.blockageReason || '',
            roadType: r.roadType || 'Mountain Highway',
            avgSlopeDeg: r.avgSlopeDeg || 12,
            maxElevationM: r.maxElevationM || 750,
            lastVerifiedAt: r.lastVerifiedAt || new Date().toISOString()
          },
          geometry: r.geometry
        }));

        src.setData({
          type: 'FeatureCollection',
          features: roadFeatures
        });
      }
    }
  }, [mapLoaded, roadSegments]);

  // Update Highlighted Route
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      const src = mapRef.current.getSource('highlighted-route-src');
      if (src) {
        src.setData({
          type: 'Feature',
          geometry: highlightedRoute?.geometry || { type: 'LineString', coordinates: [] }
        });
      }
    }
  }, [mapLoaded, highlightedRoute]);

  // Live Vehicle Markers update
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const currentMap = mapRef.current;
    const currentMarkerIds = new Set();

    vehicles.forEach((vehicle) => {
      const vid = vehicle.vehicleId;
      currentMarkerIds.add(vid);
      const coords = vehicle.currentLocation?.coordinates || [91.7362, 26.1445];

      if (!markersRef.current[vid]) {
        // Create custom HTML marker element
        const el = document.createElement('div');
        el.className = 'group cursor-pointer relative';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full ${
              vehicle.status === 'caution_zone'
                ? 'bg-amber-500/20 border-amber-400'
                : 'bg-sky-500/20 border-sky-400'
            } border flex items-center justify-center pulse-marker">
              <div class="w-5 h-5 rounded-full ${
                vehicle.status === 'caution_zone'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-sky-500 text-white'
              } flex items-center justify-center shadow-lg font-black text-[9px]">
                🚚
              </div>
            </div>
            <div class="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
              <div class="tactical-glass px-2.5 py-1 rounded text-[10px] font-mono text-slate-100 whitespace-nowrap shadow-xl border border-sky-500/40">
                <p class="font-bold text-sky-400">${vehicle.vehicleId}</p>
                <p>${vehicle.speedKmph || 0} km/h • ${vehicle.type || 'Convoy'}</p>
              </div>
            </div>
          </div>
        `;

        el.addEventListener('click', () => onVehicleClick(vehicle));

        const marker = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(currentMap);

        markersRef.current[vid] = marker;
      } else {
        // Update marker position smoothly
        markersRef.current[vid].setLngLat(coords);
      }
    });

    // Cleanup stale markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentMarkerIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [mapLoaded, vehicles]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}
      style={{ height }}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Tactical Basemap Switcher Header Ribbon */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 p-1.5 rounded-xl tactical-glass border border-slate-700/80 shadow-2xl text-[11px] font-mono">
        <span className="text-slate-400 font-bold px-1.5 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-sky-400" /> BASEMAP:
        </span>
        <button
          onClick={() => setActiveBasemap(MAP_BASEMAP_MODES.CARTO)}
          className={`px-2 py-1 rounded-lg font-semibold transition ${
            activeBasemap === MAP_BASEMAP_MODES.CARTO
              ? 'bg-sky-600 text-white shadow-glow-primary'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Option A: CARTO Dark Raster Tiles (Navy Tinted)"
        >
          CARTO Dark
        </button>
        <button
          onClick={() => setActiveBasemap(MAP_BASEMAP_MODES.OSM)}
          className={`px-2 py-1 rounded-lg font-semibold transition ${
            activeBasemap === MAP_BASEMAP_MODES.OSM
              ? 'bg-sky-600 text-white shadow-glow-primary'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Option B: OpenStreetMap Standard Raster Tiles"
        >
          OSM
        </button>
        <button
          onClick={() => setActiveBasemap(MAP_BASEMAP_MODES.NONE)}
          className={`px-2 py-1 rounded-lg font-semibold transition ${
            activeBasemap === MAP_BASEMAP_MODES.NONE
              ? 'bg-emerald-600 text-white shadow-glow-primary'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Option C: Pure Tactical Dark Canvas (Zero External Network Dependency)"
        >
          Tactical (0-Net)
        </button>

        {isOfflineFallback && (
          <span className="ml-1 px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-700 font-bold text-[10px]">
            Auto Fallback
          </span>
        )}
      </div>
    </div>
  );
}
