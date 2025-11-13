// src/bot/services/PowerAutomateService.js

const axios = require('axios');

/**
 * Servicio centralizado para interactuar con flujos de Microsoft Power Automate.
 * Abstrae la lógica de las llamadas HTTP a los endpoints de los flujos,
 * proporcionando métodos específicos para cada acción del bot.
 */
class PowerAutomateService {
    /**
     * Carga y verifica las URLs de los flujos de Power Automate desde las variables de entorno.
     */
    constructor() {
        this.flowUrls = {
            unresolvedQuery: process.env.POWER_AUTOMATE_QUERY_FLOW_URL,
            courseRequest: process.env.POWER_AUTOMATE_COURSE_FLOW_URL,
            anonymousComplaint: process.env.POWER_AUTOMATE_COMPLAINT_FLOW_URL,
            qnaLog: process.env.POWER_AUTOMATE_QNA_LOG_FLOW_URL
        };

        console.log('PowerAutomateService: Inicializado. Verificando configuraciones de flujos...');
        for (const [key, url] of Object.entries(this.flowUrls)) {
            console.log(`  - ${key}: ${url ? 'CONFIGURADA' : 'NO CONFIGURADA'}`);
        }
    }

    /**
     * Envía una consulta no resuelta a Power Automate para su escalamiento.
     * @param {object} data - Datos de la consulta, incluyendo nombre, RUT y texto de la consulta.
     * @returns {Promise<boolean>} `true` si la solicitud fue enviada con éxito, `false` en caso contrario.
     */
    async sendUnresolvedQuery(data) {
        const payload = {
            nombreEmpleado: data.nombreEmpleado || '',
            rutEmpleado: data.rutEmpleado || '',
            employeeArea: data.employeeArea || '',
            employeeCargo: data.employeeCargo || '',
            consultaTexto: data.consultaTexto || ''
        };
        return this._sendToFlow('unresolvedQuery', payload);
    }

    /**
     * Envía una solicitud de curso a Power Automate.
     * @param {object} data - Datos de la solicitud, incluyendo el nombre del curso.
     * @returns {Promise<boolean>} `true` si la solicitud fue enviada con éxito, `false` en caso contrario.
     */
    async sendCourseRequest(data) {
        const payload = {
            nombreEmpleado: data.nombreEmpleado || '',
            rutEmpleado: data.rutEmpleado || '',
            employeeArea: data.employeeArea || '',
            employeeCargo: data.employeeCargo || '',
            cursoSolicitado: data.cursoSolicitado || ''
        };
        return this._sendToFlow('courseRequest', payload);
    }

    /**
     * Envía una denuncia anónima a Power Automate.
     * @param {string} complaintText - El texto de la denuncia.
     * @returns {Promise<boolean>} `true` si la solicitud fue enviada con éxito, `false` en caso contrario.
     */
    async sendAnonymousComplaint(complaintText) {
        const payload = {
            textoDenuncia: complaintText || ''
        };
        return this._sendToFlow('anonymousComplaint', payload);
    }

    /**
     * Envía los detalles de una interacción de QnA a un flujo de Power Automate para su registro.
     * Este método no retorna un valor de éxito o fracaso, ya que es una operación de "disparar y olvidar".
     * @param {object} data - Datos de la interacción (consulta, respuesta, sede, etc.).
     * @returns {Promise<void>}
     */
    async logQnaQuery(data) {
        const payload = {
            sede: data.sede || 'No autenticado',
            area: data.area || 'No autenticado',
            consulta: data.consulta || '',
            respuesta: data.respuesta || ''
        };
        // Para el logging, no necesitamos el valor de retorno, por lo que no es necesario un `return`.
        await this._sendToFlow('qnaLog', payload, { isFireAndForget: true });
    }

    /**
     * Método genérico y privado para enviar datos a un flujo de Power Automate.
     * Centraliza la validación, construcción del payload, llamada HTTP y manejo de errores.
     * @private
     * @param {string} flowKey - La clave del flujo a invocar (ej: 'unresolvedQuery').
     * @param {object} customPayload - Los datos específicos de la solicitud.
     * @param {object} [options={}] - Opciones adicionales, como `isFireAndForget`.
     * @returns {Promise<boolean>} `true` si tiene éxito, `false` si falla (a menos que `isFireAndForget` sea `true`).
     */
    async _sendToFlow(flowKey, customPayload, options = {}) {
        const url = this.flowUrls[flowKey];

        if (!url) {
            // Si es una operación de "disparar y olvidar", solo advertimos. Si no, es un error crítico.
            const logMethod = options.isFireAndForget ? console.warn : console.error;
            logMethod(`PowerAutomateService: URL para el flujo '${flowKey}' no configurada.`);
            return options.isFireAndForget ? undefined : false;
        }

        const now = new Date();
        const fullPayload = {
            ...customPayload,
            fecha: now.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
            hora: now.toLocaleTimeString('es-CL', { hourCycle: 'h23', timeZone: 'America/Santiago' })
        };

        try {
            await axios.post(url, fullPayload);
            console.log(`PowerAutomateService: Datos enviados con éxito al flujo '${flowKey}'.`);
            return options.isFireAndForget ? undefined : true;
        } catch (error) {
            console.error(`PowerAutomateService: Error al enviar datos al flujo '${flowKey}':`, error.message);
            if (error.response) {
                console.error('  - Detalles de la respuesta de Power Automate:', error.response.data);
                console.error('  - Código de estado:', error.response.status);
            }
            return options.isFireAndForget ? undefined : false;
        }
    }
}

module.exports = PowerAutomateService;