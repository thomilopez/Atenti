export class AtentiError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export class ValidationError extends AtentiError {
  constructor(message: string, options?: { cause?: unknown }) {
    super('VALIDATION_ERROR', message, options);
  }
}

export class FirestoreWriteError extends AtentiError {
  constructor(message: string, options?: { cause?: unknown }) {
    super('FIRESTORE_WRITE_ERROR', message, options);
  }
}

export class OfflineError extends AtentiError {
  constructor(message = 'No hay conexión disponible', options?: { cause?: unknown }) {
    super('NETWORK_OFFLINE_ERROR', message, options);
  }
}

export class NotFoundError extends AtentiError {
  constructor(message: string) {
    super('NOT_FOUND', message);
  }
}

export function esErrorDeRed(error: unknown): boolean {
  if (error instanceof OfflineError) return true;
  const code = (error as { code?: string } | null)?.code ?? '';
  return (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'network-request-failed' ||
    code === 'NETWORK_OFFLINE_ERROR'
  );
}
