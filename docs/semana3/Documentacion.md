# Documentación — Semana 3 (Entregable 3) — Do-Own

Actualizado el 15 de octubre de 2026 con el frontend ejecutable integrado en `devmondoss/Do-Own`.

---

## Front construido
*(400–2000 palabras)*

El frontend de Do-Own está implementado como una aplicación ejecutable en **Next.js App Router, TypeScript y Tailwind CSS**, preparada en la carpeta `frontend/`, fuera de `docs/`. El código del frontend se incorpora al repositorio del equipo junto con sus instrucciones de ejecución y guías de integración. El código utiliza componentes reutilizables, rutas navegables y estado compartido en React para recorrer el MVP sin depender de servicios todavía no conectados.

La evidencia pública del frontend es [https://do-own.vercel.app](https://do-own.vercel.app). La versión integra el ciclo **observar → aprender → recibir → poseer → volver** definido en el [Product Blueprint](../semana2/ProductBlueprint.md). Los colores principales son violeta `#7C3AED` y verde `#10B981`, con tipografía Plus Jakarta Sans alojada localmente, tarjetas suaves y navegación adaptada a móvil y escritorio.

### Pantallas implementadas y relación con el MVP

- **Bienvenida (`/bienvenida`):** introduce el recorrido y permite escribir un nombre opcional. No solicita datos bancarios ni financieros sensibles. Es una entrada de demostración, sin crear una identidad o cuenta real.
- **Inicio (`/inicio`):** reúne el saludo, la racha de ejemplo y las acciones de registrar una decisión, asociar una emoción y aprender. Los enlaces conducen a los flujos correspondientes y reflejan las acciones realizadas en la sesión.
- **Registro (`/registro`):** permite seleccionar o tomar una fotografía, revisar su vista previa y confirmar el monto manualmente. Incluye las categorías Antojo, Lo de siempre y Guardé, una emoción y una nota opcional. Valida imagen y monto antes de continuar. La lectura automática de la foto queda pendiente del servicio de IA; la interfaz lo indica y no inventa resultados.
- **Aprender (`/aprender`):** utiliza el contenido de Antojos escrito por el equipo en [contenido-microleccion-antojo](./contenido-microleccion-antojo). Presenta dos pasos de contenido y las dos preguntas de comprensión. Exige responder correctamente para finalizar y permite repasar sin generar otra recompensa.
- **Recompensa (`/recompensa`):** habilita una recompensa inmediatamente después del registro financiero y emocional. Completar por primera vez la microlección habilita una adicional. Cada premio tiene su propio identificador y no se puede recibir dos veces en la misma sesión. Entrar directamente sin haber realizado una acción muestra cómo desbloquearlo.
- **Progreso (`/progreso`):** muestra el saldo de ejemplo, las acciones completadas y una gráfica construida a partir de los registros disponibles. Se sustituyeron las metas y consejos de presupuesto por indicadores de observación y aprendizaje, acordes con el alcance del Blueprint.
- **Cuenta digital (`/cuenta`):** permite consultar y copiar un identificador de ejemplo, elegir un destino de demostración y practicar un envío. Valida cantidad y saldo, muestra un resumen y pide confirmación antes de descontar créditos. El movimiento queda visible en la sesión; no se mueve dinero ni se firma una operación real.
- **Reflexión semanal (`/reflexion`):** presenta decisiones, fechas, emociones y montos separados por categoría. El ahorro se muestra separado de los gastos. La ventana usa siete fechas del calendario de Ciudad de México tomando como referencia el registro más reciente. Es un resumen descriptivo, sin diagnósticos ni recomendaciones financieras.
- **Comprobante (`/comprobante`):** muestra una constancia semanal de ejemplo con opciones de copiar y compartir. Los detalles del sello y de la red están en una sección desplegable, para conservar un recorrido comprensible. El comprobante se identifica como muestra sin verificación real y no acredita los registros nuevos de la sesión.

### Alcance funcional y puntos pendientes

El saldo inicial de 125 créditos, la racha de 14 días y el certificado son datos de demostración. Los créditos no equivalen a USDC, dinero real ni un activo emitido. Los registros nuevos, recompensas y movimientos se comparten durante la navegación interna; una recarga completa restablece la demo. No hay base de datos ni persistencia del archivo de la fotografía.

La presentación está separada de los contratos en `src/types/do-own.ts` y de los callbacks en `src/lib/integrations.ts`, dentro de `frontend/`. Los comentarios `TODO(BACKEND)`, `TODO(STELLAR)` y `DEMO(UI)` indican qué reemplazar para conectar servicios reales. Quedan pendientes autenticación, OCR/IA, persistencia, validación de premios en servidor, medición de retorno, creación de cuentas, firma, transferencia y verificación real en Stellar. Se conserva la decisión técnica del equipo: capacidades nativas de Stellar con memo hash y reservas patrocinadas, sin incorporar un contrato Soroban.

Los datos financieros y emocionales y las fotografías deben permanecer privados y fuera de la cadena. El hash visual actual es ilustrativo y debe sustituirse por un compromiso válido y una transacción confirmada antes de presentar evidencia verificable. Las reservas patrocinadas y el pago de comisiones requieren definir sus mecanismos por separado en la integración.

El [README de la raíz](../../README.md) describe requisitos, instalación y ejecución. El [mapa técnico](../tecnica/FRONTEND.md) y la [guía de integración](../tecnica/INTEGRACION.md) permiten localizar pantallas, componentes, estado y conexiones. Se incluyen pruebas de navegador de los flujos, validaciones, adaptación móvil/escritorio, accesibilidad automatizada y recursos PWA; sus reportes y dependencias permanecen fuera del repositorio.

---

## Decisión técnica
*(200–500 palabras)*

**Opción elegida: B — Solución existente del ecosistema.**

Do-Own usará capacidades nativas de Stellar en lugar de escribir un contrato propio en Soroban: transacciones con **memo hash** para anclar un comprobante verificable de cada registro/recompensa semanal, y **reservas patrocinadas** para que la persona usuaria no necesite tener XLM propio ni gestionar fondos para poder operar en la red.

**Por qué se decidió así.** El caso de uso del MVP es anclar un comprobante verificable semanalmente — no requiere lógica programable personalizada ni condiciones complejas evaluadas on-chain. Las transacciones nativas de Stellar ya ofrecen justamente lo que el producto necesita: una forma de dejar un registro inmutable y verificable en la red, con el costo de transacción cubierto por el equipo (reserva patrocinada) para que la persona usuaria no tenga que lidiar con criptomonedas ni conceptos técnicos. Esto está directamente alineado con el uso de Stellar definido en el Blueprint: materializar y transferir el activo digital del usuario sin exigirle comprensión técnica previa de blockchain.

**Por qué se descartó un contrato propio.** Escribir y desplegar un contrato propio en Soroban (lógica en Rust, compilación a WASM, deploy, mantenimiento) habría agregado una complejidad de desarrollo significativa sin aportar valor adicional al usuario final para este alcance de MVP. Un contrato propio tiene sentido cuando se necesita lógica condicional — por ejemplo, liberar una recompensa solo si se cumplen varias condiciones verificables automáticamente — pero esa no es la necesidad actual del producto. Si el producto evoluciona en esa dirección, esta decisión se revisaría y Soroban sería el camino técnico a seguir.

---

## Participación del equipo
*(Breve)*

| Integrante | GitHub | Rol | Commits esta semana (desde 5 oct) |
|---|---|---|---|
| Adriana | AdrianaLhada | Methodology & Product Lead | Sí — contenido de la micro-lección de Antojos, mockups |
| Anthony | devmondoss | Full Stack | Sí — presentación del proyecto e inicio de Info.md |
| Elba | elba333 | Product & Business Lead | *(pendiente)* |
| Nayeli | nayelicz | Backend | Sí - presentación de slides de las pantallas del MVP|
| Rodrigo | rodyxdev | Backend | Sí — frontend ejecutable, adaptación al Blueprint y documentación de integración |

---

## Bloqueos y siguiente paso
*(Breve)*

**Bloqueos:** El frontend ya está integrado como código ejecutable en `frontend/`, junto con el README de requisitos, instalación y ejecución y las guías técnicas. El bloqueo de ausencia de código del frontend está resuelto. Permanecen pendientes los servicios reales de autenticación, lectura de fotos, persistencia, medición de recurrencia y la conexión con Stellar; la experiencia actual es una demostración en memoria.

**Siguiente paso:** Conectar los servicios del backend, implementar la decisión técnica aquí declarada (memo hash + reservas patrocinadas) y dejar evidencia pública verificable en el explorador de testnet — esto corresponde al Entregable 4 (MVP Functional), con fecha límite el lunes 19 de octubre.
