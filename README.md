<div align="center">
  <img src="src/images/logo.png" alt="AllForDev Wellness Logo" width="150" style="border-radius: 50%;" />
</div>

# 🌿 AllForDev Wellness

> Tu centro de control personal para el bienestar, la productividad y el crecimiento.

![Badge](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Badge](https://img.shields.io/badge/Vite-6.0-purple?style=for-the-badge&logo=vite)
![Badge](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Badge](https://img.shields.io/badge/TailwindCSS-Styling-38bdf8?style=for-the-badge&logo=tailwindcss)

AllForDev Wellness es una aplicación web integral diseñada para ayudarte a gestionar todos los aspectos de tu vida diaria. Desde la concentración profunda con técnicas Pomodoro hasta el seguimiento de tus rutinas de ejercicios, hábitos y base de conocimiento personal.

---

## ✨ Características Principales

### Focus (Productividad)
Optimiza tu flujo de trabajo con un temporizador **Pomodoro** integrado. Personaliza tus sesiones de enfoque y descansos para mantener tu mente fresca y productiva.

### Fitness (Salud Física)
Mantén tu cuerpo en movimiento.
- **Rutinas Personalizadas**: Crea y gestiona tus propios planes de entrenamiento por días de la semana.
- **Registro de Logs**: Lleva un historial detallado de tus sesiones y pesos levantados.

### Hábitos (Constancia)
Construye la mejor versión de ti mismo.
- Seguimiento diario de hábitos positivos.
- Visualización de progreso y rachas actuales (current streaks).

###  Base de Conocimiento/Registro de libros y notas (Segundo Cerebro)
Tu biblioteca personal de sabiduría.
- **Libros**: Registra tus lecturas actuales, autores y estado de lectura.
- **Notas**: Captura aprendizajes rápidos, fragmentos de código y resúmenes importantes.

###  Ideas (Creatividad)
Un espacio rápido y accesible para capturar esos momentos de inspiración antes de que se escapen.

### ⚙️ Configuración y Perfil
- Gestión completa de perfil de usuario (Nombre, Email).
- **Seguridad**: Cambio de contraseña y recuperación de cuenta.
- **Personalización**: Soporte nativo para Modo Oscuro y Claro.

---

## 🛠️ Stack Tecnológico

Este proyecto ha sido construido con las últimas tecnologías web para garantizar rendimiento, mantenibilidad y escalabilidad:

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend / BaaS**: [Supabase](https://supabase.com/) (Auth + Database)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Iconos**: Material Symbols

---

## Comenzando

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### Prerrequisitos
- Node.js (v18 o superior recomendado)
- Una cuenta en [Supabase](https://supabase.com/)

### Instalación

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/DiegoMartinez-Git/App-for-all.git
    cd allfordev-wellness
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Supabase (puedes encontrarlas en `Project Settings > API`):
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase_aqui
    VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase_aqui
    ```
    > **Nota**: Asegúrate de nunca subir este archivo al control de versiones (ya está en `.gitignore`).

4.  **Configurar Base de Datos**
    El proyecto incluye un archivo `supabase_setup.sql`. Copia su contenido y ejecútalo en el **SQL Editor** de tu dashboard de Supabase. Esto creará:
    - Tablas necesarias (`profiles`, `books`, `habits`, etc.)
    - Políticas de seguridad (Row Level Security).
    - Triggers para la creación automática de usuarios.

5.  **Ejecutar en Desarrollo**
    ```bash
    npm run dev
    ```

---

## 📂 Estructura del Proyecto

```
allfordev-wellness/
├── src/
│   ├── components/      # Componentes reutilizables (Sidebar, UI, cards, etc.)
│   ├── context/         # Context API (AuthContext para manejo de sesiones)
│   ├── screens/         # Pantallas principales (Focus, Fitness, Auth, etc.)
│   ├── lib/             # Configuraciones de clientes externos (Supabase)
│   └── App.tsx          # Configuración de rutas y layout principal
├── public/              # Assets estáticos (imágenes, favicons)
├── supabase_setup.sql   # Script de inicialización de esquema de base de datos
└── ...
```

---

## 🔒 Autenticación y Seguridad

El proyecto utiliza **Supabase Auth** para gestionar sesiones de forma segura y escalable.
- **Registro/Login**: Email y contraseña.
- **Protección**: Rutas protegidas que redirigen a `/auth` si no hay sesión activa.
- **RLS (Row Level Security)**: Cada fila en la base de datos está protegida para que los usuarios **solo puedan ver y editar su propia información**.

---

Hecho con ❤️ por Diego Martinez como primer proyecto en 2026