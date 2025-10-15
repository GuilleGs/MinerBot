// src/bot/services/PowerAutomateService.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

class PowerAutomateService {
    constructor() {
        this.queryFlowUrl = process.env.POWER_AUTOMATE_QUERY_FLOW_URL;
        this.courseFlowUrl = process.env.POWER_AUTOMATE_COURSE_FLOW_URL; // Para futuras integraciones
        this.complaintFlowUrl = process.env.POWER_AUTOMATE_COMPLAINT_FLOW_URL; // Para futuras integraciones
    }

    /**
     * Envía una consulta no resuelta a un flujo de Power Automate.
     * Incluye datos del empleado (si existen) y la consulta.
     * @param {object} data - Objeto con los datos a enviar. Puede incluir nombreEmpleado, rutEmpleado, employeeArea, employeeCargo, consultaTexto.
     * @returns {Promise<boolean>} True si el envío fue exitoso, false en caso contrario.
     */
    async sendUnresolvedQuery(data) {
        if (!this.queryFlowUrl) {
            console.error('❌ POWER_AUTOMATE_QUERY_FLOW_URL no está configurada.');
            return false;
        }

        const now = new Date();
        const payload = {};

        // Recolectar datos y añadirlos al payload si existen
        if (data.nombreEmpleado) payload.nombreEmpleado = data.nombreEmpleado;
        if (data.rutEmpleado) payload.rutEmpleado = data.rutEmpleado;
        if (data.employeeArea) payload.employeeArea = data.employeeArea; // AÑADIDO
        if (data.employeeCargo) payload.employeeCargo = data.employeeCargo; // AÑADIDO
        if (data.consultaTexto) payload.consultaTexto = data.consultaTexto;

        payload.fecha = now.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' });
        payload.hora = now.toLocaleTimeString('es-CL', { hourCycle: 'h23', timeZone: 'America/Santiago' });

        try {
            await axios.post(this.queryFlowUrl, payload);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar la consulta no resuelta a Power Automate:', error.response?.data || error.message);
            return false;
        }
    }

    // --- Futuras funciones para otros flujos de Power Automate ---
    // async sendCourseRequest(data) { ... }
    // async sendAnonymousComplaint(data) { ... }
}

module.exports = PowerAutomateService; 