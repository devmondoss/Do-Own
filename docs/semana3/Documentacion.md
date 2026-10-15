# Documentación — Semana 3 (Entregable 3) — Do-Own

Revisado contra el estado real del repositorio `devmondoss/amorproof` el 15 de octubre.

---

## Front construido
*(400–2000 palabras)*

> **Pendiente de completar.** El diseño de las pantallas principales del flujo está definido (dashboard de progreso, acciones diarias de registro financiero/emocional, micro-aprendizaje, recompensas), pero el código del front aún no está integrado al repositorio. Esta sección se completa en cuanto el front esté subido, con:
> - Qué pantallas se implementaron y cómo se conectan con el MVP del Blueprint.
> - Capturas de pantalla o enlace al front funcionando (si está hosteado en Vercel o similar).

Las pantallas diseñadas hasta ahora cubren (ver `docs/semana3/mockups/`):
- **Progreso / inicio:** racha de registro, saldo de recompensas acumuladas, metas (ahorro, bienestar emocional).
- **Acciones diarias:** registrar una decisión financiera, registrar la emoción asociada, y completar un micro-aprendizaje — cada una con su recompensa en puntos.
- **Aprender:** micro-lecciones aplicadas (ej. qué significa registrar un gasto como "Antojo", con quiz rápido — ya existe contenido escrito para esta lección en `docs/semana3/contenido-microleccion-antojo`).

Quedan por confirmar con el equipo de diseño/front si existen también las pantallas de: confirmar/firmar una recompensa, y ver el comprobante verificable de un registro — ambas forman parte del flujo principal definido en las hipótesis de usabilidad del producto.

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
| Nayeli | nayelicz | Backend | *(pendiente)* |
| Rodrigo | rodyxdev | Backend | *(pendiente — confirmar si el diseño del front ya se subió a su nombre)* |

---

## Bloqueos y siguiente paso
*(Breve)*

**Bloqueos:** El front todavía no está integrado al repositorio como código ejecutable — existe como diseño (mockups), pendiente de implementación. Sin eso, no se puede completar ni el README (requisitos/instalación/cómo correrlo) ni la conexión con la capa de Stellar del Entregable 4.

**Siguiente paso:** Subir el código del front al repositorio (fuera de `docs/`), implementar la decisión técnica aquí declarada (memo hash + reservas patrocinadas) y dejar evidencia pública verificable en el explorador de testnet — esto corresponde al Entregable 4 (MVP Functional), con fecha límite el lunes 19 de octubre.
