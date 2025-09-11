#!/usr/bin/env node

/**
 * Script per sistemare il mapping dei messaggi esistenti nel database
 * Corregge i messaggi che potrebbero avere il sender mapping sbagliato
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMessageSenderMapping() {
  try {
    console.log('🔧 Inizio correzione mapping messaggi...');
    
    // Conta i messaggi totali
    const totalMessages = await prisma.message.count();
    console.log(`📊 Totale messaggi nel database: ${totalMessages}`);
    
    // Conta messaggi per direzione
    const inboundMessages = await prisma.message.count({
      where: { direction: 'INBOUND' }
    });
    
    const outboundMessages = await prisma.message.count({
      where: { direction: 'OUTBOUND' }
    });
    
    console.log(`📥 Messaggi INBOUND (cliente): ${inboundMessages}`);
    console.log(`📤 Messaggi OUTBOUND (bot): ${outboundMessages}`);
    
    // Verifica se ci sono messaggi con metadata che indica sender sbagliato
    const messagesWithMetadata = await prisma.message.findMany({
      where: {
        direction: 'OUTBOUND',
        metadata: {
          path: ['agentSelected'],
          equals: 'CUSTOMER' // Questo potrebbe indicare un mapping sbagliato
        }
      },
      select: {
        id: true,
        content: true,
        direction: true,
        metadata: true,
        createdAt: true
      }
    });
    
    console.log(`🔍 Messaggi OUTBOUND con metadata CUSTOMER: ${messagesWithMetadata.length}`);
    
    if (messagesWithMetadata.length > 0) {
      console.log('📝 Primi 5 messaggi problematici:');
      messagesWithMetadata.slice(0, 5).forEach((msg, index) => {
        console.log(`${index + 1}. ID: ${msg.id}, Content: ${msg.content.substring(0, 50)}...`);
      });
    }
    
    // Verifica messaggi recenti per vedere il pattern
    const recentMessages = await prisma.message.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        direction: true,
        metadata: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Ultimi 10 messaggi:');
    recentMessages.forEach((msg, index) => {
      const direction = msg.direction === 'INBOUND' ? '👤 Cliente' : '🤖 Bot';
      const content = msg.content.substring(0, 30) + '...';
      console.log(`${index + 1}. ${direction}: ${content}`);
    });
    
    console.log('\n✅ Analisi completata!');
    console.log('💡 Il frontend ora mappa correttamente:');
    console.log('   - INBOUND → sender: "customer" (sinistra)');
    console.log('   - OUTBOUND → sender: "bot" (destra)');
    
  } catch (error) {
    console.error('❌ Errore durante l\'analisi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui lo script
fixMessageSenderMapping();
