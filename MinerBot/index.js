// index.js
const restify = require('restify');
const dotenv = require('dotenv');
dotenv.config();

const { BotFrameworkAdapter, ConversationState, MemoryStorage } = require('botbuilder');
// --- CAMBIO AQUÍ: La ruta a MinerBot.js ahora es dentro de 'src' ---
const MinerBot = require('./src/bot/MinerBot');
// --- FIN CAMBIO ---

const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId || '',
    appPassword: process.env.MicrosoftAppPassword || ''
});

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

const bot = new MinerBot(conversationState);

const server = restify.createServer();
server.listen(3978, () => console.log('Servidor escuchando en http://localhost:3978'));

server.post('/api/messages', async (req, res) => {
    await adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
        await conversationState.saveChanges(context, false);
    });
});