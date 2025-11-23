#!/usr/bin/env node

/**
 * Firebase Admin SDK Setup Helper
 * 
 * This script helps you set up Firebase Admin credentials for the backend.
 * 
 * MANUAL STEPS REQUIRED:
 * 1. Go to https://console.firebase.google.com/
 * 2. Select project: humsj-academic-sector
 * 3. Click Settings (⚙️) → Project settings → Service accounts
 * 4. Click "Generate new private key"
 * 5. Save the downloaded file as "serviceAccountKey.json" in the server/ directory
 * 6. Create a .env file (copy from env.example) and add:
 *    FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
 * 7. Restart the server: npm run dev
 */

import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔥 Firebase Admin SDK Setup Helper\n');
console.log('═'.repeat(60));

const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json');
const envPath = resolve(__dirname, '.env');
const envExamplePath = resolve(__dirname, 'env.example');

// Check if service account file exists
if (existsSync(serviceAccountPath)) {
  console.log('✅ Service account file found: serviceAccountKey.json');
  
  try {
    const content = readFileSync(serviceAccountPath, 'utf8');
    const parsed = JSON.parse(content);
    
    if (parsed.project_id && parsed.private_key && parsed.client_email) {
      console.log('✅ Service account file is valid');
      console.log(`   Project ID: ${parsed.project_id}`);
      console.log(`   Client Email: ${parsed.client_email}`);
    } else {
      console.log('⚠️  Service account file is missing required fields');
    }
  } catch (error) {
    console.log('❌ Service account file is not valid JSON');
  }
} else {
  console.log('❌ Service account file not found: serviceAccountKey.json');
  console.log('\n📋 To download your service account key:\n');
  console.log('   1. Visit: https://console.firebase.google.com/');
  console.log('   2. Select project: humsj-academic-sector');
  console.log('   3. Go to: Settings ⚙️ → Project settings → Service accounts');
  console.log('   4. Click: "Generate new private key"');
  console.log('   5. Save as: server/serviceAccountKey.json');
}

console.log('\n' + '─'.repeat(60));

// Check if .env file exists
if (existsSync(envPath)) {
  console.log('✅ .env file found');
  
  const envContent = readFileSync(envPath, 'utf8');
  
  if (envContent.includes('FIREBASE_SERVICE_ACCOUNT_PATH')) {
    console.log('✅ FIREBASE_SERVICE_ACCOUNT_PATH is configured');
  } else if (envContent.includes('FIREBASE_PROJECT_ID') && 
             envContent.includes('FIREBASE_CLIENT_EMAIL') && 
             envContent.includes('FIREBASE_PRIVATE_KEY')) {
    console.log('✅ Firebase environment variables are configured');
  } else {
    console.log('⚠️  Firebase configuration not found in .env');
    console.log('   Add this line to .env:');
    console.log('   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json');
  }
} else {
  console.log('❌ .env file not found');
  
  if (existsSync(envExamplePath)) {
    console.log('   Copy env.example to .env and configure it');
  } else {
    console.log('   Create a .env file with:');
    console.log('   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json');
  }
}

console.log('\n' + '═'.repeat(60));
console.log('\n📚 For detailed instructions, see: server/FIREBASE_SETUP.md\n');
