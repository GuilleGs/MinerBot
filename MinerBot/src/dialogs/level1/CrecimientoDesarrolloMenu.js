// src/dialogs/level1/CrecimientoDesarrolloMenu.js
const { MessageFactory } = require('botbuilder'); // Módulo para crear mensajes del bot.
const content = require('../data/content'); // Importa el contenido estático para las respuestas del bot.

/**
 * Diálogo que gestiona el menú de "Crecimiento y Desarrollo".
 * Ofrece opciones relacionadas con el desarrollo profesional y capacitaciones,
 * e incluye un flujo para solicitar cursos a través de Power Automate.
 */
class CrecimientoDesarrolloMenu {
    /**
     * Inicializa el diálogo con las opciones de cursos, las opciones de menú y la referencia al bot principal.
     * @param {object} bot - Instancia del bot principal para acceso a servicios y estados de conversación.
     */
    constructor(bot) {
        this.bot = bot;
        // Define las opciones de cursos disponibles para ser solicitados.
        this.courseOptions = [
            'Capacitación en Liderazgo Avanzado',
            'Gestión de Proyectos Mineros',
            'Seguridad Operacional y Normativas HSE',
            'Tecnologías de Data Analytics para Minería',
            'Comunicación Efectiva en Equipos Multifuncionales'
        ];
        // Define las opciones principales de este menú.
        this.options = [
            'Programa de trainees o becas de estudio',
            'Evaluación de desempeño y retroalimentación',
            'Planes de carrera y movilidad interna',
            'Programas de Capacitación Interna', 
            'Solicitar Curso'                     
        ];
        this.returnOption = 'Volver'; // Opción estándar para regresar al menú anterior.
    }

    /**
     * Muestra el menú de "Crecimiento y Desarrollo" o la lista de cursos si el bot está esperando una selección.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);

        // Si el bot está esperando que el usuario seleccione un curso, muestra la lista de cursos disponibles.
        if (conversationData.awaitingCourseSelection) {
            let courseList = 'Por favor, selecciona el número del curso que deseas solicitar:\n';
            this.courseOptions.forEach((course, index) => {
                courseList += `${index + 1}. ${course}\n`;
            });
            courseList += `\nTambién puedes escribir "${this.returnOption}" para cancelar.`;
            await context.sendActivity(courseList);
            return;
        }

        // Si no está esperando una selección de curso, construye y envía el menú normal.
        let menuText = 'Crecimiento y Desarrollo:\n'; 
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += `${this.options.length + 1}. ${this.returnOption}\n`;
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText);
    }

    /**
     * Procesa la entrada del usuario para este menú.
     * Maneja la selección de cursos, el envío de solicitudes a Power Automate, la navegación y la visualización de información.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - Texto del mensaje enviado por el usuario.
     * @param {object} conversationData - Objeto que contiene el estado de la conversación.
     * @param {object} bot - Instancia del bot principal para funciones de servicio y navegación.
     * @returns {Promise<boolean>} Retorna true si la entrada fue manejada por este diálogo, false en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase(); // Convierte la entrada a minúsculas.
        const number = parseInt(text.trim()); // Intenta parsear la entrada como número.

        // Lógica principal: Gestiona la entrada si el bot está esperando la selección de un curso.
        if (conversationData.awaitingCourseSelection) {
            // Permite al usuario cancelar la solicitud de curso.
            if (lower === this.returnOption.toLowerCase() || lower === 'cancelar') {
                conversationData.awaitingCourseSelection = false; // Desactiva el estado de espera.
                await context.sendActivity('Solicitud de curso cancelada. Volviendo al menú de Crecimiento y Desarrollo.');
                await this.show(context); // Muestra el menú nuevamente.
                return true;
            }

            let selectedCourse = null;
            // Intenta identificar el curso seleccionado por número o por texto.
            if (!isNaN(number) && number > 0 && number <= this.courseOptions.length) {
                selectedCourse = this.courseOptions[number - 1];
            } else {
                selectedCourse = this.courseOptions.find(course => course.toLowerCase().includes(lower));
            }

            if (selectedCourse) {
                // Recopila los datos del empleado del estado de la conversación y el curso seleccionado.
                const dataToSend = {
                    nombreEmpleado: conversationData.employeeName,
                    rutEmpleado: conversationData.employeeRut,
                    employeeArea: conversationData.employeeArea,
                    employeeCargo: conversationData.employeeCargo,
                    cursoSolicitado: selectedCourse
                };

                // Envía la solicitud de curso al flujo de Power Automate a través del servicio centralizado.
                const success = await this.bot.powerAutomateService.sendCourseRequest(dataToSend);

                // Responde al usuario según el resultado del envío a Power Automate.
                if (success) {
                    await context.sendActivity(`Su solicitud para el curso "${selectedCourse}" ha sido enviada al área de Talento y Desarrollo. Le contactarán pronto con los siguientes pasos.`); 
                } else {
                    await context.sendActivity('Hubo un problema al enviar su solicitud de curso. Por favor, intente de nuevo más tarde o contacte a Talento y Desarrollo.');
                }

                conversationData.awaitingCourseSelection = false; // Desactiva el estado de espera.
                conversationData.isInInfoDisplayState = false; // Sale del estado de visualización de información.
                await this.show(context); // Vuelve a mostrar el menú general de Crecimiento y Desarrollo.
                return true;
            } else {
                await context.sendActivity('Opción de curso no reconocida. Por favor, seleccione un número válido o escriba el nombre del curso, o "volver" para cancelar.');
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

            // Si la opción es "Solicitar Curso", activa el flujo de selección de curso.
            if (selectedOption.toLowerCase().includes('solicitar curso')) {
                conversationData.awaitingCourseSelection = true; // Activa el estado de espera.
                await this.show(context); // Muestra la lista de cursos disponibles.
                return true;
            }

            // Si la opción es "Programas de Capacitación Interna", navega a ese sub-menú.
            if (selectedOption.toLowerCase().includes('programas de capacitación interna')) {
                await bot.navigateToMenu(context, conversationData, 'programasCapacitacionInterna');
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
        // Procesa la entrada si es el texto "Solicitar Curso".
        else if (lower.includes('solicitar curso')) {
            conversationData.awaitingCourseSelection = true; // Activa el estado de espera.
            await this.show(context); // Muestra la lista de cursos disponibles.
            return true;
        }
        // Procesa la entrada si es el texto "Programas de Capacitación Interna".
        else if (lower.includes('programas de capacitación interna')) {
            await bot.navigateToMenu(context, conversationData, 'programasCapacitacionInterna');
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

module.exports = CrecimientoDesarrolloMenu;