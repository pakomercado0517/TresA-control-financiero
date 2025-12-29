/**
 * Plantillas de email para el sistema
 * Diseño basado en los estilos corporativos de TresA Control Financiero
 */

/**
 * Template de email para confirmación de cuenta
 * @param data - Objeto con la URL de confirmación
 * @param data.ConfirmationURL - URL de confirmación de la cuenta
 * @returns HTML del email
 */
export function getConfirmationEmailTemplate(data: {
  ConfirmationURL: string;
}): string {
  const confirmationURL = data.ConfirmationURL;
  // Convertir OKLCH a RGB aproximado para compatibilidad con clientes de email
  // Primary: oklch(0.35 0.15 250) ≈ #0047AB (Azul cobalto)
  const primaryColor = "#0047AB";
  const textColor = "#1a1a1a";
  const textMuted = "#6b7280";
  const borderColor = "#e5e7eb";
  const bgColor = "#ffffff";
  const bgMuted = "#f9fafb";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Confirma tu cuenta - TresA Control Financiero</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${bgMuted}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${bgMuted};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Contenedor principal -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: ${bgColor}; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header con color primario -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 30px 40px; border-radius: 10px 10px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      TresA Control Financiero
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                
                <!-- Título -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h2 style="margin: 0; color: ${textColor}; font-size: 22px; font-weight: 600; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Confirma tu cuenta
                    </h2>
                  </td>
                </tr>

                <!-- Mensaje principal -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: ${textColor}; font-size: 16px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      ¡Gracias por registrarte en TresA Control Financiero!
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: ${textColor}; font-size: 16px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Para completar tu registro y comenzar a usar nuestro sistema de control financiero, por favor confirma tu dirección de correo electrónico haciendo clic en el botón siguiente:
                    </p>
                  </td>
                </tr>

                <!-- Botón de confirmación -->
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: ${primaryColor};">
                          <a href="${confirmationURL}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                            Confirmar cuenta
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Link alternativo -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: ${textMuted}; font-size: 14px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 32px;">
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${confirmationURL}" style="color: ${primaryColor}; text-decoration: underline; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                        ${confirmationURL}
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- Advertencia de seguridad -->
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 24px; border-top: 1px solid ${borderColor};">
                    <p style="margin: 0; color: ${textMuted}; font-size: 13px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      <strong>Nota de seguridad:</strong> Si no solicitaste esta cuenta, puedes ignorar este correo. El enlace de confirmación expirará en 24 horas.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${bgMuted}; padding: 24px 40px; border-radius: 0 0 10px 10px; border-top: 1px solid ${borderColor};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <p style="margin: 0; color: ${textMuted}; font-size: 14px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      TresA Control Financiero
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: ${textMuted}; font-size: 12px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Sistema de control financiero mediante procesamiento de facturas XML (CFDI México)
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <p style="margin: 0; color: ${textMuted}; font-size: 11px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Versión de texto plano del email de confirmación
 * @param data - Objeto con la URL de confirmación
 * @param data.ConfirmationURL - URL de confirmación de la cuenta
 * @returns Texto plano del email
 */
export function getConfirmationEmailTextTemplate(data: {
  ConfirmationURL: string;
}): string {
  const confirmationURL = data.ConfirmationURL;
  return `
TresA Control Financiero
========================

Confirma tu cuenta

¡Gracias por registrarte en TresA Control Financiero!

Para completar tu registro y comenzar a usar nuestro sistema de control financiero, por favor confirma tu dirección de correo electrónico visitando el siguiente enlace:

${confirmationURL}

Nota de seguridad: Si no solicitaste esta cuenta, puedes ignorar este correo. El enlace de confirmación expirará en 24 horas.

---
TresA Control Financiero
Sistema de control financiero mediante procesamiento de facturas XML (CFDI México)

Este es un correo automático, por favor no respondas a este mensaje.
  `.trim();
}

/**
 * Template de email para reset de contraseña
 * @param data - Objeto con la URL de restablecimiento
 * @param data.ConfirmationURL - URL de restablecimiento de contraseña
 * @returns HTML del email
 */
export function getResetPasswordEmailTemplate(data: {
  ConfirmationURL: string;
}): string {
  const confirmationURL = data.ConfirmationURL;
  // Convertir OKLCH a RGB aproximado para compatibilidad con clientes de email
  // Primary: oklch(0.35 0.15 250) ≈ #0047AB (Azul cobalto)
  const primaryColor = "#0047AB";
  const textColor = "#1a1a1a";
  const textMuted = "#6b7280";
  const borderColor = "#e5e7eb";
  const bgColor = "#ffffff";
  const bgMuted = "#f9fafb";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Restablecer contraseña - TresA Control Financiero</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${bgMuted}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${bgMuted};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Contenedor principal -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: ${bgColor}; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header con color primario -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 30px 40px; border-radius: 10px 10px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      TresA Control Financiero
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                
                <!-- Título -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h2 style="margin: 0; color: ${textColor}; font-size: 22px; font-weight: 600; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Restablecer contraseña
                    </h2>
                  </td>
                </tr>

                <!-- Mensaje principal -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: ${textColor}; font-size: 16px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en TresA Control Financiero.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: ${textColor}; font-size: 16px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Si solicitaste este cambio, haz clic en el botón siguiente para crear una nueva contraseña:
                    </p>
                  </td>
                </tr>

                <!-- Botón de restablecimiento -->
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: ${primaryColor};">
                          <a href="${confirmationURL}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                            Restablecer contraseña
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Link alternativo -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0; color: ${textMuted}; font-size: 14px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 32px;">
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${confirmationURL}" style="color: ${primaryColor}; text-decoration: underline; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                        ${confirmationURL}
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- Advertencia de seguridad -->
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 24px; border-top: 1px solid ${borderColor};">
                    <p style="margin: 0; color: ${textMuted}; font-size: 13px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      <strong>Nota de seguridad:</strong> Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual no será modificada. El enlace de restablecimiento expirará en 1 hora por razones de seguridad.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${bgMuted}; padding: 24px 40px; border-radius: 0 0 10px 10px; border-top: 1px solid ${borderColor};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <p style="margin: 0; color: ${textMuted}; font-size: 14px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      TresA Control Financiero
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: ${textMuted}; font-size: 12px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Sistema de control financiero mediante procesamiento de facturas XML (CFDI México)
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <p style="margin: 0; color: ${textMuted}; font-size: 11px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Versión de texto plano del email de reset de contraseña
 * @param data - Objeto con la URL de restablecimiento
 * @param data.ConfirmationURL - URL de restablecimiento de contraseña
 * @returns Texto plano del email
 */
export function getResetPasswordEmailTextTemplate(data: {
  ConfirmationURL: string;
}): string {
  const confirmationURL = data.ConfirmationURL;
  return `
TresA Control Financiero
========================

Restablecer contraseña

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en TresA Control Financiero.

Si solicitaste este cambio, visita el siguiente enlace para crear una nueva contraseña:

${confirmationURL}

Nota de seguridad: Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual no será modificada. El enlace de restablecimiento expirará en 1 hora por razones de seguridad.

---
TresA Control Financiero
Sistema de control financiero mediante procesamiento de facturas XML (CFDI México)

Este es un correo automático, por favor no respondas a este mensaje.
  `.trim();
}
