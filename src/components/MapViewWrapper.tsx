import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IncidentReport, LocationData } from '../types';
import { getTrafficLightColor } from '../services/credibility';

interface MapViewWrapperProps {
  incidents?: IncidentReport[];
  selectedLocation?: LocationData;
  onSelectLocation?: (location: LocationData) => void;
  onMarkerPress?: (incident: IncidentReport) => void;
  style?: any;
  interactive?: boolean;
  centerLatitude?: number;
  centerLongitude?: number;
  /** RF-036: permite arrastrar el pin seleccionado. */
  draggablePin?: boolean;
  /** RF-039: radio de búsqueda en kilómetros. */
  radioKm?: number;
  /** Centro del círculo de radio. */
  radioCenter?: { latitude: number; longitude: number };
  /** RF-041: capa de mapa de calor. */
  showHeatmap?: boolean;
}

// Para plataformas móviles nativas importamos condicionalmente react-native-maps
let NativeMapView: any = null;
let NativeMarker: any = null;
let NativeCircle: any = null;
let NativeHeatmap: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    NativeMapView = Maps.default || Maps;
    NativeMarker = Maps.Marker;
    NativeCircle = Maps.Circle;
    NativeHeatmap = Maps.Heatmap;
  } catch (err) {
    console.warn('react-native-maps no disponible nativamente:', err);
  }
}

interface Cluster {
  key: string;
  latitude: number;
  longitude: number;
  items: IncidentReport[];
}

/** Agrupa pines cercanos por celda de grilla (RF-035). */
function agruparIncidentes(incidents: IncidentReport[], grid = 0.02): Cluster[] {
  const mapa = new Map<string, Cluster>();
  for (const inc of incidents) {
    const key = `${Math.floor(inc.location.latitude / grid)}_${Math.floor(
      inc.location.longitude / grid
    )}`;
    const existente = mapa.get(key);
    if (existente) {
      existente.items.push(inc);
    } else {
      mapa.set(key, {
        key,
        latitude: inc.location.latitude,
        longitude: inc.location.longitude,
        items: [inc],
      });
    }
  }
  return Array.from(mapa.values());
}

export const MapViewWrapper: React.FC<MapViewWrapperProps> = ({
  incidents = [],
  selectedLocation,
  onSelectLocation,
  onMarkerPress,
  style,
  interactive = true,
  centerLatitude = -34.6037,
  centerLongitude = -58.3816,
  draggablePin = false,
  radioKm,
  radioCenter,
  showHeatmap = false,
}) => {
  const [activeIncident, setActiveIncident] = useState<IncidentReport | null>(null);
  const mapRef = useRef<any>(null);

  // Reciente el mapa cuando cambia el centro (por ejemplo, "Mi ubicación").
  useEffect(() => {
    if (Platform.OS !== 'web' && mapRef.current?.animateToRegion) {
      mapRef.current.animateToRegion(
        {
          latitude: centerLatitude,
          longitude: centerLongitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        500
      );
    }
  }, [centerLatitude, centerLongitude]);

  // Si estamos en entorno móvil nativo y la librería está cargada
  if (Platform.OS !== 'web' && NativeMapView && NativeMarker) {
    const clusters = agruparIncidentes(incidents);
    const circuloCentro = radioCenter ?? { latitude: centerLatitude, longitude: centerLongitude };

    return (
      <View style={[styles.container, style]}>
        <NativeMapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: centerLatitude,
            longitude: centerLongitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          scrollEnabled={interactive}
          zoomEnabled={interactive}
          onPress={(e: any) => {
            if (onSelectLocation && e.nativeEvent?.coordinate) {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              onSelectLocation({
                latitude,
                longitude,
                address: `Punto fijado (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              });
            }
          }}
        >
          {showHeatmap && NativeHeatmap && incidents.length > 0 && (
            <NativeHeatmap
              points={incidents.map((inc) => ({
                latitude: inc.location.latitude,
                longitude: inc.location.longitude,
                weight: Math.max(1, Math.round(inc.credibilityScore / 20)),
              }))}
              radius={40}
              opacity={0.6}
            />
          )}

          {typeof radioKm === 'number' && radioKm > 0 && NativeCircle && (
            <NativeCircle
              center={circuloCentro}
              radius={radioKm * 1000}
              strokeColor="rgba(37, 99, 235, 0.6)"
              fillColor="rgba(37, 99, 235, 0.12)"
            />
          )}

          {clusters.map((cluster) => {
            if (cluster.items.length > 1) {
              return (
                <NativeMarker
                  key={cluster.key}
                  coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
                  onPress={() => {
                    const primero = cluster.items[0];
                    setActiveIncident(primero);
                    if (onMarkerPress) onMarkerPress(primero);
                  }}
                >
                  <View style={styles.nativeCluster}>
                    <Text style={styles.nativeClusterText}>{cluster.items.length}</Text>
                  </View>
                </NativeMarker>
              );
            }
            const incident = cluster.items[0];
            const pinColor = getTrafficLightColor(incident.credibilityBreakdown.trafficLight);
            return (
              <NativeMarker
                key={incident.id}
                coordinate={{
                  latitude: incident.location.latitude,
                  longitude: incident.location.longitude,
                }}
                pinColor={pinColor}
                title={incident.title}
                description={`${incident.category} • Credibilidad: ${incident.credibilityScore}%`}
                onPress={() => {
                  setActiveIncident(incident);
                  if (onMarkerPress) onMarkerPress(incident);
                }}
              />
            );
          })}

          {selectedLocation && (
            <NativeMarker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              pinColor="#2563EB"
              title="Ubicación fijada"
              draggable={draggablePin}
              onDragEnd={(e: any) => {
                if (onSelectLocation && e.nativeEvent?.coordinate) {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  onSelectLocation({
                    latitude,
                    longitude,
                    address: `Punto fijado (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                  });
                }
              }}
            />
          )}
        </NativeMapView>
      </View>
    );
  }

  // Fallback visual interactivo para Web / Expo Web (con mapa estilizado de Argentina / CABA)
  return (
    <View style={[styles.webContainer, style]}>
      {/* Fondo de mapa temático */}
      <View style={styles.gridOverlay}>
        <View style={styles.riverDecoration} />
        <View style={styles.avenueH1} />
        <View style={styles.avenueH2} />
        <View style={styles.avenueV1} />
        <View style={styles.avenueV2} />
      </View>

      {showHeatmap && <View style={styles.webHeatmapOverlay} />}

      {typeof radioKm === 'number' && radioKm > 0 && (
        <View style={styles.webRadiusWrapper} pointerEvents="none">
          <View
            style={[
              styles.webRadiusCircle,
              {
                width: Math.min(240, radioKm * 12),
                height: Math.min(240, radioKm * 12),
                borderRadius: Math.min(120, radioKm * 6),
              },
            ]}
          />
          <Text style={styles.webRadiusLabel}>{radioKm} km</Text>
        </View>
      )}

      <View style={styles.mapHeaderBadge}>
        <Ionicons name="map-outline" size={14} color="#0284C7" />
        <Text style={styles.mapHeaderBadgeText}>
          {selectedLocation ? selectedLocation.address : 'Área Metropolitana - Red Atenti'}
        </Text>
      </View>

      {/* Renderizado de pines sobre el lienzo */}
      {incidents.map((incident, index) => {
        const pinColor = getTrafficLightColor(incident.credibilityBreakdown.trafficLight);
        const posX = 15 + ((index * 26 + 18) % 72);
        const posY = 18 + ((index * 22 + 20) % 65);

        return (
          <TouchableOpacity
            key={incident.id}
            activeOpacity={0.8}
            onPress={() => {
              setActiveIncident(incident);
              if (onMarkerPress) onMarkerPress(incident);
            }}
            style={[
              styles.webPin,
              {
                left: `${posX}%`,
                top: `${posY}%`,
                borderColor: pinColor,
              },
            ]}
          >
            <View style={[styles.pinInner, { backgroundColor: pinColor }]} />
            <Text style={styles.pinLabel} numberOfLines={1}>
              {incident.identifierValue}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Pin seleccionado por el usuario en P4 */}
      {selectedLocation && (
        <View style={[styles.selectedPinContainer, { left: '48%', top: '48%' }]}>
          <Ionicons name="location-sharp" size={32} color="#EF4444" />
          <View style={styles.pinPulse} />
          <Text style={styles.selectedPinText}>
            {draggablePin ? 'Arrastrá el pin' : 'Punto fijado'}
          </Text>
        </View>
      )}

      {/* Tarjeta de previsualización flotante al tocar un pin */}
      {activeIncident && onMarkerPress && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onMarkerPress(activeIncident)}
          style={styles.floatingCard}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: getTrafficLightColor(
                    activeIncident.credibilityBreakdown.trafficLight
                  ),
                },
              ]}
            />
            <Text style={styles.cardTitle}>{activeIncident.title}</Text>
            <Text style={styles.cardScore}>
              {activeIncident.credibilityScore}% veracidad
            </Text>
          </View>
          <Text style={styles.cardCategory}>{activeIncident.category}</Text>
          <Text style={styles.cardAddress} numberOfLines={1}>
            📍 {activeIncident.location.address}
          </Text>
          <Text style={styles.cardHint}>Toca para ver detalle completo →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  webContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EAF0F6',
  },
  webHeatmapOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
  },
  webRadiusWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -60 }, { translateY: -60 }],
    zIndex: 4,
  },
  webRadiusCircle: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.6)',
  },
  webRadiusLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  riverDecoration: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: '#BAE6FD',
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 80,
    opacity: 0.6,
  },
  avenueH1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#CBD5E1',
  },
  avenueH2: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#CBD5E1',
  },
  avenueV1: {
    position: 'absolute',
    left: '35%',
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  avenueV2: {
    position: 'absolute',
    left: '70%',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#CBD5E1',
  },
  nativeCluster: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nativeClusterText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  mapHeaderBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  mapHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
  },
  webPin: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 5,
  },
  pinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: 90,
  },
  selectedPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 8,
    transform: [{ translateX: -16 }, { translateY: -32 }],
  },
  pinPulse: {
    width: 12,
    height: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  selectedPinText: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0F172A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  cardCategory: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 11,
    color: '#334155',
  },
  cardHint: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 6,
    textAlign: 'right',
  },
});
