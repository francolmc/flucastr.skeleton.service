#!/bin/sh
echo "🔄 Iniciando migración de base de datos..."

# Intentar primero sin force-reset
echo "📋 Intentando push normal..."
pnpm prisma db push

# Si falla, usar force-reset
if [ $? -ne 0 ]; then
    echo "⚠️  Push normal falló, usando force-reset..."
    echo "🗑️  ADVERTENCIA: Se perderán todos los datos existentes"
    pnpm prisma db push --force-reset
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: No se pudo sincronizar la base de datos"
        exit 1
    fi
fi

echo "✅ Base de datos sincronizada correctamente"
echo "🚀 Iniciando aplicación..."

# Iniciar la aplicación
exec pnpm start:prod