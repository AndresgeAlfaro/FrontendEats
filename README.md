# CletaEats Frontend

Interfaz web en **React** con **Bootstrap 5** para probar el backend de CletaEats. Permite registrar clientes, restaurantes y repartidores, realizar pedidos y consultar reportes.

---

## Requisitos

- **Node.js** 18+ (recomendado LTS) y **npm**.

Comprobar:

```bash
node --version
npm --version
```

---

## Estructura principal

| Carpeta / archivo | Descripción |
|-------------------|-------------|
| `package.json` | Dependencias (react, react-dom, bootstrap) y scripts (dev, build, preview). |
| `vite.config.js` | Configuración de Vite; proxy de `/api` al backend en `http://localhost:5000`. |
| `index.html` | Punto de entrada HTML. |
| `src/main.jsx` | Entrada de React; importa Bootstrap CSS/JS y `App`. |
| `src/App.jsx` | Navegación y rutas internas (páginas). |
| `src/api.js` | Funciones para llamar a la API del backend (clientes, restaurantes, repartidores, pedidos, reportes). |
| `src/index.css` | Estilos globales y tema (colores CletaEats). |
| `src/pages/` | Páginas: Inicio, Clientes, Restaurantes, Repartidores, Pedidos, Reportes. |

---

## Instalación y ejecución

1. Instalar dependencias:

   ```bash
   cd Frontend
   npm install
   ```

2. Arrancar el backend (en otra terminal):

   ```bash
   cd Backend/CletaEatsBackend/CletaEatsBackend
   dotnet run
   ```

   La API debe estar en **http://localhost:5000**.

3. Arrancar el frontend:

   ```bash
   npm run dev
   ```

   Se abre en **http://localhost:5173**. Las peticiones a `/api/*` se redirigen al backend gracias al proxy de Vite.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) con recarga en caliente. |
| `npm run build` | Build de producción en la carpeta `dist/`. |
| `npm run preview` | Sirve la carpeta `dist/` localmente para probar el build. |

---

## Páginas y uso

- **Inicio**: Descripción y requisito de tener el backend en ejecución.
- **Clientes**: Registrar cliente (cédula, nombre, dirección, tarjeta, celular, correo) y listar activos o suspendidos.
- **Restaurantes**: Registrar restaurante (nombre, cédula jurídica, dirección, tipo de comida) y ver listado; botón "Combos" para ver combos por restaurante.
- **Repartidores**: Registrar repartidor y listar todos o solo los de 0 amonestaciones.
- **Pedidos**: Formulario para realizar pedido (restaurante, cédula cliente, distancia, feriado, items con combo/cantidad/precio) y otro para marcar pedido como entregado (id pedido, id repartidor).
- **Reportes**: Lista de reportes; al elegir uno se muestra el resultado (montos, hora pico, quejas, etc.).

---

## Configuración del backend

Por defecto el frontend espera la API en **http://localhost:5000** a través del proxy de Vite (rutas relativas `/api/...`). Si cambias el puerto o el host del backend, ajusta el proxy en `vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:PUERTO',
      changeOrigin: true
    }
  }
}
```

Para producción, tendrías que configurar la URL base de la API (variable de entorno o constante en `src/api.js`).
