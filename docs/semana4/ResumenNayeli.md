# Resumen de trabajo — Semana 4 · Nayeli Chávez (@nayelicz)

Contribución al Entregable 4 (MVP funcional) de Do-Own: integración de la wallet con Stellar Testnet, evidencia verificable y app instalable en el teléfono.

## 1. Wallet integrada y Stellar Testnet (PR #10)

Implementa la opción B declarada en el Entregable 3: capacidades nativas de Stellar, sin contrato propio en Soroban.

- **Wallet no custodial integrada.** La llave se genera en el dispositivo de la persona, sin frase semilla ni extensiones.
- **Reservas patrocinadas.** Do-Own crea la cuenta con 0 XLM y con trustline al activo de prueba **DOWN**.
- **Recompensas reales en DOWN.** Pago con memo hash idempotente (no paga dos veces) y límite diario.
- **Sello semanal.** Los registros se convierten en compromisos con sal y se resumen en una raíz Merkle, que se ancla como memo hash. Firma la persona y Do-Own paga la comisión con *fee bump*.
- **Envío de DOWN** entre cuentas, con la comisión cubierta por Do-Own.
- **Página pública `/verificar`**, donde cualquiera comprueba un sello sin ver montos, notas ni emociones.
- **Backend** en rutas de Next.js (`/api/stellar/*`) y configuración de testnet desde el navegador (`/api/stellar/admin`).
- Se actualizó `@stellar/stellar-sdk` a la v17 para eliminar avisos de seguridad.

## 2. Evidencia verificable (PR #11)

- Despliegue con la wallet activa: https://do-own-six.vercel.app
- `docs/semana4/EvidenciaTestnet.md` reúne 9 transacciones reales en el explorador público: emisión de DOWN, cuentas patrocinadas, recompensas, reintento idempotente, sello semanal, envío y verificación.
- `docs/semana4/MVPFunctional.md` incluye la tabla de evidencia y la sección "Qué se construyó esta semana".

## 3. Experiencia de usuario

- **Foto de perfil (PR #11).** La persona elige entre 15 ilustraciones propias (flores, animales tiernos e intrépidos, paisajes) o sube una foto, que se guarda solo en su dispositivo.
- **Datos reales (PR #16).** El nombre, los registros y el progreso se guardan en el dispositivo. La racha y el nivel se calculan con los registros reales, y ya no hay datos ni etiquetas de demostración.
- **Cerrar sesión (PR #16).** Antes de borrar los datos del dispositivo pide guardar la clave de respaldo. Se agregó también la opción de recuperar la cuenta con esa clave.

## 4. App para Android (PR #12 a #15)

- Paquete Android (TWA) generado con PWABuilder: `app.vercel.do_own_six.twa`.
- Descarga directa: https://do-own-six.vercel.app/Do-Own.apk, más el botón **Descargar app para Android** en *Mi cuenta*.
- `/.well-known/assetlinks.json` para que la app abra a pantalla completa.
- En iPhone se instala como PWA desde Safari ("Agregar a pantalla de inicio").

## 5. Video del MVP

- Video de 2:25 con la demo y el pitch: https://youtube.com/shorts/wU0fWStE4wo
- Narración grabada y limpiada (reducción de ruido y nivel de volumen), sincronizada con la grabación de pantalla de la app en Android, incluido el sello semanal.

## 6. Calidad

- Las 10 pruebas e2e existentes siguen pasando. Además se probaron la wallet, el selector de foto, la persistencia de datos y el cierre de sesión.
- Lint, verificación de tipos y compilación de producción sin errores.

## Pendientes (después del bootcamp)

- Sesión autenticada y base de datos para validar recompensas en el servidor y respaldar los registros.
- Límite de uso por IP en las rutas que patrocinan comisiones.
- Proteger la llave local con PIN o passkey.
- Panel del patrocinador con cifras agregadas.
- Publicación en Google Play.
