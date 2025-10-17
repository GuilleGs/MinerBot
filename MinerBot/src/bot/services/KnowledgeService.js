// src/bot/services/KnowledgeService.js
const axios = require('axios'); // Módulo para realizar solicitudes HTTP.
//const dotenv = require('dotenv'); // Módulo para cargar variables de entorno.
//dotenv.config({ quiet: true }); // Carga las variables de entorno definidas en el archivo .env.

/**
 * Servicio para interactuar con Azure Language Service, específicamente con la funcionalidad de Custom Question Answering (QnA Maker).
 * Permite al bot procesar preguntas en lenguaje natural del usuario y obtener respuestas de una base de conocimientos configurada.
 */
class KnowledgeService {
    /**
     * Configura el servicio utilizando las variables de entorno para el endpoint, clave y detalles del proyecto de Language Service.
     */
    constructor() {
        this.endpoint = process.env.LanguageEndpointHostName;
        this.key = process.env.LanguageEndpointKey;
        this.projectName = process.env.ProjectName;
        this.deploymentName = process.env.DeploymentName;

        // Log de consola para verificar que la configuración básica esté presente al inicio del bot.
        console.log('KnowledgeService: Inicializado. Verificando configuración de Azure Language Service:');
        console.log('  Endpoint:', this.endpoint ? 'CONFIGURADO' : 'NO CONFIGURADO');
        console.log('  ProjectName:', this.projectName ? 'CONFIGURADO' : 'NO CONFIGURADO');
        console.log('  DeploymentName:', this.deploymentName ? 'CONFIGURADO' : 'NO CONFIGURADO');
        // La clave de suscripción (this.key) no se registra por seguridad.
    }

    /**
     * Envía una pregunta a la base de conocimientos de Azure Language Service y retorna la respuesta más relevante.
     * @param {string} question - El texto de la pregunta enviada por el usuario.
     * @returns {Promise<string>} La respuesta encontrada en la base de conocimientos o un mensaje indicando que no se encontró una respuesta.
     */
    async ask(question) {
        // Valida que la pregunta no esté vacía.
        if (!question || question.trim() === '') {
            return 'No se recibió pregunta válida.';
        }

        // Verifica que todas las configuraciones necesarias para la API estén presentes.
        if (!this.endpoint || !this.key || !this.projectName || !this.deploymentName) {
            console.error('KnowledgeService: Error de configuración. Faltan variables de entorno para Azure Language Service.');
            return 'Error al consultar la base de conocimientos debido a configuración incompleta.';
        }

        // Construye la URL para la llamada a la API de Custom Question Answering.
        const url = `${this.endpoint}/language/:query-knowledgebases?projectName=${this.projectName}&deploymentName=${this.deploymentName}&api-version=2021-10-01`;

        try {
            // Realiza la solicitud HTTP POST a Azure Language Service.
            // Solicita solo la respuesta principal (top: 1) y utiliza la clave de suscripción para autenticación.
            const response = await axios.post(
                url,
                { question, top: 1 },
                { headers: { 'Ocp-Apim-Subscription-Key': this.key, 'Content-Type': 'application/json' } }
            );

            // Procesa la respuesta para extraer la mejor contestación.
            if (response.data.answers && response.data.answers.length > 0) {
                return response.data.answers[0].answer;
            }
            return 'No encontré una respuesta en la base de conocimientos.'; // Mensaje si no hay respuestas válidas.
        } catch (error) {
            // Registra los errores de la consulta a la API de Azure Language Service.
            console.error('KnowledgeService: Error al consultar la base de conocimientos:', error.response?.data || error.message);
            return 'Error al consultar la base de conocimientos.'; // Mensaje genérico de error para el usuario.
        }
    }
}

module.exports = KnowledgeService;
