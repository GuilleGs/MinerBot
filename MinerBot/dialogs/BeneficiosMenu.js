// dialogs/BeneficiosMenu.js
const { MessageFactory } = require('botbuilder');

const options = [
    'Bonos de desempeño',
    'Asignación de escolaridad',
    'Aguinaldos y gratificaciones',
    'Viáticos y reembolsos',
    'Descuentos corporativos'
];

class BeneficiosMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(options.concat(['Volver']), '💰 Beneficios Económicos')
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

module.exports = BeneficiosMenu;
