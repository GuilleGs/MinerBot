// src/bot/services/PowerAutomateService.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

class PowerAutomateService {
    constructor() {
        this.queryFlowUrl = process.env.POWER_AUTOMATE_QUERY_FLOW_URL;
        this.courseFlowUrl = process.env.POWER_AUTOMATE_COURSE_FLOW_URL; // Para la solicitud de cursos
        this.complaintFlowUrl = process.env.POWER_AUTOMATE_COMPLAINT_FLOW_URL; // Para futuras integraciones
    }

    /**
     * Envía una consulta no resuelta a un flujo de Power Automate.
     * Incluye datos del empleado (si existen) y la consulta.
     * @param {object} data - Objeto con los datos a enviar.
     * @returns {Promise<boolean>} True si el envío fue exitoso, false en caso contrario.
     */
    async sendUnresolvedQuery(data) {
        if (!this.queryFlowUrl) {
            console.error('❌ POWER_AUTOMATE_QUERY_FLOW_URL no está configurada.');
            return false;
        }

        const now = new Date();
        const payload = {
            nombreEmpleado: data.nombreEmpleado || '',
            rutEmpleado: data.rutEmpleado || '',
            employeeArea: data.employeeArea || '',
            employeeCargo: data.employeeCargo || '',
            consultaTexto: data.consultaTexto || '',
            fecha: now.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
            hora: now.toLocaleTimeString('es-CL', { hourCycle: 'h23', timeZone: 'America/Santiago' })
        };

        try {
            await axios.post(this.queryFlowUrl, payload);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar la consulta no resuelta a Power Automate:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Envía una solicitud de curso a un flujo de Power Automate.
     * @param {object} data - Objeto con los datos a enviar (nombreEmpleado, rutEmpleado, employeeArea, employeeCargo, cursoSolicitado).
     * @returns {Promise<boolean>} True si el envío fue exitoso, false en caso contrario.
     */
    async sendCourseRequest(data) { // ¡NUEVO MÉTODO!
        if (!this.courseFlowUrl) {
            console.error('❌ POWER_AUTOMATE_COURSE_FLOW_URL no está configurada.');
            return false;
        }

        const now = new Date();
        const payload = {
            nombreEmpleado: data.nombreEmpleado || '',
            rutEmpleado: data.rutEmpleado || '',
            employeeArea: data.employeeArea || '',
            employeeCargo: data.employeeCargo || '',
            cursoSolicitado: data.cursoSolicitado || '',
            fechaSolicitud: now.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
            horaSolicitud: now.toLocaleTimeString('es-CL', { hourCycle: 'h23', timeZone: 'America/Santiago' })
        };

        try {
            await axios.post(this.courseFlowUrl, payload);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar la solicitud de curso a Power Automate:', error.response?.data || error.message);
            return false;
        }
    }

    // async sendAnonymousComplaint(data) { ... }
}

module.exports = PowerAutomateService;