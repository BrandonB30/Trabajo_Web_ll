# 📝 To-Do App con Autenticación

Una aplicación de lista de tareas (To-Do) desarrollada en TypeScript con sistema de autenticación integrado.

## 🚀 Características

- **Sistema de Login**: Autenticación requerida para acceder a la aplicación
- **Gestión de Tareas**: Crear, editar, eliminar y marcar tareas como completadas
- **Filtros**: Ver todas las tareas, solo activas o solo completadas
- **Persistencia**: Las tareas se guardan en localStorage
- **Sesiones**: Sistema de sesiones con expiración automática (24 horas)
- **Interfaz Moderna**: Diseño responsive con Bootstrap 5

## 📁 Estructura del Proyecto

```
web_ll/
├── app.html          # Punto de entrada principal (redirige automáticamente)
├── Login.html        # Página de login
├── index.html        # Aplicación principal de tareas
├── main.ts           # Lógica principal de la aplicación
├── stylelogin.css    # Estilos del login
├── stylesheet.css    # Estilos adicionales
└── imagen2.png       # Imagen del logo
```

## 🔐 Credenciales de Acceso

Para acceder a la aplicación, utiliza las siguientes credenciales:

- **Usuario**: `admin`
- **Correo**: `admin@example.com`
- **Contraseña**: `1234`

## 🎯 Cómo Usar

1. **Abrir la aplicación**: Navega a `app.html` en tu navegador
2. **Login automático**: La aplicación verificará si ya tienes una sesión activa
3. **Iniciar sesión**: Si no estás autenticado, serás redirigido al login
4. **Acceder**: Una vez autenticado, podrás usar la aplicación de tareas
5. **Cerrar sesión**: Usa el botón "Cerrar sesión" en la esquina superior derecha

## ⚙️ Funcionalidades

### Gestión de Tareas
- ➕ **Agregar**: Escribe una tarea y presiona "Agregar"
- ✅ **Completar**: Marca el checkbox para marcar como completada
- 👁️ **Ver**: Haz clic en "Ver" para ver detalles de la tarea
- ✏️ **Editar**: Haz clic en "Editar" para modificar el título
- 🗑️ **Eliminar**: Haz clic en "Eliminar" para borrar la tarea

### Filtros
- **Todas**: Muestra todas las tareas
- **Activas**: Solo tareas pendientes
- **Completadas**: Solo tareas terminadas

### Acciones Adicionales
- 🧹 **Eliminar completadas**: Borra todas las tareas completadas
- 🔄 **Resetear lista**: Borra todas las tareas (con confirmación)
- 🚪 **Cerrar sesión**: Termina la sesión actual

## 🔒 Seguridad

- Las sesiones expiran automáticamente después de 24 horas
- Los datos se almacenan localmente en el navegador
- Validación de contraseña con indicador de fortaleza
- Confirmación antes de acciones destructivas

## 🛠️ Tecnologías Utilizadas

- **TypeScript**: Lenguaje principal
- **Bootstrap 5**: Framework CSS
- **Bootstrap Icons**: Iconografía
- **localStorage**: Persistencia de datos
- **Babel Standalone**: Transpilación en el navegador

## 📱 Responsive Design

La aplicación está optimizada para funcionar en:
- 💻 Escritorio
- 📱 Tablets
- 📱 Móviles

## 🎨 Personalización

Puedes personalizar la aplicación modificando:
- `stylesheet.css`: Estilos adicionales
- `stylelogin.css`: Estilos del login
- Credenciales en `Login.html`
- Configuración de sesión en `main.ts`

## 🚀 Instalación y Uso

1. Clona o descarga el proyecto
2. Abre `app.html` en tu navegador
3. ¡Listo! La aplicación se ejecutará automáticamente

No se requiere instalación de dependencias adicionales, ya que utiliza CDNs para Bootstrap y Babel.
