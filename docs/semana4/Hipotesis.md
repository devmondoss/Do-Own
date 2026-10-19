# Hipótesis de validación 

Formato: **Creemos que** [quién] [hará qué], **porque** [razón], **lo sabremos si** [señal observable].

Organizadas en los 3 tipos de riesgo que el bootcamp pide comprobar: **Deseabilidad**, **Usabilidad**, **Viabilidad**. Referenciadas desde [`MVPFunctional.md`](./MVPFunctional.md) en la sección "Plan de validación con usuarios".

---

## Deseabilidad — ¿la gente lo quiere?

**H1 — Constancia de registro**
Creemos que las personas de 25-49 años con estrés financiero registrarán sus decisiones de gasto y su emoción asociada de forma constante, porque hoy no tienen una forma sencilla de ver el patrón detrás de sus hábitos sin juicio ni fricción.
Lo sabremos si mantienen una racha de al menos 7 días seguidos.

**H2 — La recompensa no es el único motivo**
Creemos que la recompensa en cripto sostiene la constancia más que el resultado financiero percibido, porque da una señal de avance inmediata.
Lo sabremos si las personas mantienen su racha incluso en semanas donde registran principalmente Antojos (el mecanismo de observar sin juicio engancha, no solo el token).

---

## Usabilidad — ¿lo pueden usar sin fricción?

**H3 — Registro rápido**
Creemos que las personas podrán registrar un gasto completo (monto, categoría, emoción) en menos de un minuto sin ayuda externa, porque el flujo evita pedir información financiera sensible y usa solo 3 categorías simples.
Lo sabremos si el 80% de los registros se completan sin abandonar la pantalla a mitad de camino, y sin soporte manual del equipo.

**H4 — Activo digital comprensible**
Creemos que las personas entenderán qué es su "activo digital" sin conocimientos previos de blockchain, porque la cuenta Stellar Testnet y la reserva patrocinada quedan invisibles para ellas.
Lo sabremos si pueden explicar con sus propias palabras qué tienen y cómo lo consiguieron.

**H5 — Conexión de billetera sin ayuda**
Creemos que una persona sin experiencia previa en cripto podrá conectar o crear su billetera sin ayuda externa, porque Do-Own guía el proceso paso a paso y no pide frases semilla ni claves privadas.
Lo sabremos si el 80%+ de los usuarios completan ese paso sin pedir soporte.

**H6 — Entiende qué firma**
Creemos que la persona entenderá qué está aprobando cuando firma una transacción, porque Do-Own lo presenta en lenguaje simple, sin jerga de blockchain.
Lo sabremos si, al preguntarle, puede explicar con sus propias palabras qué acaba de confirmar.

**H7 — Espera la confirmación sin reintentar**
Creemos que la persona esperará los ~5 segundos de confirmación en Stellar sin volver a tocar el botón, porque la interfaz muestra con claridad que la operación está en curso.
Lo sabremos si no se registran transacciones duplicadas por reintentos durante la validación.

**H8 — El hash se entiende como comprobante**
Creemos que la persona entenderá el hash/comprobante como evidencia de que su registro quedó guardado, no como un código sin sentido, porque Do-Own lo presenta como "tu comprobante" y no como un dato técnico.
Lo sabremos si, al mostrárselo, lo reconoce como prueba — no pregunta "¿y esto qué es?".

---

## Viabilidad — ¿es sostenible construirlo y mantenerlo?

**H9 — Emisión de recompensas sin fallos**
Creemos que se puede emitir y verificar recompensas en Stellar Testnet para todo el grupo de prueba sin fallos de transacción, porque las reservas patrocinadas evitan que el usuario necesite XLM propio.
Lo sabremos si el 100% de las recompensas otorgadas durante la validación se reflejan correctamente en el saldo del usuario, verificables en Stellar Expert.

**H10 — Presupuesto de recompensas sostenible**
Creemos que el presupuesto de recompensas puede sostener el uso real del grupo de prueba sin quedarse sin fondos, porque el modelo limita la recompensa a acciones validadas (no ilimitadas).
Lo sabremos si, al cierre de la validación, el gasto en recompensas se mantiene dentro del presupuesto estimado por usuario.

---

## Nota

Estas hipótesis están pensadas para probarse en el grupo de validación de la Semana 4 del bootcamp, una vez que el Functional Proof (Semana 3) ya está construido. Las señales observables (racha, % de registros completos, transacciones duplicadas, recompensas verificadas on-chain) deben medirse directamente, no inferirse de lo que la persona dice que hizo.
