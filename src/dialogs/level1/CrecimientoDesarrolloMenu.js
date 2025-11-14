// src/dialogs/level1/CrecimientoDesarrolloMenu.js

const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

/**
 * Diálogo que gestiona el menú de "Crecimiento y Desarrollo".
 * Este diálogo multifuncional permite:
 * 1. Proporcionar información sobre planes de carrera y desarrollo.
 * 2. Navegar al sub-menú de capacitaciones internas.
 * 3. Gestionar un flujo interactivo para que el usuario solicite un curso.
 */
class CrecimientoDesarrolloMenu {
    /**
     * Inicializa el diálogo con las opciones de menú y la lista de cursos disponibles.
     * @param {object} bot - Instancia del bot principal para acceso a servicios y estados de conversación.
     */
    constructor(bot) {
        this.bot = bot;
        this.courseOptions = [
            'Capacitación en Liderazgo Avanzado',
            'Gestión de Proyectos Mineros',
            'Seguridad Operacional y Normativas HSE',
            'Tecnologías de Data Analytics para Minería',
            'Comunicación Efectiva en Equipos Multifuncionales'
        ];
        this.options = [
            'Programa de trainees o becas de estudio',
            'Evaluación de desempeño y retroalimentación',
            'Planes de carrera y movilidad interna',
            'Solicitar Curso'
        ];
        this.returnOption = 'Volver';
        
        // No hay navegación a un sub-menú de "Programas de Capacitación Interna".
        this.navigationMap = {};
    }

    /**
     * Muestra la vista correcta al usuario, ya sea el menú principal o la lista de cursos.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);

        if (conversationData.awaitingCourseSelection) {
            const courseOptionsText = this.courseOptions.map((course, index) => `${index + 1}. ${course}`);
            const text = [
                'Por favor, selecciona el número del curso que deseas solicitar:',
                ...courseOptionsText,
                `\nTambién puedes escribir "${this.returnOption}" para cancelar.`
            ].join('\n');
            await context.sendActivity(text);
        } else {
            const menuOptions = this.options.map((option, index) => `${index + 1}. ${option}`);
            menuOptions.push(`${this.options.length + 1}. ${this.returnOption}`);
            const menuText = [
                'Crecimiento y Desarrollo:',
                ...menuOptions,
                '\nPor favor, escribe el número o el nombre de la opción.'
            ].join('\n');
            await context.sendActivity(menuText);
        }
    }

    /**
     * Procesa la entrada del usuario, delegando a un método especializado si se está solicitando un curso.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - El mensaje enviado por el usuario.
     * @param {object} conversationData - El estado de la conversación.
     * @param {object} bot - La instancia principal del bot.
     * @returns {Promise<boolean>} `true` si la entrada fue manejada, `false` en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        // Flujo prioritario: si estamos en el modo de "selección de curso".
        if (conversationData.awaitingCourseSelection) {
            return await this._handleCourseSelection(context, text, conversationData, bot);
        }

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

            if (selectedOptionLower.includes('solicitar curso')) {
                conversationData.awaitingCourseSelection = true;
                await this.show(context);
                return true;
            }

            let response = content[selectedOptionLower];
            if (response) {
                // Si el contenido es un objeto (p.ej. por sede), seleccionar la variante apropiada.
                if (typeof response === 'object' && response !== null) {
                    const sedeKey = conversationData && conversationData.employeeSedeId ? String(conversationData.employeeSedeId) : 'default';
                    response = response[sedeKey] || response.default || Object.values(response)[0];
                }
                if (response) {
                    await context.sendActivity(response);
                    conversationData.isInInfoDisplayState = true;
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Maneja el flujo interactivo de selección y solicitud de un curso.
     * Este método es llamado cuando `conversationData.awaitingCourseSelection` es true.
     * @private
     */
    async _handleCourseSelection(context, text, conversationData, bot) {
        const lowerText = text.toLowerCase().trim();
        const number = parseInt(lowerText, 10);

        if (lowerText === this.returnOption.toLowerCase() || lowerText === 'cancelar') {
            conversationData.awaitingCourseSelection = false;
            await context.sendActivity('Solicitud de curso cancelada. Volviendo al menú de Crecimiento y Desarrollo.');
            await this.show(context);
            return true;
        }

        let selectedCourse = null;
        if (!isNaN(number) && number > 0 && number <= this.courseOptions.length) {
            selectedCourse = this.courseOptions[number - 1];
        } else {
            selectedCourse = this.courseOptions.find(course => course.toLowerCase().includes(lowerText));
        }

        if (selectedCourse) {
            const dataToSend = {
                nombreEmpleado: conversationData.employeeName,
                rutEmpleado: conversationData.employeeRut,
                employeeArea: conversationData.employeeArea,
                employeeCargo: conversationData.employeeCargo,
                cursoSolicitado: selectedCourse
            };

            const success = await bot.powerAutomateService.sendCourseRequest(dataToSend);

            if (success) {
                await context.sendActivity(`Su solicitud para el curso "${selectedCourse}" ha sido enviada al área de Talento y Desarrollo. Le contactarán pronto.`);
            } else {
                await context.sendActivity('Hubo un problema al enviar su solicitud de curso. Por favor, intente de nuevo más tarde.');
            }

            conversationData.awaitingCourseSelection = false;
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        } else {
            await context.sendActivity('Opción de curso no reconocida. Por favor, seleccione un número válido o escriba "volver" para cancelar.');
            return true;
        }
    }
}

module.exports = CrecimientoDesarrolloMenu;