// src/dialogs/level2/ProcedimientoDenunciasMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

class ProcedimientoDenunciasMenu {
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Denuncia por Acoso',
            'Denuncia por Discriminación',
            'Reporte de Conflicto de Interés',
            'Realizar Denuncia Anónima' // ¡NUEVA OPCIÓN!
        ];
        this.returnOption = 'Volver';
    }

    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);
        // Si el bot está esperando el texto de la denuncia, NO mostramos el menú, solo el prompt del contenido
        if (conversationData.awaitingAnonymousComplaint) {
            await context.sendActivity(content['realizar denuncia anónima 🤫']); // Muestra el mensaje introductorio
            return;
        }

        let menuText = '🚨 Procedimiento para Denuncias:\n';
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += `${this.options.length + 1}. ${this.returnOption}\n`;
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText);
    }

    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase();
        const number = parseInt(text.trim());

        // --- INICIO CAMBIOS: Lógica para manejar el estado de espera de denuncia anónima ---
        if (conversationData.awaitingAnonymousComplaint) {
            const complaintText = text.trim();
            if (!complaintText) {
                await context.sendActivity('Parece que no escribiste nada. Por favor, escribe tu denuncia o "volver" para cancelar.');
                return true;
            }
            if (lower === 'volver' || lower === 'cancelar') {
                conversationData.awaitingAnonymousComplaint = false;
                await context.sendActivity('Envío de denuncia anónima cancelado. Volviendo al menú de Procedimiento para Denuncias.');
                await this.show(context);
                return true;
            }

            let success = false;
            try {
                console.log('🤖 DEBUG: Llamando a PowerAutomateService para denuncia anónima desde ProcedimientoDenunciasMenu.');
                success = await this.bot.powerAutomateService.sendAnonymousComplaint(complaintText);
                console.log('🤖 DEBUG: sendAnonymousComplaint ha finalizado. Éxito:', success);
            } catch (error) {
                console.error('❌ ERROR INESPERADO en ProcedimientoDenunciasMenu al intentar enviar denuncia anónima:', error);
                // No enviar mensaje al usuario aquí, ya lo gestiona el finally o el PowerAutomateService
            } finally {
                if (success) {
                    await context.sendActivity('✅ Tu denuncia anónima ha sido enviada con éxito. Agradecemos tu contribución para mantener un ambiente de integridad.');
                } else {
                    await context.sendActivity('Hubo un problema al enviar tu denuncia anónima. Por favor, intenta de nuevo más tarde o contacta a un superior directamente.');
                }
                conversationData.awaitingAnonymousComplaint = false;
                conversationData.isInInfoDisplayState = false;
                await this.show(context); // Volver a mostrar el menú de Procedimiento para Denuncias
                return true;
            }
        }
        // --- Fin de la lógica para manejar el estado de espera de denuncia anónima ---


        if (conversationData.isInInfoDisplayState && lower.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            const selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];

            if (selectedOption.toLowerCase().includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            // --- INICIO CAMBIOS: Lógica para 'Realizar Denuncia Anónima' ---
            if (selectedOption.toLowerCase().includes('realizar denuncia anónima')) {
                conversationData.awaitingAnonymousComplaint = true; // Establecer el estado de espera
                await this.show(context); // Muestra el mensaje introductorio y espera la denuncia
                return true;
            }
            // --- FIN CAMBIOS ---

            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response);
            } else {
                await context.sendActivity(`Has seleccionado: "${text}" (No hay información detallada aún).`);
            }
            conversationData.isInInfoDisplayState = true;
            return true;
        }
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
            return true;
        }
        // --- INICIO CAMBIOS: Lógica para 'Realizar Denuncia Anónima' por texto ---
        else if (lower.includes('realizar denuncia anónima')) {
            conversationData.awaitingAnonymousComplaint = true; // Establecer el estado de espera
            await this.show(context); // Muestra el mensaje introductorio y espera la denuncia
            return true;
        }
        // --- FIN CAMBIOS ---

        const matchedOption = this.options.find(opt => opt.toLowerCase() === lower);
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

module.exports = ProcedimientoDenunciasMenu;