/**
 * Utilidades para validar RFCs mexicanos
 */

/**
 * Valida el formato básico de un RFC
 * @param rfc RFC a validar
 * @returns true si el formato es válido
 */
export function validarFormatoRFC(rfc: string): boolean {
  if (!rfc || typeof rfc !== 'string') {
    return false;
  }

  // Eliminar espacios y convertir a mayúsculas
  const rfcLimpio = rfc.trim().toUpperCase();

  // RFC de Persona Moral: 12 caracteres (3 letras + 6 números + 3 alfanuméricos)
  // RFC de Persona Física: 13 caracteres (4 letras + 6 números + 3 alfanuméricos)
  const regexMoral = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;
  const regexFisica = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;

  return regexMoral.test(rfcLimpio) || regexFisica.test(rfcLimpio);
}

/**
 * Determina el tipo de persona basado en el RFC
 * @param rfc RFC a analizar
 * @returns 'MORAL' | 'FISICA' | null
 */
export function determinarTipoPersona(rfc: string): 'MORAL' | 'FISICA' | null {
  if (!validarFormatoRFC(rfc)) {
    return null;
  }

  const rfcLimpio = rfc.trim().toUpperCase();
  // Persona Moral: 3 letras iniciales
  // Persona Física: 4 letras iniciales
  const regexMoral = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;
  
  return regexMoral.test(rfcLimpio) ? 'MORAL' : 'FISICA';
}

/**
 * Normaliza un RFC (elimina espacios, convierte a mayúsculas)
 * @param rfc RFC a normalizar
 * @returns RFC normalizado
 */
export function normalizarRFC(rfc: string): string {
  if (!rfc || typeof rfc !== 'string') {
    return '';
  }
  return rfc.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Compara dos RFCs (normalizados)
 * @param rfc1 Primer RFC
 * @param rfc2 Segundo RFC
 * @returns true si coinciden
 */
export function compararRFCs(rfc1: string, rfc2: string): boolean {
  const rfc1Normalizado = normalizarRFC(rfc1);
  const rfc2Normalizado = normalizarRFC(rfc2);
  return rfc1Normalizado === rfc2Normalizado;
}

