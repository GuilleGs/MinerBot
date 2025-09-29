// dialogs/VacacionesMenu.js
const { MessageFactory } = require('botbuilder');

const options = [
    'Solicitar vacaciones',
    'Consultar saldo de vacaciones',
    'Procedimiento de licencia médica',
    'Tipos de permisos legales'
];

class VacacionesMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(options.concat(['Volver']), '📄 Vacaciones y Permisos')
        );
    }

    async handleInput(context, text) {
        const lower = text.toLowerCase();

        if (lower.includes('volver')) {
            const previous = this.bot.menuStack.pop();
            if (previous) {
                this.bot.currentMenu = previous;
                await this.bot.currentMenu.show(context);
            }
            return true;
        } else {
            await context.sendActivity(`Has seleccionado: "${text}"`);
            return true;
        }
    }
}

module.exports = VacacionesMenu;
