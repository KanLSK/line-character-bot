import { testGeminiConnection } from '../lib/gemini-client';
import { seedCharacters } from './seed-characters';
import { connectToDatabase } from '../lib/db-utils';
import Character from '../models/Character';
import { generateCharacterResponse } from '../lib/gemini-client';

async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini Integration...\n');

  try {
    // 1. Test basic connection
    console.log('1. Testing Gemini connection...');
    const connectionResult = await testGeminiConnection();
    if (connectionResult.success) {
      console.log('✅ Gemini connection successful');
    } else {
      console.log('❌ Gemini connection failed:', connectionResult.message);
      return;
    }

    // 2. Seed characters
    console.log('\n2. Seeding characters...');
    await seedCharacters();
    console.log('✅ Characters seeded successfully');

    // 3. Test character response generation
    console.log('\n3. Testing character response generation...');
    await connectToDatabase();
    const character = await Character.findOne({ id: 'sherlock-holmes' });
    
    if (!character) {
      console.log('❌ Sherlock Holmes character not found');
      return;
    }

    const testMessage = "Hello! What's your name and what do you do?";
    console.log(`Testing with message: "${testMessage}"`);
    
    const characterData = character.toObject() as any;
    const response = await generateCharacterResponse(characterData, testMessage);
    console.log('✅ Character response generated:');
    console.log(`"${response}"`);

    console.log('\n🎉 All tests passed! Gemini integration is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testGeminiIntegration()
    .then(() => {
      console.log('\nTest completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
} 