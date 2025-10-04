// dialogs/MainMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('./content');

class MainMenu {
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Vacaciones, Licencias y Permisos',
            'Beneficios Económicos',
            'Salud y Seguros',
            'Bienestar y Conciliación',
            'Cultura y Valores',
            'Crecimiento y Desarrollo',
            'Consultas Generales y Otros'
        ];
    }

    async show(context) {
        let menuText = 'Menú principal:\n';
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText);
    }

    async handleInput(context, text, conversationData) {
        const lower = text.toLowerCase();
        const number = parseInt(text.trim());

        // Manejo de entrada numérica
        if (!isNaN(number) && number > 0 && number <= this.options.length) {
            const selectedOption = this.options[number - 1].toLowerCase();

            if (selectedOption.includes('vacaciones')) {
                await this.bot.navigateToMenu(context, conversationData, 'vacaciones');
                return true;
            } else if (selectedOption.includes('beneficios')) {
                await this.bot.navigateToMenu(context, conversationData, 'beneficios');
                return true;
            }
            else if (selectedOption.includes('salud y seguros')) {
                await this.bot.navigateToMenu(context, conversationData, 'saludSeguros');
                return true;
            }
            else if (selectedOption.includes('bienestar y conciliación')) {
                await this.bot.navigateToMenu(context, conversationData, 'bienestarConciliacion');
                return true;
            }
            else if (selectedOption.includes('cultura y valores')) {
                await this.bot.navigateToMenu(context, conversationData, 'culturaValores');
                return true;
            }
            else if (selectedOption.includes('crecimiento y desarrollo')) {
                await this.bot.navigateToMenu(context, conversationData, 'crecimientoDesarrollo');
                return true;
            }
            else if (selectedOption.includes('consultas generales y otros')) {
                await this.bot.navigateToMenu(context, conversationData, 'consultasGenerales');
                return true;
            }
        }
        // Lógica existente para manejar la entrada de texto (como fallback)
        else if (lower.includes('vacaciones')) {
            await this.bot.navigateToMenu(context, conversationData, 'vacaciones');
            return true;
        } else if (lower.includes('beneficios')) {
            await this.bot.navigateToMenu(context, conversationData, 'beneficios');
            return true;
        }
        else if (lower.includes('salud y seguros')) {
            await this.bot.navigateToMenu(context, conversationData, 'saludSeguros');
            return true;
        }
        else if (lower.includes('bienestar y conciliación')) {
            await this.bot.navigateToMenu(context, conversationData, 'bienestarConciliacion');
            return true;
        }
        else if (lower.includes('cultura y valores')) {
            await this.bot.navigateToMenu(context, conversationData, 'culturaValores');
            return true;
        }
        else if (lower.includes('crecimiento y desarrollo')) {
            await this.bot.navigateToMenu(context, conversationData, 'crecimientoDesarrollo');
            return true;
        }
        else if (lower.includes('consultas generales y otros')) {
            await this.bot.navigateToMenu(context, conversationData, 'consultasGenerales');
            return true;
        }

        const response = content[lower];
        if (response) {
            await context.sendActivity(response);
            return true;
        }

        return false;
    }
}

module.exports = MainMenu;