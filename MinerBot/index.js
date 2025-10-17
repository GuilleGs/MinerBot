// index.js
const restify = require('restify'); // Módulo para crear un servidor web REST.
const dotenv = require('dotenv'); // Módulo para cargar variables de entorno desde un archivo .env.
dotenv.config({ quiet: true });; // Carga las variables de entorno al inicio de la aplicación.

const {
    BotFrameworkAdapter, // Adaptador para conectar el bot a varios canales.
    ConversationState,  // Clase para gestionar el estado de la conversación.
    MemoryStorage       // Implementación de almacenamiento de estado en memoria (para desarrollo).
} = require('botbuilder');

const MinerBot = require('./src/bot/MinerBot'); // Importa la clase principal de tu bot.

// Crea una instancia del adaptador para Bot Framework.
// Utiliza las credenciales de la aplicación Microsoft (AppId, AppPassword) definidas en las variables de entorno.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId || '',
    appPassword: process.env.MicrosoftAppPassword || ''
});

// Configuración del almacenamiento del estado de la conversación.
// MemoryStorage es adecuado para desarrollo y pruebas, pero NO para producción,
// donde se requiere persistencia (ej. Azure Blob Storage, Cosmos DB).
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

// Crea una instancia de tu bot principal, pasándole el gestor de estado de conversación.
const bot = new MinerBot(conversationState);

// Crea un servidor Restify para escuchar las actividades entrantes del Bot Framework.
const server = restify.createServer();
server.listen(3978, () => {
    console.log('Bot Framework: Servidor escuchando en http://localhost:3978');
});

// Define la ruta POST donde el Bot Framework Adapter recibirá las actividades del bot.
server.post('/api/messages', async (req, res) => {
    // Procesa la actividad entrante y delega la lógica de negocio a la instancia del bot.
    await adapter.processActivity(req, res, async (context) => {
        await bot.run(context); // Ejecuta la lógica principal del bot para la actividad.
        await conversationState.saveChanges(context, false); // Guarda los cambios en el estado de la conversación.
    });
});