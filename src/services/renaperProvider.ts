/**
 * Provider de verificación de DNI (RF-011, RG-07 +10 pts).
 *
 * Mientras no haya credenciales de RENAPER configuradas, el provider por
 * defecto deja la verificación en estado "verificando" y reintenta en segundo
 * plano, sin bloquear la app (ver design.md - Decisión 6).
 */
import { env, hasRenaperConfig } from './env';

export type EstadoDNI = 'verificado' | 'verificando' | 'rechazado';

export interface ResultadoVerificacionDNI {
  estado: EstadoDNI;
  mensaje: string;
}

export interface ProveedorDNI {
  verificar(dni: string): Promise<ResultadoVerificacionDNI>;
}

/** Provider real que consulta el endpoint de RENAPER. */
export class RenaperHTTPProvider implements ProveedorDNI {
  constructor(
    private readonly endpoint: string,
    private readonly apiKey: string
  ) {}

  async verificar(dni: string): Promise<ResultadoVerificacionDNI> {
    const respuesta = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ dni }),
    });
    if (!respuesta.ok) {
      return { estado: 'rechazado', mensaje: 'No se pudo validar el DNI con RENAPER.' };
    }
    const datos = (await respuesta.json()) as { valido?: boolean };
    if (datos.valido) {
      return { estado: 'verificado', mensaje: 'DNI verificado correctamente.' };
    }
    return { estado: 'rechazado', mensaje: 'El DNI no fue validado.' };
  }
}

/** Provider por defecto: RENAPER no disponible, queda "verificando". */
export class RenaperPendienteProvider implements ProveedorDNI {
  async verificar(_dni: string): Promise<ResultadoVerificacionDNI> {
    await new Promise((res) => setTimeout(res, 1500));
    return {
      estado: 'verificando',
      mensaje: 'Verificación de DNI en curso. Te avisaremos cuando RENAPER responda.',
    };
  }
}

export function obtenerProveedorDNI(): ProveedorDNI {
  if (hasRenaperConfig() && env.renaper.endpoint) {
    return new RenaperHTTPProvider(env.renaper.endpoint, env.renaper.apiKey);
  }
  return new RenaperPendienteProvider();
}
