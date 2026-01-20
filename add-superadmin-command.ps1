# Script para crear estructura de carpetas para comando Django

# Función auxiliar (debe estar AL INICIO)
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) { return $true }
    } catch { return $false }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Creando estructura para comando" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la raíz del proyecto
if (-not (Test-Path "backend")) {
    Write-Host "✗ Error: No se encontró la carpeta 'backend'" -ForegroundColor Red
    Write-Host "Ejecuta este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit
}

# Verificar que existe la carpeta users
if (-not (Test-Path "backend\users")) {
    Write-Host "✗ Error: No se encontró la carpeta 'backend\users'" -ForegroundColor Red
    Write-Host "Primero debes crear la app 'users'" -ForegroundColor Yellow
    exit
}

# Crear estructura de carpetas
$managementPath = "backend\users\management"
$commandsPath = "$managementPath\commands"

Write-Host "Creando estructura de carpetas..." -ForegroundColor Yellow
Write-Host ""

# Crear carpeta management
if (-not (Test-Path $managementPath)) {
    New-Item -ItemType Directory -Path $managementPath -Force | Out-Null
    Write-Host "✓ Carpeta creada: backend\users\management\" -ForegroundColor Green
} else {
    Write-Host "⚠ Ya existe: backend\users\management\" -ForegroundColor Yellow
}

# Crear __init__.py en management
$initManagement = "$managementPath\__init__.py"
if (-not (Test-Path $initManagement)) {
    New-Item -ItemType File -Path $initManagement -Force | Out-Null
    Write-Host "✓ Archivo creado: backend\users\management\__init__.py" -ForegroundColor Green
} else {
    Write-Host "⚠ Ya existe: backend\users\management\__init__.py" -ForegroundColor Yellow
}

# Crear carpeta commands
if (-not (Test-Path $commandsPath)) {
    New-Item -ItemType Directory -Path $commandsPath -Force | Out-Null
    Write-Host "✓ Carpeta creada: backend\users\management\commands\" -ForegroundColor Green
} else {
    Write-Host "⚠ Ya existe: backend\users\management\commands\" -ForegroundColor Yellow
}

# Crear __init__.py en commands
$initCommands = "$commandsPath\__init__.py"
if (-not (Test-Path $initCommands)) {
    New-Item -ItemType File -Path $initCommands -Force | Out-Null
    Write-Host "✓ Archivo creado: backend\users\management\commands\__init__.py" -ForegroundColor Green
} else {
    Write-Host "⚠ Ya existe: backend\users\management\commands\__init__.py" -ForegroundColor Yellow
}

# Crear el archivo del comando VACÍO
$commandFile = "$commandsPath\create_superadmin.py"

if (-not (Test-Path $commandFile)) {
    New-Item -ItemType File -Path $commandFile -Force | Out-Null
    Write-Host "✓ Archivo creado: backend\users\management\commands\create_superadmin.py" -ForegroundColor Green
} else {
    Write-Host "⚠ Ya existe: backend\users\management\commands\create_superadmin.py" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Estructura creada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Estructura final:" -ForegroundColor Cyan
Write-Host "  backend\users\" -ForegroundColor White
Write-Host "    └── management\" -ForegroundColor White
Write-Host "        ├── __init__.py" -ForegroundColor Gray
Write-Host "        └── commands\" -ForegroundColor White
Write-Host "            ├── __init__.py" -ForegroundColor Gray
Write-Host "            └── create_superadmin.py  ← PEGA TU CÓDIGO AQUÍ" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ahora abre:" -ForegroundColor Cyan
Write-Host "  backend\users\management\commands\create_superadmin.py" -ForegroundColor White
Write-Host ""
Write-Host "Y pega el código del comando." -ForegroundColor Yellow
Write-Host ""

# Abrir el archivo en el editor por defecto
$open = Read-Host "¿Abrir archivo create_superadmin.py ahora? (s/n)"
if ($open -eq "s") {
    if (Test-Command code) {
        code $commandFile
        Write-Host "✓ Archivo abierto en VS Code" -ForegroundColor Green
    } elseif (Test-Command notepad) {
        notepad $commandFile
        Write-Host "✓ Archivo abierto en Notepad" -ForegroundColor Green
    } else {
        Invoke-Item $commandFile
        Write-Host "✓ Archivo abierto" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "¡Listo! 🚀" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")