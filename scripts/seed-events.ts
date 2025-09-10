import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { config } from "../lib/config";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-west-2',
  // Remove explicit credentials - let AWS SDK find them automaticall
});

const dynamodb = DynamoDBDocumentClient.from(client);

const events = [
  {
    id: '1',
    title: "Coffee & Connections at Pike Place",
    description: "Join fellow coffee enthusiasts for morning conversations and networking in the heart of Seattle.",
    date: "2025-09-15",
    time: "9:00 AM",
    location: "Pike Place Market, Seattle",
    attendees: 12,
    maxAttendees: 20,
    category: "Networking",
    image: "☕"
  },
  {
    id: '2',
    title: "Capitol Hill Art Walk & Meet",
    description: "Explore local galleries and street art while meeting creative minds in Capitol Hill.",
    date: "2025-09-18",
    time: "6:00 PM",
    location: "Capitol Hill, Seattle",
    attendees: 8,
    maxAttendees: 15,
    category: "Arts & Culture",
    image: "🎨"
  }
];

async function seedEvents() {
  console.log(`Seeding events to table: ${config.aws.eventsTable}`);
  
  for (const event of events) {
    try {
      await dynamodb.send(new PutCommand({
        TableName: config.aws.eventsTable,
        Item: event
      }));
      console.log(`✅ Added event: ${event.title}`);
    } catch (error) {
      console.error(`❌ Failed to add event ${event.title}:`, error);
    }
  }
}

seedEvents()
  .then(() => {
    console.log('🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });