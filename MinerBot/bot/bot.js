// bot.js
const { ActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios');

// Configuración de la KB
const endpoint = 'https://botminer.cognitiveservices.azure.com';
const key = process.env.LanguageEndpointKey;
const deploymentName = 'production';

class MinerBot extends ActivityHandler {
    constructor() {
        super();

        // Saludo al iniciar conversación
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('👋 Bienvenido, soy MinerBot. Escribe "hola" para empezar.');
                }
            }
            await next();
        });

        // Manejo de mensajes
        this.onMessage(async (context, next) => {
            const text = context.activity.text.trim();

            // Menú principal
            if (text.toLowerCase() === 'hola') {
                await context.sendActivity(
                    MessageFactory.suggestedActions(
                        ['¿Cuál es tu nombre?', 'Vacaciones'],
                        'Elige una opción:'
                    )
                );
            } else {
                // Envía cualquier otro mensaje a la KB
                const answer = await this.consultarKB(text);
                await context.sendActivity(answer);
            }

            await next();
        });
    }

    // Función para consultar la KB
    async consultarKB(pregunta) {
        const url = `${endpoint}/language/:query-knowledgebases?projectName=${projectName}&deploymentName=${deploymentName}&api-version=2021-10-01`;
        try {
            const response = await axios.post(
                url,
                { question: pregunta, top: 1 },
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': key,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.answers && response.data.answers.length > 0) {
                return response.data.answers[0].answer;
            } else {
                return 'No encontré una respuesta en la KB.';
            }
        } catch (error) {
            console.error('Error consultando la KB:', error.response?.data || error.message);
            return 'Error al consultar la base de conocimientos.';
        }
    }
}

module.exports.MinerBot = MinerBot;
