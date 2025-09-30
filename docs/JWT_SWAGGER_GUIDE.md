# 🔐 Guía de Autenticación JWT - Swagger

## 📋 Resumen

Este microservicio utiliza **JWT (JSON Web Tokens)** para autenticación, validando tokens contra un servicio de autenticación externo mediante **introspección de tokens**.

## 🚀 Cómo usar Swagger con JWT

### 1. **Obtener un Token JWT**
- El sistema **NO genera tokens localmente**
- Debes obtener un token válido del servicio de autenticación externo:
  - 🌐 **Servicio:** `https://skeleton-auth-service.nsideas.cl`
  - 📋 **Endpoint:** `/api/v1/auth/login` (u otro endpoint de login)

### 2. **Configurar el Token en Swagger**

1. **Abre Swagger UI** en tu navegador: `http://localhost:3001/api`

2. **Busca el botón "Authorize"** 🔓 en la parte superior derecha

3. **Haz clic en "Authorize"** - verás un modal con:
   - Campo para **Bearer Token (jwt)**
   - Campo de texto donde ingresar tu token

4. **Ingresa tu token JWT**:
   - ✅ **Correcto:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - ❌ **Incorrecto:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - 📝 **Nota:** NO incluyas la palabra "Bearer", solo el token

5. **Haz clic en "Authorize"** - debería mostrar un ✅ checkmark verde

6. **Cierra el modal** - ahora todos los endpoints protegidos tendrán un 🔒 candado cerrado

### 3. **Probar Endpoints Protegidos**

Una vez autorizado, puedes usar cualquier endpoint de `/tasks`:
- `GET /tasks` - Listar todas las tareas
- `POST /tasks` - Crear nueva tarea  
- `GET /tasks/{id}` - Obtener tarea por ID
- etc.

## 🔍 Endpoints de Prueba

### `/auth/info` 
- **Sin autenticación requerida**
- Información sobre el sistema de auth
- Instrucciones de uso

### `/auth/test`
- **Sin autenticación requerida** (temporal)
- Para probar que el sistema funciona

### `/tasks/*` 
- **Requiere autenticación JWT**
- Todos los endpoints de tareas están protegidos

## ⚠️ Solución de Problemas

### "No se muestra campo para ingresar token"
- ✅ Verifica que `JWT_ENABLED=true` en `.env`
- ✅ Reinicia el servidor después de cambios en `.env`
- ✅ El esquema debe ser `jwt` (minúsculas) en `@ApiBearerAuth('jwt')`

### "Token inválido"
- ✅ Verifica que el token no haya expirado
- ✅ Asegúrate de no incluir "Bearer " en el token
- ✅ El servicio de auth externo debe estar disponible

### "Error 401 Unauthorized"
- ✅ Verifica que hayas hecho clic en "Authorize" en Swagger
- ✅ El token debe ser válido y activo
- ✅ Verifica la conectividad con el servicio de auth externo

## 🏗️ Arquitectura

```
Frontend/Swagger → JWT Token → NestJS Microservice → Auth Service
                                      ↓
                              Token Introspection
                                      ↓
                                 User Context
                                      ↓
                            Protected Endpoints
```

## 📝 Variables de Entorno

```bash
# JWT habilitado para Swagger
JWT_ENABLED=true

# Swagger habilitado
SWAGGER_ENABLED=true

# Servicio de autenticación externo
AUTH_SERVICE_API_URL="https://skeleton-auth-service.nsideas.cl/api"
```

## 🎯 Características

- ✅ **Autenticación JWT externa**
- ✅ **Introspección de tokens**
- ✅ **Filtrado por usuario automático**
- ✅ **Guards JWT/RBAC/ABAC disponibles**
- ✅ **Integración completa con Swagger**
- ✅ **Endpoints protegidos y públicos**