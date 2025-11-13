// src/dialogs/level1/BeneficiosMenu.js

const content = require('../data/content');
// A futuro, si este menú necesitara contenido personalizado, solo se requeriría
// importar y usar `getPersonalizedContent` aquí.
// const { getPersonalizedContent } = require('../../bot/contentHelper');

/**
 * Diálogo que gestiona el menú de "Beneficios Económicos".
 * Presenta opciones informativas sobre la compensación financiera de la empresa.
 * Este es un ejemplo de un diálogo de menú simple que no navega a sub-menús.
 */
class BeneficiosMenu {
    /**
     * Inicializa el diálogo con las opciones de menú y la referencia al bot principal.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Bonos de desempeño',
            'Asignación de escolaridad',
            'Aguinaldos y gratificaciones',
            'Viáticos y reembolsos',
            'Descuentos corporativos'
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
            'Beneficios Económicos:',
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
            // Busca una coincidencia exacta o la opción de volver.
            const matchedOption = this.options.find(opt => opt.toLowerCase() === lowerText);
            if (matchedOption) {
                selectedOption = matchedOption;
            } else if (lowerText.includes(this.returnOption.toLowerCase())) {
                selectedOption = this.returnOption;
            }
        }

        // Si se identificó una opción válida (ya sea por texto o número)...
        if (selectedOption) {
            // Si la opción es "Volver", retrocede.
            if (selectedOption === this.returnOption) {
                await bot.goBack(context, conversationData);
                return true;
            }

            // Para cualquier otra opción, busca la respuesta en el archivo de contenido.
            // NOTA: Aquí es donde se usaría `await getPersonalizedContent(...)` si fuera necesario.
            const response = content[selectedOption.toLowerCase()];
            
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true;
                return true;
            }
        }

        // Si la entrada no coincide con ninguna opción, no fue manejada por este menú.
        return false;
    }
}

module.exports = BeneficiosMenu;