// src/dialogs/level2/ProcedimientoDenunciasMenu.js
const { MessageFactory } = require('botbuilder'); // Módulo para crear mensajes del bot.
const content = require('../data/content'); // Importa el contenido estático para las respuestas del bot.

/**
 * Diálogo que gestiona el sub-menú de "Procedimiento para Denuncias".
 * Ofrece información sobre diferentes tipos de denuncias y permite al usuario
 * realizar una denuncia anónima a través de un flujo de Power Automate.
 */
class ProcedimientoDenunciasMenu {
    /**
     * Inicializa el diálogo con las opciones de menú y la referencia al bot principal.
     * @param {object} bot - Instancia del bot principal para acceso a servicios y estados de conversación.
     */
    constructor(bot) {
        this.bot = bot;
        // Define las opciones específicas de este menú de denuncias.
        this.options = [
            'Denuncia por Acoso',
            'Denuncia por Discriminación',
            'Reporte de Conflicto de Interés',
            'Realizar Denuncia Anónima' 
        ];
        this.returnOption = 'Volver'; // Opción estándar para regresar al menú anterior.
    }

    /**
     * Muestra el menú de "Procedimiento para Denuncias" o el prompt para una denuncia anónima.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);
        // Si el bot está esperando el texto de la denuncia, muestra el mensaje introductorio y no el menú completo.
        if (conversationData.awaitingAnonymousComplaint) {
            await context.sendActivity(content['realizar denuncia anónima']); // Utiliza la clave sin emoticón.
            return;
        }

        // Construye y envía el menú normal si no se está esperando una denuncia.
        let menuText = 'Procedimiento para Denuncias:\n'; 
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += `${this.options.length + 1}. ${this.returnOption}\n`;
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText);
    }

    /**
     * Procesa la entrada del usuario para este menú.
     * Maneja el envío de denuncias anónimas a Power Automate, la navegación y la visualización de información.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - Texto del mensaje enviado por el usuario.
     * @param {object} conversationData - Objeto que contiene el estado de la conversación.
     * @param {object} bot - Instancia del bot principal para funciones de servicio y navegación.
     * @returns {Promise<boolean>} Retorna true si la entrada fue manejada por este diálogo, false en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase(); // Convierte la entrada a minúsculas.
        const number = parseInt(text.trim()); // Intenta parsear la entrada como número.

        // Lógica principal: Gestiona la entrada si el bot está esperando el texto de una denuncia anónima.
        if (conversationData.awaitingAnonymousComplaint) {
            const complaintText = text.trim();

            // Valida si el usuario ingresó texto o intentó cancelar.
            if (!complaintText) {
                await context.sendActivity('No se recibió texto. Por favor, escribe tu denuncia o "volver" para cancelar.');
                return true;
            }
            if (lower === 'volver' || lower === 'cancelar') {
                conversationData.awaitingAnonymousComplaint = false; // Desactiva el estado de espera.
                await context.sendActivity('Envío de denuncia anónima cancelado. Volviendo al menú de Procedimiento para Denuncias.');
                await this.show(context); // Muestra el menú de Procedimiento para Denuncias nuevamente.
                return true;
            }

            let success = false;
            try {
                // Envía la denuncia anónima al flujo de Power Automate a través del servicio centralizado.
                success = await this.bot.powerAutomateService.sendAnonymousComplaint(complaintText);
            } catch (error) {
                // Captura errores inesperados durante la llamada al servicio.
                console.error('ProcedimientoDenunciasMenu: Error inesperado al intentar enviar denuncia anónima:', error);
            } finally {
                // Responde al usuario según el resultado del envío a Power Automate.
                if (success) {
                    await context.sendActivity('Su denuncia anónima ha sido enviada con éxito. Agradecemos su contribución para mantener un ambiente de integridad.');
                } else {
                    await context.sendActivity('Hubo un problema al enviar su denuncia anónima. Por favor, intente de nuevo más tarde o contacte a un superior directamente.');
                }
                conversationData.awaitingAnonymousComplaint = false; // Desactiva el estado de espera.
                conversationData.isInInfoDisplayState = false; // Sale del estado de visualización de información.
                await this.show(context); // Vuelve a mostrar el menú de Procedimiento para Denuncias.
                return true;
            }
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

            // Si la opción es "Realizar Denuncia Anónima", activa el flujo de denuncia.
            if (selectedOption.toLowerCase().includes('realizar denuncia anónima')) {
                conversationData.awaitingAnonymousComplaint = true; // Activa el estado de espera.
                await this.show(context); // Muestra el mensaje introductorio y espera la denuncia.
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
        // Procesa la entrada si es el texto "Realizar Denuncia Anónima".
        else if (lower.includes('realizar denuncia anónima')) {
            conversationData.awaitingAnonymousComplaint = true; // Activa el estado de espera.
            await this.show(context); // Muestra el mensaje introductorio y espera la denuncia.
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

module.exports = ProcedimientoDenunciasMenu;