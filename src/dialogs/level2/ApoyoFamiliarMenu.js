// src/dialogs/level2/ApoyoFamiliarMenu.js

const { MessageFactory } = require('botbuilder');
// La ruta a 'content' debe subir dos niveles desde la carpeta 'level2'.
const content = require('../data/content'); 

/**
 * Diálogo que gestiona el sub-menú de "Apoyo Familiar".
 * Presenta opciones de información sobre los beneficios de apoyo para las familias
 * de los colaboradores. Este es un diálogo informativo final en su rama de navegación.
 */
class ApoyoFamiliarMenu {
    /**
     * Inicializa el diálogo con las opciones de menú.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Apoyo de Guardería',
            'Becas de Estudio para Hijos',
            'Días Administrativos por Cuidado Familiar'
        ];
        this.returnOption = 'Volver';
    }

    /**
     * Muestra el menú de opciones al usuario de forma clara y numerada.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const menuOptions = this.options.map((option, index) => `${index + 1}. ${option}`);
        menuOptions.push(`${this.options.length + 1}. ${this.returnOption}`);
        
        const menuText = [
            'Apoyo Familiar:',
            ...menuOptions,
            '\nPor favor, escribe el número o el nombre de la opción.'
        ].join('\n');

        await context.sendActivity(menuText);
    }

    /**
     * Procesa la entrada del usuario, manejando selecciones numéricas, de texto y la opción de retroceder.
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

        // Caso 2: El usuario ingresa un número.
        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];
        } 
        // Caso 3: El usuario ingresa texto.
        else {
            const matchedOption = this.options.find(opt => opt.toLowerCase() === lowerText);
            if (matchedOption) {
                selectedOption = matchedOption;
            } else if (lowerText.includes(this.returnOption.toLowerCase())) {
                selectedOption = this.returnOption;
            }
        }

        if (selectedOption) {
            // Acción 1: Si la opción es "Volver", retrocede.
            if (selectedOption === this.returnOption) {
                await bot.goBack(context, conversationData);
                return true;
            }

            // Acción 2: Para cualquier otra opción, busca y muestra la respuesta estática.
            const response = content[selectedOption.toLowerCase()];
            
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true;
                return true;
            }
        }

        return false;
    }
}

module.exports = ApoyoFamiliarMenu;