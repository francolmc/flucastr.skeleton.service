# Flucastr Lleva - Service Skeleton

Este es un template/skeleton para crear nuevos microservicios en la plataforma Flucastr Lleva.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env` y configura tus variables:
```bash
cp .env .env.local
```

Edita `.env.local` con tus configuraciones específicas.

### 3. Configurar base de datos
Actualiza el `DATABASE_URL` en tu archivo `.env` y ejecuta:
```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
```

### 4. Ejecutar en desarrollo
```bash
pnpm start:dev
```

### 5. Acceder a la documentación
- API: http://localhost:3001
- Swagger: http://localhost:3001/api
- Health Check: http://localhost:3001/health

## 📁 Estructura del Proyecto

```
src/
├── app.module.ts          # Módulo principal de la aplicación
├── main.ts                # Punto de entrada de la aplicación
├── config/                # Configuraciones específicas
├── modules/               # Módulos de negocio
│   ├── database/          # Configuración de base de datos
│   └── health/            # Endpoint de health check
└── shared/                # Código compartido
    └── interceptors/      # Interceptores globales
```

## 🛠️ Scripts Disponibles

- `pnpm start` - Inicia la aplicación en modo producción
- `pnpm start:dev` - Inicia la aplicación en modo desarrollo con hot reload
- `pnpm start:debug` - Inicia la aplicación en modo debug
- `pnpm build` - Compila la aplicación
- `pnpm lint` - Ejecuta el linter y corrige errores automáticamente
- `pnpm test` - Ejecuta los tests
- `pnpm prisma:generate` - Genera el cliente de Prisma
- `pnpm prisma:studio` - Abre Prisma Studio
- `pnpm prisma:migrate:dev` - Ejecuta migraciones en desarrollo

## 🔧 Configuración

### Variables de Entorno
- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
- `PORT`: Puerto en el que corre la aplicación (por defecto: 3001)

### Base de Datos
Este skeleton está configurado para usar PostgreSQL con Prisma ORM. Para usar una base de datos diferente:

1. Actualiza el `DATABASE_URL` en `.env`
2. Modifica el schema de Prisma en `prisma/schema.prisma`
3. Ejecuta `pnpm prisma:generate` para regenerar el cliente

## 📝 Próximos Pasos

1. **Crear tu primer módulo**: Crea un nuevo directorio en `src/modules/` para tu funcionalidad
2. **Definir entidades**: Crea tus modelos de datos en `prisma/schema.prisma`
3. **Implementar controladores**: Crea controladores REST para tus endpoints
4. **Agregar validación**: Usa class-validator para validar DTOs
5. **Documentar APIs**: Usa Swagger decorators para documentar tus endpoints

## 🐳 Docker

Para ejecutar con Docker:

```bash
# Construir imagen
docker build -t flucastr-lleva-service .

# Ejecutar contenedor
docker run -p 3001:3001 --env-file .env flucastr-lleva-service
```

## 📚 Documentación Adicional

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Swagger/OpenAPI](https://swagger.io/)

## 🤝 Contribución

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios y ejecuta los tests: `pnpm test`
3. Ejecuta el linter: `pnpm lint`
4. Crea un commit descriptivo
5. Push y crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia UNLICENSED.