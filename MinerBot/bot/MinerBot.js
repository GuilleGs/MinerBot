// bot/MinerBot.js
const { ActivityHandler } = require('botbuilder');
const dotenv = require('dotenv');
dotenv.config();

const MenuStack = require('./utils/MenuStack');
const KnowledgeService = require('./services/KnowledgeService');

const MainMenu = require('../dialogs/MainMenu');
const VacacionesMenu = require('../dialogs/VacacionesMenu');
const BeneficiosMenu = require('../dialogs/BeneficiosMenu');

class MinerBot extends ActivityHandler {
    constructor() {
        super();

        // Inicializa stack y menús
        this.menuStack = new MenuStack();
        this.menus = {
            main: new MainMenu(this),
            vacaciones: new VacacionesMenu(this),
            beneficios: new BeneficiosMenu(this)
        };
        this.currentMenu = this.menus.main;

        // Inicializa servicio KB
        this.knowledgeService = new KnowledgeService();

        // Saludo al iniciar conversación
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('👋 Bienvenido, escribe "menu" para ver las opciones.');
                }
            }
            await next();
        });

        // Manejo de mensajes
        this.onMessage(async (context, next) => {
            const text = context.activity.text.trim();

            // Comando global: ir al menú principal
            if (text.toLowerCase() === 'menu') {
                this.menuStack.clear();
                this.currentMenu = this.menus.main;
                await this.currentMenu.show(context);
                await next();
                return;
            }

            // Intento de manejar en el menú actual
            let handled = await this.currentMenu.handleInput(context, text);

            // Si no fue manejado por el menú, consulta la KB
            if (!handled) {
                const answer = await this.knowledgeService.ask(text);
                await context.sendActivity(answer);
            }

            await next();
        });
    }
}

module.exports = MinerBot;
