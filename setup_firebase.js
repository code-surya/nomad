// Firebase Credential Setup Helper
// Run this script after downloading your service account JSON file
// Usage: node setup_firebase.js path/to/your-service-account.json

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.log('Usage: node setup_firebase.js <path-to-service-account-json>');
  console.log('Example: node setup_firebase.js ~/Downloads/nomad-firebase-key.json');
  process.exit(1);
}

const jsonFilePath = process.argv[2];

try {
  // Read the JSON file
  const credentials = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  
  // Read current .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update environment variables
  const updates = {
    'FIREBASE_PROJECT_ID': credentials.project_id,
    'FIREBASE_PRIVATE_KEY_ID': credentials.private_key_id,
    'FIREBASE_PRIVATE_KEY': `"${credentials.private_key.replace(/\n/g, '\\n')}"`,
    'FIREBASE_CLIENT_EMAIL': credentials.client_email,
    'FIREBASE_CLIENT_ID': credentials.client_id,
    'FIREBASE_AUTH_URI': credentials.auth_uri || 'https://accounts.google.com/o/oauth2/auth',
    'FIREBASE_TOKEN_URI': credentials.token_uri || 'https://oauth2.googleapis.com/token',
    'FIREBASE_AUTH_PROVIDER_CERT_URL': credentials.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs'
  };
  
  // Replace or add each variable
  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });
  
  // Write updated .env file
  fs.writeFileSync(envPath, envContent.trim());
  
  console.log('✅ Firebase credentials updated in .env file!');
  console.log('🔥 You can now start your server with: npm start');
  
  // Remind about security
  console.log('\n⚠️  SECURITY REMINDER:');
  console.log('- Keep your service account JSON file safe');
  console.log('- Never commit .env file to version control');
  console.log('- Consider deleting the JSON file after setup');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nMake sure:');
  console.log('1. The JSON file path is correct');
  console.log('2. The JSON file is valid');
  console.log('3. You have read permissions for the file');
}
