// src/dialogs/level1/CulturaValoresMenu.js

const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

/**
 * Diálogo que gestiona el menú de "Cultura y Valores".
 * Este diálogo sirve como punto de entrada a información sobre ética y valores,
 * y como enrutador hacia el sub-menú de procedimientos de denuncia.
 */
class CulturaValoresMenu {
    /**
     * Inicializa el diálogo con sus opciones y define un mapa para la navegación.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Código de ética y conducta',
            'Valores corporativos y compromisos de diversidad',
            'Canales de reporte confidencial',
            'Procedimiento para Denuncias'
        ];
        this.returnOption = 'Volver';

        // El mapa de navegación define las transiciones a otros diálogos.
        this.navigationMap = {
            'procedimiento para denuncias': 'procedimientoDenuncias'
        };
    }

    /**
     * Muestra el menú de opciones al usuario de forma clara y numerada.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const menuOptions = this.options.map((option, index) => `${index + 1}. ${option}`);
        menuOptions.push(`${this.options.length + 1}. ${this.returnOption}`);
        
        const menuText = [
            'Cultura y Valores:',
            ...menuOptions,
            '\nPor favor, escribe el número o el nombre de la opción.'
        ].join('\n');

        await context.sendActivity(menuText);
    }

    /**
     * Procesa la entrada del usuario, manejando selecciones, navegación a sub-menús y la opción de retroceder.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - El mensaje enviado por el usuario.
     * @param {object} conversationData - El estado de la conversación.
     * @param {object} bot - La instancia principal del bot.
     * @returns {Promise<boolean>} `true` si la entrada fue manejada, `false` en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        const lowerText = text.toLowerCase().trim();
        const number = parseInt(lowerText, 10);

        // Caso 1: El usuario quiere volver al menú de opciones después de ver información.
        if (conversationData.isInInfoDisplayState && lowerText.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        let selectedOption = null;

        // Caso 2: Identificar la opción seleccionada por el usuario (número o texto).
        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];
        } else {
            const matchedOption = this.options.find(opt => opt.toLowerCase() === lowerText || lowerText.includes(opt.toLowerCase()));
            if (matchedOption) {
                selectedOption = matchedOption;
            } else if (lowerText.includes(this.returnOption.toLowerCase())) {
                selectedOption = this.returnOption;
            }
        }

        // Caso 3: Actuar según la opción identificada.
        if (selectedOption) {
            const selectedOptionLower = selectedOption.toLowerCase();

            // Acción 1: Si es "Volver", retrocede.
            if (selectedOptionLower.includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }
            
            // Acción 2: Si la opción está en el mapa de navegación, navega al sub-menú.
            if (this.navigationMap[selectedOptionLower]) {
                await bot.navigateToMenu(context, conversationData, this.navigationMap[selectedOptionLower]);
                return true;
            }

            // Acción 3: Si es una opción informativa, muestra el contenido estático.
            const response = content[selectedOptionLower];
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true;
                return true;
            }
        }

        return false;
    }
}

module.exports = CulturaValoresMenu;