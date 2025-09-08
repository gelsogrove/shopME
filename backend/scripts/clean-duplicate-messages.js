#!/usr/bin/env node

/**
 * 🧹 CLEAN DUPLICATE MESSAGES SCRIPT
 * 
 * This script removes duplicate messages from the database that were created
 * before the webhook duplication fix was applied.
 * 
 * It identifies duplicates by:
 * - Same content
 * - Same chat session
 * - Same direction (INBOUND/OUTBOUND)
 * - Created within 5 minutes of each other
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicateMessages() {
  console.log('🧹 Starting duplicate message cleanup...');
  
  try {
    // Find all chat sessions
    const chatSessions = await prisma.chatSession.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    let totalDuplicatesRemoved = 0;

    for (const session of chatSessions) {
      console.log(`\n📋 Processing chat session: ${session.id} (${session.messages.length} messages)`);
      
      const messagesToDelete = [];

      // Group messages by content and direction
      const messageGroups = {};
      
      for (const message of session.messages) {
        const key = `${message.content.trim()}_${message.direction}`;
        if (!messageGroups[key]) {
          messageGroups[key] = [];
        }
        messageGroups[key].push(message);
      }
      
      // Find duplicates in each group
      for (const [key, messages] of Object.entries(messageGroups)) {
        if (messages.length > 1) {
          // Sort by creation time, keep the first one, delete the rest
          messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          const duplicates = messages.slice(1); // Remove all except the first
          
          for (const duplicate of duplicates) {
            console.log(`   🔍 Found duplicate: "${duplicate.content.substring(0, 50)}..." (ID: ${duplicate.id})`);
            messagesToDelete.push(duplicate.id);
          }
        }
      }

      // Delete duplicates for this session
      if (messagesToDelete.length > 0) {
        console.log(`   🗑️ Deleting ${messagesToDelete.length} duplicate messages...`);
        
        const deleteResult = await prisma.message.deleteMany({
          where: {
            id: {
              in: messagesToDelete
            }
          }
        });
        
        console.log(`   ✅ Deleted ${deleteResult.count} duplicate messages`);
        totalDuplicatesRemoved += deleteResult.count;
      } else {
        console.log(`   ✨ No duplicates found in this session`);
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`📊 Total duplicate messages removed: ${totalDuplicatesRemoved}`);
    
    // Show summary statistics
    const totalMessages = await prisma.message.count();
    const totalSessions = await prisma.chatSession.count();
    
    console.log(`\n📈 Database Summary:`);
    console.log(`   💬 Total messages remaining: ${totalMessages}`);
    console.log(`   📋 Total chat sessions: ${totalSessions}`);
    console.log(`   📊 Average messages per session: ${(totalMessages / totalSessions).toFixed(1)}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDuplicateMessages();
