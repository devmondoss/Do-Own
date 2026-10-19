# Do-Own — Frontend

Frontend de demostración del MVP, construido con Next.js App Router, TypeScript y Tailwind CSS. Sigue el ciclo del Product Blueprint: observar → aprender → recibir → poseer → volver. La documentación del producto y las decisiones del equipo se conserva en el repositorio compartido.

Demo pública: [do-own.vercel.app](https://do-own.vercel.app).

## Ejecutar

Node.js 24 y npm. Desde la raíz del repositorio, entrar en `frontend/` antes de ejecutar los comandos:

```sh
cd frontend
npm ci
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). La raíz abre `/bienvenida`.

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

No se necesitan variables de entorno. Para ejecutar las pruebas con Google Chrome instalado y la aplicación servida en el puerto 3000:

```sh
npm run test:e2e
```

`TEST_BASE_URL` permite probar otro servidor. Las pruebas cubren los recorridos, validaciones, recompensas sin duplicación, envío simulado con confirmación, adaptación a 360/430/1440 px, accesibilidad automatizada, portapapeles y PWA. Las capturas y reportes son locales y se excluyen de Git.

## Pantallas y relación con el MVP

| Ruta           | Función                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------- |
| `/bienvenida`  | Introducción y nombre opcional, sin datos financieros sensibles.                         |
| `/inicio`      | Acciones de registro, emoción y aprendizaje; resumen de la sesión.                       |
| `/registro`    | Foto opcional con vista previa, monto confirmado manualmente, categoría, emoción y nota. |
| `/aprender`    | Microlección de Antojos del equipo, con dos preguntas y repaso.                          |
| `/recompensa`  | Una recompensa por cada registro y otra por la primera finalización de la lección.       |
| `/progreso`    | Saldo de ejemplo, actividad derivada de registros y acciones completadas.                |
| `/cuenta`      | Identificador de ejemplo, saldo y envío simulado con revisión y confirmación.            |
| `/reflexion`   | Resumen descriptivo de categorías, fechas y emociones, sin recomendaciones financieras.  |
| `/comprobante` | Constancia de muestra; sello y detalles de verificación opcionales.                      |

La foto se selecciona localmente y no se sube. El OCR/IA queda pendiente y la interfaz lo explica. Las recompensas son créditos de demostración, sin equivalencia monetaria ni activo emitido. El saldo inicial de 125, la racha de 14 días y el certificado son ejemplos. Cada registro nuevo habilita un crédito; completar la lección por primera vez habilita otro. Reclamar o repetir la lección no duplica premios. El envío debita créditos solo tras confirmación y evita repetir una misma operación en memoria.

El estado vive en React. La navegación interna lo conserva; recargar reinicia todo. La reflexión y la gráfica usan los últimos siete días del calendario de Ciudad de México, tomando como referencia el registro más reciente. Los registros de ejemplo se distinguen por IDs `sample-*`. Los puntos visuales de las acciones no son créditos ni dinero.

La demo no incluye autenticación, base de datos, OCR, medición real de retorno, billetera, firma, transferencia ni anclaje real. Estos son los siguientes puntos de integración del MVP. La decisión técnica permanece en Stellar nativo con memo hash y reservas patrocinadas; no se incorpora Soroban.

Las rutas de archivos siguientes son relativas a `frontend/`.

## Organización

| Ubicación                         | Responsabilidad                                              |
| --------------------------------- | ------------------------------------------------------------ |
| `src/app/`                        | Rutas, layouts, metadatos, estilos y manifest.               |
| `src/components/features/`        | Una implementación por pantalla.                             |
| `src/components/ui/`              | Navegación, botones, tarjetas, badges, barras y anillos.     |
| `src/providers/demo-provider.tsx` | Estado en memoria, recompensas y movimientos.                |
| `src/data/mock-data.ts`           | Datos iniciales y contenido educativo del equipo.            |
| `src/types/do-own.ts`             | DTOs y tipos iniciales de integración.                       |
| `src/lib/integrations.ts`         | Callbacks sin llamadas de red, con comentarios de conexión.  |
| `src/lib/decision-summary.ts`     | Ventana semanal y calendario de Ciudad de México.            |
| `public/`                         | Recursos locales, iconos, service worker y fallback offline. |
| `tests/`                          | Pruebas de navegador y accesibilidad.                        |

La [guía de integración](./INTEGRACION.md) explica los contratos, responsabilidades y pendientes. Buscar `TODO(BACKEND)`, `TODO(STELLAR)` y `DEMO(UI)` para localizar las conexiones.

## Diseño y adaptación

Los tokens están en `src/app/globals.css` y `tailwind.config.ts`, cargado explícitamente con `@config` en Tailwind 4. Colores principales `#7C3AED` y `#10B981`, bordes suaves y Plus Jakarta Sans alojada localmente.

Desde 1024 px se muestra navegación lateral y una distribución amplia con columnas. En móvil se utiliza navegación inferior y flujos independientes. Se mantiene el diseño visual de las referencias, adaptando el contenido al Blueprint y al criterio del equipo de evitar tecnicismos en el recorrido principal.

## PWA y despliegue

El service worker se registra solo en producción con HTTPS o localhost. Guarda recursos y documentos visitados mediante navegación completa; las rutas nuevas sin conexión muestran `public/offline.html`. Los payloads RSC y las peticiones API no se guardan. La navegación interna puede necesitar conexión. No se conserva estado privado en almacenamiento del navegador.

Antes de integrar usuarios reales debe retirarse o rediseñarse la caché de documentos privados, respetar `no-store` y limpiar cachés al cerrar sesión. La instalación depende del navegador; no es una aplicación completamente offline.

La aplicación funciona en Vercel sin variables de entorno. Al integrarla en el repositorio del equipo, configurar **Root Directory: `frontend`** y enlazar el proyecto existente `do-own`, equipo `rodyx-dev`. `.vercel/`, `.env*`, dependencias y artefactos de compilación quedan fuera de Git. Mantener las claves de firma y secretos únicamente en el servidor.


## Validación de esta versión

El 15 de octubre de 2026 se aprobaron diez pruebas de navegador sobre la compilación local: navegación de las nueve vistas, bienvenida, foto y formulario, premios únicos, repaso de la lección, envío con confirmación, comprobante, adaptación y PWA, junto con accesibilidad automatizada en móvil y escritorio. Se revisaron capturas a 360, 430 y 1440 px. Lint, TypeScript, formato y compilación también pasaron desde la carpeta integrada `frontend/`. Esta comprobación automatizada complementa la revisión visual; no sustituye una auditoría manual de accesibilidad ni pruebas con usuarios.

## Integración de Backend (wallet), Frontend con Stellar

Wallet integrada y Stellar Testnet: reservas patrocinadas, recompensas DOWN, sello semanal con fee bump, envíos y página /verificar.
Evidencia verificable: tu despliegue y las 9 transacciones en el explorador.
Experiencia de usuario: foto de perfil, datos reales y cerrar sesión.
App para Android: el .apk, el botón de descarga y la pantalla completa.

Calidad: pruebas, lint y compilación.
