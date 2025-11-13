// src/dialogs/level1/SaludSegurosMenu.js

const { MessageFactory } = require('botbuilder');
const content = require('../data/content');
// Importamos el helper que se encargará de seleccionar el contenido correcto.
const { getPersonalizedContent } = require('../../bot/contentHelper');

/**
 * Diálogo que gestiona el menú de "Salud y Seguros".
 * Este diálogo sirve como punto de entrada a información sobre salud, seguros,
 * y como enrutador hacia el sub-menú de tipos de seguros.
 * Es un ejemplo clave del uso de `getPersonalizedContent` para mostrar información
 * específica de la sede del usuario.
 */
class SaludSegurosMenu {
    /**
     * Inicializa el diálogo con sus opciones y define un mapa para la navegación.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Procedimiento de reembolso médico/dental',
            'Beneficios de salud mental',
            'Seguro de vida y cobertura en accidentes laborales',
            'Tipos de Seguros de Salud'
        ];
        this.returnOption = 'Volver';

        this.navigationMap = {
            'tipos de seguros de salud': 'tiposSegurosSalud'
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
            'Salud y Seguros:',
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

        if (conversationData.isInInfoDisplayState && lowerText.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        let selectedOption = null;

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

        if (selectedOption) {
            const selectedOptionLower = selectedOption.toLowerCase();

            if (selectedOptionLower.includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            if (this.navigationMap[selectedOptionLower]) {
                await bot.navigateToMenu(context, conversationData, this.navigationMap[selectedOptionLower]);
                return true;
            }

            // Para las opciones informativas, llamamos a getPersonalizedContent.
            // Se usa 'await' para que funcione correctamente incluso si en el futuro
            // el helper necesita hacer llamadas asíncronas (como a una API).
            const response = await getPersonalizedContent(selectedOptionLower, conversationData);
            
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true;
                return true;
            }
        }

        return false;
    }
}

module.exports = SaludSegurosMenu;