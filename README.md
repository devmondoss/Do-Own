# 🎯 Do-Own

**Historial verificable para cambiar hábitos financieros.**

Un adulto de 31 años experimenta estrés financiero porque enfrenta decisiones cotidianas sobre gasto, ahorro y deuda. Sin ver sus propios hábitos, termina mes a mes endeudado, repitiendo lo mismo. Do-Own te devuelve un histórico inalterable de tus decisiones para que identifiques patrones y cambies lo que realmente importa.

---

## 📊 Problema

En México, 36.9% de los adultos presenta estrés financiero alto (ENSAFI 2023). Las principales preocupaciones son deudas, gastos imprevistos y dificultad para ahorrar.

**La brecha:** saber qué debería cambiar no es lo mismo que ver por qué lo repites mes a mes.

Las soluciones actuales (educación financiera, apps de presupuesto, asesoría) fragmentan el aprendizaje. **Do-Own integra:** educación + registro en tiempo real + evidencia de progreso + histórico inalterable.

---

## 🎯 MVP

| # | Funcionalidad | Descripción |
|---|---------------|-------------|
| 1 | **Onboarding** | Registro breve, sin datos financieros sensibles |
| 2 | **Registro financiero (IA)** | Foto de un gasto → la IA propone monto y categoría |
| 3 | **Registro emocional** | Emoji que describe cómo te sentiste |
| 4 | **Recompensa inmediata** | Tokens y racha al completar un registro |
| 5 | **Aprendizaje aplicado** | Micro-lección y cuestionario relacionados con tu registro |
| 6 | **Primera experiencia digital** | Ver y mover tokens en Stellar Testnet |
| 7 | **Verificación de integridad** | Hash del registro anclado en Stellar, sin exponer su contenido |
| 8 | **Reflexión semanal** | Resumen descriptivo de categorías, momentos y emociones |
| 9 | **Medición de recurrencia** | Activación, retorno a 7/14/28 días y aprendizajes completados |

Tablero con criterios por tarjeta: [Backlog Semana 2](https://github.com/devmondoss/AmorProof/projects/1)

---

## 📁 Estructura del repositorio

```
docs/
├── semana1/
│   └── ProblemBrief.md              ← Problem Brief (entregable grupal)
├── semana2/
│   ├── AdrianaLhada.md              ← Historias de usuario
│   ├── AnthonyLopez.md              ← Historias de usuario
│   ├── Rodrigo.md                   ← Historias de usuario
│   ├── NayeliChavez.md              ← Historias de usuario
│   ├── ProductBlueprint.md          ← Product Blueprint (entregable grupal)
│   └── LeanCanvass2.md              ← Lean Canvas v1.0 (+ imagen PNG)

CLAUDE.md                            ← Workflow del equipo
README.md                            ← Este archivo
```

---

## 👥 Equipo

| Persona | Rol | GitHub |
|---------|-----|--------|
| Adriana Lhada | Methodology & Product Lead | [@AdrianaLhada](https://github.com/AdrianaLhada) |
| Elba | Product & Business Lead | [@elba333](https://github.com/elba333) |
| Anthony López | Full Stack | [@devmondoss](https://github.com/devmondoss) |
| Nayeli | Backend | [@nayelicz](https://github.com/nayelicz) |
| Rodrigo | Backend | [@rodyxdev](https://github.com/rodyxdev) |

**Coordinación:** [Discord](https://discord.com/invite/ZYuhNhCp)

---

## 🚀 Cómo contribuir

Todo vive en GitHub. Ver [CLAUDE.md](./CLAUDE.md) para el flujo completo.

- **Historias de usuario:** `docs/semana2/TuNombre.md`, 5–7 historias con el formato "Como [rol], quiero [acción], para [beneficio]".
- **Tareas:** GitHub Issues, asignadas en el tablero del Project.
- **Criterios de historias (según Adriana):** se entiende sin explicación · un rol y un verbo por paso · sin palabras técnicas · solo el camino principal.

---

## 🔗 Enlaces

- **Issues:** [GitHub Issues](https://github.com/devmondoss/AmorProof/issues)
- **Tablero:** [Backlog Semana 2](https://github.com/devmondoss/AmorProof/projects/1)

---

**Última actualización:** 2026-10-04
**Mantenido por:** Anthony López ([@devmondoss](https://github.com/devmondoss))


---

## Frontend implementado — 15 de octubre de 2026

El frontend ejecutable está en `frontend/`. Incluye nueve vistas navegables y adaptadas a móvil y escritorio: bienvenida, inicio, registro financiero y emocional, microaprendizaje, recompensas, progreso, cuenta digital de demostración, reflexión semanal y comprobante de muestra. Backend, IA y Stellar conservan puntos de conexión documentados para su integración posterior.

## Requisitos

- Node.js 24 LTS y npm.
- Git para clonar el repositorio.

## Instalación

Desde la raíz del repositorio:

```sh
cd frontend
npm ci
```

No se necesitan variables de entorno para ejecutar el frontend de demostración.

## Cómo correrlo

Desde `frontend/`, iniciar el servidor de desarrollo:

```sh
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). La aplicación inicia en `/bienvenida`.

Para ejecutar una compilación de producción, desde `frontend/`:

```sh
npm run build
npm start
```

Demo: [do-own.vercel.app](https://do-own.vercel.app). Mapa del frontend: [FRONTEND.md](docs/tecnica/FRONTEND.md). Conexión con backend y Stellar: [INTEGRACION.md](docs/tecnica/INTEGRACION.md). Contexto del proyecto y equipo: [PROYECTO.md](docs/PROYECTO.md).

## Wallet y Stellar Testnet — Semana 4

La app incluye una wallet integrada y no custodial: la llave se genera en el dispositivo y la cuenta se crea con reservas patrocinadas, así que la persona no necesita XLM. Las recompensas se pagan en el activo de prueba **DOWN**, el sello semanal se ancla como memo hash con comisión pagada por Do-Own (fee bump) y existe una página pública de verificación en `/verificar`. La app se puede instalar en el teléfono como PWA. Configuración y endpoints: [INTEGRACION.md → Stellar Testnet](docs/tecnica/INTEGRACION.md#stellar-testnet-semana-4). Evidencia: [docs/semana4/MVPFunctional.md](docs/semana4/MVPFunctional.md).

## App para Android

Do-Own es una PWA: se puede instalar desde el navegador ("Agregar a pantalla de inicio") o como app de Android.

- **Descargar la app (.apk):** https://do-own-six.vercel.app/Do-Own.apk. También está el botón **Descargar app para Android** en la pantalla *Mi cuenta*. Para publicar una versión nueva, se reemplaza `frontend/public/Do-Own.apk`.
- **Generar el instalador (.apk):** abrir el [reporte de PWABuilder](https://pwabuilder.com/reportcard?site=https://do-own-six.vercel.app), presionar **Package for stores**, luego **Android** y luego **Generate**. Se descarga un .zip con el `.apk` (para instalar directo en el teléfono) y el `.aab` (para Google Play).
- **Instalar en el teléfono:** pasar el `.apk` al teléfono, abrirlo y permitir "instalar apps de origen desconocido" cuando Android lo pida.
- **Pantalla completa:** ya está configurado en `frontend/public/.well-known/assetlinks.json` (paquete `app.vercel.do_own_six.twa`). Si se genera un paquete nuevo con otra firma, hay que reemplazar ese archivo con el `assetlinks.json` del nuevo .zip.
- **iPhone:** en Safari, **Compartir** y luego **Agregar a pantalla de inicio**.

