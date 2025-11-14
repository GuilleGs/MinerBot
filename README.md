# MinerBot Global Asistente

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-UNLICENSED-red.svg)](./package.json)
[![Version](https://img.shields.io/badge/Version-2.1.0-blue.svg)](./package.json)

**Asistente virtual inteligente para gestión de Recursos Humanos en operaciones mineras**, desarrollado con **Microsoft Bot Framework** y **Azure Language Services** para proporcionar información sobre beneficios, procedimientos legales, planes de carrera y más.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Desarrollo](#desarrollo)
- [Troubleshooting](#troubleshooting)

## 📊 Descripción General

MinerBot Global Asistente es una solución conversacional de IA diseñada específicamente para operaciones mineras multinacionales. El bot proporciona soporte 24/7 a empleados sobre temas de Recursos Humanos, facilitando el acceso a información sobre:

- **Vacaciones, Licencias y Permisos**: Procedimientos de solicitud y normativas legales
- **Beneficios Económicos**: Aguinaldos, gratificaciones, viáticos y descuentos corporativos
- **Salud y Seguros**: Cobertura médica, dental y seguros complementarios
- **Bienestar y Conciliación**: Programas de bienestar, iniciativas de balance vida-trabajo
- **Crecimiento Profesional**: Planes de carrera, capacitación y oportunidades de desarrollo
- **Cultura y Valores**: Código de ética, canales de denuncia y compromisos de diversidad

## ✨ Características Principales

### 🔐 Autenticación Segura
- Login de dos pasos (Email/RUT + Contraseña)
- Hash de contraseñas con **bcrypt**
- Mecanismo de bloqueo anti-fuerza bruta
- Integración con base de datos corporativa

### 🌍 Personalización por Sede
- Contenido específico para diferentes ubicaciones (Iquique, Santiago, Canadá)
- Respuestas adaptadas según la localización del empleado
- Soporte multilingüe (Español, Inglés)

### 🤖 Inteligencia Basada en IA
- **QnA Maker de Azure**: Procesamiento de lenguaje natural
- Base de conocimientos personalizable
- Escalamiento automático de consultas no resueltas

### 📱 Interfaz Conversacional Intuitiva
- Navegación jerárquica por menús
- Soporte para entrada numérica y textual
- Opción de volver en cualquier momento
- Flujos interactivos (solicitudes de cursos, denuncias anónimas, etc.)

### 🔗 Integración con Power Automate
- Registro automático de consultas QnA
- Solicitudes de cursos y capacitación
- Canal de denuncias anónimas
- Escalamiento de consultas no resueltas a RRHH

### 📊 Análisis y Auditoría
- Logging centralizado de interacciones
- Trazabilidad de consultas y respuestas
- Integración con Azure Monitor (opcional)

## 🔧 Requisitos Previos

### Software Requerido
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** (para control de versión)

### Servicios de Azure Requeridos
- **Azure Bot Service**: Hosting del bot
- **Azure Language Service**: QnA Maker para base de conocimientos
- **Azure MySQL Flexible Server** o similar: Base de datos corporativa
- **Power Automate**: Integración de flujos (opcional pero recomendado)

### Cuentas y Accesos
- Cuenta de Microsoft Azure
- Base de datos MySQL con esquema de Empleados, Sedes, Áreas y Cargos
- Flujos de Power Automate configurados (URLs de endpoints)

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/GuilleGs/MinerBot.git
cd MinerBot
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Verificar Instalación

```bash
npm list
```

**Dependencias principales instaladas:**
- `botbuilder` (~4.22.1): Microsoft Bot Framework
- `restify` (^11.1.0): Servidor HTTP
- `axios` (^1.7.2): Cliente HTTP para APIs
- `mysql2` (^3.10.1): Driver MySQL
- `bcrypt` (^5.1.1): Hash de contraseñas
- `dotenv` (^16.4.5): Gestión de variables de entorno

## ⚙️ Configuración

### 1. Crear Archivo `.env`

En la raíz del proyecto, crear un archivo `.env` con las siguientes variables:

```env
# Azure Bot Service
MicrosoftAppId=<your-app-id>
MicrosoftAppPassword=<your-app-password>

# Azure Language Service (QnA Maker)
LanguageEndpointHostName=https://<your-region>.api.cognitive.microsoft.com/
LanguageEndpointKey=<your-language-service-key>
ProjectName=<your-project-name>
DeploymentName=<your-deployment-name>

# Base de Datos MySQL
DB_HOST=<your-db-host>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_DATABASE=minerbothr_local_db
DB_PORT=3306
# O usar connection string:
# DB_CONNECTION_STRING_MYSQL=Server=<host>;Database=<db>;Uid=<user>;Pwd=<password>;

# Power Automate Flow URLs
POWER_AUTOMATE_QUERY_FLOW_URL=https://prod-<region>.logic.azure.com:443/workflows/<workflow-id>/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=<signature>
POWER_AUTOMATE_COURSE_FLOW_URL=<similar-format>
POWER_AUTOMATE_COMPLAINT_FLOW_URL=<similar-format>
POWER_AUTOMATE_QNA_LOG_FLOW_URL=<similar-format>

# Puerto de Escucha (opcional)
port=3978
```

### 2. Configurar Base de Datos

**Esquema requerido:**

```sql
-- Tabla de Sedes
CREATE TABLE Sedes (
    ID_Sede INT PRIMARY KEY,
    NombreSede VARCHAR(255)
);

-- Tabla de Áreas
CREATE TABLE Areas (
    ID_Area INT PRIMARY KEY,
    NombreArea VARCHAR(255)
);

-- Tabla de Cargos
CREATE TABLE Cargos (
    ID_Cargo INT PRIMARY KEY,
    NombreCargo VARCHAR(255)
);

-- Tabla de Empleados
CREATE TABLE Empleados (
    ID_Empleado INT PRIMARY KEY,
    Nombre VARCHAR(255),
    ApellidoPaterno VARCHAR(255),
    EmailCorporativo VARCHAR(255) UNIQUE,
    PasswordHash VARCHAR(255),
    Rut VARCHAR(12) UNIQUE,
    Sede VARCHAR(255),
    ID_Sede INT,
    ID_Area INT,
    ID_Cargo INT,
    ID_JefaturaDirecta INT,
    Estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    FOREIGN KEY (ID_Sede) REFERENCES Sedes(ID_Sede),
    FOREIGN KEY (ID_Area) REFERENCES Areas(ID_Area),
    FOREIGN KEY (ID_Cargo) REFERENCES Cargos(ID_Cargo),
    FOREIGN KEY (ID_JefaturaDirecta) REFERENCES Empleados(ID_Empleado)
);
```

### 3. Configurar Azure Language Service (QnA)

1. Ir a [Azure Portal](https://portal.azure.com)
2. Crear o seleccionar un **Language Service**
3. Crear un proyecto con el nombre especificado en `.env` (`ProjectName`)
4. Cargar Q&A pairs sobre temas de RRHH minero
5. Crear un **Deployment** (por defecto: "production")
6. Obtener **Endpoint Key** y actualizar `.env`

### 4. Configurar Power Automate Flows

Crear 4 flujos en Power Automate:

1. **Query Flow**: Para registrar consultas no resueltas
2. **Course Flow**: Para solicitudes de capacitación
3. **Complaint Flow**: Para denuncias anónimas
4. **QnA Log Flow**: Para registrar interacciones QnA

Cada flujo debe tener un trigger HTTP POST y guardar su URL en `.env`.

## 🚀 Uso

### Desarrollo Local

#### 1. Iniciar el Bot

```bash
npm run dev
```

El bot iniciará en `http://localhost:3978` (o el puerto especificado en `.env`)

**Salida esperada:**
```
restify escuchando en http://[::]:3978
Bot listo para recibir mensajes. Conéctate con el Bot Framework Emulator.
```

#### 2. Conectar con Bot Framework Emulator

1. Descargar [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases)
2. Abrir el emulator
3. Crear nueva conexión:
   - **Endpoint URL**: `http://localhost:3978/api/messages`
   - **App ID**: (dejar vacío para local, o usar el de `.env`)
   - **App Password**: (dejar vacío para local, o usar el de `.env`)
4. Conectar y comenzar a chatear

#### 3. Flujo de Interacción Típico

```
Usuario: [Se conecta]
Bot: "Bienvenido a MinerBot Global Asistente."

Usuario: 18.123.456-K (RUT)
Bot: "Usuario encontrado. Por favor, ingresa tu contraseña."

Usuario: MiContraseña123
Bot: "¡Bienvenido, Juan García! Has iniciado sesión correctamente."

Usuario: 1 (Selecciona "Vacaciones, Licencias y Permisos")
Bot: [Muestra opciones del menú]

Usuario: 3 (Selecciona "Procedimiento de licencia médica")
Bot: [Muestra respuesta específica para su sede]

Usuario: volver
Bot: [Vuelve al menú anterior]

Usuario: menu
Bot: [Vuelve al menú principal]
```

### Producción

#### 1. Compilar para Producción

```bash
npm start
```

#### 2. Desplegar a Azure

```bash
# Usando Azure Developer CLI
azd up

# O manualmente
az webapp deployment source config-zip \
  --resource-group <resource-group> \
  --name <app-service-name> \
  --src MinerBot.zip
```

#### 3. Monitoreo

- Verificar logs en **Application Insights**
- Monitorear consumo de RU en base de datos
- Revisar fallos de autenticación en Azure Monitor

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                  Bot Framework Adapter                   │
│           (Gestiona comunicación con canales)            │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────────┐        ┌────▼────────┐
    │  MinerBot   │        │ Conversation│
    │   (Handler) │        │    State    │
    └────┬────────┘        └────────────┘
         │
    ┌────┴──────────────────────────────┐
    │                                   │
 ┌──▼──────┐  ┌──────────┐  ┌─────────▼─┐
 │ Services │  │ Dialogs  │  │    Data   │
 └─────────┘  └──────────┘  └───────────┘
    │              │              │
    ├─────────┬────┼────┬────────┤
    │         │    │    │        │
 ┌──▼──┐  ┌──▼────▼┐ ┌─▼──┐  ┌─▼──┐
 │ KnS │  │Dialogs │ │QnA │  │Auth│
 │     │  │ Menús  │ │Logs│  │DB  │
 └─────┘  └────────┘ └────┘  └─┬──┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                 ┌──▼──┐          ┌─────▼─┐
                 │MySQL│          │Power  │
                 │ DB  │          │Automat│
                 └─────┘          └───────┘
```

### Flujo de Procesamiento de Mensajes

```
1. Usuario envía mensaje
   ↓
2. BotFrameworkAdapter recibe y procesa
   ↓
3. MinerBot.onMessage() ejecuta lógica
   ↓
4. Verificar autenticación
   ↓
5. Si no autenticado → AuthMenu
   Si autenticado → Menú actual
   ↓
6. Menu.handleInput() procesa entrada
   ↓
7. Si no manejado → KnowledgeService.ask()
   ↓
8. PowerAutomateService.logQnaQuery()
   ↓
9. Enviar respuesta a usuario
   ↓
10. Guardar estado de conversación
```

## 📁 Estructura del Proyecto

```
MinerBot/
├── index.js                          # Punto de entrada (Adapter y servidor)
├── package.json                      # Dependencias y scripts
├── package-lock.json                 # Lock de versiones
├── .env                              # Variables de entorno (NO COMMITEAR)
├── .gitignore                        # Archivos a ignorar en Git
├── .git/                             # Repositorio Git
├── INSTRUCCIONES_ENTREGA.txt         # Guía para entrega
├── README.md                         # Este archivo
│
├── src/
│   ├── bot/
│   │   ├── MinerBot.js               # Clase principal del bot
│   │   └── services/
│   │       ├── EmployeeService.js    # Acceso a BD (Empleados)
│   │       ├── KnowledgeService.js   # QnA Maker (Azure Language)
│   │       └── PowerAutomateService.js # Integración Power Automate
│   │
│   └── dialogs/
│       ├── data/
│       │   └── content.js            # Contenido estático (respuestas)
│       ├── main/
│       │   ├── AuthMenu.js           # Login (2 pasos)
│       │   └── MainMenu.js           # Menú principal (7 opciones)
│       ├── level1/                   # Menús de 1er nivel (7 diálogos)
│       │   ├── VacacionesMenu.js
│       │   ├── BeneficiosMenu.js
│       │   ├── SaludSegurosMenu.js
│       │   ├── BienestarConciliacionMenu.js
│       │   ├── CulturaValoresMenu.js
│       │   ├── CrecimientoDesarrolloMenu.js
│       │   └── ConsultasGeneralesMenu.js
│       └── level2/                   # Menús de 2do nivel (5 diálogos)
│           ├── TiposPermisosLegalesMenu.js
│           ├── TiposSegurosSaludMenu.js
│           ├── ProgramasInternosMenu.js
│           ├── ApoyoFamiliarMenu.js
│           └── ProcedimientoDenunciasMenu.js
│
└── node_modules/                    # Dependencias (gitignored)
```

## 👨‍💻 Desarrollo

### Agregar un Nuevo Menú

#### 1. Crear archivo `src/dialogs/level1/NuevoMenu.js`

```javascript
const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

class NuevoMenu {
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Opción 1',
            'Opción 2',
            'Sub-menú'
        ];
        this.returnOption = 'Volver';
        this.navigationMap = {
            'sub-menú': 'subMenuId'
        };
    }

    async show(context) {
        const menuOptions = this.options.map((opt, i) => `${i + 1}. ${opt}`);
        menuOptions.push(`${this.options.length + 1}. ${this.returnOption}`);
        const text = ['Título:', ...menuOptions, '\nEscribe número o nombre.'].join('\n');
        await context.sendActivity(text);
    }

    async handleInput(context, text, conversationData, bot) {
        // Implementar lógica de manejo
        return false; // No manejado
    }
}

module.exports = NuevoMenu;
```

#### 2. Registrar en `src/bot/MinerBot.js`

```javascript
const NuevoMenu = require('../dialogs/level1/NuevoMenu');

// En el constructor:
this.menuInstances = {
    // ... otros menús
    nuevoMenu: new NuevoMenu(this),
};
```

#### 3. Agregar contenido en `src/dialogs/data/content.js`

```javascript
module.exports = {
    // ... contenido existente
    'opción 1': 'Texto de respuesta para opción 1',
    'opción 2': {
        '1': 'Respuesta para sede 1',
        '2': 'Respuesta para sede 2',
        'default': 'Respuesta por defecto'
    }
};
```

### Estándares de Código

- **Nomenclatura**: camelCase para variables y funciones, PascalCase para clases
- **Comentarios**: JSDoc para funciones públicas, inline para lógica compleja
- **Async/Await**: Preferir sobre Promises cuando sea posible
- **Error Handling**: Siempre catchear errores en llamadas a servicios externos
- **Logging**: Usar `console.log()`, `console.warn()`, `console.error()`
- **Validación**: Validar entrada del usuario en `handleInput()`

### Testing Local

```bash
# Usar Bot Framework Emulator (recomendado)
# Conectar a http://localhost:3978/api/messages

# O usar curl para pruebas básicas
curl -X POST http://localhost:3978/api/messages \
  -H "Content-Type: application/json" \
  -d '{"type":"message","text":"hola","from":{"id":"user1"}}'
```

## 🔍 Troubleshooting

### No conecta a la base de datos

**Problema**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solución**: 
1. Verificar que MySQL está corriendo
2. Verificar credenciales en `.env`
3. Probar conexión manualmente:

```bash
mysql -h <host> -u <user> -p -D minerbothr_local_db
```

### Respuestas de QnA no funcionan

**Problema**: "No encontré una respuesta en la base de conocimientos"

**Solución**:
1. Verificar que el proyecto QnA existe en Azure Language Service
2. Verificar que el deployment es "production"
3. Probar endpoint manualmente con Postman

### Demasiados intentos de login bloqueados

**Problema**: "Demasiados intentos fallidos. Por favor, espera X segundos."

**Solución**: Esperar 1 minuto o resetear usuario en BD

```sql
UPDATE Empleados SET ... WHERE ID_Empleado = <id>;
```

## 📚 Recursos Adicionales

- [Microsoft Bot Framework Documentation](https://docs.microsoft.com/en-us/azure/bot-service/)
- [Azure Language Service QnA](https://learn.microsoft.com/en-us/azure/ai-services/language-service/question-answering/overview)
- [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator)
- [Power Automate Documentation](https://docs.microsoft.com/en-us/power-automate/)


## 📄 Licencia

Este proyecto es **UNLICENSED** (Privado). Uso solo con autorización explícita.

## 👥 Autor

**Guillermo González** - [GitHub Profile](https://github.com/GuilleGs)


---

**Última actualización**: 14 de noviembre de 2025  
**Versión**: 2.1.0  
**Estado**: Producción
