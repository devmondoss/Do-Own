# Integración del frontend con backend y Stellar

Todas las rutas de archivo de esta guía son relativas a `frontend/`. Los comandos se ejecutan desde esa carpeta. La UI es funcional con datos en memoria: no realiza llamadas a una API ni a Stellar. Una recarga reinicia registros, nombre, recompensas y movimientos.

## Mapa de conexiones

| Vista o módulo      | Archivo                                         | Punto de conexión                                                                  |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Bienvenida          | `src/components/features/welcome-screen.tsx`    | `handleCrearPerfil`, nombre opcional en memoria.                                   |
| Inicio              | `src/components/features/home-screen.tsx`       | Perfil, racha y acciones obtenidos del provider.                                   |
| Registro            | `src/components/features/register-screen.tsx`   | `handleAnalizarFoto`, `handleGuardarDecision`.                                     |
| Aprender            | `src/components/features/learn-screen.tsx`      | `handleCompletarLeccion`; contenido en `src/data/mock-data.ts`.                    |
| Recompensa          | `src/components/features/reward-screen.tsx`     | `handleReclamar(rewardId)`.                                                        |
| Progreso            | `src/components/features/progress-screen.tsx`   | Saldo, actividad y acciones del provider.                                          |
| Cuenta y envío      | `src/components/features/account-screen.tsx`    | `handleTransferirRecompensa(input)`.                                               |
| Reflexión           | `src/components/features/reflection-screen.tsx` | Registros privados del provider; cálculo en `src/lib/decision-summary.ts`.         |
| Comprobante         | `src/components/features/proof-screen.tsx`      | `handleVerExplorer`, muestra en `demoProof`.                                       |
| Estado compartido   | `src/providers/demo-provider.tsx`               | Sustituir las mutaciones de demo por respuestas confirmadas del servidor.          |
| Contratos iniciales | `src/types/do-own.ts`                           | `DecisionInput`, `DecisionRecord`, `TransferInput`, `RewardReceipt`, `HabitProof`. |
| Placeholders        | `src/lib/integrations.ts`                       | Funciones síncronas `void` que solo escriben marcadores seguros en consola.        |

Las rutas se declaran en `src/app/`. Los grupos `(principal)` y `(flujos)` no forman parte de las URL. La bienvenida está fuera del shell; el resto comparte `src/components/ui/app-shell.tsx`. Componentes reutilizables en `src/components/ui/primitives.tsx`.

```sh
rg -n 'TODO\(BACKEND\)|TODO\(STELLAR\)|DEMO\(UI\)' src public/sw.js
```

`TODO(BACKEND)` identifica persistencia/validación del servidor; `TODO(STELLAR)` identifica operaciones o comprobantes reales; `DEMO(UI)` marca cambios que solo ocurren en memoria.

## Identidad, perfil y lectura inicial

Sustituir `initialDemo` por una consulta autenticada. El nombre opcional no crea una cuenta real y el identificador `DEMO-DOOWN-001` no es una dirección Stellar. La identidad y autorización deben derivarse de la sesión del servidor. Agregar estados de carga, error, reintento y cierre de sesión. No confiar en el perfil, saldo o racha enviados por el cliente.

La racha de 14 días, el nivel y el saldo de 125 son muestras. La gráfica semanal y la reflexión sí se recalculan a partir de los registros de ejemplo y los de la sesión. La zona horaria actual es `America/Mexico_City`, centralizada en `decision-summary.ts`. Acordar períodos y zona horaria con el backend.

## Foto y registro privado

`handleAnalizarFoto(file)` recibe un `File` local. La UI admite JPG/PNG/WebP de hasta 10 MB, muestra una URL temporal y la revoca al cambiar o desmontar la vista. No hay subida ni OCR; el usuario confirma monto y categoría manualmente. Conectar una subida privada mediante `FormData` y devolver sugerencias editables, con estados de carga/error y confirmación explícita. Validar formato, tamaño y contenido también en el servidor.

`handleGuardarDecision(input)` recibe `DecisionInput`:

```ts
{
  amount: "350.50", // string decimal, nunca dinero como float en la API
  currency: "MXN",
  category: "ahorro", // antojo | habitual | ahorro
  emotion: "tranquilo", // tranquilo | estres | rutina
  note: "Una decisión de hoy",
  attachment: file // File opcional; no serializar directamente a JSON
}
```

El frontend acepta coma o punto decimal, monto positivo hasta 999,999,999 MXN y hasta dos decimales. Normalizar en servidor a decimal o unidades mínimas. Si hay imagen, enviar campos y archivo por `FormData` o una referencia privada previamente autorizada. `DecisionRecord` contiene ID, fecha y `photoAttached`; la demo conserva solo el indicador de foto, no el archivo.

Convertir el callback a asíncrono, deshabilitar envíos simultáneos y esperar éxito antes de navegar a `/recompensa`. Reemplazar `saveDecision` por el registro y la elegibilidad devueltos por el servidor. Montos, fotos, categorías, emociones y notas se mantienen fuera de blockchain, URLs públicas, analítica y logs. Los placeholders actuales no imprimen esos campos.

## Aprendizaje y recompensas

La lección usa el contenido y las dos preguntas de `docs/semana3/contenido-microleccion-antojo`. `finishLesson` solo permite finalizar con ambas respuestas correctas; `completeLesson` evita un segundo premio en la sesión. Al integrar, enviar un ID/versionado estable y respuestas al servidor; validar allí la finalización y la elegibilidad. Actualmente `handleCompletarLeccion()` es un marcador sin payload: ampliar su contrato con el equipo antes de conectarlo.

La regla visual sigue el Blueprint: un premio por registro financiero/emocional y otro adicional al completar por primera vez la lección. No exige terminar las tres acciones para habilitar el primero. Cada premio tiene un ID y estado `available`/`claimed`; `claimDemoReward(id)` evita duplicación en memoria. Los créditos de ejemplo no representan USDC ni otro activo emitido. Los puntos de las acciones son una escala visual distinta.

`handleReclamar(rewardId)` debe convertirse en un endpoint autenticado e idempotente que valide identidad, período y elegibilidad. La fuente de verdad debe estar en servidor, no en React. `RewardReceipt` deja preparados estados `pending`/`confirmed`/`failed`, monto decimal, activo `{code, issuer}` y hash de transacción. No sumar saldo real hasta confirmar la operación; contemplar reconciliación y reintentos. El activo, montos y política de premios definitivos quedan pendientes del equipo.

## Cuenta digital y envío

`handleTransferirRecompensa(input)` recibe `TransferInput` con `recipient`, `amount` decimal en string e `idempotencyKey`. La demo solo admite cuentas `DEMO-*`, cantidades enteras positivas dentro del saldo y exige revisar/confirmar antes de debitar. `transferDemo` impide debitar dos veces la misma clave en memoria.

Para Stellar, reemplazar la validación de ejemplo por la del destino real y la precisión del activo acordado. Preparar la operación en servidor, determinar el modelo de custodia/firma, mostrar datos reales para confirmar y devolver estados verificables de preparación, envío y confirmación. El identificador de idempotencia debe conservarse durante los reintentos de una misma operación. No convertir `transferDemo` en una transferencia real ni reutilizar los IDs `DEMO-*` como direcciones.

## Decisión técnica y comprobante

Se respeta la opción B de la Semana 3: **Stellar nativo, memo hash y reservas patrocinadas**; no se añade contrato Soroban. El backend debe construir el compromiso criptográfico acordado, mantener registros privados fuera de la cadena y devolver el comprobante confirmado. Definir serialización, privacidad del hash, relación registro/cierre semanal y verificación reproducible antes de implementar.

Las reservas patrocinadas cubren requisitos de reserva; pagar comisiones es otro mecanismo. Acordar también quién cubre las comisiones, sin asumir que el patrocinio de reservas las resuelve. Referencias oficiales: [reservas patrocinadas](https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves) y [patrocinio de comisiones](https://developers.stellar.org/docs/build/guides/transactions/fee-sponsorship).

`demoProof` es un certificado semanal histórico de muestra, independiente de las recompensas de esta sesión. No acredita los registros nuevos ni una transacción real. `0x8fa3...b41c` es una referencia visual y su valor completo de ejemplo no es un memo hash válido de Stellar. Reemplazarlo por datos reales y `transactionHash` confirmado. Memo y hash de transacción son conceptos distintos: el vínculo al explorador debe usar este último y la red correcta.

Los detalles técnicos están colapsados en `/comprobante` para mantener el recorrido principal comprensible. El botón Explorer solo muestra un aviso, sin abrir una operación ficticia. Copiar utiliza Clipboard API y compartir usa Web Share API con copia alternativa. El enlace compartido actual abre la muestra; definir una URL y permisos para certificados personales reales.

Nunca incluir semillas, claves privadas ni tokens privilegiados en el navegador o variables `NEXT_PUBLIC_*`.

## Reflexión y recurrencia

La reflexión muestra categorías, cantidades por categoría, fechas y emociones seleccionadas. `Guardé` se mantiene separado de los gastos. No ofrece diagnósticos, asesoría ni metas automáticas. La ventana contiene siete fechas del calendario local, relativas al registro más reciente.

La medición de activación y retorno a 7/14/28 días queda pendiente del backend. No hay tracking remoto ni afirmaciones de retención real. Los handlers existentes señalan dónde ocurren alta, registro, lección y reclamo; definir eventos mínimos, consentimiento y política de privacidad con el equipo antes de conectar analítica.

## PWA, pruebas y Vercel

`public/sw.js` guarda recursos y HTML de demostración visitado mediante navegación completa. Excluye `/api/`, terceros y payloads RSC. Antes de mostrar contenido autenticado en HTML, retirar o rediseñar esta caché, respetar `Cache-Control: no-store`, aislar sesiones y limpiar al salir. Subir `VERSION` al cambiar el shell. El formulario, foto y saldo no se guardan en almacenamiento persistente.

Con Node 24, instalar con `npm ci`; verificar con `npm run lint`, `npm run typecheck`, `npm run build`; servir con `npm start` y ejecutar `npm run test:e2e` en otra terminal con Google Chrome instalado. No se requieren variables de entorno para esta demo.

En Vercel, usar **Root Directory `frontend`** al conectar el repositorio compartido. Enlazar el proyecto existente, evitando crear uno duplicado:

```sh
vercel link --project do-own --scope rodyx-dev
vercel --prod --yes --scope rodyx-dev
```

La carpeta `.vercel/`, `.env*`, `node_modules/`, `.next/` y los reportes no se incluyen en Git. Los endpoints no están inventados ni se instala un SDK Stellar en esta entrega: confirmar los contratos finales con el equipo de backend.


## Dependencias revisadas — 15 de octubre de 2026

La instalación independiente y la compilación de `frontend/` se verificaron con Node 24. `npm audit --omit=dev` no reportó vulnerabilidades. Se retiró la dependencia directa de desarrollo `sharp`, usada únicamente por un generador local de recursos que no forma parte del entregable; Next mantiene su dependencia propia `sharp@0.35.5`.

La auditoría completa conserva cinco avisos altos derivados de una misma dependencia de desarrollo: `braces@3.0.3`, a través de `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next`. El [aviso revisado de GitHub](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) no registra una versión corregida. No se aplicó `npm audit fix --force`, porque propone cambiar la versión mayor de la configuración de Next. Revisar una actualización compatible cuando exista. La herramienta procesa patrones del proyecto durante el lint; no recibe los formularios ni fotografías de los usuarios.

## Stellar Testnet (Semana 4)

Esta sección reemplaza los marcadores `TODO(STELLAR)` de recompensas, cuenta, envío y comprobante. Ya se instaló `@stellar/stellar-sdk` y existen endpoints reales. Si el servidor no tiene variables de entorno, `/api/stellar/config` responde `enabled: false` y la UI vuelve al modo demo, que es como corren las pruebas e2e.

### Piezas

| Archivo | Qué hace |
|---|---|
| `src/lib/stellar/config.ts` | Red, Horizon, explorador y activo `DOWN` (no secretos) |
| `src/lib/stellar/server.ts` | Solo servidor: onboarding patrocinado, pago de recompensas idempotente y fee bump con lista blanca |
| `src/lib/stellar/client.ts` | Navegador: llave en el dispositivo, firma, compromisos con sal, raíz Merkle y verificación |
| `src/providers/wallet-provider.tsx` | Estado de la wallet (`disabled` / `none` / `creating` / `ready` / `error`) |
| `src/app/api/stellar/{config,onboard,reward,sponsor}` | Route handlers de Next (corren como funciones en Vercel) |
| `src/components/features/wallet-account.tsx` | `/cuenta` real: saldo DOWN, recibir, enviar, movimientos, respaldo y recuperación |
| `src/components/features/verify-screen.tsx` | `/verificar`: página pública de verificación |

### Endpoints

- `GET /api/stellar/config`: indica si la integración está activa y devuelve el activo y el patrocinador.
- `POST /api/stellar/onboard {publicKey}`: devuelve una transacción ya firmada por el patrocinador (crear cuenta + trustline con reservas patrocinadas). El dispositivo agrega su firma y la envía a Horizon. Si la cuenta ya existe, responde `{status:"ready"}`.
- `POST /api/stellar/reward {publicKey, rewardId}`: paga 1 DOWN con memo `sha256("do-own:reward:v1:<cuenta>:<rewardId>")`. Si encuentra ese memo en el historial, devuelve la transacción existente sin volver a pagar. El límite es de 12 recompensas por cuenta por día.
- `POST /api/stellar/sponsor {xdr, kind}`: envuelve en fee bump y envía la transacción firmada por la persona. Solo acepta dos formas: `seal` (una `bumpSequence` a 0 con memo hash) y `transfer` (un pago de DOWN). Verifica la firma y que la cuenta tenga trustline a DOWN.

### Sello semanal

`compromiso = sha256(sal16 ‖ JSON["do-own:record:v1", id, createdAt, amount, currency, category, emotion, note])`. La raíz es un árbol de Merkle binario sobre los compromisos (el nodo impar sube). La raíz (32 bytes) va en `Memo.hash`. Solo se guardan en `localStorage` la llave, los hashes de los sellos y los recibos de recompensa; nunca montos ni notas. Las sales se conservan en memoria durante la sesión para que "Verificar ahora" pueda recomputar la raíz.

### Configurar sin instalar nada (desde el navegador)

1. En Vercel → Settings → Environment Variables, agregar `STELLAR_SPONSOR_SECRET`, `STELLAR_ASSET_ISSUER`, `STELLAR_ISSUER_SECRET` y `STELLAR_ADMIN_TOKEN`, y volver a desplegar.
2. Abrir `https://do-own.vercel.app/api/stellar/admin?token=<TOKEN>&action=setup`. Fondea las cuentas con Friendbot, crea la trustline y emite DOWN. Se puede repetir sin problema.
3. Abrir `https://do-own.vercel.app/api/stellar/admin?token=<TOKEN>&action=evidence`. Recorre el flujo completo con dos usuarios de prueba y devuelve el Markdown para `docs/semana4/EvidenciaTestnet.md`.

### Configurar con Node (alternativa local)

```sh
cd frontend
npm ci
npm run stellar:setup      # crea emisor + patrocinador en testnet y escribe .env.local
npm run dev                # en otra terminal:
npm run stellar:evidence   # recorre el flujo y escribe docs/semana4/EvidenciaTestnet.md
```

En Vercel (proyecto `do-own`), en **Settings → Environment Variables**, agregar `STELLAR_SPONSOR_SECRET` y `STELLAR_ASSET_ISSUER` con los valores que imprime `stellar:setup`, y volver a desplegar. Después se puede correr `npm run stellar:evidence -- https://do-own.vercel.app` para generar la evidencia contra producción.

`STELLAR_SPONSOR_SECRET` es la llave de la tesorería de testnet: solo va en el servidor, nunca en `NEXT_PUBLIC_*` ni en Git (`.env.local` está ignorado).

### Pendiente

Falta la sesión autenticada y una base de datos para validar en el servidor que cada `rewardId` corresponde a un registro real. También faltan rate limiting por IP en `/sponsor`, cifrar la llave local con PIN o passkey, y la página del patrocinador con cifras agregadas.
