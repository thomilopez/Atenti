import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IncidentReport, LocationData } from '../types';
import { getTrafficLightColor } from '../services/credibility';
import {
  getCurrentUserLocation,
  DEFAULT_BUENOS_AIRES_LOCATION,
} from '../services/locationService';

interface MapViewWrapperProps {
  incidents?: IncidentReport[];
  selectedLocation?: LocationData;
  onSelectLocation?: (location: LocationData) => void;
  onMarkerPress?: (incident: IncidentReport) => void;
  style?: any;
  interactive?: boolean;
  centerLatitude?: number;
  centerLongitude?: number;
  autoLocateUser?: boolean;
  showRecenterButton?: boolean;
}

// Carga condicional de react-native-maps para plataformas móviles
let NativeMapView: any = null;
let NativeMarker: any = null;
let NativeProviderGoogle: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    NativeMapView = Maps.default || Maps;
    NativeMarker = Maps.Marker;
    NativeProviderGoogle = Maps.PROVIDER_GOOGLE;
  } catch (err) {
    console.warn('react-native-maps no disponible en este entorno:', err);
  }
}

export const MapViewWrapper: React.FC<MapViewWrapperProps> = ({
  incidents = [],
  selectedLocation,
  onSelectLocation,
  onMarkerPress,
  style,
  interactive = true,
  centerLatitude = DEFAULT_BUENOS_AIRES_LOCATION.latitude,
  centerLongitude = DEFAULT_BUENOS_AIRES_LOCATION.longitude,
  autoLocateUser = true,
  showRecenterButton = true,
}) => {
  const mapRef = useRef<any>(null);
  const [activeIncident, setActiveIncident] = useState<IncidentReport | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentRegion, setCurrentRegion] = useState({
    latitude: centerLatitude,
    longitude: centerLongitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Localizar al usuario al montar el componente
  useEffect(() => {
    let isMounted = true;
    if (autoLocateUser) {
      locateUser(false);
    }
    return () => {
      isMounted = false;
    };
  }, [autoLocateUser]);

  const locateUser = async (animate = true) => {
    setIsLocating(true);
    try {
      const { location, isRealLocation } = await getCurrentUserLocation();
      setUserLocation(location);

      const targetRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setCurrentRegion(targetRegion);

      if (animate && mapRef.current) {
        if (typeof mapRef.current.animateToRegion === 'function') {
          mapRef.current.animateToRegion(targetRegion, 800);
        }
      }
    } catch (error) {
      console.warn('Error al centrar en ubicación del usuario:', error);
    } finally {
      setIsLocating(false);
    }
  };

  // Renderizado Nativo (Android / iOS con Google Maps / Apple Maps)
  if (Platform.OS !== 'web' && NativeMapView && NativeMarker) {
    return (
      <View style={[styles.container, style]}>
        <NativeMapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === 'android' ? NativeProviderGoogle : undefined}
          initialRegion={currentRegion}
          loadingEnabled={true}
          loadingIndicatorColor="#0F172A"
          loadingBackgroundColor="#F8FAFC"
          showsUserLocation={false} // Usamos marcador personalizado para consistencia visual
          showsCompass={true}
          showsMyLocationButton={false} // Usamos nuestro FAB con estilo de diseño Atenti
          onMapReady={() => setIsMapReady(true)}
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
          {/* Marcador distintivo de la ubicación actual del usuario */}
          {userLocation && (
            <NativeMarker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="Tu ubicación"
              description="Estás aquí"
              zIndex={999}
            >
              <View style={styles.userMarkerOuter}>
                <View style={styles.userMarkerPulse} />
                <View style={styles.userMarkerCore} />
              </View>
            </NativeMarker>
          )}

          {/* Marcadores de incidentes reportados en la comunidad */}
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

          {/* Marcador de punto fijado manualmente (ej: al crear reporte) */}
          {selectedLocation && (
            <NativeMarker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              pinColor="#2563EB"
              title="Ubicación fijada"
              description={selectedLocation.address}
            />
          )}
        </NativeMapView>

        {/* Indicador de carga inicial */}
        {!isMapReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0F172A" />
            <Text style={styles.loadingText}>Cargando mapa de alertas...</Text>
          </View>
        )}

        {/* Botón flotante para recentrar en la ubicación del usuario */}
        {showRecenterButton && (
          <TouchableOpacity
            style={styles.recenterFab}
            activeOpacity={0.8}
            onPress={() => locateUser(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Centrar en mi ubicación actual"
            accessibilityRole="button"
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <Ionicons
                name={userLocation ? 'locate' : 'locate-outline'}
                size={22}
                color="#0F172A"
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Fallback interactivo para Web / Expo Web (simulación enriquecida de mapa geolocalizado)
  return (
    <View style={[styles.webContainer, style]}>
      {/* Fondo de mapa con cuadrícula temática */}
      <View style={styles.gridOverlay}>
        <View style={styles.riverDecoration} />
        <View style={styles.avenueH1} />
        <View style={styles.avenueH2} />
        <View style={styles.avenueV1} />
        <View style={styles.avenueV2} />
      </View>

      {/* Badge con la dirección o zona actual */}
      <View style={styles.mapHeaderBadge}>
        <Ionicons name="map-outline" size={14} color="#0284C7" />
        <Text style={styles.mapHeaderBadgeText} numberOfLines={1}>
          {selectedLocation
            ? selectedLocation.address
            : userLocation
            ? userLocation.address
            : 'Área Metropolitana - Red Atenti'}
        </Text>
      </View>

      {/* Marcador de ubicación actual del usuario en la simulación web */}
      {userLocation && (
        <View style={[styles.webUserMarker, { left: '50%', top: '50%' }]}>
          <View style={styles.userMarkerPulse} />
          <View style={styles.userMarkerCore} />
          <View style={styles.userMarkerTooltip}>
            <Text style={styles.userMarkerTooltipText}>Tu ubicación</Text>
          </View>
        </View>
      )}

      {/* Marcadores de incidentes sobre el mapa */}
      {incidents.map((incident, index) => {
        const pinColor = getTrafficLightColor(incident.credibilityBreakdown.trafficLight);
        const posX = 15 + ((index * 26 + 18) % 70);
        const posY = 18 + ((index * 22 + 20) % 64);

        return (
          <TouchableOpacity
            key={incident.id}
            activeOpacity={0.8}
            onPress={() => {
              setActiveIncident(incident);
              if (onMarkerPress) onMarkerPress(incident);
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
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
            <Text style={styles.pinLabel} numberOfLines={1} ellipsizeMode="tail">
              {incident.identifierValue}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Pin seleccionado al fijar ubicación */}
      {selectedLocation && (
        <View style={[styles.selectedPinContainer, { left: '46%', top: '44%' }]}>
          <Ionicons name="location-sharp" size={32} color="#2563EB" />
          <View style={styles.pinPulse} />
          <Text style={styles.selectedPinText} numberOfLines={1}>
            Punto fijado
          </Text>
        </View>
      )}

      {/* Tarjeta flotante de previsualización al tocar un marcador */}
      {activeIncident && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onMarkerPress && onMarkerPress(activeIncident)}
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
            <Text style={styles.cardTitle} numberOfLines={1}>
              {activeIncident.title}
            </Text>
            <Text style={styles.cardScore}>
              {activeIncident.credibilityScore}% veracidad
            </Text>
          </View>
          <Text style={styles.cardCategory} numberOfLines={1}>
            {activeIncident.category}
          </Text>
          <Text style={styles.cardAddress} numberOfLines={1}>
            📍 {activeIncident.location.address}
          </Text>
          <Text style={styles.cardHint}>Toca para ver detalle completo →</Text>
        </TouchableOpacity>
      )}

      {/* Botón flotante para recentrar en la ubicación del usuario */}
      {showRecenterButton && (
        <TouchableOpacity
          style={styles.recenterFab}
          activeOpacity={0.8}
          onPress={() => locateUser(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Centrar en mi ubicación actual"
          accessibilityRole="button"
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <Ionicons
              name={userLocation ? 'locate' : 'locate-outline'}
              size={22}
              color="#0F172A"
            />
          )}
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
    position: 'relative',
  },
  webContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
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
    maxWidth: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    flexShrink: 1,
  },
  userMarkerOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  userMarkerCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  webUserMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    zIndex: 12,
  },
  userMarkerTooltip: {
    marginTop: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userMarkerTooltipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  webPin: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 4,
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
    width: 8,
    height: 8,
    borderRadius: 4,
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
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  recenterFab: {
    position: 'absolute',
    right: 16,
    bottom: 84, // Ubicado cómodamente arriba del FAB principal
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
