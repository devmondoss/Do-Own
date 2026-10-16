# Do-Own

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
