import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
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
}

// Para plataformas móviles nativas importamos condicionalmente react-native-maps
let NativeMapView: any = null;
let NativeMarker: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    NativeMapView = Maps.default || Maps;
    NativeMarker = Maps.Marker;
  } catch (err) {
    console.warn('react-native-maps no disponible nativamente:', err);
  }
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
}) => {
  const [activeIncident, setActiveIncident] = useState<IncidentReport | null>(null);

  // Si estamos en entorno móvil nativo y la librería está cargada
  if (Platform.OS !== 'web' && NativeMapView && NativeMarker) {
    return (
      <View style={[styles.container, style]}>
        <NativeMapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: centerLatitude,
            longitude: centerLongitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
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
          {incidents.map((incident) => {
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

      <View style={styles.mapHeaderBadge}>
        <Ionicons name="map-outline" size={14} color="#0284C7" />
        <Text style={styles.mapHeaderBadgeText}>
          {selectedLocation ? selectedLocation.address : 'Área Metropolitana - Red Atenti'}
        </Text>
      </View>

      {/* Renderizado de pines sobre el lienzo */}
      {incidents.map((incident, index) => {
        const pinColor = getTrafficLightColor(incident.credibilityBreakdown.trafficLight);
        // Distribución pseudo-geográfica proporcional para la vista web
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
          <Text style={styles.selectedPinText}>Punto fijado</Text>
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

      {/* Controles de zoom decorativos */}
      <View style={styles.mapControls}>
        <View style={styles.controlBtn}>
          <Ionicons name="add" size={16} color="#334155" />
        </View>
        <View style={styles.controlBtn}>
          <Ionicons name="remove" size={16} color="#334155" />
        </View>
      </View>
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
  mapControls: {
    position: 'absolute',
    right: 12,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  controlBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
});
