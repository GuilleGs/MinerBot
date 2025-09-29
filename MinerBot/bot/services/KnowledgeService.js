// bot/services/KnowledgeService.js
const axios = require('axios');

class KnowledgeService {
    constructor() {
        this.endpoint = process.env.LanguageEndpointHostName;
        this.key = process.env.LanguageEndpointKey;
        this.projectName = process.env.ProjectName;
        this.deploymentName = process.env.DeploymentName;
    }

    async ask(question) {
        if (!question || question.trim() === '') return 'No se recibió pregunta válida.';
        const url = `${this.endpoint}/language/:query-knowledgebases?projectName=${this.projectName}&deploymentName=${this.deploymentName}&api-version=2021-10-01`;

        try {
            const response = await axios.post(
                url,
                { question, top: 1 },
                { headers: { 'Ocp-Apim-Subscription-Key': this.key, 'Content-Type': 'application/json' } }
            );

            if (response.data.answers && response.data.answers.length > 0) {
                return response.data.answers[0].answer;
            }
            return 'No encontré una respuesta en la KB.';
        } catch (error) {
            console.error('❌ Error consultando la KB:', error.response?.data || error.message);
            return 'Error al consultar la base de conocimientos.';
        }
    }
}

module.exports = KnowledgeService;
