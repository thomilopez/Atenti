/**
 * Atenti - Catálogo de Reportes y Categorías de Incidencias Predefinidas
 * Incluye metadatos completos: iconos, colores, descripciones y tipos de identificador recomendados.
 */

import { IdentifierType, IncidentCategory } from '../types';

export interface ReportCategoryMetadata {
  id: string;
  name: IncidentCategory;
  shortLabel: string;
  description: string;
  icon: string; // Ionicons glyph name
  color: string;
  badgeBg: string;
  defaultIdentifierType: IdentifierType;
}

export const REPORT_CATEGORIES: ReportCategoryMetadata[] = [
  {
    id: 'estafa_bancaria',
    name: 'Estafa Bancaria',
    shortLabel: 'Estafa Bancaria',
    description: 'Transferencias no autorizadas, débito indebido o vaciamiento de cuentas',
    icon: 'card-outline',
    color: '#DC2626',
    badgeBg: '#FEE2E2',
    defaultIdentifierType: 'CBU',
  },
  {
    id: 'phishing',
    name: 'Phishing / Suplantación',
    shortLabel: 'Phishing',
    description: 'Enlaces maliciosos, páginas web duplicadas de bancos o billeteras virtuales',
    icon: 'mail-unread-outline',
    color: '#EA580C',
    badgeBg: '#FFEDD5',
    defaultIdentifierType: 'Alias',
  },
  {
    id: 'comercio_virtual',
    name: 'Comercio Virtual Falso',
    shortLabel: 'Tienda Falsa',
    description: 'Ventas en redes sociales o tiendas online que cobran y nunca envían el producto',
    icon: 'cart-outline',
    color: '#D97706',
    badgeBg: '#FEF3C7',
    defaultIdentifierType: 'Alias',
  },
  {
    id: 'local_fisico',
    name: 'Local Físico Ilícito',
    shortLabel: 'Comercio Físico',
    description: 'Locales comerciales, cuevas o agencias que realizan cobros ilegales o estafas',
    icon: 'business-outline',
    color: '#7C3AED',
    badgeBg: '#EDE9FE',
    defaultIdentifierType: 'Local',
  },
  {
    id: 'clonacion_identidad',
    name: 'Clonación de Identidad',
    shortLabel: 'Robo de Identidad',
    description: 'Créditos o cuentas abiertas a tu nombre sin consentimiento mediante DNI falsificado',
    icon: 'people-outline',
    color: '#2563EB',
    badgeBg: '#DBEAFE',
    defaultIdentifierType: 'Tel',
  },
  {
    id: 'cripto_fraude',
    name: 'Fraude con Criptoactivos',
    shortLabel: 'Cripto Fraude',
    description: 'Esquemas Ponzi, falsos brokers o bots de inversión de alto rendimiento garantizado',
    icon: 'logo-bitcoin',
    color: '#059669',
    badgeBg: '#D1FAE5',
    defaultIdentifierType: 'Alias',
  },
  {
    id: 'robo_callejero',
    name: 'Robo o Despojo en Vía Pública',
    shortLabel: 'Robo en Calle',
    description: 'Arrebatos de celular para transferir fondos inmediatos o compras con QR forzadas',
    icon: 'warning-outline',
    color: '#B91C1C',
    badgeBg: '#FFE4E6',
    defaultIdentifierType: 'Local',
  },
  {
    id: 'falso_gestor',
    name: 'Falso Gestor / Trámite',
    shortLabel: 'Falso Gestor',
    description: 'Cobro de aranceles falsos para subsidios, trámites de ANSES, Mi Argentina o visas',
    icon: 'document-text-outline',
    color: '#0284C7',
    badgeBg: '#E0F2FE',
    defaultIdentifierType: 'CBU',
  },
  {
    id: 'llamada_extorsiva',
    name: 'Llamada Extorsiva / Cuento del Tío',
    shortLabel: 'Cuento del Tío',
    description: 'Llamadas fraudulentas simulando familiares en apuros, premios ficticios o secuestros',
    icon: 'call-outline',
    color: '#C026D3',
    badgeBg: '#FAE8FF',
    defaultIdentifierType: 'Tel',
  },
  {
    id: 'alquiler_fantasma',
    name: 'Alquiler Fantasma / Inmueble Falso',
    shortLabel: 'Alquiler Falso',
    description: 'Señas por departamentos turísticos o alquileres temporarios que no existen',
    icon: 'home-outline',
    color: '#0D9488',
    badgeBg: '#CCFBF1',
    defaultIdentifierType: 'CBU',
  },
];

export const CATEGORY_NAMES = REPORT_CATEGORIES.map((cat) => cat.name);

export const getCategoryMetadata = (categoryName: string): ReportCategoryMetadata => {
  return (
    REPORT_CATEGORIES.find((cat) => cat.name === categoryName) || {
      id: 'otro',
      name: categoryName as IncidentCategory,
      shortLabel: categoryName,
      description: 'Reporte de irregularidad o fraude no clasificado',
      icon: 'alert-circle-outline',
      color: '#64748B',
      badgeBg: '#F1F5F9',
      defaultIdentifierType: 'Alias',
    }
  );
};
