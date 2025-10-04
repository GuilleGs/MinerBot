// dialogs/BeneficiosMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('./content');

class BeneficiosMenu {
    constructor(bot) {
        this.bot = bot;
        this.options = [ // Las opciones ahora son una propiedad de la instancia
            'Bonos de desempeño',
            'Asignación de escolaridad',
            'Aguinaldos y gratificaciones',
            'Viáticos y reembolsos',
            'Descuentos corporativos'
        ];
        this.returnOption = 'Volver'; // Opción para volver
    }

    async show(context) {
        let menuText = '💰 Beneficios Económicos:\n';
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += `${this.options.length + 1}. ${this.returnOption}\n`; // Añadir "Volver" al final
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText);
    }

    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase();
        const number = parseInt(text.trim());

        // --- Manejo del estado de información y "Volver" ---
        if (conversationData.isInInfoDisplayState && lower.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        // --- Manejo de entrada numérica ---
        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            const selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];

            if (selectedOption.toLowerCase().includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            // Opciones informativas
            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true;
                return true;
            }
        }
        // --- FIN Manejo de entrada numérica ---

        // Lógica existente para manejar la entrada de texto (como fallback)
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
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

module.exports = BeneficiosMenu;