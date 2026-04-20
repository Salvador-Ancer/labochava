# Release Board V1

Aplicación mínima para practicar pipeline, despliegue y promoción entre entornos usando GitHub Actions y GitHub Pages.

---

## Variables de entorno

### Configuración general (no sensible)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_PUBLIC_ENVIRONMENT` | Entorno actual | `local`, `dev`, `staging` |
| `VITE_PUBLIC_VERSION` | Versión del build | `dev-local` |
| `VITE_APP_NAME` | Nombre de la app | `release-board` |
| `VITE_FEATURE_X_ENABLED` | Feature flag | `true` / `false` |

### Secretos (nunca subir al repositorio)

| Variable | Descripción |
|---|---|
| `DB_PASSWORD` | Contraseña de base de datos |
| `API_KEY` | Llave de API externa |
| `JWT_SECRET` | Secreto para tokens JWT |

---

## Diferencia entre configuración y secretos

- **Configuración**: parámetros que cambian entre entornos pero no son sensibles. Se pueden versionar en `.env.example`.
- **Secretos**: datos sensibles como contraseñas y tokens. Nunca deben subirse al repositorio.

---

## Cómo configurar el proyecto localmente

1. Clona el repositorio
2. Copia el archivo de ejemplo:
```bash