# Centro de Idiomas Global - Frontend

Aplicación web React para la gestión académica de un centro de idiomas.

## 🛠️ Tecnologías

- **React 18** - UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Enrutamiento
- **Context API** - Estado global

## 📁 Estructura

```
src/
├── api/            # APIs del backend
├── components/     # Componentes reutilizables
├── context/        # Contextos (Auth)
├── pages/          # Páginas del sistema
└── routes/         # Rutas
```

## 🔐 Autenticación

- JWT guardado en localStorage
- AuthContext gestionar sesión
- Rutas protegidas por rol

## 👥 Roles

| Rol | Acceso |
|-----|-------|
| **admin** | Dashboard, Cursos, Grupos, Matrículas, Asistencia, Pagos, Certificados, Reportes |
| **profesor** | Grupos, Alumnos, Asistencia, Certificados, Reportes |
| **alumno** | Dashboard, Mis Cursos, Asistencia, Pagos, Certificados, Perfil |

## 📱 Páginas

### Auth
- `/login` - Iniciar sesión
- `/register` - Registro

### Públicas/Protegidas
- `/dashboard` - Dashboard
- `/courses` - Cursos
- `/groups` - Grupos
- `/enrollments` - Matrículas
- `/attendance` - Asistencia
- `/payments` - Pagos
- `/certificates` - Certificados
- `/reports` - Reportes
- `/profile` - Perfil

## ⚙️ Instalación

```bash
npm install
```

## ▶️ Desarrollo

```bash
npm run dev
```

## 📦 Build

```bash
npm run build
```

## 🌐 Variables

```env
VITE_API_URL=http://localhost:3000
```

## 📱 Responsive

- Mobile-first con Tailwind CSS
- Breakpoints: sm, md, lg, xl
- Compatible con PWA