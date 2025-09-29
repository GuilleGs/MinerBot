// dialogs/SaludSegurosMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('./content');

const saludSegurosOptions = [
    'Procedimiento de reembolso médico/dental',
    'Beneficios de salud mental',
    'Seguro de vida y cobertura en accidentes laborales',
    'Tipos de Seguros de Salud ⚕️'
];

class SaludSegurosMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(saludSegurosOptions.concat(['Volver']), '💚 Salud y Seguros')
        );
    }

    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase();

        if (conversationData.isInInfoDisplayState && lower.includes('volver')) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        if (lower.includes('volver')) {
            await bot.goBack(context, conversationData);
            return true;
        }

        if (lower.includes('tipos de seguros de salud')) {
            await bot.navigateToMenu(context, conversationData, 'tiposSegurosSalud');
            return true;
        }

        const matchedOption = saludSegurosOptions.find(opt => opt.toLowerCase() === lower);

        if (matchedOption) {
            const response = content[lower];
            if (response) {
                await context.sendActivity(response);
            } else {
                await context.sendActivity(`Has seleccionado: "${text}" (No hay información detallada aún).`);
            }
            conversationData.isInInfoDisplayState = true;
            return true;
        }

        return false;
    }
}

module.exports = SaludSegurosMenu;