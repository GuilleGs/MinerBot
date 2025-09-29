// dialogs/BeneficiosMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('./content');

const benefitsOptions = [
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
            MessageFactory.suggestedActions(benefitsOptions.concat(['Volver']), '💰 Beneficios Económicos')
        );
    }

    /**
     * @param {TurnContext} context
     * @param {string} text
     * @param {object} conversationData - El objeto de estado de la conversación.
     * @param {MinerBot} bot - La instancia del bot para acceder a sus métodos de navegación.
     * @returns {boolean} True si la entrada fue manejada, false en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) { // Se recibe 'bot' para goBack
        const lower = text.toLowerCase();

        // --- INICIO DE CAMBIOS PARA EL COMPORTAMIENTO DE "VOLVER" ---
        // Si el usuario está en un estado de display de información y escribe 'volver',
        // simplemente mostramos las opciones del menú actual de nuevo.
        if (conversationData.isInInfoDisplayState && lower.includes('volver')) {
            conversationData.isInInfoDisplayState = false; // Resetea el flag
            await this.show(context); // Vuelve a mostrar las opciones de BeneficiosMenu
            return true;
        }
        // --- FIN DE CAMBIOS ---

        if (lower.includes('volver')) {
            await bot.goBack(context, conversationData); // Usa el método goBack del bot
            return true;
        }

        const matchedOption = benefitsOptions.find(opt => opt.toLowerCase() === lower);

        if (matchedOption) {
            const response = content[lower];
            if (response) {
                await context.sendActivity(response);
            } else {
                await context.sendActivity(`Has seleccionado: "${text}" (No hay información detallada aún).`);
            }
            conversationData.isInInfoDisplayState = true; // <-- AÑADIDO: Establecer el flag
            return true; // Se manejó una opción del menú
        }

        return false; // No se manejó ninguna opción del menú, dejar que MinerBot intente la KB
    }
}

module.exports = BeneficiosMenu;