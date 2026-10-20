# Avance técnico contra el Product Definition

Qué se construyó en la app para cubrir lo escrito en el *Product Definition* de Do-Own, qué queda pendiente y por qué.

Demo: https://do-own-six.vercel.app · Rama: `product-definition-mvp`

## Hecho en esta entrega

| Función | Qué hace ahora la app | Dónde |
|---|---|---|
| F01 Registro | Nuevo campo obligatorio **"¿Qué compraste?"**. Se valida todo junto (qué compraste y monto). En la bienvenida, **correo opcional** (se valida el formato, solo se guarda en el teléfono). | `/registro`, `/bienvenida` |
| F02 Evidencia | La foto se **guarda en el teléfono** (IndexedDB, reducida a 1280 px). Se puede ver, cambiar, quitar o agregar después desde el historial. Nunca se sube a un servidor ni a la blockchain. Al cerrar sesión se borra. | `/registro`, `/historial` |
| F03 Mi historial | Registros agrupados por mes y día, con filtros por tipo y por emoción. "Lo que observamos": patrones solo con 5+ registros, redactados como observación, no consejo. Descarga en **CSV**. | `/historial` |
| F04 Microlecciones | Ahora hay **3 lecciones**: Antojos (contenido del equipo), *Lo de siempre también cuenta* y *Guardar también es decidir*. Cada una da 1 recompensa la primera vez. | `/aprender` |
| F05 Constancia | Vista **Día / Semana / Mes** con calendario. Mensaje de racha que siempre dice cómo mantenerla o recuperarla. | `/constancia` |
| F06 Recompensas | **Bono semanal** (3 DOWN): 5 de 7 días con registro y al menos una foto. **Bono mensual** (10 DOWN): 3 bonos semanales en el mes. Pantalla *Mis recompensas*: por recibir, en camino (con avance), **no aplicaron (con motivo)** y recibidas (con fecha y comprobante). | `/mis-recompensas` |
| F07 Emociones | 5 emociones: Alegría/Contento, Tranquilo/Satisfecho, Estrés/Culpa, Tristeza/Desánimo, Rutina/Neutro. | `/registro` |
| F08 Activo | Tarjeta "¿Qué es lo que tienes aquí?": qué tienes, dónde está, quién paga y la diferencia entre puntos y DOWN. | `/cuenta` |
| F09 Envío | El envío muestra la **comisión de red** (la paga Do-Own, tú $0) y el **estado**: por confirmar → pendiente → completada; si falla, se dice que no se movió nada. Los movimientos muestran "Completada · comisión $0". | `/cuenta` |

Además: accesos rápidos en Inicio, enlaces en Progreso, métrica de lecciones x/3, servidor acepta los nuevos ids de recompensa (`week-AAAA-Sxx`, `month-AAAA-MM`, `lesson-…`) con su monto.

## Por revisar con el equipo

- **Lecciones 2 y 3** son borradores: Adriana debe revisar el contenido (`frontend/src/data/mock-data.ts`).
- **Reglas de los bonos** (5/7 días, 3 semanas, montos 3 y 10) se eligieron para la demo; se pueden ajustar en `frontend/src/lib/periods.ts`.

## Pendiente (necesita algo más que código de app)

- **Base de datos y cuentas de usuario**: hoy todo vive en el teléfono. Sin servidor de datos, el servidor no puede verificar por sí mismo si alguien cumplió un bono semanal/mensual; solo limita a 12 entregas por día y una vez por id.
- **Retiro a pesos / conexión bancaria**: requiere un ancla regulada (SEP-24) y acuerdos legales.
- **Aliados y canje de recompensas**: requiere acuerdos comerciales.
- **Recordatorios por correo**: requiere un servicio de envío y consentimiento.

## Pruebas

`npm run lint`, `tsc`, `npm run build` y 11 pruebas Playwright (incluye accesibilidad WCAG AA en 12 pantallas, móvil y escritorio) en verde.
