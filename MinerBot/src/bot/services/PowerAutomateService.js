// src/bot/services/PowerAutomateService.js
const axios = require('axios'); // Módulo para realizar solicitudes HTTP.
//const dotenv = require('dotenv'); // Módulo para cargar variables de entorno.
//dotenv.config({ quiet: true }); // Carga las variables de entorno definidas en el archivo .env.

/**
 * Servicio centralizado para interactuar con los flujos de Power Automate.
 * Facilita al bot el envío de datos a diferentes flujos para automatizar tareas,
 * como guardar información en SharePoint/Excel o enviar notificaciones por correo.
 */
class PowerAutomateService {
    /**
     * Configura el servicio cargando las URLs de los diferentes flujos de Power Automate desde las variables de entorno.
     */
    constructor() {
        this.queryFlowUrl = process.env.POWER_AUTOMATE_QUERY_FLOW_URL;
        this.courseFlowUrl = process.env.POWER_AUTOMATE_COURSE_FLOW_URL;
        this.complaintFlowUrl = process.env.POWER_AUTOMATE_COMPLAINT_FLOW_URL;

        // Logs de consola para verificar la configuración de las URLs de Power Automate al inicio del bot.
        // Estos mensajes son clave para la depuración inicial en diferentes entornos.
        console.log('PowerAutomateService: Inicializado. Verificando configuraciones de flujos:');
        console.log('  - Consulta No Resuelta URL:', this.queryFlowUrl ? 'CONFIGURADA' : 'NO CONFIGURADA');
        console.log('  - Solicitud de Curso URL:', this.courseFlowUrl ? 'CONFIGURADA' : 'NO CONFIGURADA');
        console.log('  - Denuncia Anónima URL:', this.complaintFlowUrl ? 'CONFIGURADA' : 'NO CONFIGURADA');
    }

    /**
     * Envía una consulta no resuelta a su flujo de Power Automate correspondiente.
     * Incluye datos del empleado (nombre, RUT, área, cargo) y el texto de la consulta.
     * @param {object} data - Objeto con los datos a enviar.
     * @param {string} data.nombreEmpleado - Nombre completo del empleado.
     * @param {string} data.rutEmpleado - RUT del empleado.
     * @param {string} data.employeeArea - Área del empleado.
     * @param {string} data.employeeCargo - Cargo del empleado.
     * @param {string} data.consultaTexto - Texto de la consulta del empleado.
     * @returns {Promise<boolean>} Retorna true si el envío fue exitoso, false en caso de error o configuración incompleta.
     */
    async sendUnresolvedQuery(data) {
        // Verifica si la URL del flujo está configurada antes de intentar enviar.
        if (!this.queryFlowUrl) {
            console.error('PowerAutomateService: Error crítico: POWER_AUTOMATE_QUERY_FLOW_URL no configurada. No se pudo enviar la consulta no resuelta.');
            return false;
        }

        const now = new Date();
        const payload = {
            // Se construyen los datos a enviar al flujo, asegurando que todos los campos sean strings.
            // Los campos ausentes en 'data' se envían como cadenas vacías.
            nombreEmpleado: data.nombreEmpleado || '',
            rutEmpleado: data.rutEmpleado || '',
            employeeArea: data.employeeArea || '',
            employeeCargo: data.employeeCargo || '',
            consultaTexto: data.consultaTexto || '',
            fecha: now.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }), // Formato de fecha chileno.
            hora: now.toLocaleTimeString('es-CL', { hourCycle: 'h23', timeZone: 'America/Santiago' }) // Formato de hora 24h chileno.
        };

        try {
            // Realiza la solicitud HTTP POST al flujo de Power Automate.
            const response = await axios.post(this.queryFlowUrl, payload);
            console.log('PowerAutomateService: Consulta no resuelta enviada a Power Automate. Estado:', response.status);
            return true;
        } catch (error) {
            // Captura y registra los errores durante la comunicación con Power Automate.
            console.error('PowerAutomateService: Error al enviar la consulta no resuelta:', error.message);
            if (error.response) { // Error de respuesta del servidor (código 4xx/5xx).
                console.error('  Detalles de la respuesta de Power Automate:', error.response.data);
                console.error('  Código de estado:', error.response.status);
            } else if (error.request) { // La solicitud fue hecha, pero no se recibió respuesta (ej. problema de red).
                console.error('  No se recibió respuesta del servidor de Power Automate. Posible problema de red o timeout.');
            } else { // Otros errores (ej. configuración de la solicitud).
                console.error('  Error en la configuración de la solicitud:', error.message);
            }
            return false;
        }
    }

    /**
     * Envía una solicitud de curso a su flujo de Power Automate correspondiente.
     * Incluye datos del empleado (nombre, RUT, área, cargo) y el curso solicitado.
     * @param {object} data - Objeto con los datos a enviar.
     * @param {string} data.nombreEmpleado - Nombre completo del empleado.
     * @param {string} data.rutEmpleado - RUT del empleado.
     * @param {string} data.employeeArea - Área del empleado.
     * @param {string} data.employeeCargo - Cargo del empleado.
     * @param {string} data.cursoSolicitado - Nombre del curso solicitado.
     * @returns {Promise<boolean>} Retorna true si el envío fue exitoso, false en caso de error o configuración incompleta.
     */
    async sendCourseRequest(data) {
        // Verifica si la URL del flujo está configurada.
        if (!this.courseFlowUrl) {
            console.error('PowerAutomateService: Error crítico: POWER_AUTOMATE_COURSE_FLOW_URL no configurada. No se pudo enviar la solicitud de curso.');
            return false;
        }

        const now = new Date();
        const payload = {
            // Construye el payload para la solicitud de curso.
            nombreEmpleado: data.nombreEmpleado || '',
            rutEmpleado: data.rutEmpleado || '',
            employeeArea: data.employeeArea || '',
            employeeCargo: data.employeeCargo || '',
            cursoSolicitado: data.cursoSolicitado || '',
            fechaSolicitud: now.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
            horaSolicitud: now.toLocaleTimeString('es-CL', { hourCycle: 'h23', timeZone: 'America/Santiago' })
        };

        try {
            // Realiza la solicitud HTTP POST al flujo de Power Automate.
            const response = await axios.post(this.courseFlowUrl, payload);
            console.log('PowerAutomateService: Solicitud de curso enviada a Power Automate. Estado:', response.status);
            return true;
        } catch (error) {
            // Captura y registra los errores durante la comunicación con Power Automate.
            console.error('PowerAutomateService: Error al enviar la solicitud de curso:', error.message);
            if (error.response) {
                console.error('  Detalles de la respuesta de Power Automate:', error.response.data);
                console.error('  Código de estado:', error.response.status);
            } else if (error.request) {
                console.error('  No se recibió respuesta del servidor de Power Automate. Posible problema de red o timeout.');
            } else {
                console.error('  Error en la configuración de la solicitud:', error.message);
            }
            return false;
        }
    }

    /**
     * Envía una denuncia anónima a su flujo de Power Automate correspondiente.
     * Este método garantiza el anonimato al no incluir ningún dato de identificación del empleado.
     * @param {string} complaintText - El texto de la denuncia proporcionado por el usuario.
     * @returns {Promise<boolean>} Retorna true si el envío fue exitoso, false en caso de error o configuración incompleta.
     */
    async sendAnonymousComplaint(complaintText) {
        // Verifica si la URL del flujo está configurada.
        if (!this.complaintFlowUrl) {
            console.error('PowerAutomateService: Error crítico: POWER_AUTOMATE_COMPLAINT_FLOW_URL no configurada. No se pudo enviar la denuncia anónima.');
            return false;
        }

        const now = new Date();
        const payload = {
            // Construye el payload para la denuncia anónima, incluyendo solo el texto y la marca de tiempo.
            textoDenuncia: complaintText || '',
            fecha: now.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
            hora: now.toLocaleTimeString('es-CL', { hourCycle: 'h23', timeZone: 'America/Santiago' })
        };

        try {
            // Realiza la solicitud HTTP POST al flujo de Power Automate.
            const response = await axios.post(this.complaintFlowUrl, payload);
            console.log('PowerAutomateService: Denuncia anónima enviada a Power Automate. Estado:', response.status);
            return true;
        } catch (error) {
            // Captura y registra los errores durante la comunicación con Power Automate.
            console.error('PowerAutomateService: Error al enviar la denuncia anónima:', error.message);
            if (error.response) {
                console.error('  Detalles de la respuesta de Power Automate:', error.response.data);
                console.error('  Código de estado:', error.response.status);
            } else if (error.request) {
                console.error('  No se recibió respuesta del servidor de Power Automate. Posible problema de red o timeout.');
            } else {
                console.error('  Error en la configuración de la solicitud:', error.message);
            }
            return false;
        }
    }
}

module.exports = PowerAutomateService;