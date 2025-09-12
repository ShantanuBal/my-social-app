import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { config } from "../lib/config";
import bcrypt from 'bcryptjs';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-west-2',
  // Remove explicit credentials - let AWS SDK find them automatically
});

const dynamodb = DynamoDBDocumentClient.from(client);

const users = [
  {
    id: 'user_1757600000001_seed',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    location: 'Capitol Hill, Seattle',
    bio: 'Coffee enthusiast and software developer'
  },
  {
    id: 'user_1757600000002_seed',
    name: 'Mike Rodriguez',
    email: 'mike.rodriguez@example.com',
    location: 'Belltown, Seattle',
    bio: 'Photographer and outdoor adventure seeker'
  },
  {
    id: 'user_1757600000003_seed',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    location: 'Fremont, Seattle',
    bio: 'Artist and community organizer'
  },
  {
    id: 'user_1757600000004_seed',
    name: 'David Kim',
    email: 'david.kim@example.com',
    location: 'University District, Seattle',
    bio: 'Tech startup founder and mentor'
  },
  {
    id: 'user_1757600000005_seed',
    name: 'Jessica Martinez',
    email: 'jessica.martinez@example.com',
    location: 'Queen Anne, Seattle',
    bio: 'Marketing professional and yoga instructor'
  },
  {
    id: 'user_1757600000006_seed',
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    location: 'Wallingford, Seattle',
    bio: 'Musician and music teacher'
  },
  {
    id: 'user_1757600000007_seed',
    name: 'Rachel Green',
    email: 'rachel.green@example.com',
    location: 'Ballard, Seattle',
    bio: 'Chef and food blogger'
  },
  {
    id: 'user_1757600000008_seed',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    location: 'Georgetown, Seattle',
    bio: 'Environmental scientist and hiker'
  },
  {
    id: 'user_1757600000009_seed',
    name: 'Lisa Park',
    email: 'lisa.park@example.com',
    location: 'Green Lake, Seattle',
    bio: 'Physical therapist and runner'
  },
  {
    id: 'user_1757600000010_seed',
    name: 'Chris Anderson',
    email: 'chris.anderson@example.com',
    location: 'Pioneer Square, Seattle',
    bio: 'Architect and urban planning enthusiast'
  },
  {
    id: 'user_1757600000011_seed',
    name: 'Amanda Taylor',
    email: 'amanda.taylor@example.com',
    location: 'Magnolia, Seattle',
    bio: 'Veterinarian and animal rescue volunteer'
  },
  {
    id: 'user_1757600000012_seed',
    name: 'Ryan O\'Connor',
    email: 'ryan.oconnor@example.com',
    location: 'Phinney Ridge, Seattle',
    bio: 'Craft beer brewer and homebrewing teacher'
  },
  {
    id: 'user_1757600000013_seed',
    name: 'Sophia Lee',
    email: 'sophia.lee@example.com',
    location: 'International District, Seattle',
    bio: 'UX designer and digital nomad'
  },
  {
    id: 'user_1757600000014_seed',
    name: 'Matt Davis',
    email: 'matt.davis@example.com',
    location: 'West Seattle',
    bio: 'Marine biologist and scuba diving instructor'
  },
  {
    id: 'user_1757600000015_seed',
    name: 'Nina Patel',
    email: 'nina.patel@example.com',
    location: 'Eastlake, Seattle',
    bio: 'Data scientist and board game enthusiast'
  },
  {
    id: 'user_1757600000016_seed',
    name: 'Jordan Mitchell',
    email: 'jordan.mitchell@example.com',
    location: 'Columbia City, Seattle',
    bio: 'Social worker and community advocate'
  },
  {
    id: 'user_1757600000017_seed',
    name: 'Kate Sullivan',
    email: 'kate.sullivan@example.com',
    location: 'Ravenna, Seattle',
    bio: 'Librarian and book club organizer'
  },
  {
    id: 'user_1757600000018_seed',
    name: 'Ben Foster',
    email: 'ben.foster@example.com',
    location: 'Greenwood, Seattle',
    bio: 'Carpenter and woodworking workshop leader'
  },
  {
    id: 'user_1757600000019_seed',
    name: 'Olivia Chang',
    email: 'olivia.chang@example.com',
    location: 'Maple Leaf, Seattle',
    bio: 'Financial advisor and investment club founder'
  },
  {
    id: 'user_1757600000020_seed',
    name: 'Tyler Brooks',
    email: 'tyler.brooks@example.com',
    location: 'Northgate, Seattle',
    bio: 'Personal trainer and rock climbing guide'
  }
];

async function seedUsers() {
  console.log(`Seeding users to table: ${config.aws.usersTable}`);
  
  for (const userData of users) {
    try {
      // Hash a default password for all seed users
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const user = {
        ...userData,
        hashedPassword,
        createdAt: new Date().toISOString(),
        avatar: null,
        // Add searchable lowercase name for better search performance
        searchName: userData.name.toLowerCase()
      };

      await dynamodb.send(new PutCommand({
        TableName: config.aws.usersTable,
        Item: user
      }));
      console.log(`✅ Added user: ${user.name} (${user.email})`);
    } catch (error) {
      console.error(`❌ Failed to add user ${userData.name}:`, error);
    }
  }
}

seedUsers()
  .then(() => {
    console.log('🎉 User seeding complete!');
    console.log('📝 All users have password: password123');
    console.log('🔍 You can now test search functionality');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 User seeding failed:', error);
    process.exit(1);
  });