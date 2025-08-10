// System Templates Data for ChecklistPro
// These templates are predefined and available to all users

const systemTemplates = [
  // Shopping Templates
  {
    name: "Weekly Grocery Shopping",
    description: "Complete grocery list for a family weekly shopping",
    type: "system",
    category: "shopping",
    icon: "fas fa-shopping-cart",
    items: [
      // Produce
      { name: "Bananas", defaultPrice: 2.99, category: "Produce", isOptional: false, alternatives: [{name: "Apples", price: 4.99}, {name: "Oranges", price: 3.99}] },
      { name: "Apples (3 lbs)", defaultPrice: 4.99, category: "Produce", isOptional: false, alternatives: ["Pears", "Peaches"] },
      { name: "Lettuce", defaultPrice: 2.49, category: "Produce", isOptional: false, alternatives: ["Spinach", "Kale"] },
      { name: "Tomatoes (2 lbs)", defaultPrice: 3.99, category: "Produce", isOptional: false, alternatives: ["Cherry Tomatoes"] },
      { name: "Onions (3 lbs)", defaultPrice: 2.99, category: "Produce", isOptional: false, alternatives: ["Shallots", "Green Onions"] },
      { name: "Carrots (2 lbs)", defaultPrice: 1.99, category: "Produce", isOptional: false, alternatives: ["Baby Carrots"] },
      { name: "Potatoes (5 lbs)", defaultPrice: 3.99, category: "Produce", isOptional: false, alternatives: ["Sweet Potatoes"] },
      
      // Dairy
      { name: "Milk (Gallon)", defaultPrice: 3.99, category: "Dairy", isOptional: false, alternatives: ["Almond Milk", "Oat Milk"] },
      { name: "Eggs (Dozen)", defaultPrice: 4.99, category: "Dairy", isOptional: false, alternatives: ["Egg Whites"] },
      { name: "Butter", defaultPrice: 4.49, category: "Dairy", isOptional: false, alternatives: ["Margarine"] },
      { name: "Cheese (Cheddar)", defaultPrice: 5.99, category: "Dairy", isOptional: false, alternatives: ["Mozzarella", "Swiss"] },
      { name: "Yogurt (4-pack)", defaultPrice: 3.99, category: "Dairy", isOptional: true, alternatives: ["Greek Yogurt"] },
      
      // Meat & Protein
      { name: "Chicken Breast (2 lbs)", defaultPrice: 12.99, category: "Meat", isOptional: false, alternatives: ["Chicken Thighs", "Turkey"] },
      { name: "Ground Beef (1 lb)", defaultPrice: 5.99, category: "Meat", isOptional: false, alternatives: ["Ground Turkey", "Ground Chicken"] },
      { name: "Bacon", defaultPrice: 6.99, category: "Meat", isOptional: true, alternatives: ["Turkey Bacon"] },
      { name: "Fish (Salmon)", defaultPrice: 14.99, category: "Meat", isOptional: true, alternatives: ["Tilapia", "Cod"] },
      
      // Pantry
      { name: "Bread (Loaf)", defaultPrice: 2.99, category: "Pantry", isOptional: false, alternatives: ["Whole Wheat Bread"] },
      { name: "Rice (5 lbs)", defaultPrice: 6.99, category: "Pantry", isOptional: false, alternatives: ["Brown Rice", "Quinoa"] },
      { name: "Pasta (2 boxes)", defaultPrice: 3.98, category: "Pantry", isOptional: false, alternatives: ["Whole Wheat Pasta"] },
      { name: "Cooking Oil", defaultPrice: 5.99, category: "Pantry", isOptional: false, alternatives: ["Olive Oil", "Coconut Oil"] },
      { name: "Salt", defaultPrice: 1.99, category: "Pantry", isOptional: true, alternatives: ["Sea Salt"] },
      { name: "Pepper", defaultPrice: 2.99, category: "Pantry", isOptional: true, alternatives: ["Black Pepper"] },
      
      // Snacks & Others
      { name: "Coffee", defaultPrice: 8.99, category: "Beverages", isOptional: true, alternatives: ["Tea", "Instant Coffee"] },
      { name: "Cereal", defaultPrice: 4.99, category: "Breakfast", isOptional: true, alternatives: ["Oatmeal", "Granola"] },
      { name: "Snacks (Chips/Crackers)", defaultPrice: 3.99, category: "Snacks", isOptional: true, alternatives: ["Pretzels", "Popcorn"] }
    ],
    metadata: {
      season: ["all"],
      duration: "week",
      difficulty: "easy",
      estimatedTotal: 150.00,
      tags: ["grocery", "weekly", "family", "essentials"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 4.5
  },

  // Travel Templates
  {
    name: "Weekend Trip Packing",
    description: "Essential items for a 2-3 day trip",
    type: "system",
    category: "travel",
    icon: "fas fa-suitcase",
    items: [
      // Clothing
      { name: "T-shirts (3)", defaultPrice: 0, category: "Clothing", isOptional: false, alternatives: ["Polo Shirts"] },
      { name: "Pants/Jeans (2)", defaultPrice: 0, category: "Clothing", isOptional: false, alternatives: ["Shorts", "Skirts"] },
      { name: "Underwear (3 sets)", defaultPrice: 0, category: "Clothing", isOptional: false, alternatives: [] },
      { name: "Socks (3 pairs)", defaultPrice: 0, category: "Clothing", isOptional: false, alternatives: [] },
      { name: "Pajamas", defaultPrice: 0, category: "Clothing", isOptional: false, alternatives: ["Sleepwear"] },
      { name: "Light Jacket", defaultPrice: 0, category: "Clothing", isOptional: true, alternatives: ["Sweater", "Hoodie"] },
      
      // Toiletries
      { name: "Toothbrush", defaultPrice: 3.99, category: "Toiletries", isOptional: false, alternatives: [] },
      { name: "Toothpaste", defaultPrice: 4.99, category: "Toiletries", isOptional: false, alternatives: [] },
      { name: "Shampoo (Travel Size)", defaultPrice: 2.99, category: "Toiletries", isOptional: false, alternatives: ["2-in-1 Shampoo"] },
      { name: "Body Wash", defaultPrice: 2.99, category: "Toiletries", isOptional: false, alternatives: ["Bar Soap"] },
      { name: "Deodorant", defaultPrice: 4.99, category: "Toiletries", isOptional: false, alternatives: [] },
      { name: "Razor", defaultPrice: 8.99, category: "Toiletries", isOptional: true, alternatives: ["Electric Shaver"] },
      { name: "Medications", defaultPrice: 0, category: "Toiletries", isOptional: false, alternatives: [] },
      
      // Electronics
      { name: "Phone Charger", defaultPrice: 0, category: "Electronics", isOptional: false, alternatives: ["Wireless Charger"] },
      { name: "Headphones", defaultPrice: 0, category: "Electronics", isOptional: true, alternatives: ["Earbuds"] },
      { name: "Power Bank", defaultPrice: 29.99, category: "Electronics", isOptional: true, alternatives: [] },
      
      // Documents
      { name: "ID/Driver's License", defaultPrice: 0, category: "Documents", isOptional: false, alternatives: [] },
      { name: "Credit Cards", defaultPrice: 0, category: "Documents", isOptional: false, alternatives: [] },
      { name: "Cash", defaultPrice: 100, category: "Documents", isOptional: false, alternatives: [] },
      { name: "Travel Tickets", defaultPrice: 0, category: "Documents", isOptional: false, alternatives: ["E-tickets"] },
      
      // Accessories
      { name: "Sunglasses", defaultPrice: 0, category: "Accessories", isOptional: true, alternatives: [] },
      { name: "Umbrella", defaultPrice: 12.99, category: "Accessories", isOptional: true, alternatives: ["Raincoat"] },
      { name: "Reusable Water Bottle", defaultPrice: 15.99, category: "Accessories", isOptional: true, alternatives: [] },
      { name: "Snacks", defaultPrice: 10, category: "Food", isOptional: true, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "short",
      difficulty: "easy",
      estimatedTotal: 180.00,
      tags: ["travel", "weekend", "packing", "essentials"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 4.7
  },

  // Moving Templates
  {
    name: "Moving House Checklist",
    description: "Complete checklist for moving to a new home",
    type: "system",
    category: "moving",
    icon: "fas fa-truck",
    items: [
      // Packing Supplies
      { name: "Moving Boxes (20)", defaultPrice: 40, category: "Supplies", isOptional: false, alternatives: ["Plastic Bins"] },
      { name: "Packing Tape (3 rolls)", defaultPrice: 15, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Bubble Wrap", defaultPrice: 25, category: "Supplies", isOptional: false, alternatives: ["Packing Paper"] },
      { name: "Markers for Labeling", defaultPrice: 5, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Box Cutter", defaultPrice: 8, category: "Supplies", isOptional: false, alternatives: [] },
      
      // Services
      { name: "Moving Truck Rental", defaultPrice: 200, category: "Services", isOptional: false, alternatives: ["Moving Company"] },
      { name: "Storage Unit (if needed)", defaultPrice: 100, category: "Services", isOptional: true, alternatives: [] },
      { name: "Cleaning Service", defaultPrice: 150, category: "Services", isOptional: true, alternatives: [] },
      
      // Utilities Transfer
      { name: "Cancel/Transfer Internet", defaultPrice: 0, category: "Utilities", isOptional: false, alternatives: [] },
      { name: "Cancel/Transfer Electricity", defaultPrice: 0, category: "Utilities", isOptional: false, alternatives: [] },
      { name: "Cancel/Transfer Gas", defaultPrice: 0, category: "Utilities", isOptional: false, alternatives: [] },
      { name: "Cancel/Transfer Water", defaultPrice: 0, category: "Utilities", isOptional: false, alternatives: [] },
      { name: "Update Address with Bank", defaultPrice: 0, category: "Admin", isOptional: false, alternatives: [] },
      { name: "Update Driver's License", defaultPrice: 30, category: "Admin", isOptional: false, alternatives: [] },
      { name: "Forward Mail with USPS", defaultPrice: 20, category: "Admin", isOptional: false, alternatives: [] },
      
      // Moving Day Essentials
      { name: "First Day Box", defaultPrice: 0, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Important Documents Folder", defaultPrice: 0, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Cleaning Supplies", defaultPrice: 30, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Tool Kit", defaultPrice: 0, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Toilet Paper", defaultPrice: 10, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Hand Soap", defaultPrice: 5, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Towels", defaultPrice: 0, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Snacks and Water", defaultPrice: 20, category: "Essentials", isOptional: false, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "long",
      difficulty: "complex",
      estimatedTotal: 758,
      tags: ["moving", "relocation", "house", "checklist"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 4.8
  },

  // Event Planning Templates
  {
    name: "Birthday Party Planning",
    description: "Everything needed for a memorable birthday celebration",
    type: "system",
    category: "event",
    icon: "fas fa-birthday-cake",
    items: [
      // Venue & Decor
      { name: "Venue Booking", defaultPrice: 200, category: "Venue", isOptional: false, alternatives: ["Home Party"] },
      { name: "Balloons", defaultPrice: 20, category: "Decorations", isOptional: false, alternatives: [] },
      { name: "Streamers", defaultPrice: 10, category: "Decorations", isOptional: false, alternatives: [] },
      { name: "Banner", defaultPrice: 15, category: "Decorations", isOptional: false, alternatives: [] },
      { name: "Table Cloths", defaultPrice: 20, category: "Decorations", isOptional: false, alternatives: [] },
      
      // Food & Drinks
      { name: "Birthday Cake", defaultPrice: 50, category: "Food", isOptional: false, alternatives: ["Cupcakes"] },
      { name: "Snacks/Appetizers", defaultPrice: 80, category: "Food", isOptional: false, alternatives: [] },
      { name: "Main Course", defaultPrice: 150, category: "Food", isOptional: false, alternatives: ["Pizza", "Catering"] },
      { name: "Beverages", defaultPrice: 40, category: "Drinks", isOptional: false, alternatives: [] },
      { name: "Ice", defaultPrice: 10, category: "Drinks", isOptional: false, alternatives: [] },
      
      // Party Supplies
      { name: "Plates", defaultPrice: 15, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Cups", defaultPrice: 10, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Napkins", defaultPrice: 8, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Utensils", defaultPrice: 10, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Candles", defaultPrice: 5, category: "Supplies", isOptional: false, alternatives: [] },
      
      // Entertainment
      { name: "Music Playlist/DJ", defaultPrice: 100, category: "Entertainment", isOptional: true, alternatives: ["Spotify Playlist"] },
      { name: "Games/Activities", defaultPrice: 30, category: "Entertainment", isOptional: true, alternatives: [] },
      { name: "Party Favors", defaultPrice: 40, category: "Entertainment", isOptional: true, alternatives: [] },
      
      // Other
      { name: "Invitations", defaultPrice: 20, category: "Planning", isOptional: false, alternatives: ["E-invites"] },
      { name: "Photography", defaultPrice: 100, category: "Services", isOptional: true, alternatives: ["Friend with Camera"] },
      { name: "Gift Bags", defaultPrice: 30, category: "Supplies", isOptional: true, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "medium",
      difficulty: "medium",
      estimatedTotal: 903,
      tags: ["birthday", "party", "celebration", "event"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 4.6
  },

  // Daily Routine Templates
  {
    name: "Morning Routine",
    description: "Start your day right with this morning checklist",
    type: "system",
    category: "routine",
    icon: "fas fa-sun",
    items: [
      { name: "Wake up at set time", defaultPrice: 0, category: "Morning", isOptional: false, alternatives: [] },
      { name: "Drink water (16 oz)", defaultPrice: 0, category: "Morning", isOptional: false, alternatives: ["Lemon Water"] },
      { name: "Morning stretch (5 min)", defaultPrice: 0, category: "Exercise", isOptional: false, alternatives: ["Yoga"] },
      { name: "Shower", defaultPrice: 0, category: "Hygiene", isOptional: false, alternatives: [] },
      { name: "Brush teeth", defaultPrice: 0, category: "Hygiene", isOptional: false, alternatives: [] },
      { name: "Skincare routine", defaultPrice: 0, category: "Hygiene", isOptional: true, alternatives: [] },
      { name: "Get dressed", defaultPrice: 0, category: "Morning", isOptional: false, alternatives: [] },
      { name: "Make bed", defaultPrice: 0, category: "Morning", isOptional: false, alternatives: [] },
      { name: "Healthy breakfast", defaultPrice: 5, category: "Food", isOptional: false, alternatives: ["Protein Shake"] },
      { name: "Take vitamins", defaultPrice: 0, category: "Health", isOptional: true, alternatives: [] },
      { name: "Review daily goals", defaultPrice: 0, category: "Planning", isOptional: false, alternatives: ["Check Calendar"] },
      { name: "Pack lunch", defaultPrice: 8, category: "Food", isOptional: true, alternatives: ["Buy Lunch"] },
      { name: "Check weather", defaultPrice: 0, category: "Planning", isOptional: false, alternatives: [] },
      { name: "Grab work essentials", defaultPrice: 0, category: "Planning", isOptional: false, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "short",
      difficulty: "easy",
      estimatedTotal: 13,
      tags: ["morning", "routine", "daily", "productivity"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 4.4
  },

  // Gym Workout Template
  {
    name: "Gym Workout Checklist",
    description: "Complete gym session checklist",
    type: "system",
    category: "routine",
    icon: "fas fa-dumbbell",
    items: [
      // Pre-Workout
      { name: "Water bottle filled", defaultPrice: 0, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Gym clothes", defaultPrice: 0, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Gym shoes", defaultPrice: 0, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Towel", defaultPrice: 0, category: "Essentials", isOptional: false, alternatives: [] },
      { name: "Headphones", defaultPrice: 0, category: "Essentials", isOptional: true, alternatives: [] },
      { name: "Pre-workout snack", defaultPrice: 3, category: "Nutrition", isOptional: true, alternatives: ["Protein Bar"] },
      
      // Workout Items
      { name: "5-min warm-up", defaultPrice: 0, category: "Exercise", isOptional: false, alternatives: ["Treadmill", "Bike"] },
      { name: "Stretching", defaultPrice: 0, category: "Exercise", isOptional: false, alternatives: [] },
      { name: "Main workout (45 min)", defaultPrice: 0, category: "Exercise", isOptional: false, alternatives: [] },
      { name: "Cool-down (5 min)", defaultPrice: 0, category: "Exercise", isOptional: false, alternatives: [] },
      
      // Post-Workout
      { name: "Protein shake", defaultPrice: 5, category: "Nutrition", isOptional: true, alternatives: ["Protein Bar"] },
      { name: "Shower", defaultPrice: 0, category: "Hygiene", isOptional: false, alternatives: [] },
      { name: "Change clothes", defaultPrice: 0, category: "Hygiene", isOptional: false, alternatives: [] },
      { name: "Log workout", defaultPrice: 0, category: "Tracking", isOptional: true, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "short",
      difficulty: "medium",
      estimatedTotal: 8,
      tags: ["gym", "workout", "fitness", "exercise", "health"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 4.3
  }
];

// Function to seed system templates to database
async function seedSystemTemplates() {
  const Template = require('../models/Template');
  
  try {
    // Check if system templates already exist
    const existingCount = await Template.countDocuments({ type: 'system' });
    
    if (existingCount > 0) {
      console.log(`System templates already exist (${existingCount} templates). Skipping seed.`);
      return;
    }
    
    // Insert all system templates
    const result = await Template.insertMany(systemTemplates);
    console.log(`Successfully seeded ${result.length} system templates.`);
    
    return result;
  } catch (error) {
    console.error('Error seeding system templates:', error);
    throw error;
  }
}

module.exports = {
  systemTemplates,
  seedSystemTemplates
};