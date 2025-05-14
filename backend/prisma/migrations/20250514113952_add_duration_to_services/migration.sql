-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "afterRegistrationMessages" JSONB DEFAULT '{"it": "Registrazione eseguita con successo. Ciao [nome], in cosa posso esserti utile oggi?", "en": "Registration completed successfully. Hello [nome], how can I help you today?", "es": "Registro completado con éxito. Hola [nome], ¿en qué puedo ayudarte hoy?", "fr": "Enregistrement effectué avec succès. Bonjour [nome], en quoi puis-je vous aider aujourd''hui ?", "de": "Registrierung erfolgreich abgeschlossen. Hallo [nome], wie kann ich Ihnen heute helfen?", "pt": "Registro concluído com sucesso. Olá [nome], em que posso ajudá-lo hoje?"}';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 60;
