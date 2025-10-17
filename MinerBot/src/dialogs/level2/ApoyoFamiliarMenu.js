// src/dialogs/level2/ApoyoFamiliarMenu.js
const { MessageFactory } = require('botbuilder'); // Módulo para crear mensajes del bot.
const content = require('../data/content'); // Importa el contenido estático para las respuestas del bot.

/**
 * Diálogo que gestiona el sub-menú de "Apoyo Familiar".
 * Presenta opciones de información relacionadas con los beneficios de apoyo para las familias de los colaboradores.
 */
class ApoyoFamiliarMenu {
    /**
     * Inicializa el diálogo con las opciones de menú y la referencia al bot principal.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        // Define las opciones específicas de este menú de apoyo familiar.
        this.options = [
            'Apoyo de Guardería',
            'Becas de Estudio para Hijos',
            'Días Administrativos por Cuidado Familiar'
        ];
        this.returnOption = 'Volver'; // Opción estándar para regresar al menú anterior.
    }

    /**
     * Muestra el menú de "Apoyo Familiar" al usuario, listando todas las opciones disponibles.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        // Construye el mensaje con la lista numerada de opciones.
        let menuText = 'Apoyo Familiar:\n'; 
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += `${this.options.length + 1}. ${this.returnOption}\n`;
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText); // Envía el menú al usuario.
    }

    /**
     * Procesa la entrada del usuario para este menú.
     * Maneja la selección de opciones numéricas o de texto y la acción de "Volver".
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - Texto del mensaje enviado por el usuario.
     * @param {object} conversationData - Objeto que contiene el estado de la conversación.
     * @param {object} bot - Instancia del bot principal para funciones de navegación.
     * @returns {Promise<boolean>} Retorna true si la entrada fue manejada por este menú, false en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase(); // Convierte la entrada a minúsculas.
        const number = parseInt(text.trim()); // Intenta parsear la entrada como número.

        // Maneja la acción "Volver" cuando el bot está mostrando información estática.
        if (conversationData.isInInfoDisplayState && lower.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false; // Sale del estado de visualización.
            await this.show(context); // Muestra el menú nuevamente.
            return true;
        }

        // Procesa la entrada si es un número válido que corresponde a una opción del menú o a "Volver".
        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            const selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];

            // Si la opción seleccionada es "Volver".
            if (selectedOption.toLowerCase().includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            // Busca y muestra la respuesta estática desde 'content.js'.
            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true; // Entra en estado de visualización.
                return true;
            }
        }
        // Procesa la entrada si es el texto "Volver".
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
            return true;
        }

        // Fallback: Si la entrada coincide con una opción informativa, la busca en content.js.
        const matchedOption = this.options.find(opt => opt.toLowerCase() === lower);
        if (matchedOption) {
            const response = content[lower];
            if (response) {
                await context.sendActivity(response);
            } else {
                await context.sendActivity(`Ha seleccionado: "${text}" (Información detallada no disponible).`);
            }
            conversationData.isInInfoDisplayState = true;
            return true;
        }

        return false; // Indica que la entrada no fue manejada por este diálogo.
    }
}

module.exports = ApoyoFamiliarMenu;