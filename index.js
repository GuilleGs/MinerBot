// index.js

// -----------------------------------------------------------------------------
// 1. CONFIGURACIÓN E IMPORTACIONES
// -----------------------------------------------------------------------------

const restify = require('restify');
const path = require('path');
const dotenv = require('dotenv');

// Carga las variables de entorno desde el archivo .env.
// Es una buena práctica hacerlo lo primero de todo.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const {
    BotFrameworkAdapter,
    ConversationState,
    MemoryStorage
    // Para producción, se reemplazaría MemoryStorage por una solución persistente:
    // const { BlobStorage } = require('botbuilder-azure');
} = require('botbuilder');

// Importa la clase principal del bot, que contiene toda la lógica de conversación.
const MinerBot = require('./src/bot/MinerBot');

// -----------------------------------------------------------------------------
// 2. INICIALIZACIÓN DE COMPONENTES PRINCIPALES
// -----------------------------------------------------------------------------

// El Adaptador es el componente central que procesa las actividades entrantes
// y las envía al bot. También maneja la autenticación con el Bot Framework Service.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Manejador de errores global.
// Es crucial para la estabilidad de la aplicación. Atrapa cualquier error no manejado
// durante el procesamiento de un turno para evitar que el bot se caiga.
adapter.onTurnError = async (context, error) => {
    // Registra el error detallado en la consola o en un sistema de logging (ej. Application Insights).
    console.error(`\n [onTurnError] error no manejado: ${error}`);

    // Envía un mensaje genérico y amigable al usuario para informarle del problema.
    await context.sendActivity('Lo siento, parece que algo salió mal. Por favor, intenta de nuevo.');
    
    // Opcional: Limpia el estado de la conversación para empezar de nuevo.
    // await conversationState.delete(context);
};

// El Almacenamiento de Estado define dónde se guardará la memoria de la conversación.
// MemoryStorage es solo para desarrollo. Para producción, debe ser persistente.
// const storage = new BlobStorage({ containerName: 'bot-state', storageAccountOrConnectionString: '...' });
const storage = new MemoryStorage();

// El Estado de Conversación gestiona el almacenamiento y recuperación de los datos
// del diálogo para cada conversación.
const conversationState = new ConversationState(storage);

// Crea la instancia principal del bot, inyectando las dependencias que necesita.
const bot = new MinerBot(conversationState);

// -----------------------------------------------------------------------------
// 3. CONFIGURACIÓN DEL SERVIDOR WEB
// -----------------------------------------------------------------------------

const server = restify.createServer();
const port = process.env.port || process.env.PORT || 3978;

server.listen(port, () => {
    console.log(`\n${server.name} escuchando en ${server.url}`);
    console.log('Bot listo para recibir mensajes. Conéctate con el Bot Framework Emulator.');
});

// El endpoint principal '/api/messages' que recibe todas las actividades del Bot Service.
server.post('/api/messages', async (req, res) => {
    // El adaptador procesa la solicitud y la convierte en un 'TurnContext'.
    await adapter.processActivity(req, res, async (context) => {
        // Se ejecuta la lógica principal del bot para el turno actual.
        await bot.run(context);

        // Al final de cada turno, se guardan los cambios en el estado de la conversación.
        await conversationState.saveChanges(context, false);
    });
});