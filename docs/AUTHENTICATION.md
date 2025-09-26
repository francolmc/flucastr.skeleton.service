# Sistema de Autenticación JWT + RBAC + ABAC

## 🎯 Resumen

Este microservicio implementa un sistema completo de autenticación y autorización que **NO genera tokens JWT**, sino que los **valida y consume** desde un servicio de autenticación centralizado. Incluye:

- **JWT Guard**: Validación de tokens JWT
- **RBAC**: Control de acceso basado en roles
- **ABAC**: Control de acceso basado en atributos
- **Endpoints de ejemplo**: Demostraciones prácticas de protección

## 🏗️ Arquitectura

### Flujo de Autenticación

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Auth Service  │───▶│  JWT Token       │───▶│ Flucastr Lleva  │
│  (Genera JWT)   │    │  (Bearer Token)  │    │ (Valida JWT)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Guards Chain   │
                                               │  JWT → RBAC →   │
                                               │  ABAC → Endpoint│
                                               └─────────────────┘
```

### Componentes Principales

1. **JwtGuard**: Valida tokens y extrae información del usuario
2. **RbacGuard**: Verifica roles del usuario
3. **AbacGuard**: Evalúa políticas basadas en atributos
4. **Decoradores**: Facilitan la configuración de protección

## 📋 Configuración

### Variables de Entorno

```bash
# JWT Configuration
JWT_ENABLED=true
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ISSUER=flucastr-auth-service
JWT_AUDIENCE=flucastr-services

# Token Extraction
JWT_EXTRACT_FROM_HEADER=true
JWT_EXTRACT_FROM_QUERY=false
JWT_EXTRACT_FROM_COOKIE=false

# Claims Configuration
JWT_ROLES_CLAIM_KEY=roles
JWT_PERMISSIONS_CLAIM_KEY=permissions
JWT_USER_ID_CLAIM_KEY=sub
JWT_TENANT_ID_CLAIM_KEY=tenant_id
```

### Payload JWT Esperado

```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "roles": ["user", "manager"],
  "permissions": ["read:posts", "write:posts"],
  "tenant_id": "tenant-456",
  "iss": "flucastr-auth-service",
  "aud": "flucastr-services",
  "exp": 1640995200,
  "iat": 1640908800
}
```

## 🔐 Uso de Guards

### 1. JWT Guard (Autenticación Básica)

```typescript
@Get('protected')
@UseGuards(JwtGuard)
async getProtectedData(@CurrentUser() user: AuthenticatedUser) {
  return { message: 'Datos protegidos', userId: user.id };
}
```

### 2. RBAC Guard (Control por Roles)

```typescript
// Un rol específico
@Get('admin-only')
@UseGuards(JwtGuard, RbacGuard)
@RequireAdmin()
async getAdminData() {
  return { message: 'Solo administradores' };
}

// Múltiples roles (OR)
@Get('manager-or-admin')
@UseGuards(JwtGuard, RbacGuard)
@Roles('admin', 'manager')
async getManagerData() {
  return { message: 'Admins o managers' };
}

// Todos los roles requeridos (AND)
@Post('create-admin-resource')
@UseGuards(JwtGuard, RbacGuard)
@RequireAllRoles('admin', 'super-admin')
async createAdminResource() {
  return { message: 'Requiere ambos roles' };
}
```

### 3. ABAC Guard (Control por Atributos)

```typescript
// Lectura básica
@Get('resources/:id')
@UseGuards(JwtGuard, AbacGuard)
@CanRead('resource')
async getResource(@Param('id') id: string) {
  return { message: 'Recurso leído' };
}

// Solo propietario del recurso
@Put('resources/:id')
@UseGuards(JwtGuard, AbacGuard)
@RequireResourceOwner()
async updateResource(@Param('id') id: string) {
  return { message: 'Solo el propietario puede actualizar' };
}

// Mismo tenant
@Get('tenant-resources')
@UseGuards(JwtGuard, AbacGuard)
@RequireSameTenant()
async getTenantResources() {
  return { message: 'Recursos del mismo tenant' };
}

// Horario laboral
@Post('business-operation')
@UseGuards(JwtGuard, AbacGuard)
@RequireBusinessHours()
async businessOperation() {
  return { message: 'Operación en horario laboral' };
}
```

### 4. Combinación de Guards

```typescript
@Post('admin-resources')
@UseGuards(JwtGuard, RbacGuard, AbacGuard)
@RequireAdmin()                    // RBAC: Rol admin
@RequireSameTenant()              // ABAC: Mismo tenant
@CanWrite('admin-resource')       // ABAC: Permiso de escritura
async createAdminResource() {
  return { message: 'Protección combinada RBAC + ABAC' };
}
```

## 🎭 Decoradores Disponibles

### Obtener Información del Usuario

```typescript
// Usuario completo
@Get('user-info')
@UseGuards(JwtGuard)
async getUserInfo(@CurrentUser() user: AuthenticatedUser) {
  return user;
}

// Solo roles
@Get('my-roles')
@UseGuards(JwtGuard)
async getMyRoles(@UserRoles() roles: string[]) {
  return { roles };
}

// Solo permisos
@Get('my-permissions')
@UseGuards(JwtGuard)
async getMyPermissions(@UserPermissions() permissions: string[]) {
  return { permissions };
}

// Payload completo
@Get('token-info')
@UseGuards(JwtGuard)
async getTokenInfo(@JwtPayloadDecorator() payload: JwtPayload) {
  return { payload };
}
```

### Decoradores RBAC

```typescript
@Roles('admin', 'manager')           // Cualquiera de los roles
@RequireAdmin()                      // Solo admin
@RequireSuperAdmin()                 // Solo super-admin
@RequireUser()                       // Solo user
@RequireManager()                    // Solo manager
@RequireAdminOrManager()             // Admin o manager
@RequireAllRoles('admin', 'manager') // Ambos roles requeridos
```

### Decoradores ABAC

```typescript
@CanRead('resource')                 // Permiso de lectura
@CanWrite('resource')                // Permiso de escritura
@CanUpdate('resource')               // Permiso de actualización
@CanDelete('resource')               // Permiso de eliminación
@RequireResourceOwner()              // Solo propietario
@RequireSameTenant()                 // Mismo tenant
@RequireBusinessHours()              // Horario laboral (9-18h)
```

## 🔧 Políticas ABAC Predefinidas

### 1. Política por Defecto
- **Nombre**: `default`
- **Efecto**: `allow`
- **Condición**: Usuario autenticado

### 2. Política de Propietario
- **Nombre**: `resource-owner`
- **Efecto**: `allow`
- **Condición**: `resource.userId === user.id`

### 3. Política de Tenant
- **Nombre**: `same-tenant`
- **Efecto**: `allow`
- **Condición**: `resource.tenantId === user.tenantId`

### 4. Política de Horario
- **Nombre**: `business-hours`
- **Efecto**: `allow`
- **Condición**: `9:00 <= hora_actual < 18:00`

### 5. Política de IP
- **Nombre**: `allowed-ip`
- **Efecto**: `deny`
- **Condición**: IP no está en lista permitida

## 📊 Endpoints de Ejemplo

El controlador `AuthExampleController` incluye ejemplos completos:

### Públicos
- `GET /auth-examples/public` - Sin protección

### JWT Básico
- `GET /auth-examples/protected` - Solo JWT
- `GET /auth-examples/user-info` - Información del usuario

### RBAC
- `GET /auth-examples/admin-only` - Solo administradores
- `GET /auth-examples/manager-or-admin` - Admins o managers
- `POST /auth-examples/create-with-roles` - Múltiples roles

### ABAC
- `GET /auth-examples/resources/:id` - Lectura básica
- `PUT /auth-examples/resources/:id` - Solo propietario
- `DELETE /auth-examples/resources/:id` - Solo propietario
- `GET /auth-examples/tenant-resources` - Mismo tenant
- `POST /auth-examples/business-hours-only` - Horario laboral

### Combinados
- `POST /auth-examples/admin-resources` - RBAC + ABAC

## 🧪 Testing

### Generar Token JWT de Prueba

```javascript
// Usando jsonwebtoken en Node.js
const jwt = require('jsonwebtoken');

const payload = {
  sub: 'user-123',
  email: 'test@example.com',
  roles: ['admin'],
  permissions: ['read:all', 'write:all'],
  tenant_id: 'tenant-456'
};

const token = jwt.sign(payload, 'your-super-secret-jwt-key-change-in-production', {
  issuer: 'flucastr-auth-service',
  audience: 'flucastr-services',
  expiresIn: '1h'
});

console.log('Bearer', token);
```

### Usar con curl

```bash
# Token JWT
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Endpoint protegido
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/auth-examples/protected

# Endpoint con roles
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/auth-examples/admin-only
```

## 🚨 Consideraciones de Seguridad

### Producción
1. **JWT_SECRET**: Usar clave segura de 256+ bits
2. **HTTPS**: Siempre usar HTTPS en producción
3. **Validación**: Verificar issuer y audience
4. **Expiración**: No ignorar expiración de tokens
5. **Logging**: Monitorear intentos fallidos

### Desarrollo
1. **Tokens de prueba**: Usar tokens con datos realistas
2. **Logs**: Habilitar logging detallado
3. **Validación**: Probar todos los casos de error

## 📚 Referencias

- [JWT.io](https://jwt.io/) - Debugger de tokens JWT
- [NestJS Guards](https://docs.nestjs.com/guards) - Documentación oficial
- [RBAC vs ABAC](https://auth0.com/blog/role-based-access-control-rbac-and-attribute-based-access-control-abac/) - Comparación de modelos

## 🆘 Troubleshooting

### Error: "Invalid access token"
- Verificar que el token no esté expirado
- Comprobar que el secret coincida
- Validar formato del token (Bearer + espacio)

### Error: "Insufficient permissions"
- Verificar roles en el payload del token
- Comprobar configuración de claims keys
- Revisar jerarquía de roles

### Error: "Access denied for action"
- Verificar políticas ABAC aplicables
- Comprobar contexto del recurso
- Revisar logs de evaluación de políticas
