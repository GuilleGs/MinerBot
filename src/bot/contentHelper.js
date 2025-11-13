// src/bot/contentHelper.js

const content = require('../dialogs/data/content');

/**
 * Obtiene un mensaje del archivo de contenido, seleccionando la versión correcta
 * según la sede del usuario si existen múltiples variantes.
 *
 * Esta función actúa como una capa de abstracción sobre el objeto `content.js`,
 * permitiendo que los diálogos soliciten contenido por una clave sin necesidad de
 * conocer la estructura interna (si es un string simple o un objeto con personalización).
 *
 * @param {string} key La clave del contenido que se desea obtener (ej: 'procedimiento de reembolso médico/dental').
 * @param {object} conversationData El estado actual de la conversación. Debe contener la propiedad `employeeSedeId` para que la personalización funcione.
 * @returns {string} El mensaje de texto final, ya sea el personalizado para la sede o el por defecto.
 */
function getPersonalizedContent(key, conversationData) {
    if (!key) {
        console.warn('contentHelper: Se llamó a la función sin una clave.');
        return 'Lo siento, hubo un problema al obtener la información.';
    }

    const lowerKey = key.toLowerCase();
    const contentEntry = content[lowerKey];

    // Caso 1: La clave de contenido no fue encontrada en el archivo.
    if (!contentEntry) {
        console.warn(`contentHelper: No se encontró contenido para la clave: '${lowerKey}'`);
        return 'Lo siento, no tengo información sobre ese tema.';
    }

    // Caso 2: El contenido es un string simple, sin personalización.
    if (typeof contentEntry === 'string') {
        return contentEntry;
    }

    // Caso 3: El contenido es un objeto, indicando que hay personalización por sede.
    if (typeof contentEntry === 'object' && contentEntry !== null) {
        const sedeId = conversationData?.employeeSedeId; // Uso de optional chaining para más seguridad

        // Intenta obtener el contenido específico para la sede del usuario.
        if (sedeId && contentEntry[sedeId]) {
            return contentEntry[sedeId];
        }

        // Si no hay una versión para la sede del usuario, busca la versión por defecto.
        if (contentEntry.default) {
            return contentEntry.default;
        }
        
        // Si no hay ni versión específica ni 'default', es un error de configuración en content.js.
        console.warn(`contentHelper: El objeto para la clave '${lowerKey}' no tiene una entrada para la sede '${sedeId}' ni una entrada 'default'.`);
    } else {
        // Fallback si la entrada en content.js tiene un tipo de dato inesperado (ej: número, booleano).
        console.error(`contentHelper: Formato de contenido inesperado para la clave '${lowerKey}'. Se esperaba un string o un objeto.`);
    }

    // Retorna un mensaje de error genérico si ninguna de las condiciones anteriores se cumplió.
    return 'Lo siento, hubo un problema al procesar la información solicitada.';
}

module.exports = { getPersonalizedContent };