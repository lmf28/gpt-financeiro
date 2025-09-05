const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Sua API Key da OpenAI será pega de variável de ambiente
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Inicializa o WhatsApp com persistência de sessão
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "lucasbot",      // identifica a sessão
        dataPath: "./session"      // pasta para guardar a sessão
    })
});

// QR Code (aparece apenas na primeira vez)
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Quando o bot estiver pronto
client.on('ready', () => {
    console.log('✅ LucasBot está online!');
});

// Quando receber mensagem
client.on('message', async msg => {
    if (msg.fromMe) return;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Você é LucasBot, assistente pessoal no WhatsApp. \
Sempre responda em português, de forma clara e organizada. \
Funções: ajudar em lembretes, anotações rápidas, responder dúvidas gerais \
e dar sugestões. Nunca invente informações; se não souber, diga 'Não tenho certeza, posso pesquisar para você'."
                    },
                    { role: "user", content: msg.body }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const resposta = response.data.choices[0].message.content;
        await client.sendMessage(msg.from, resposta);

    } catch (error) {
        console.error("Erro:", error.response ? error.response.data : error.message);
        await client.sendMessage(msg.from, "⚠️ Desculpe, ocorreu um erro.");
    }
});

// Inicializa o bot
client.initialize();
