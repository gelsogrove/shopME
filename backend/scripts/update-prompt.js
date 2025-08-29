const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client with proper error handling
let prisma;
try {
  prisma = new PrismaClient();
  console.log('✅ Prisma client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error);
  process.exit(1);
}

async function updatePrompt() {
  try {
    console.log('🔄 Updating prompt in database...');
    
    // Read the updated prompt from the file
    const promptFilePath = path.join(__dirname, '..', '..', 'docs', 'other', 'prompt_agent.md');
    const promptContent = fs.readFileSync(promptFilePath, 'utf8');
    
    console.log('✅ Prompt file read successfully');
    console.log(`📝 Prompt length: ${promptContent.length} characters`);
    
    // Get the main workspace ID (from seed)
    const workspace = await prisma.workspace.findFirst({
      where: { isActive: true, isDelete: false }
    });
    
    if (!workspace) {
      console.error('❌ No active workspace found');
      return;
    }
    
    console.log(`🏢 Found workspace: ${workspace.name} (${workspace.id})`);
    
    // Update the agent config with the new prompt
    const updatedAgentConfig = await prisma.agentConfig.updateMany({
      where: { workspaceId: workspace.id },
      data: {
        prompt: promptContent,
        updatedAt: new Date()
      }
    });
    
    console.log(`✅ Updated ${updatedAgentConfig.count} agent config(s)`);
    
    // Also update prompts table if it exists
    try {
      const updatedPrompts = await prisma.prompts.updateMany({
        where: { 
          workspaceId: workspace.id,
          name: { contains: 'SofIA' }
        },
        data: {
          content: promptContent,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Updated ${updatedPrompts.count} prompt(s) in prompts table`);
    } catch (error) {
      console.log('⚠️ Could not update prompts table (might not exist):', error.message);
    }
    
    console.log('🎉 Prompt update completed successfully!');
    console.log('🔄 The chatbot will now use the updated prompt');
    
  } catch (error) {
    console.error('❌ Error updating prompt:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updatePrompt();
