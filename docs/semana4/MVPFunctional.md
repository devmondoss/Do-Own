# Documentación — Semana 4 

## Aprendizajes y ajustes priorizados

El aprendizaje central de esta etapa fue de simplificación técnica: en el Entregable 3 el equipo decidió usar capacidades nativas de Stellar (transacciones con memo hash + reservas patrocinadas) en lugar de escribir un contrato propio en Soroban para el sello semanal de integridad. La Sesión 6 (Smart Contracts) confirmó que esa decisión fue correcta para el alcance del MVP: el caso de uso —anclar un comprobante verificable semanalmente— no requiere lógica programable personalizada, y construir un contrato propio habría agregado complejidad (Rust, compilación a WASM, deploy, mantenimiento) sin aportar valor adicional al usuario final. Esto dejó más tiempo del equipo para el front y la experiencia de registro, que es donde realmente se juega la adopción.

El ajuste priorizado más importante antes del cierre es ocultar por completo la complejidad de blockchain en la interfaz: el usuario nunca ve "Stellar", "testnet" ni conceptos técnicos — solo su registro, su racha y su recompensa. Es un criterio de diseño que el equipo adoptó por juicio propio, en línea con la hipótesis H4 (activo digital comprensible sin conocimientos previos de blockchain), y que no requiere cambios de arquitectura, solo ajustes de copy e interfaz.

Queda pendiente para después del cierre: si el producto evoluciona hacia incentivos condicionados a reglas más complejas (por ejemplo, liberar recompensa solo si se cumplen varias condiciones verificables automáticamente), ahí sí sería necesario migrar a un contrato propio en Soroban, usando lo ya cubierto en la Sesión 6 (SDK en Rust, SEP-0041/SEP-0048 para tokens e interfaces).

---

## Riesgos y pendientes

**Riesgos de producto y adopción**
El mayor riesgo sigue siendo de deseabilidad, no técnico: no hay todavía evidencia con usuarios reales de que las personas registren sus gastos y emociones de forma constante (H1) ni de que la recompensa, por sí sola, sostenga ese hábito más allá de la novedad inicial (H2). Ambas se resuelven con las 5 sesiones de validación ya planeadas, pero hasta no correrlas son supuestos, no hechos.

**Riesgos de negocio (Go-to-Market)**
Dos de las cinco partes del modelo de go-to-market siguen sin resolver: el canal de adquisición real (más allá de candidatos como la comunidad del bootcamp) y el modelo de sostenibilidad económico, que depende de que empresas y patrocinadores financien las recompensas (B2B2C). Sin esas dos decisiones, el producto puede funcionar técnicamente pero no tiene aún un camino claro para crecer más allá del grupo de prueba.

**Riesgos técnicos**
El presupuesto de recompensas podría no sostener el uso real del grupo si la frecuencia de registro supera lo estimado (H10) — esto se mide recién al cierre de la validación, no antes. También existe el riesgo de fricción en la firma de transacciones: si la persona no entiende qué está aprobando (H6) o reintenta el botón antes de que confirme la red (H7), eso se traduce en una mala primera impresión aunque el backend funcione correctamente.

**Pendientes antes del cierre**
- Ejecutar las 5 sesiones de validación con usuarios reales del perfil definido en el Problem Brief.
- Definir un canal de adquisición concreto (no solo candidatos).
- Sostener 2–3 conversaciones reales con empresas potenciales patrocinadoras para validar el modelo B2B2C.
- Dejar cargada la evidencia pública: enlace al producto, video del pitch, y transacciones verificables en el explorador de testnet.

---

## Plan de validación con usuarios

Do-Own valida con **un solo tipo de usuario**, definido en el Problem Brief: personas de 25 a 49 años, económicamente activas, que saben qué deberían cambiar en cómo gastan, ahorran o pagan deudas, pero repiten el mismo patrón sin identificar qué lo dispara. La meta es **5 personas** de ese perfil — suficiente para detectar ~85% de los problemas de usabilidad según la curva estándar de pruebas con usuarios.

**Qué se prueba.** Diez hipótesis organizadas en los tres riesgos que pide el bootcamp:
- *Deseabilidad* (H1–H2): si la persona registra sus gastos y emociones de forma constante (racha de 7+ días), y si la recompensa sostiene ese hábito más allá del resultado financiero.
- *Usabilidad* (H3–H8): si puede registrar un gasto en menos de un minuto sin ayuda, entender su "activo digital" sin conocimientos de blockchain, conectar su billetera sin soporte, entender qué firma, esperar la confirmación sin reintentar, y reconocer el hash como comprobante.
- *Viabilidad* (H9–H10): si las recompensas se emiten sin fallos en testnet, y si el presupuesto de recompensas sostiene el uso real del grupo.

**Cómo se prueba.** Sesiones individuales de usabilidad (presenciales o por videollamada), con roles separados — un(a) moderador(a) que conduce la sesión con un guion fijo (bienvenida, 4 escenarios de tarea, preguntas de "pensar en voz alta", preguntas finales sobre comportamiento pasado, nunca sobre intenciones futuras) y un(a) observador(a) que solo anota, sin intervenir. Antes de gastar una sesión real, el equipo recorre el flujo internamente con una checklist de 4 preguntas por paso, para resolver fricciones obvias primero.

**Cómo se ordena la evidencia.** Cada sesión deja una ficha de observación (qué hizo, qué dijo, en qué paso) y un resumen de fricciones por tarea. Con las 5 sesiones completas, las fricciones se agrupan en un mapa de afinidad para identificar patrones reales — una fricción que se repite en 3 de 5 personas es prioridad; un caso aislado no lo es.

**Criterio de éxito.** Una hipótesis se da por validada según su señal observable definida (ej. H3: 80% de registros completos sin abandono; H5: 80%+ conecta su billetera sin soporte). Una vez corridas las 5 sesiones, los patrones de fricción confirmados se priorizan en una matriz de impacto/esfuerzo (alto impacto + bajo esfuerzo se corrige antes del cierre; el resto se planea o se descarta) — ese es el único punto del proceso donde se usa esa matriz, y con datos reales de usuarios, no con supuestos del equipo.


https://do-own.vercel.app/inicio
