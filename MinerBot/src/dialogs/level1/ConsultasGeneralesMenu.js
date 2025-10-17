// src/dialogs/level1/ConsultasGeneralesMenu.js
const { MessageFactory } = require('botbuilder'); // Módulo para crear mensajes del bot.
const content = require('../data/content'); // Importa el contenido estático del bot.

/**
 * Diálogo que gestiona el menú de "Consultas Generales y Otros".
 * Permite al usuario acceder a información general de la empresa y enviar consultas no resueltas
 * a un flujo de Power Automate para atención manual.
 */
class ConsultasGeneralesMenu {
    /**
     * Inicializa el diálogo con las opciones de menú y la referencia al bot principal.
     * @param {object} bot - Instancia del bot principal para acceso a servicios y estados de conversación.
     */
    constructor(bot) {
        this.bot = bot;
        // Define las opciones principales de este menú.
        this.options = [
            'Información general de la empresa',
            'No encontré lo que buscaba'
        ];
        this.returnOption = 'Volver'; // Opción estándar para retroceder en la navegación.
    }

    /**
     * Muestra el menú de "Consultas Generales y Otros" o el prompt para la consulta no resuelta.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);

        // Si el bot está esperando el texto de la consulta del usuario,
        // muestra el mensaje introductorio de content.js y no el menú completo.
        if (conversationData.awaitingUserQuery) {
            await context.sendActivity(content['no encontré lo que buscaba']);
            return;
        }

        // Construye y envía el menú normal si no se está esperando una consulta.
        let menuText = 'Consultas Generales y Otros:\n';
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += `${this.options.length + 1}. ${this.returnOption}\n`;
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText);
    }

    /**
     * Procesa la entrada del usuario para este menú.
     * Maneja el envío de consultas no resueltas a Power Automate, la navegación y la visualización de información.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - Texto del mensaje enviado por el usuario.
     * @param {object} conversationData - Objeto que contiene el estado de la conversación.
     * @param {object} bot - Instancia del bot principal para funciones de servicio y navegación.
     * @returns {Promise<boolean>} Retorna true si la entrada fue manejada por este diálogo, false en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase(); // Convierte la entrada a minúsculas.
        const number = parseInt(text.trim()); // Intenta parsear la entrada como número.

        // Lógica principal: Gestiona la entrada si el bot está esperando el texto de una consulta no resuelta.
        if (conversationData.awaitingUserQuery) {
            const userQuery = text.trim();

            // Valida si el usuario ingresó texto o intentó cancelar.
            if (!userQuery) {
                await context.sendActivity('No se recibió texto. Por favor, escribe tu consulta o "volver" para cancelar.');
                return true;
            }
            if (lower === 'volver' || lower === 'cancelar') {
                conversationData.awaitingUserQuery = false; // Desactiva el estado de espera.
                await context.sendActivity('Envío de consulta cancelado. Volviendo al menú de Consultas Generales.');
                await this.show(context); // Muestra el menú de Consultas Generales nuevamente.
                return true;
            }

            // Recopila los datos del empleado del estado de la conversación y el texto de la consulta.
            const dataToSend = {
                nombreEmpleado: conversationData.employeeName,
                rutEmpleado: conversationData.employeeRut,
                employeeArea: conversationData.employeeArea,
                employeeCargo: conversationData.employeeCargo,
                consultaTexto: userQuery
            };

            // Envía la consulta al flujo de Power Automate a través del servicio centralizado.
            const success = await this.bot.powerAutomateService.sendUnresolvedQuery(dataToSend);

            // Responde al usuario según el resultado del envío a Power Automate.
            if (success) {
                await context.sendActivity('Su consulta ha sido enviada al equipo de soporte. Le contactaremos a la brevedad posible. Gracias por su paciencia.');
            } else {
                await context.sendActivity('Hubo un problema al enviar su consulta. Por favor, intente de nuevo más tarde o contacte directamente a RRHH.');
            }

            conversationData.awaitingUserQuery = false; // Desactiva el estado de espera.
            conversationData.isInInfoDisplayState = false; // Sale del estado de visualización de información.
            await this.show(context); // Vuelve a mostrar el menú general de Consultas Generales.
            return true;
        }

        // Maneja la acción "Volver" cuando el bot está mostrando información estática.
        if (conversationData.isInInfoDisplayState && lower.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        // Procesa la entrada si es un número válido de una opción de menú o "Volver".
        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            const selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];

            // Si la opción es "Volver".
            if (selectedOption.toLowerCase().includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            // Si la opción es "No encontré lo que buscaba", activa el flujo de envío de consulta.
            if (selectedOption.toLowerCase().includes('no encontré lo que buscaba')) {
                conversationData.awaitingUserQuery = true; // Activa el estado de espera.
                await this.show(context); // Muestra el mensaje introductorio y espera la consulta.
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
        // Procesa la entrada si es el texto "No encontré lo que buscaba".
        else if (lower.includes('no encontré lo que buscaba')) {
            conversationData.awaitingUserQuery = true; // Activa el estado de espera.
            await this.show(context); // Muestra el mensaje introductorio y espera la consulta.
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

module.exports = ConsultasGeneralesMenu;