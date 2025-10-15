// src/dialogs/level1/ConsultasGeneralesMenu.js
const { MessageFactory } = require('botbuilder');
<<<<<<< HEAD
const content = require('../data/content');
// const axios = require('axios'); // ¡ELIMINADO!
// const dotenv = require('dotenv'); // ¡ELIMINADO!
// dotenv.config(); // ¡ELIMINADO!
=======
const content = require('../data/content'); // --- CAMBIO AQUÍ: Ruta a content.js ---
>>>>>>> 281abc1a7a45e54b171fac0472dd40fd30b1e110

class ConsultasGeneralesMenu {
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Información general de la empresa',
            'No encontré lo que buscaba 🆘'
        ];
        this.returnOption = 'Volver';
<<<<<<< HEAD
        // this.powerAutomateQueryFlowUrl = process.env.POWER_AUTOMATE_QUERY_FLOW_URL; // ¡ELIMINADO! Ahora se usa el servicio
    }

    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);

        // Si el bot está esperando la consulta del usuario, NO mostramos el menú, solo el prompt del contenido
        if (conversationData.awaitingUserQuery) {
            await context.sendActivity(content['no encontré lo que buscaba 🆘']); // Muestra el nuevo mensaje directo
            return;
        }

=======
    }

    async show(context) {
>>>>>>> 281abc1a7a45e54b171fac0472dd40fd30b1e110
        let menuText = '🆘 Consultas Generales y Otros:\n';
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

<<<<<<< HEAD
        if (conversationData.awaitingUserQuery) {
            const userQuery = text.trim();
            if (!userQuery) {
                await context.sendActivity('Parece que no escribiste nada. Por favor, escribe tu consulta o "volver" para cancelar.');
                return true;
            }
            if (lower === 'volver' || lower === 'cancelar') {
                conversationData.awaitingUserQuery = false;
                await context.sendActivity('Envío de consulta cancelado. Volviendo al menú de Consultas Generales.');
                await this.show(context);
                return true;
            }

            // --- INICIO CAMBIOS: Usar PowerAutomateService ---
            const dataToSend = {
                nombreEmpleado: conversationData.employeeName,
                rutEmpleado: conversationData.employeeRut, // Ya guardado en AuthMenu
                employeeArea: conversationData.employeeArea, // Ya guardado en AuthMenu
                employeeCargo: conversationData.employeeCargo, // Ya guardado en AuthMenu
                consultaTexto: userQuery
            };

            const success = await this.bot.powerAutomateService.sendUnresolvedQuery(dataToSend);

            if (success) {
                await context.sendActivity('✅ Tu consulta ha sido enviada al equipo de soporte. Te contactaremos a la brevedad posible. Gracias por tu paciencia.');
            } else {
                await context.sendActivity('Hubo un problema al enviar tu consulta. Por favor, intenta de nuevo más tarde o contacta directamente a RRHH.');
            }
            // --- FIN CAMBIOS ---

            conversationData.awaitingUserQuery = false;
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

=======
>>>>>>> 281abc1a7a45e54b171fac0472dd40fd30b1e110
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

<<<<<<< HEAD
            if (selectedOption.toLowerCase().includes('no encontré lo que buscaba')) {
                conversationData.awaitingUserQuery = true;
                await this.show(context); // Mostrará el mensaje directo y esperará la consulta
                return true;
            }

=======
>>>>>>> 281abc1a7a45e54b171fac0472dd40fd30b1e110
            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true;
                return true;
            }
        }
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
            return true;
        }
<<<<<<< HEAD
        else if (lower.includes('no encontré lo que buscaba')) {
            conversationData.awaitingUserQuery = true;
            await this.show(context); // Mostrará el mensaje directo y esperará la consulta
            return true;
        }
=======
>>>>>>> 281abc1a7a45e54b171fac0472dd40fd30b1e110

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

module.exports = ConsultasGeneralesMenu;