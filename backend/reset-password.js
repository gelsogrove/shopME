// Reset password script
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Configuration
const EMAIL = 'admin@shopme.com'; // Email dell'utente da modificare
const NEW_PASSWORD = 'admin123';   // Nuova password
const SALT_ROUNDS = 10;            // Rounds per l'hashing

async function resetPassword() {
  try {
    // Controlla se l'utente esiste
    const user = await prisma.user.findUnique({
      where: { email: EMAIL },
    });

    if (!user) {
      console.error(`Utente con email ${EMAIL} non trovato`);
      return;
    }

    // Genera il nuovo hash della password
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);

    // Aggiorna la password nel database
    const updatedUser = await prisma.user.update({
      where: { email: EMAIL },
      data: { passwordHash },
    });

    console.log(`Password reimpostata con successo per ${updatedUser.email}`);
    console.log('Le nuove credenziali sono:');
    console.log(`Email: ${EMAIL}`);
    console.log(`Password: ${NEW_PASSWORD}`);
  } catch (error) {
    console.error('Errore durante il reset della password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
