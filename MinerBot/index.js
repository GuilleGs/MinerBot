// index.js
const restify = require('restify');
const dotenv = require('dotenv');
dotenv.config();

// Se importan ConversationState y MemoryStorage
const { BotFrameworkAdapter, ConversationState, MemoryStorage } = require('botbuilder');
const MinerBot = require('./bot/MinerBot');

// Crear adaptador con credenciales del .env
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId || '',
    appPassword: process.env.MicrosoftAppPassword || ''
});

// --- INICIO DE CAMBIOS PARA MANEJO DE ESTADO ---
// Configurar almacenamiento de estado (para desarrollo, usar MemoryStorage)
// En producción, se usaría un almacenamiento persistente como BlobStorage o CosmosDbStorage.
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
// --- FIN DE CAMBIOS PARA MANEJO DE ESTADO ---

// Crear instancia del bot, pasándole el ConversationState
const bot = new MinerBot(conversationState);

// Crear servidor Restify
const server = restify.createServer();
server.listen(3978, () => console.log('Servidor escuchando en http://localhost:3978'));

// Endpoint para recibir mensajes
server.post('/api/messages', async (req, res) => {
    // --- INICIO DE CAMBIOS PARA MANEJO DE ESTADO ---
    // Procesa la actividad y maneja el estado de la conversación
    // `conversationState.run` asegura que el estado se carga antes y se guarda después de cada turno.
    await adapter.processActivity(req, res, async (context) => {
        // Ejecuta el bot con el contexto
        await bot.run(context);

        // Guardar todos los cambios de estado al final de cada turno.
        await conversationState.saveChanges(context, false);
    });
    // --- FIN DE CAMBIOS PARA MANEJO DE ESTADO ---
});