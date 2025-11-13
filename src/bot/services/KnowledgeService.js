// src/bot/services/KnowledgeService.js

const axios = require('axios');

/**
 * Servicio para interactuar con la funcionalidad de "Respuesta a preguntas personalizada"
 * de Azure Language Service (anteriormente QnA Maker).
 *
 * Encapsula la lógica de las llamadas a la API de Azure para que el bot pueda
 * procesar preguntas en lenguaje natural y obtener respuestas de una base de conocimientos.
 */
class KnowledgeService {
    /**
     * Configura el cliente del servicio utilizando las variables de entorno para el endpoint,
     * la clave de API y los detalles del proyecto.
     */
    constructor() {
        this.endpoint = process.env.LanguageEndpointHostName;
        this.key = process.env.LanguageEndpointKey;
        this.projectName = process.env.ProjectName;
        this.deploymentName = process.env.DeploymentName;

        // Valida la configuración esencial al iniciar el servicio.
        if (!this.endpoint || !this.key || !this.projectName || !this.deploymentName) {
            console.warn('KnowledgeService: Advertencia - Faltan una o más variables de entorno para Azure Language Service. El servicio no funcionará.');
        } else {
            console.log('KnowledgeService: Inicializado y configurado correctamente.');
        }
    }

    /**
     * Envía una pregunta a la base de conocimientos y retorna la respuesta más relevante,
     * con la capacidad de filtrar por metadatos (ej: por sede).
     *
     * @param {string} question - El texto de la pregunta enviada por el usuario.
     * @param {string|number} [sedeId=null] - El ID de la sede del empleado para filtrar la respuesta. Es opcional.
     * @returns {Promise<string>} La respuesta encontrada o un mensaje de fallback estándar.
     */
    async ask(question, sedeId = null) {
        // 1. Validación de entrada
        if (!question || question.trim() === '') {
            return 'No se recibió una pregunta válida.';
        }

        // 2. Validación de configuración (salvaguarda en tiempo de ejecución)
        if (!this.endpoint || !this.key || !this.projectName || !this.deploymentName) {
            console.error('KnowledgeService: Intento de uso sin configuración completa.');
            return 'Error: El servicio de conocimiento no está configurado correctamente.';
        }

        // 3. Construcción de la solicitud a la API
        const url = `${this.endpoint}/language/:query-knowledgebases?projectName=${this.projectName}&deploymentName=${this.deploymentName}&api-version=2021-10-01`;

        const payload = {
            question,
            top: 1
        };

        // Si se proporciona un sedeId, se añade el filtro de metadatos a la solicitud.
        // Esto le indica a Azure que solo considere las respuestas que tengan la etiqueta 'sede'
        // con el valor correspondiente.
        if (sedeId) {
            payload.filters = {
                metadataFilter: {
                    logicalOperation: 'AND',
                    filters: [
                        { key: 'sede', value: String(sedeId) }
                    ]
                }
            };
        }

        try {
            // 4. Ejecución de la llamada a la API
            const response = await axios.post(
                url,
                payload,
                { headers: { 'Ocp-Apim-Subscription-Key': this.key, 'Content-Type': 'application/json' } }
            );

            // 5. Procesamiento de la respuesta
            if (response.data.answers && response.data.answers.length > 0) {
                return response.data.answers[0].answer;
            }

            // Mensaje de fallback estándar si no se encontraron respuestas.
            return 'No encontré una respuesta en la base de conocimientos.';
        } catch (error) {
            // 6. Manejo de errores
            console.error('KnowledgeService: Error al consultar la base de conocimientos:', error.response?.data || error.message);
            return 'Lo siento, hubo un problema al consultar mi base de conocimientos en este momento.';
        }
    }
}

module.exports = KnowledgeService;