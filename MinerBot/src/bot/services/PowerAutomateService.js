// src/bot/services/PowerAutomateService.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

class PowerAutomateService {
    constructor() {
        this.queryFlowUrl = process.env.POWER_AUTOMATE_QUERY_FLOW_URL;
        this.courseFlowUrl = process.env.POWER_AUTOMATE_COURSE_FLOW_URL;
        this.complaintFlowUrl = process.env.POWER_AUTOMATE_COMPLAINT_FLOW_URL; // ¡AÑADIDO!

        // Logs de depuración para verificar URLs al inicio
        console.log('🤖 PowerAutomateService inicializado.');
        console.log('🔗 QUERY_FLOW_URL:', this.queryFlowUrl ? 'CONFIGURADA' : 'NO CONFIGURADA');
        console.log('🔗 COURSE_FLOW_URL:', this.courseFlowUrl ? 'CONFIGURADA' : 'NO CONFIGURADA');
        console.log('🔗 COMPLAINT_FLOW_URL:', this.complaintFlowUrl ? 'CONFIGURADA' : 'NO CONFIGURADA'); // ¡AÑADIDO!
    }

    /**
     * Envía una consulta no resuelta a un flujo de Power Automate.
     * @param {object} data - Objeto con los datos a enviar (nombreEmpleado, rutEmpleado, employeeArea, employeeCargo, consultaTexto).
     * @returns {Promise<boolean>} True si el envío fue exitoso, false en caso contrario.
     */
    async sendUnresolvedQuery(data) {
        if (!this.queryFlowUrl) {
            console.error('❌ ERROR CRÍTICO: POWER_AUTOMATE_QUERY_FLOW_URL no está configurada en .env. No se puede enviar la consulta.');
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
            const response = await axios.post(this.queryFlowUrl, payload);
            console.log('✅ ÉXITO: Consulta no resuelta enviada a Power Automate. Status:', response.status);
            return true;
        } catch (error) {
            console.error('❌ ERROR al enviar la consulta no resuelta a Power Automate:', error.message);
            if (error.response) console.error('    Detalles de la respuesta de Power Automate:', error.response.data);
            else if (error.request) console.error('    No se recibió respuesta del servidor de Power Automate (error de red/timeout).');
            else console.error('    Error de configuración de la solicitud:', error.message);
            return false;
        }
    }

    /**
     * Envía una solicitud de curso a un flujo de Power Automate.
     * @param {object} data - Objeto con los datos a enviar (nombreEmpleado, rutEmpleado, employeeArea, employeeCargo, cursoSolicitado).
     * @returns {Promise<boolean>} True si el envío fue exitoso, false en caso contrario.
     */
    async sendCourseRequest(data) {
        if (!this.courseFlowUrl) {
            console.error('❌ ERROR CRÍTICO: POWER_AUTOMATE_COURSE_FLOW_URL no está configurada en .env. No se puede enviar la solicitud de curso.');
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
            const response = await axios.post(this.courseFlowUrl, payload);
            console.log('✅ ÉXITO: Solicitud de curso enviada a Power Automate. Status:', response.status);
            return true;
        } catch (error) {
            console.error('❌ ERROR al enviar la solicitud de curso a Power Automate:', error.message);
            if (error.response) console.error('    Detalles de la respuesta de Power Automate:', error.response.data);
            else if (error.request) console.error('    No se recibió respuesta del servidor de Power Automate (error de red/timeout).');
            else console.error('    Error de configuración de la solicitud:', error.message);
            return false;
        }
    }

    /**
     * Envía una denuncia anónima a un flujo de Power Automate.
     * No incluye datos de empleado para preservar el anonimato.
     * @param {string} complaintText - El texto de la denuncia.
     * @returns {Promise<boolean>} True si el envío fue exitoso, false en caso contrario.
     */
    async sendAnonymousComplaint(complaintText) { // ¡NUEVO MÉTODO AÑADIDO!
        if (!this.complaintFlowUrl) {
            console.error('❌ ERROR CRÍTICO: POWER_AUTOMATE_COMPLAINT_FLOW_URL no está configurada en .env. No se puede enviar la denuncia anónima.');
            return false;
        }

        console.log('🤖 DEBUG: Iniciando envío de denuncia anónima a Power Automate.');
        console.log('🤖 DEBUG: URL del flujo de denuncia anónima a usar:', this.complaintFlowUrl);

        const now = new Date();
        const payload = {
            textoDenuncia: complaintText || '',
            fecha: now.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
            hora: now.toLocaleTimeString('es-CL', { hourCycle: 'h23', timeZone: 'America/Santiago' })
        };
        console.log('🤖 DEBUG: Payload para denuncia anónima:', JSON.stringify(payload));

        try {
            const response = await axios.post(this.complaintFlowUrl, payload);
            console.log('✅ ÉXITO: Denuncia anónima enviada a Power Automate. Status:', response.status);
            return true;
        } catch (error) {
            console.error('❌ ERROR al enviar la denuncia anónima a Power Automate:', error.message);
            if (error.response) console.error('    Detalles de la respuesta de Power Automate:', error.response.data);
            else if (error.request) console.error('    No se recibió respuesta del servidor de Power Automate (error de red/timeout).');
            else console.error('    Error de configuración de la solicitud:', error.message);
            return false;
        }
    }
}

module.exports = PowerAutomateService;