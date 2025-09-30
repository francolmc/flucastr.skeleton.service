# Guía de Migración para Producción

## Problema
La columna `userId` se agregó como requerida a una tabla con datos existentes.

## Solución para Desarrollo
```bash
pnpm prisma db push --force-reset
```

## Solución para Producción (Dokploy)

### Paso 1: Migración Temporal
1. Modificar el schema para hacer `userId` opcional:
```prisma
model Tasks {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  description String?  @db.Text
  status      TaskStatus @default(PENDING)
  userId      String?  // Temporal: opcional
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  @@map("tasks")
}
```

2. Ejecutar migración:
```bash
pnpm prisma migrate dev --name make_userid_optional
```

### Paso 2: Asignar Usuarios a Tareas Existentes
```sql
-- Asignar un usuario por defecto a todas las tareas existentes
UPDATE tasks SET "userId" = 'default-user-id' WHERE "userId" IS NULL;
```

### Paso 3: Hacer Columna Requerida
1. Modificar schema para hacer `userId` requerida:
```prisma
model Tasks {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  description String?  @db.Text
  status      TaskStatus @default(PENDING)
  userId      String   // Ahora requerida
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  @@map("tasks")
}
```

2. Ejecutar migración final:
```bash
pnpm prisma migrate dev --name make_userid_required
```

## Variables de Entorno para Deployment

Asegúrate de tener en Dokploy:
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=schema_name"
AUTH_SERVICE_API_URL="https://your-auth-service.com/api"
JWT_ENABLED=true
PORT=3001
```