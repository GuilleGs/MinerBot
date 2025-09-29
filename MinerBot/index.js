// index.js
const restify = require('restify');
const dotenv = require('dotenv');
dotenv.config();

const { BotFrameworkAdapter } = require('botbuilder');
const MinerBot = require('./bot/MinerBot');

// Crear adaptador con credenciales del .env
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId || '',
    appPassword: process.env.MicrosoftAppPassword || ''
});

// Crear instancia del bot
const bot = new MinerBot();

// Crear servidor Restify
const server = restify.createServer();
server.listen(3978, () => console.log('Servidor escuchando en http://localhost:3978'));

// Endpoint para recibir mensajes
server.post('/api/messages', async (req, res) => {
    await adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});
