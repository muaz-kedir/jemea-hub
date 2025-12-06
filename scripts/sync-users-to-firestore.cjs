/**
 * Script to sync Firebase Auth users to Firestore users collection
 * Run this once to populate the users collection with existing Auth users
 * 
 * Usage: node scripts/sync-users-to-firestore.cjs
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../server/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function syncUsersToFirestore() {
  console.log('Starting user sync...\n');
  
  try {
    // Get all users from Firebase Auth
    const listUsersResult = await auth.listUsers();
    const authUsers = listUsersResult.users;
    
    console.log(`Found ${authUsers.length} users in Firebase Auth\n`);
    
    let synced = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const authUser of authUsers) {
      try {
        const uid = authUser.uid;
        const email = authUser.email || '';
        const displayName = authUser.displayName || '';
        
        // Check if user already exists in Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (userDoc.exists) {
          console.log(`⏭️  Skipping ${email} - already exists in Firestore`);
          skipped++;
          continue;
        }
        
        // Parse display name into first/last name
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || email.split('@')[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Create user document in Firestore
        await db.collection('users').doc(uid).set({
          uid,
          email,
          firstName,
          lastName,
          createdAt: authUser.metadata.creationTime ? new Date(authUser.metadata.creationTime) : new Date(),
        });
        
        // Check if user_roles exists, if not create default
        const roleDoc = await db.collection('user_roles').doc(uid).get();
        if (!roleDoc.exists) {
          await db.collection('user_roles').doc(uid).set({
            userId: uid,
            role: 'student',
            assignedAt: new Date(),
            assignedBy: 'system_sync',
          });
          console.log(`✅ Synced ${email} with default role: student`);
        } else {
          console.log(`✅ Synced ${email} (role already exists: ${roleDoc.data().role})`);
        }
        
        synced++;
      } catch (error) {
        console.error(`❌ Error syncing user ${authUser.email}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n========== SYNC COMPLETE ==========');
    console.log(`✅ Synced: ${synced}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total: ${authUsers.length}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
  
  process.exit(0);
}

syncUsersToFirestore();
