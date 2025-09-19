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
    title: "Coffee & Connections at Pike Place",
    description: "Join fellow coffee enthusiasts for morning conversations and networking in the heart of Seattle.",
    date: "2025-09-15",
    time: "9:00 AM",
    location: "Pike Place Market, Seattle",
    attendees: 0,
    maxAttendees: 20,
    category: "Networking",
    image: "☕",
    price: 0, // Free event
    currency: "usd",
    isPaid: false
  },
  {
    id: '2',
    title: "Capitol Hill Art Walk & Meet",
    description: "Explore local galleries and street art while meeting creative minds in Capitol Hill.",
    date: "2025-09-18",
    time: "6:00 PM",
    location: "Capitol Hill, Seattle",
    attendees: 0,
    maxAttendees: 15,
    category: "Arts & Culture",
    image: "🎨",
    price: 1500, // $15.00
    currency: "usd",
    isPaid: true
  },
  {
    id: '3',
    title: "Hiking Group: Rattlesnake Ledge",
    description: "Experience breathtaking views and meet outdoor enthusiasts on this popular hiking trail.",
    date: "2025-09-20",
    time: "8:00 AM",
    location: "Rattlesnake Ledge Trailhead",
    attendees: 0,
    maxAttendees: 12,
    category: "Outdoor",
    image: "🥾",
    price: 2500, // $25.00 (includes transportation)
    currency: "usd",
    isPaid: true
  },
  {
    id: '4',
    title: "Board Game Night at Fremont",
    description: "Unwind with classic and modern board games in a cozy neighborhood setting.",
    date: "2025-09-22",
    time: "7:00 PM",
    location: "Fremont Community Center",
    attendees: 0,
    maxAttendees: 25,
    category: "Social",
    image: "🎲",
    price: 500, // $5.00 (venue cost)
    currency: "usd",
    isPaid: true
  },
  {
    id: '5',
    title: "Volunteer Beach Cleanup",
    description: "Make a positive impact while meeting community-minded individuals at Alki Beach.",
    date: "2025-09-25",
    time: "10:00 AM",
    location: "Alki Beach, West Seattle",
    attendees: 0,
    maxAttendees: 40,
    category: "Community",
    image: "🏖️",
    price: 0, // Free community service
    currency: "usd",
    isPaid: false
  },
  {
    id: '6',
    title: "Cooking Class: Pacific Northwest Cuisine",
    description: "Learn to prepare local dishes with fresh ingredients while socializing with food lovers.",
    date: "2025-09-28",
    time: "6:30 PM",
    location: "Seattle Culinary Academy",
    attendees: 0,
    maxAttendees: 16,
    category: "Social",
    image: "👨‍🍳",
    price: 4500, // $45.00 (includes ingredients)
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