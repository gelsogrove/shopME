const {
  EmailService,
} = require("./dist/src/application/services/email.service.js")

async function testRealEmail() {
  try {
    console.log("🚀 Inizializzazione EmailService per invio email REALE...")
    const emailService = new EmailService()

    console.log("📧 Invio email di test all'indirizzo specificato...")
    const result = await emailService.sendOperatorNotificationEmail({
      to: "gelsogrovel@gmail.com", // La tua email per ricevere il test
      customerName: "Test Customer",
      chatSummary:
        "Questo è un test per verificare che le email reali funzionino correttamente. Il sistema Ethereal è stato rimosso.",
      subject: "🔴 TEST EMAIL REALE - ShopMe System",
      fromEmail: "noreply@shopme.com",
    })

    console.log("Risultato invio email:", result)

    if (result) {
      console.log("✅ EMAIL REALE INVIATA CON SUCCESSO!")
      console.log("� Controlla la tua casella email")
    } else {
      console.log("❌ Errore nell'invio dell'email reale")
    }
  } catch (error) {
    console.error("🔴 ERRORE nel test email reale:", error.message)
    if (error.message.includes("SMTP credentials")) {
      console.log("\n📋 ISTRUZIONI:")
      console.log("1. Vai su Gmail > Impostazioni > Sicurezza")
      console.log("2. Attiva la verifica in due passaggi")
      console.log('3. Genera una "App Password" per ShopMe')
      console.log("4. Inserisci email e app password nel file .env")
      console.log("5. Riavvia il backend")
    }
  }
}

testRealEmail()
