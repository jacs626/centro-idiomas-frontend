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

| Rol          | Acceso                                                                           |
| ------------ | -------------------------------------------------------------------------------- |
| **admin**    | Dashboard, Cursos, Grupos, Matrículas, Asistencia, Pagos, Certificados, Reportes |
| **profesor** | Dashboard, Cursos, Grupos, Asistencia, Certificados                              |
| **alumno**   | Dashboard, Mis Cursos, Asistencia, Pagos, Certificados, Perfil                   |

## 🔒 Permisos por Rol

- **Admin**: Acceso total a todos los módulos
- **Profesor**: Solo ve sus propios grupos/cursos/alumnos. Sin acceso a pagos ni reportes
- **Alumno**: Solo ve sus propios datos (cursos, pagos, certificados, asistencia)

## 📱 Páginas

### Auth

- `/login` - Iniciar sesión
- `/register` - Registro

### Públicas/Protegidas

- `/dashboard` - Dashboard
- `/courses` - Cursos (profesor solo ve los suyos)
- `/groups` - Grupos (profesor solo los suyos, admin crea con selección de profesor)
- `/enrollments` - Matrículas (filtros: curso → grupo, crear requiere curso → grupo)
- `/attendance` - Asistencia (filtros: curso → grupo)
- `/payments` - Pagos (admin: filtros curso → grupo → estado; alumno: solo propios)
- `/certificates` - Certificados (filtros: curso → grupo)
- `/reports` - Reportes (filtros: curso → grupo)
- `/profile` - Perfil
- `/notifications` - Notificaciones

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
