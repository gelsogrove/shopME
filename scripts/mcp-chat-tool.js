#!/usr/bin/env node

/**
 * 🤖 MCP CHAT TOOL - Advanced Terminal Chat Simulator
 * 
 * Questo tool MCP permette di simulare conversazioni WhatsApp
 * direttamente nel terminale di Cursor
 */

const axios = require('axios');
const readline = require('readline');

// Configurazione
const CONFIG = {
    backendUrl: 'http://localhost:3001',
    workspaceId: '6c72e7e8-9f2a-4b8e-8e7d-2c3f4a5b6789',
    customers: {
        maria: {
            id: '2b8fbd85-4286-4bce-a0a0-a7e17b8ca7e2',
            name: 'Maria Garcia',
            phone: '+34666777888'
        },
        mario: {
            id: '3c9fce96-5397-5c9f-9f8e-3d4f5a6b7890',
            name: 'Mario Rossi', 
            phone: '+34666888999'
        }
    }
};

// Colori per console
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bold: '\x1b[1m'
};

class ChatSimulator {
    constructor() {
        this.currentCustomer = null;
        this.chatActive = false;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    log(message, color = 'white') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    printBanner() {
        this.log('\n╔══════════════════════════════════════════════════════════════╗', 'cyan');
        this.log('║                    🤖 MCP CHAT SIMULATOR v2.0               ║', 'cyan');
        this.log('║              Test WhatsApp bot direttamente qui!            ║', 'cyan');
        this.log('╚══════════════════════════════════════════════════════════════╝', 'cyan');
        this.log('');
    }

    printHelp() {
        this.log('📋 COMANDI DISPONIBILI:', 'yellow');
        this.log('  START CHAT <customer>     - Inizia chat (maria, mario)', 'white');
        this.log('  END CHAT                  - Termina chat', 'white');
        this.log('  HELP                      - Mostra questo help', 'white');
        this.log('  EXIT                      - Esci dal simulatore', 'white');
        this.log('');
        this.log('💬 ESEMPI DI MESSAGGI:', 'yellow');
        this.log('  dammi link ordini', 'white');
        this.log('  dammi ordine 20012', 'white');
        this.log('  fammi modificare la mia mail', 'white');
        this.log('  voglio cambiare il mio indirizzo', 'white');
        this.log('');
        this.log('👥 CLIENTI DISPONIBILI:', 'yellow');
        Object.entries(CONFIG.customers).forEach(([key, customer]) => {
            this.log(`  ${key} - ${customer.name} (${customer.phone})`, 'green');
        });
        this.log('');
    }

    async startChat(customerKey) {
        const customer = CONFIG.customers[customerKey.toLowerCase()];
        
        if (!customer) {
            this.log(`❌ Cliente '${customerKey}' non trovato!`, 'red');
            this.log(`Clienti disponibili: ${Object.keys(CONFIG.customers).join(', ')}`, 'yellow');
            return;
        }

        this.currentCustomer = customer;
        this.chatActive = true;

        this.log('🚀 CHAT ATTIVATA!', 'green');
        this.log(`👤 Cliente: ${customer.name} (${customer.phone})`, 'blue');
        this.log(`🆔 ID: ${customer.id}`, 'blue');
        this.log('💬 Scrivi il tuo messaggio (o "END CHAT" per terminare):', 'cyan');
    }

    async sendMessage(message) {
        if (!this.chatActive || !this.currentCustomer) {
            this.log('❌ Nessuna chat attiva!', 'red');
            return;
        }

        this.log(`👤 ${this.currentCustomer.name}: ${message}`, 'yellow');

        // Use test format for WhatsApp webhook endpoint
        const payload = {
            chatInput: message,
            workspaceId: CONFIG.workspaceId,
            customerid: this.currentCustomer.id
        };

        this.log('🔄 Invio messaggio al bot...', 'cyan');

        try {
            const response = await axios.post(
                `${CONFIG.backendUrl}/api/whatsapp/webhook`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            const botMessage = response.data?.message || response.data?.response || response.data?.text || JSON.stringify(response.data);
            
            this.log(`🤖 Bot ShopMe: ${botMessage}`, 'green');

            // Estrae e evidenzia i link
            const linkRegex = /https?:\/\/[^\s]+/g;
            const links = botMessage.match(linkRegex);
            
            if (links && links.length > 0) {
                this.log('🔗 LINK TROVATI:', 'cyan');
                links.forEach(link => {
                    this.log(`   ${link}`, 'blue');
                });
            }

        } catch (error) {
            this.log('❌ Errore nella comunicazione con il bot:', 'red');
            this.log(`Error: ${error.message}`, 'red');
            if (error.response) {
                this.log(`Status: ${error.response.status}`, 'red');
                this.log(`Response: ${JSON.stringify(error.response.data)}`, 'red');
            }
        }

        this.log('');
    }

    endChat() {
        if (!this.chatActive) {
            this.log('❌ Nessuna chat attiva!', 'red');
            return;
        }

        this.log(`👋 Chat con ${this.currentCustomer.name} terminata!`, 'yellow');
        this.chatActive = false;
        this.currentCustomer = null;
    }

    async processInput(input) {
        const trimmedInput = input.trim();
        
        if (!trimmedInput) return;

        const upperInput = trimmedInput.toUpperCase();

        // Comandi globali
        switch (upperInput) {
            case 'EXIT':
            case 'QUIT':
            case 'Q':
                this.log('👋 Arrivederci Andrea!', 'yellow');
                this.rl.close();
                process.exit(0);
                break;
                
            case 'HELP':
            case 'H':
                this.printHelp();
                return;
                
            case 'END CHAT':
                this.endChat();
                return;
        }

        // Comando START CHAT
        const startChatMatch = upperInput.match(/^START CHAT (.+)$/);
        if (startChatMatch) {
            await this.startChat(startChatMatch[1]);
            return;
        }

        // Messaggi chat
        if (this.chatActive) {
            await this.sendMessage(trimmedInput);
        } else {
            this.log('❌ Comando non riconosciuto! Scrivi "HELP" per l\'aiuto.', 'red');
        }
    }

    async start() {
        this.printBanner();
        this.printHelp();

        const promptUser = () => {
            const prompt = this.chatActive ? '💬 Messaggio: ' : '🔧 Comando: ';
            this.rl.question(`${colors.cyan}${prompt}${colors.reset}`, async (input) => {
                await this.processInput(input);
                promptUser();
            });
        };

        promptUser();
    }
}

// Verifica dipendenze
try {
    require('axios');
} catch (error) {
    console.log('❌ axios non installato! Esegui: npm install axios');
    process.exit(1);
}

// Avvia il simulatore
const simulator = new ChatSimulator();
simulator.start().catch(error => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
});
