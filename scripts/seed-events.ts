import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { config } from "../lib/config";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-west-2',
  // Remove explicit credentials - let AWS SDK find them automatically
});

const dynamodb = DynamoDBDocumentClient.from(client);

const events = [
  {
    id: '1',
    title: "Sogaeting, Korean dating vibes straight to Seattle",
    description: "We’re bringing Korean dating vibes straight to Seattle with a sogaeting-style night out you won’t forget! Think fun, low-pressure matchmaking meets a cozy hangout where sparks and friendships fly. \n\n💌 We’ll help you mix, mingle, and connect with new people in a K-style “sogaeting” twist ✨ Chill group activities to break the ice (no awkwardness allowed) \n\n🤝 A night where strangers become friends, and maybe even something more If you’ve been looking for a fresh way to meet people IRL — this is it. Bring your curiosity, leave with connections. \n\n🎟️ Tickets are limited — grab yours now and don’t miss out! \n\n(Note: This ticket does not include food/drinks ordered at the restaurant. Tickets are fully refundable if cancelled more than 24 hours before event)",
    date: "2025-09-25",
    time: "7:30 PM",
    location: "Wild Ginger Bellevue",
    attendees: 0,
    maxAttendees: 6,
    category: "Social",
    image: "event/Event1.png", // S3 image path
    price: 2000, // $20.00 (venue cost)
    currency: "usd",
    isPaid: true
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
      console.log(`✅ Added event: ${event.title} - ${event.isPaid ? `$${(event.price / 100).toFixed(2)}` : 'Free'}`);
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