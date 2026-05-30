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
    description: "We're bringing Korean dating vibes straight to Seattle with a sogaeting-style night out you won't forget! Think fun, low-pressure matchmaking meets a cozy hangout where sparks and friendships fly. \n\n💌 We'll help you mix, mingle, and connect with new people in a K-style \"sogaeting\" twist ✨ Chill group activities to break the ice (no awkwardness allowed) \n\n🤝 A night where strangers become friends, and maybe even something more If you've been looking for a fresh way to meet people IRL — this is it. Bring your curiosity, leave with connections. \n\n🎟️ Tickets are limited — grab yours now and don't miss out! \n\n(Note: This ticket does not include food/drinks ordered at the restaurant. Tickets are fully refundable if cancelled more than 24 hours before event)",
    date: "2025-09-25",
    time: "7:30 PM",
    location: "Wild Ginger Bellevue",
    attendees: 0,
    maxAttendees: 6,
    category: "Social",
    image: "event/Event1.png",
    price: 2000,
    currency: "usd",
    isPaid: true,
    isActive: false
  },
  {
    id: "2",
    title: "Strike Up Connections - Bowling Night",
    description: "Ready to roll into some fun? Join us for an epic bowling night at The Garage in Capitol Hill! Whether you're a strike machine or more of a gutter ball specialist, this is all about good vibes and great connections.\n\n🎳 What to expect:\n• 2 hours of bowling fun with rotating teams\n• Shoe rental included in ticket price\n• Mix and mingle between frames\n• Light snacks and drink specials available\n• Prizes for most strikes AND most creative bowling style!\n\n🤝 Perfect for meeting new people in a relaxed, fun environment. We'll mix up teams every few frames so you'll get to chat with everyone!\n\n📍 Located in the heart of Capitol Hill with easy parking and transit access.\n\nCome as you are - no bowling experience required! Just bring your awesome self and get ready to laugh, connect, and maybe even pick up a spare or two. 🎯\n\n(Note: This ticket does not include food/drinks ordered at the venue. Tickets are fully refundable if cancelled more than 24 hours before event)",
    date: "2025-10-04",
    time: "7:00 PM",
    location: "The Garage, 1130 Broadway, Seattle, WA 98122",
    attendees: 0,
    maxAttendees: 24,
    category: "Social",
    image: "🎳",
    price: 0,
    currency: "usd",
    isPaid: false,
    isActive: true
  },
  {
    id: "3",
    title: "Green Lake Walk & Hangout",
    description: "Summer is here and there's no better way to kick it off than a group walk around one of Seattle's most beloved parks! 🌿\n\nWe'll meet at the East Parking Lot, walk the full 2.8-mile loop around Green Lake, and hang out on the grass after. Whether you're new to Seattle or a longtime local looking to expand your circle, this is the perfect low-key way to meet genuine people.\n\n☀️ What to expect:\n• A relaxed 2.8-mile walk around the lake\n• Good conversation and easy introductions\n• Post-walk hangout on the lawn\n• Optional coffee run nearby after\n\nNo pressure, no awkwardness — just a group of people enjoying a beautiful Seattle summer day together. Shantanu will be there to make sure everyone gets introduced!\n\n👟 Wear comfortable shoes. Bring water and sunscreen.\n\n(Free event — no ticket cost. Spots are limited to keep things personal.)",
    date: "2026-06-06",
    time: "11:00 AM",
    location: "Green Lake Park, East Parking Lot (7201 E Green Lake Dr N, Seattle)",
    attendees: 0,
    maxAttendees: 12,
    category: "Outdoor",
    image: "event/Event3.jpg",
    price: 0,
    currency: "usd",
    isPaid: false,
    isActive: true,
    waitlistCount: 0
  },
  {
    id: "4",
    title: "Alki Beach Sunset Walk",
    description: "Is there anything better than a Seattle sunset over Puget Sound with good company? We don't think so. 🌅\n\nJoin us for an evening walk along Alki Beach — one of the most scenic stretches in the city. We'll meet at the iconic Statue of Liberty replica, walk south along the waterfront, and watch the sun dip behind the Olympic Mountains together.\n\n🌊 What to expect:\n• ~1.5 mile walk along the Alki waterfront\n• Stunning views of Puget Sound and the Olympics\n• Great conversations as we walk\n• Optional stop at a beachside spot for drinks after\n\nThis is a super chill, no-pressure event — perfect for meeting new people in one of the most beautiful settings Seattle has to offer. Shantanu will be there to welcome everyone!\n\n👟 Wear comfortable shoes. Layers recommended — it can get breezy by the water.\n\n(Free event — no ticket cost. Spots are limited to keep things personal.)",
    date: "2026-06-14",
    time: "7:00 PM",
    location: "Alki Beach, Statue of Liberty replica (61st Ave SW & Alki Ave SW, Seattle)",
    attendees: 0,
    maxAttendees: 12,
    category: "Outdoor",
    image: "event/Event4.jpg",
    price: 0,
    currency: "usd",
    isPaid: false,
    isActive: true,
    waitlistCount: 0
  },
  {
    id: "5",
    title: "Gas Works Park Picnic & Lawn Games",
    description: "Pack a blanket and come hang at one of Seattle's coolest spots — Gas Works Park, with its iconic skyline views and wide open lawns perfect for a summer afternoon. 🎉\n\nWe'll claim a spot on the hill, play some lawn games, and just enjoy the day together. This is the most low-key event you'll ever love.\n\n🌞 What to bring:\n• A blanket or camp chair\n• Snacks/drinks to share (optional but appreciated!)\n• Yourself and good vibes\n\n🎲 Games we might play:\n• Frisbee\n• Spikeball\n• Cards\n• Whatever you bring!\n\nShantanu will have a spot staked out on the main hill near the kite-flying area. Just look for the group!\n\nThis is the perfect summer afternoon to meet people, relax, and enjoy Seattle at its finest. All are welcome.\n\n(Free event — no ticket cost. Spots are limited to keep things personal.)",
    date: "2026-06-21",
    time: "1:00 PM",
    location: "Gas Works Park, main hill (2101 N Northlake Way, Seattle)",
    attendees: 0,
    maxAttendees: 12,
    category: "Outdoor",
    image: "event/Event5.jpg",
    price: 0,
    currency: "usd",
    isPaid: false,
    isActive: true,
    waitlistCount: 0
  },
  {
    id: "6",
    title: "Pike Place Market Food Tour",
    description: "Let's explore the heart of Seattle together — Pike Place Market! 🐟\n\nWe'll meet at the main entrance on Pike Street and wander through the market as a group, sampling local foods, checking out the vendors, grabbing coffee, and just soaking it all in. Whether you've been a hundred times or never visited, it's always a great time with fresh company.\n\n🍎 What to expect:\n• Guided wander through the market with the group\n• Sample fresh produce, baked goods, and local bites\n• Stop at the original Starbucks for a photo op (optional 😄)\n• Flexible — go at your own pace, no rigid schedule\n\nShantanu will be at the main entrance (by the big Public Market sign) at 11:00 AM sharp. Look for the group!\n\nBring some cash for food samples and whatever catches your eye. This is a super fun, exploratory morning with great people.\n\n(Free event — no ticket cost. Spots are limited to keep things personal.)",
    date: "2026-06-28",
    time: "11:00 AM",
    location: "Pike Place Market, main entrance (Pike St & 1st Ave, Seattle)",
    attendees: 0,
    maxAttendees: 12,
    category: "Social",
    image: "event/Event6.jpg",
    price: 0,
    currency: "usd",
    isPaid: false,
    isActive: true,
    waitlistCount: 0
  },
  {
    id: "7",
    title: "Discovery Park Hike",
    description: "Start your July 4th weekend with a morning hike through Seattle's largest park! 🌲\n\nDiscovery Park is a 534-acre gem with old-growth forest, sweeping bluff views of Puget Sound, and a historic lighthouse you can walk to. We'll hike the Loop Trail together — about 2.8 miles — and end at the South Beach overlook with views that'll make your jaw drop.\n\n🥾 What to expect:\n• 2.8-mile Loop Trail hike through forest and bluffs\n• Stop at the West Point Lighthouse\n• Epic views of Puget Sound, the Olympics, and Mt. Rainier on a clear day\n• Great conversation along the way\n\nShantanu will be at the main entrance South Parking Lot at 10:00 AM. The trail is well-marked and suitable for all fitness levels — just wear real shoes!\n\n👟 Wear hiking shoes or sturdy sneakers. Bring water and a light layer.\n\n(Free event — no ticket cost. Spots are limited to keep things personal.)",
    date: "2026-07-05",
    time: "10:00 AM",
    location: "Discovery Park, South Parking Lot (3801 Discovery Park Blvd, Seattle)",
    attendees: 0,
    maxAttendees: 12,
    category: "Outdoor",
    image: "event/Event7.jpg",
    price: 0,
    currency: "usd",
    isPaid: false,
    isActive: true,
    waitlistCount: 0
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