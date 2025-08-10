// Fixed System Templates Data for ChecklistPro
// These templates are predefined and available to all users

const systemTemplates = [
  // Shopping Template
  {
    name: "Weekly Grocery Shopping",
    description: "Complete grocery list for a family weekly shopping",
    type: "system",
    category: "shopping",
    icon: "fas fa-shopping-cart",
    items: [
      { name: "Milk (Gallon)", defaultPrice: 3.99, category: "Dairy", isOptional: false, alternatives: [] },
      { name: "Bread", defaultPrice: 2.99, category: "Bakery", isOptional: false, alternatives: [] },
      { name: "Eggs (Dozen)", defaultPrice: 4.99, category: "Dairy", isOptional: false, alternatives: [] },
      { name: "Chicken Breast (2 lbs)", defaultPrice: 12.99, category: "Meat", isOptional: false, alternatives: [] },
      { name: "Rice (5 lbs)", defaultPrice: 6.99, category: "Pantry", isOptional: false, alternatives: [] },
      { name: "Bananas", defaultPrice: 2.99, category: "Produce", isOptional: false, alternatives: [] },
      { name: "Apples (3 lbs)", defaultPrice: 4.99, category: "Produce", isOptional: false, alternatives: [] },
      { name: "Tomatoes (2 lbs)", defaultPrice: 3.99, category: "Produce", isOptional: false, alternatives: [] },
      { name: "Onions (3 lbs)", defaultPrice: 2.99, category: "Produce", isOptional: false, alternatives: [] },
      { name: "Coffee", defaultPrice: 8.99, category: "Beverages", isOptional: true, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "medium",
      difficulty: "beginner",
      estimatedTotal: 55.94,
      tags: ["grocery", "weekly", "family", "essentials"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 4
  },

  // Travel Template
  {
    name: "Weekend Trip Packing",
    description: "Essential items for a 2-3 day trip",
    type: "system",
    category: "travel",
    icon: "fas fa-suitcase",
    items: [
      { name: "T-shirts (3)", defaultPrice: 0, category: "Clothing", isOptional: false, alternatives: [] },
      { name: "Pants (2)", defaultPrice: 0, category: "Clothing", isOptional: false, alternatives: [] },
      { name: "Underwear (3 sets)", defaultPrice: 0, category: "Clothing", isOptional: false, alternatives: [] },
      { name: "Toothbrush", defaultPrice: 3.99, category: "Toiletries", isOptional: false, alternatives: [] },
      { name: "Toothpaste", defaultPrice: 4.99, category: "Toiletries", isOptional: false, alternatives: [] },
      { name: "Phone Charger", defaultPrice: 0, category: "Electronics", isOptional: false, alternatives: [] },
      { name: "ID/Passport", defaultPrice: 0, category: "Documents", isOptional: false, alternatives: [] },
      { name: "Cash/Cards", defaultPrice: 100, category: "Money", isOptional: false, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "short",
      difficulty: "beginner",
      estimatedTotal: 108.98,
      tags: ["travel", "weekend", "packing", "essentials"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 5
  },

  // Event Planning Template
  {
    name: "Birthday Party Planning",
    description: "Everything needed for a birthday celebration",
    type: "system",
    category: "event",
    icon: "fas fa-birthday-cake",
    items: [
      { name: "Birthday Cake", defaultPrice: 50, category: "Food", isOptional: false, alternatives: [] },
      { name: "Decorations", defaultPrice: 30, category: "Decor", isOptional: false, alternatives: [] },
      { name: "Balloons", defaultPrice: 20, category: "Decor", isOptional: false, alternatives: [] },
      { name: "Party Plates", defaultPrice: 15, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Party Cups", defaultPrice: 10, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Napkins", defaultPrice: 8, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Snacks", defaultPrice: 40, category: "Food", isOptional: false, alternatives: [] },
      { name: "Beverages", defaultPrice: 30, category: "Drinks", isOptional: false, alternatives: [] },
      { name: "Party Games", defaultPrice: 25, category: "Entertainment", isOptional: true, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "short",
      difficulty: "intermediate",
      estimatedTotal: 228,
      tags: ["birthday", "party", "celebration", "event"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 4
  },

  // Moving Template
  {
    name: "Moving House Checklist",
    description: "Complete checklist for moving to a new home",
    type: "system",
    category: "moving",
    icon: "fas fa-truck",
    items: [
      { name: "Moving Boxes (20)", defaultPrice: 40, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Packing Tape", defaultPrice: 15, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Bubble Wrap", defaultPrice: 25, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Markers", defaultPrice: 5, category: "Supplies", isOptional: false, alternatives: [] },
      { name: "Moving Truck Rental", defaultPrice: 200, category: "Services", isOptional: false, alternatives: [] },
      { name: "Update Address", defaultPrice: 0, category: "Admin", isOptional: false, alternatives: [] },
      { name: "Transfer Utilities", defaultPrice: 0, category: "Admin", isOptional: false, alternatives: [] },
      { name: "Cleaning Supplies", defaultPrice: 30, category: "Supplies", isOptional: false, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "long",
      difficulty: "advanced",
      estimatedTotal: 315,
      tags: ["moving", "relocation", "house", "checklist"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 5
  },

  // Daily Routine Template
  {
    name: "Morning Routine",
    description: "Start your day right with this morning checklist",
    type: "system",
    category: "routine",
    icon: "fas fa-sun",
    items: [
      { name: "Wake up at 7 AM", defaultPrice: 0, category: "Morning", isOptional: false, alternatives: [] },
      { name: "Drink water", defaultPrice: 0, category: "Health", isOptional: false, alternatives: [] },
      { name: "Morning stretch", defaultPrice: 0, category: "Exercise", isOptional: false, alternatives: [] },
      { name: "Shower", defaultPrice: 0, category: "Hygiene", isOptional: false, alternatives: [] },
      { name: "Breakfast", defaultPrice: 5, category: "Food", isOptional: false, alternatives: [] },
      { name: "Review daily goals", defaultPrice: 0, category: "Planning", isOptional: false, alternatives: [] },
      { name: "Pack lunch", defaultPrice: 8, category: "Food", isOptional: true, alternatives: [] }
    ],
    metadata: {
      season: ["all"],
      duration: "short",
      difficulty: "beginner",
      estimatedTotal: 13,
      tags: ["morning", "routine", "daily", "productivity"]
    },
    usageCount: 0,
    isPublic: true,
    rating: 4
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