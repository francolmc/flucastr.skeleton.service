# Variables de Entorno - Guía de Configuración

## 🎯 Resumen

Este documento describe las variables de entorno disponibles en el microservicio Flucastr Lleva y cómo configurarlas correctamente.

## 📋 Variables Requeridas

### Base de Datos
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

### Aplicación
```bash
NODE_ENV=development|production|test
PORT=3001
APP_NAME="Flucastr Lleva - Service"
APP_VERSION=1.0.0  # Formato: x.y.z o x.y
```

## 🔧 Errores Comunes y Soluciones

### Error: SWAGGER_VERSION pattern validation

**Error:**
```
"SWAGGER_VERSION" with value "1.0" fails to match the required pattern: /^\d+\.\d+\.\d+$/
```

**Solución:**
Usar formato semver completo o parcial:
```bash
# ✅ Correcto
SWAGGER_VERSION=1.0.0
SWAGGER_VERSION=1.0

# ❌ Incorrecto
SWAGGER_VERSION=v1.0
SWAGGER_VERSION=1.0.0-beta
```

### Error: DATABASE_URL validation

**Error:**
```
"DATABASE_URL" must be a valid uri with a scheme matching the postgresql|postgres pattern
```

**Solución:**
```bash
# ✅ Correcto
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_URL=postgres://user:pass@host:5432/db

# ❌ Incorrecto
DATABASE_URL=mysql://user:pass@host:3306/db
DATABASE_URL=user:pass@host:5432/db
```

### Error: PORT validation

**Error:**
```
"PORT" must be a valid port
```

**Solución:**
```bash
# ✅ Correcto
PORT=3001
PORT=8080

# ❌ Incorrecto
PORT=99999
PORT=abc
PORT=0
```

## 📊 Formatos de Variables

### Booleanos
```bash
# Valores aceptados: true, false
SWAGGER_ENABLED=true
CORS_ENABLED=false
```

### URLs
```bash
# Debe incluir protocolo
BASE_URL=http://localhost:3001
SWAGGER_CONTACT_URL=https://flucastr.com
```

### Listas separadas por comas
```bash
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
CORS_METHODS="GET,POST,PUT,DELETE"
```

### Números
```bash
PORT=3001
RATE_LIMIT_MAX=100
REQUEST_TIMEOUT=30000
```

### Patrones de versión
```bash
# Acepta: x.y.z o x.y
APP_VERSION=1.0.0
SWAGGER_VERSION=2.1
```

## 🚀 Configuración por Ambiente

### Development
```bash
NODE_ENV=development
SWAGGER_ENABLED=true
LOG_LEVEL=debug
CORS_ENABLED=true
RATE_LIMIT_ENABLED=false
```

### Production
```bash
NODE_ENV=production
SWAGGER_ENABLED=false
LOG_LEVEL=warn
CORS_ENABLED=true
RATE_LIMIT_ENABLED=true
HELMET_ENABLED=true
```

### Test
```bash
NODE_ENV=test
SWAGGER_ENABLED=false
LOG_LEVEL=error
CORS_ENABLED=false
RATE_LIMIT_ENABLED=false
```

## 🔍 Validación de Variables

El sistema valida automáticamente todas las variables al arranque de la aplicación. Si hay errores:

1. **Revisa el mensaje de error** - indica qué variable y qué patrón esperado
2. **Consulta el `.env.example`** - contiene valores de ejemplo válidos
3. **Verifica el formato** - especialmente para URLs, versiones y booleanos
4. **Reinicia la aplicación** - después de corregir las variables

## 📚 Referencias

- [Archivo .env.example](../.env.example) - Configuración completa de ejemplo
- [Schema de validación](../src/config/env.validation.ts) - Reglas de validación
- [Configuración de aplicación](../src/config/app.config.ts) - Uso de variables

## 🆘 Soporte

Si encuentras problemas con las variables de entorno:

1. Verifica que el archivo `.env` existe y tiene las variables requeridas
2. Compara con `.env.example` para ver el formato correcto
3. Revisa los logs de la aplicación para errores específicos
4. Consulta este documento para patrones y formatos válidos
