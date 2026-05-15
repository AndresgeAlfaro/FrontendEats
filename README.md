# CletaEats Frontend

Interfaz web en **React** + **Vite** + **Bootstrap 5**. Hay **dos modos** alineados con el monorepo:

| Modo | URL | Backend |
|------|-----|---------|
| **Principal** | `http://localhost:5173/` o `http://localhost:5173/#/` | **Supabase** (PostgreSQL + Auth). UI en `src/cleta/` (`CletaApp`, `CletaContext`, `supabaseRepository.js`). |
| **Consola API local** | `http://localhost:5173/#dotnet` | **ASP.NET Core + SQLite** (`../Backend/...`). Pantallas en `src/pages/` que llaman a `src/api.js` vía proxy `/api` → `http://localhost:5000`. |

El punto de entrada es `src/App.jsx`: elige el modo según el hash (`#dotnet` / `#api-local` / `#sqlite` equivalen a la consola .NET).

---

## Requisitos

- **Node.js** 18+ y **npm**.
- Para **Supabase**: proyecto en la nube y variables en `src/cleta/supabaseConfig.js` (o el archivo que use el cliente).
- Para **API .NET**: **.NET 8** y el backend en ejecución (véase `../Backend/CletaEatsBackend/README.md`).

---

## Estructura principal

| Ruta | Descripción |
|------|-------------|
| `vite.config.js` | Proxy `/api` → `http://localhost:5000` (solo la consola `#dotnet`). |
| `src/main.jsx` | React + `CletaProvider` + `App`. |
| `src/App.jsx` | Enrutado por hash: `CletaApp` vs `LegacyDotnetApp`. |
| `src/LegacyDotnetApp.jsx` | Navbar Bootstrap + páginas contra `api.js`. |
| `src/cleta/` | App principal Supabase (login, roles, CRUD remoto). |
| `src/pages/` | Formularios de prueba contra la API SQLite (modo `#dotnet`). |
| `src/api.js` | Fetch a `/api/...` (controladores `*ApiController`). |
| `src/cleta/backendDotnet.js` | Mapeo DTO .NET ↔ modelo UI (uso opcional; la consola usa `api.js` directo). |

---

## Instalación y ejecución

```bash
cd Frontend
npm install
npm run dev
```

1. **Solo Supabase**: abre `http://localhost:5173/`. El enlace inferior *Consola API .NET* lleva a `#dotnet`.
2. **Probar SQLite**: en otra terminal:

   ```bash
   cd Backend/CletaEatsBackend/CletaEatsBackend
   dotnet run
   ```

   Luego `http://localhost:5173/#dotnet`.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor Vite (5173). |
| `npm run build` | Salida en `dist/`. |
| `npm run preview` | Sirve `dist/` localmente. |

---

## Producción

Configura la URL base de la API si no usas el proxy de Vite (variable de entorno o constante en `src/api.js`). Para Supabase, usa las claves y URL del proyecto desplegado.

---

## Relación con otros módulos

- La **app Android** (`../AplicacionMovil`) usa **Supabase**, no esta API .NET.
- La **API .NET** sirve para la consola web `#dotnet`, Swagger en `http://localhost:5000/swagger` y desarrollo local SQLite.
