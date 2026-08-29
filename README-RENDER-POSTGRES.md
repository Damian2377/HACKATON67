# Persistencia de reportes con Render PostgreSQL

Esta versión conserva la aplicación y sus apartados existentes. El único cambio funcional es que
`server/index.js` ahora usa PostgreSQL cuando existe `DATABASE_URL`, en lugar de depender del
sistema de archivos de Render para guardar los datos.

## Render

1. Crea un PostgreSQL en Render.
2. En el Web Service de este proyecto, agrega la variable de entorno:
   - `DATABASE_URL` = **Internal Database URL** de tu PostgreSQL de Render.
3. Build Command:
   `npm install && npm run build`
4. Start Command:
   `npm start`

La primera vez que el servidor se conecta a PostgreSQL, crea la tabla `aforopucp_state` y copia
los datos iniciales de `server/db.json`. A partir de ahí, los cambios de reportes, historial,
aforo, votos y gamificación se guardan en PostgreSQL.

## Importante

No subas `DATABASE_URL` a GitHub.

En desarrollo local, si no existe `DATABASE_URL`, el servidor sigue usando `server/db.json`,
por lo que no hace falta configurar PostgreSQL para trabajar localmente.

## Qué no se modificó

No se cambiaron las pantallas, estilos, componentes ni formularios. `src/api.ts` y el frontend
mantienen sus mismas rutas `/api/...`; el cambio de persistencia está concentrado en el backend.
