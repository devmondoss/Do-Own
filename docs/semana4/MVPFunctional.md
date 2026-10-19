# MVP Functional — Semana 4 (Entregable 4) — Do-Own

## Evidencia verificable

| Qué | Enlace |
|---|---|
| Producto en línea con wallet en testnet (PWA instalable en el teléfono) | [do-own-six.vercel.app](https://do-own-six.vercel.app/bienvenida) |
| App para Android (generador del instalador en PWABuilder) | [Reporte y descarga](https://pwabuilder.com/reportcard?site=https://do-own-six.vercel.app) |
| App para Android (.apk) | [Descargar Do-Own.apk](https://do-own-six.vercel.app/Do-Own.apk) |
| Demo anterior (Semana 3, sin red) | [do-own.vercel.app](https://do-own.vercel.app/bienvenida) |
| Video del producto + pitch (máx. 3 min) | _PENDIENTE: pegar enlace público de YouTube_ |
| Publicación en redes (bono, opcional) | _PENDIENTE_ |
| Todas las transacciones en Stellar Testnet | [EvidenciaTestnet.md](./EvidenciaTestnet.md) |
| Cuenta creada con reservas patrocinadas (0 XLM) | [69ff7a86bb…](https://stellar.expert/explorer/testnet/tx/69ff7a86bbc322bba068379812f8026bac178bfecf7ed715442d7c35001079fc) |
| Recompensa DOWN con memo hash | [1ec60fff9a…](https://stellar.expert/explorer/testnet/tx/1ec60fff9a99d942c1080478cfa67444dcf03a3e265964e28a63d1f204ebfc4a) |
| Sello semanal (memo hash + fee bump) | [47db7b6018…](https://stellar.expert/explorer/testnet/tx/47db7b601848c155310104930dfd0711dd427901a308ba36bf0c729369138122) |
| Verificación pública del sello | [Abrir](https://do-own-six.vercel.app/verificar?tx=47db7b601848c155310104930dfd0711dd427901a308ba36bf0c729369138122&root=addf2451b34926cfbb6bcb00182fd411393cc89b8fa31043471a96c43b0d4b58) |
| Activo DOWN y tesorería | [DOWN](https://stellar.expert/explorer/testnet/asset/DOWN-GA6WNG33B7IPAAWXR4ZZ5Y5VOZRMHGDBDOLT2R575PTCSYVSO4OGOKF5) · [Tesorería](https://stellar.expert/explorer/testnet/account/GAUR5HX7W4SVUM5LWLF5EARTEZF72SSWQBBPFZ7CCAYFWW6T32QKLY7B) |
| Código de la integración | [`frontend/src/lib/stellar/`](../../frontend/src/lib/stellar/) y [`frontend/src/app/api/stellar/`](../../frontend/src/app/api/stellar/) |

Tecnología declarada en el Entregable 3: **opción B — solución existente del ecosistema** (capacidades nativas de Stellar: memo hash y reservas patrocinadas, sin contrato Soroban propio). Esta semana quedó integrada en el front y funcionando en testnet.

## Qué se construyó esta semana

**Wallet integrada (no custodial).** Al empezar el recorrido, la app genera la llave de la persona en su propio dispositivo. No pide frase semilla, extensión ni XLM. El servidor de Do-Own nunca recibe esa llave.

| Paso del producto | Capacidad de Stellar | Dónde está en el código |
|---|---|---|
| Crear la cuenta digital con saldo 0 XLM | **Reservas patrocinadas**: `beginSponsoringFutureReserves` + `createAccount` + `changeTrust` a DOWN + `endSponsoringFutureReserves`. Firman Do-Own (patrocinador) y la persona | `POST /api/stellar/onboard` · `client.ts → onboard` |
| Recibir recompensa por registro o microlección | Pago de **DOWN** (activo de prueba sin valor en dinero) con **memo hash** determinista: si se reintenta, no se paga dos veces | `POST /api/stellar/reward` |
| Sellar la semana | Cada registro se convierte en `sha256(sal ‖ registro)`, con un árbol de Merkle de la semana. La raíz va como **memo hash** en una transacción firmada por la persona, y Do-Own paga la comisión con **fee bump** | `POST /api/stellar/sponsor` (kind `seal`) · `/comprobante` |
| Verificar sin ver datos | Página pública que lee la transacción en la red y compara su memo con la raíz | `/verificar?tx=…&root=…` |
| Enviar DOWN a otra persona | Pago firmado por la persona, con comisión cubierta por fee bump | `POST /api/stellar/sponsor` (kind `transfer`) · `/cuenta` |
| Llevarla en el teléfono | PWA instalable ("Agregar a pantalla de inicio"), con tarjeta de instalación en `/cuenta` | `manifest.ts`, `sw.js`, `install-card.tsx` |

Montos, categorías, notas y emociones **nunca salen del dispositivo ni llegan a Stellar**: solo se publican hashes. El servidor solo acepta patrocinar comisiones de dos formas de transacción (sello y envío de DOWN), para que nadie pueda usar la tesorería en otra cosa. Si el servidor no tiene variables de Stellar, la app sigue funcionando como demo.

Cómo reproducir: [docs/tecnica/INTEGRACION.md → Stellar Testnet](../tecnica/INTEGRACION.md#stellar-testnet-semana-4).

---

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
El presupuesto de recompensas podría no sostener el uso real del grupo si la frecuencia de registro supera lo estimado (H10) — esto se mide recién al cierre de la validación, no antes. También existe el riesgo de fricción en la firma de transacciones: si la persona no entiende qué está aprobando (H6) o reintenta el botón antes de que confirme la red (H7), eso se traduce en una mala primera impresión aunque el backend funcione correctamente. La llave de la wallet vive en el navegador del dispositivo: si la persona borra los datos sin haber guardado su clave de respaldo, pierde el acceso a esa cuenta. Además, mientras no exista base de datos ni sesión, el servidor limita las recompensas por día y evita pagos duplicados, pero todavía no comprueba que cada registro sea real.

**Pendientes antes del cierre**
- Ejecutar las 5 sesiones de validación con usuarios reales del perfil definido en el Problem Brief.
- Definir un canal de adquisición concreto (no solo candidatos).
- Sostener 2–3 conversaciones reales con empresas potenciales patrocinadoras para validar el modelo B2B2C.
- Dejar cargado el enlace al video del pitch (el producto en línea y las transacciones verificables en testnet ya están en la sección de evidencia).

---

## Plan de validación con usuarios

Do-Own valida con **un solo tipo de usuario**, definido en el Problem Brief: personas de 25 a 49 años, económicamente activas, que saben qué deberían cambiar en cómo gastan, ahorran o pagan deudas, pero repiten el mismo patrón sin identificar qué lo dispara. La meta es **5 personas** de ese perfil — suficiente para detectar ~85% de los problemas de usabilidad según la curva estándar de pruebas con usuarios.

**Qué se prueba.** Diez hipótesis organizadas en los tres riesgos que pide el bootcamp:

*Deseabilidad*
- **H1 — Constancia de registro.** Creemos que las personas de 25-49 años con estrés financiero registrarán sus decisiones de gasto y su emoción asociada de forma constante, porque hoy no tienen una forma sencilla de ver el patrón detrás de sus hábitos sin juicio ni fricción. Lo sabremos si mantienen una racha de al menos 7 días seguidos.
- **H2 — La recompensa no es el único motivo.** Creemos que la recompensa en cripto sostiene la constancia más que el resultado financiero percibido, porque da una señal de avance inmediata. Lo sabremos si las personas mantienen su racha incluso en semanas donde registran principalmente Antojos (el mecanismo de observar sin juicio engancha, no solo el token).

*Usabilidad*
- **H3 — Registro rápido.** Creemos que las personas podrán registrar un gasto completo (monto, categoría, emoción) en menos de un minuto sin ayuda externa, porque el flujo evita pedir información financiera sensible y usa solo 3 categorías simples. Lo sabremos si el 80% de los registros se completan sin abandonar la pantalla a mitad de camino, y sin soporte manual del equipo.
- **H4 — Activo digital comprensible.** Creemos que las personas entenderán qué es su "activo digital" sin conocimientos previos de blockchain, porque la cuenta Stellar Testnet y la reserva patrocinada quedan invisibles para ellas. Lo sabremos si pueden explicar con sus propias palabras qué tienen y cómo lo consiguieron.
- **H5 — Conexión de billetera sin ayuda.** Creemos que una persona sin experiencia previa en cripto podrá conectar o crear su billetera sin ayuda externa, porque Do-Own guía el proceso paso a paso y no pide frases semilla ni claves privadas. Lo sabremos si el 80%+ de los usuarios completan ese paso sin pedir soporte.
- **H6 — Entiende qué firma.** Creemos que la persona entenderá qué está aprobando cuando firma una transacción, porque Do-Own lo presenta en lenguaje simple, sin jerga de blockchain. Lo sabremos si, al preguntarle, puede explicar con sus propias palabras qué acaba de confirmar.
- **H7 — Espera la confirmación sin reintentar.** Creemos que la persona esperará los ~5 segundos de confirmación en Stellar sin volver a tocar el botón, porque la interfaz muestra con claridad que la operación está en curso. Lo sabremos si no se registran transacciones duplicadas por reintentos durante la validación.
- **H8 — El hash se entiende como comprobante.** Creemos que la persona entenderá el hash/comprobante como evidencia de que su registro quedó guardado, no como un código sin sentido, porque Do-Own lo presenta como "tu comprobante" y no como un dato técnico. Lo sabremos si, al mostrárselo, lo reconoce como prueba — no pregunta "¿y esto qué es?".

*Viabilidad*
- **H9 — Emisión de recompensas sin fallos.** Creemos que se puede emitir y verificar recompensas en Stellar Testnet para todo el grupo de prueba sin fallos de transacción, porque las reservas patrocinadas evitan que el usuario necesite XLM propio. Lo sabremos si el 100% de las recompensas otorgadas durante la validación se reflejan correctamente en el saldo del usuario, verificables en Stellar Expert.
- **H10 — Presupuesto de recompensas sostenible.** Creemos que el presupuesto de recompensas puede sostener el uso real del grupo de prueba sin quedarse sin fondos, porque el modelo limita la recompensa a acciones validadas (no ilimitadas). Lo sabremos si, al cierre de la validación, el gasto en recompensas se mantiene dentro del presupuesto estimado por usuario.

**Cómo se prueba.** Sesiones individuales de usabilidad (presenciales o por videollamada), con roles separados — un(a) moderador(a) que conduce la sesión con un guion fijo (bienvenida, 4 escenarios de tarea, preguntas de "pensar en voz alta", preguntas finales sobre comportamiento pasado, nunca sobre intenciones futuras) y un(a) observador(a) que solo anota, sin intervenir. Antes de gastar una sesión real, el equipo recorre el flujo internamente con una checklist de 4 preguntas por paso, para resolver fricciones obvias primero.

**Cómo se ordena la evidencia.** Cada sesión deja una ficha de observación (qué hizo, qué dijo, en qué paso) y un resumen de fricciones por tarea. Con las 5 sesiones completas, las fricciones se agrupan en un mapa de afinidad para identificar patrones reales — una fricción que se repite en 3 de 5 personas es prioridad; un caso aislado no lo es.

**Criterio de éxito.** Una hipótesis se da por validada según su señal observable definida (ej. H3: 80% de registros completos sin abandono; H5: 80%+ conecta su billetera sin soporte). Una vez corridas las 5 sesiones, los patrones de fricción confirmados se priorizan en una matriz de impacto/esfuerzo (alto impacto + bajo esfuerzo se corrige antes del cierre; el resto se planea o se descarta) — ese es el único punto del proceso donde se usa esa matriz, y con datos reales de usuarios, no con supuestos del equipo.
