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
    description: "We’re bringing Korean dating vibes straight to Seattle with a sogaeting-style night out you won’t forget! Think fun, low-pressure matchmaking meets a cozy hangout where sparks and friendships fly. \n💌 We’ll help you mix, mingle, and connect with new people in a K-style “sogaeting” twist ✨ Chill group activities to break the ice (no awkwardness allowed) \n🤝 A night where strangers become friends, and maybe even something more If you’ve been looking for a fresh way to meet people IRL — this is it. Bring your curiosity, leave with connections. \n🎟️ Tickets are limited — grab yours now and don’t miss out!",
    date: "2025-09-25",
    time: "7 PM",
    location: "Ascend Bellevue – the perfect backdrop with both indoor + outdoor vibe",
    attendees: 0,
    maxAttendees: 1,
    category: "Social",
    image: "👨‍🍳",
    price: 100, // $1.00 (venue cost)
    currency: "usd",
    isPaid: true
  },
  {
    id: '2',
    title: "Coffee & Connections: Seattle Freelancers Meetup",
    description: "Join fellow freelancers, remote workers, and entrepreneurs for a casual coffee meetup in the heart of Seattle! Whether you're a designer, developer, writer, consultant, or any other type of independent professional, this is your chance to connect with like-minded people.\n\n☕ What to expect:\n• Relaxed networking in a cozy coffee shop setting\n• Share experiences, challenges, and wins\n• Potential collaboration opportunities\n• Tips and resources for freelance success\n• Maybe find your next coffee buddy or accountability partner\n\nNo pressure, no sales pitches - just genuine connections over great coffee. Bring your laptop if you want to work together after, or just come to chat!\n\nPerfect for: Freelancers, remote workers, digital nomads, entrepreneurs, and anyone interested in the independent work lifestyle.",
    date: "2025-09-28",
    time: "10:30 AM",
    location: "Victrola Coffee Roasters, Capitol Hill",
    attendees: 0,
    maxAttendees: 1,
    category: "Networking",
    image: "☕",
    price: 0, // Free event
    currency: "usd",
    isPaid: false
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