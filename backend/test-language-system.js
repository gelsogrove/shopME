// Test rapido del sistema delle lingue
const { detectLanguageFromPhone } = require('./dist/utils/language-detector.js');

console.log('🧪 Testing Language Detection System');
console.log('=====================================');

// Test phone numbers
const testPhones = [
  '+393401234567',  // Italy
  '+34612345678',   // Spain  
  '+15551234567',   // USA
  '+351912345678',  // Portugal
  '+552199999999',  // Brazil
  '+5491122334455', // Argentina
  '+447700900123',  // UK
  '+invalid'        // Invalid
];

testPhones.forEach(phone => {
  const detected = detectLanguageFromPhone(phone);
  console.log(`📱 ${phone} → Language: ${detected}`);
});

console.log('\n✅ Language detection test completed!');
