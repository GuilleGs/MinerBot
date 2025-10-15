// src/dialogs/level1/CrecimientoDesarrolloMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

class CrecimientoDesarrolloMenu {
    constructor(bot) {
        this.bot = bot;
        this.courseOptions = [
            'Capacitación en Liderazgo Avanzado',
            'Gestión de Proyectos Mineros',
            'Seguridad Operacional y Normativas HSE',
            'Tecnologías de Data Analytics para Minería',
            'Comunicación Efectiva en Equipos Multifuncionales'
        ];
        // --- INICIO CAMBIOS: Reorganizar y renombrar opciones ---
        this.options = [
            'Programa de trainees o becas de estudio',
            'Evaluación de desempeño y retroalimentación',
            'Planes de carrera y movilidad interna',
            'Programas de Capacitación Interna 📚',
            'Solicitar Curso 🎓' // Renombrado y movido
        ];
        // --- FIN CAMBIOS ---
        this.returnOption = 'Volver';
    }

    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);

        if (conversationData.awaitingCourseSelection) {
            let courseList = 'Por favor, selecciona el número del curso que deseas solicitar:\n';
            this.courseOptions.forEach((course, index) => {
                courseList += `${index + 1}. ${course}\n`;
            });
            courseList += `\nTambién puedes escribir "${this.returnOption}" para cancelar.`;
            await context.sendActivity(courseList);
            return;
        }

        let menuText = '📚 Crecimiento y Desarrollo:\n';
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

        if (conversationData.awaitingCourseSelection) {
            if (lower === this.returnOption.toLowerCase() || lower === 'cancelar') {
                conversationData.awaitingCourseSelection = false;
                await context.sendActivity('Solicitud de curso cancelada. Volviendo al menú de Crecimiento y Desarrollo.');
                await this.show(context);
                return true;
            }

            let selectedCourse = null;
            if (!isNaN(number) && number > 0 && number <= this.courseOptions.length) {
                selectedCourse = this.courseOptions[number - 1];
            } else {
                selectedCourse = this.courseOptions.find(course => course.toLowerCase().includes(lower));
            }

            if (selectedCourse) {
                const dataToSend = {
                    nombreEmpleado: conversationData.employeeName,
                    rutEmpleado: conversationData.employeeRut,
                    employeeArea: conversationData.employeeArea,
                    employeeCargo: conversationData.employeeCargo,
                    cursoSolicitado: selectedCourse
                };

                const success = await this.bot.powerAutomateService.sendCourseRequest(dataToSend);

                if (success) {
                    await context.sendActivity(`✅ Tu solicitud para el curso "${selectedCourse}" ha sido enviada al área de Talento y Desarrollo. Te contactarán pronto con los siguientes pasos.`);
                } else {
                    await context.sendActivity('Hubo un problema al enviar tu solicitud de curso. Por favor, intenta de nuevo más tarde o contacta a Talento y Desarrollo.');
                }

                conversationData.awaitingCourseSelection = false;
                conversationData.isInInfoDisplayState = false;
                await this.show(context);
                return true;
            } else {
                await context.sendActivity('Opción de curso no reconocida. Por favor, selecciona un número válido o escribe el nombre del curso, o "volver" para cancelar.');
                return true;
            }
        }


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

            // --- INICIO CAMBIOS: Lógica para 'Solicitar Curso' ---
            // Usamos .includes() para ser más flexibles, ya que ahora podría ser por número o por texto
            if (selectedOption.toLowerCase().includes('solicitar curso')) {
                conversationData.awaitingCourseSelection = true;
                // No enviamos un mensaje de content.js aquí, el show() ya manejará el prompt de la lista de cursos
                await this.show(context); // Esto mostrará la lista de cursos disponibles
                return true;
            }
            // --- FIN CAMBIOS ---

            if (selectedOption.toLowerCase().includes('programas de capacitación interna')) {
                await bot.navigateToMenu(context, conversationData, 'programasCapacitacionInterna');
                return true;
            }

            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response);
            } else {
                // Mensaje genérico para opciones sin contenido específico en content.js (ej: opciones base del menú)
                await context.sendActivity(`Has seleccionado: "${text}" (No hay información detallada aún o es una opción de navegación).`);
            }
            conversationData.isInInfoDisplayState = true;
            return true;
        }
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
            return true;
        }
        // --- INICIO CAMBIOS: Lógica para 'Solicitar Curso' por texto ---
        else if (lower.includes('solicitar curso')) {
            conversationData.awaitingCourseSelection = true;
            await this.show(context); // Esto mostrará la lista de cursos disponibles
            return true;
        }
        // --- FIN CAMBIOS ---
        else if (lower.includes('programas de capacitación interna')) {
            await bot.navigateToMenu(context, conversationData, 'programasCapacitacionInterna');
            return true;
        }

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

module.exports = CrecimientoDesarrolloMenu;