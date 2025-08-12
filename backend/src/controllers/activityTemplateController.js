// Activity templates matching the frontend ItineraryBuilderEnhanced.jsx
const activityTemplates = {
  "Sightseeing": [
    { name: "Visit famous landmarks", duration: "2h", category: "Sightseeing", priority: "high" },
    { name: "City walking tour", duration: "3h", category: "Sightseeing", priority: "medium" },
    { name: "Museum visit", duration: "2h", category: "Sightseeing", priority: "medium" },
    { name: "Historical sites", duration: "1.5h", category: "Sightseeing", priority: "medium" },
    { name: "Viewpoint/Observatory", duration: "1h", category: "Sightseeing", priority: "low" }
  ],
  "Food & Dining": [
    { name: "Local breakfast", duration: "1h", category: "Food & Dining", priority: "medium", cost: 15 },
    { name: "Street food tour", duration: "2h", category: "Food & Dining", priority: "high", cost: 25 },
    { name: "Fine dining dinner", duration: "2.5h", category: "Food & Dining", priority: "low", cost: 80 },
    { name: "Local market visit", duration: "1.5h", category: "Food & Dining", priority: "medium", cost: 10 },
    { name: "Cooking class", duration: "3h", category: "Food & Dining", priority: "medium", cost: 50 }
  ],
  "Adventure": [
    { name: "Hiking/Trekking", duration: "4h", category: "Adventure", priority: "high", cost: 30 },
    { name: "Water sports", duration: "3h", category: "Adventure", priority: "medium", cost: 60 },
    { name: "Adventure park", duration: "2h", category: "Adventure", priority: "medium", cost: 40 },
    { name: "Rock climbing", duration: "3h", category: "Adventure", priority: "high", cost: 70 },
    { name: "Safari/Wildlife tour", duration: "6h", category: "Adventure", priority: "high", cost: 120 }
  ],
  "Cultural": [
    { name: "Traditional show/performance", duration: "2h", category: "Cultural", priority: "medium", cost: 45 },
    { name: "Local festival", duration: "4h", category: "Cultural", priority: "high", cost: 20 },
    { name: "Art gallery visit", duration: "1.5h", category: "Cultural", priority: "medium", cost: 15 },
    { name: "Cultural workshop", duration: "2.5h", category: "Cultural", priority: "medium", cost: 35 },
    { name: "Religious site visit", duration: "1h", category: "Cultural", priority: "low", cost: 0 }
  ],
  "Transportation": [
    { name: "Airport/Station transfer", duration: "1h", category: "Transportation", priority: "high", cost: 25 },
    { name: "Local transport", duration: "30min", category: "Transportation", priority: "medium", cost: 5 },
    { name: "Car rental pickup", duration: "30min", category: "Transportation", priority: "medium", cost: 0 },
    { name: "Train journey", duration: "varies", category: "Transportation", priority: "medium", cost: 50 },
    { name: "Flight", duration: "varies", category: "Transportation", priority: "high", cost: 200 }
  ],
  "Shopping": [
    { name: "Local souvenir shopping", duration: "2h", category: "Shopping", priority: "low", cost: 30 },
    { name: "Traditional market browse", duration: "1.5h", category: "Shopping", priority: "medium", cost: 20 },
    { name: "Mall visit", duration: "2h", category: "Shopping", priority: "low", cost: 50 },
    { name: "Artisan workshop visit", duration: "1h", category: "Shopping", priority: "medium", cost: 25 }
  ],
  "Entertainment": [
    { name: "Live music venue", duration: "3h", category: "Entertainment", priority: "medium", cost: 30 },
    { name: "Theater performance", duration: "2.5h", category: "Entertainment", priority: "medium", cost: 60 },
    { name: "Nightlife experience", duration: "4h", category: "Entertainment", priority: "low", cost: 50 },
    { name: "Cinema/Movies", duration: "2h", category: "Entertainment", priority: "low", cost: 15 }
  ],
  "Relaxation": [
    { name: "Spa/Wellness center", duration: "2h", category: "Relaxation", priority: "low", cost: 80 },
    { name: "Beach time", duration: "3h", category: "Relaxation", priority: "medium", cost: 0 },
    { name: "Park/Garden stroll", duration: "1h", category: "Relaxation", priority: "low", cost: 0 },
    { name: "Meditation/Yoga class", duration: "1.5h", category: "Relaxation", priority: "low", cost: 25 }
  ]
};

// Get all activity templates
exports.getAllTemplates = async (req, res) => {
  try {
    res.json({
      success: true,
      templates: activityTemplates
    });
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching templates'
    });
  }
};

// Get templates by category
exports.getTemplatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const templates = activityTemplates[category];
    if (!templates) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      category,
      templates
    });
  } catch (err) {
    console.error('Get category templates error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching category templates'
    });
  }
};

// Get activity categories
exports.getCategories = async (req, res) => {
  try {
    const categories = Object.keys(activityTemplates).map(category => ({
      name: category,
      count: activityTemplates[category].length,
      description: getCategoryDescription(category)
    }));

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
};

// Helper function to get category descriptions
function getCategoryDescription(category) {
  const descriptions = {
    "Sightseeing": "Explore landmarks, monuments, and famous attractions",
    "Food & Dining": "Discover local cuisine and dining experiences",
    "Adventure": "Thrilling outdoor activities and sports",
    "Cultural": "Immerse in local traditions and cultural experiences",
    "Transportation": "Travel and transfer arrangements",
    "Shopping": "Browse local markets and shopping areas",
    "Entertainment": "Shows, performances, and nightlife",
    "Relaxation": "Peaceful activities for rest and rejuvenation"
  };
  return descriptions[category] || "Various activities and experiences";
}

// Generate personalized activity suggestions based on user preferences
exports.getPersonalizedSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { city, interests, budget, duration, travelStyle } = req.query;

    // Get user's travel preferences
    const user = req.user;
    const userInterests = interests ? interests.split(',') : 
                         user.interests ? user.interests.toLowerCase().split(',').map(i => i.trim()) : [];
    
    const suggestions = [];
    
    // Score and filter activities based on preferences
    Object.keys(activityTemplates).forEach(category => {
      const categoryActivities = activityTemplates[category];
      
      categoryActivities.forEach(activity => {
        let score = 0;
        
        // Interest matching
        if (userInterests.some(interest => 
          category.toLowerCase().includes(interest) || 
          activity.name.toLowerCase().includes(interest)
        )) {
          score += 3;
        }
        
        // Budget consideration
        if (budget && activity.cost) {
          const budgetNum = parseInt(budget);
          if (activity.cost <= budgetNum * 0.5) score += 2;
          else if (activity.cost <= budgetNum) score += 1;
          else score -= 1;
        }
        
        // Travel style matching
        if (travelStyle) {
          if (travelStyle === 'adventure' && category === 'Adventure') score += 2;
          if (travelStyle === 'cultural' && category === 'Cultural') score += 2;
          if (travelStyle === 'relaxed' && category === 'Relaxation') score += 2;
          if (travelStyle === 'foodie' && category === 'Food & Dining') score += 2;
        }
        
        // Duration matching
        if (duration && activity.duration) {
          const activityDuration = parseDuration(activity.duration);
          const preferredDuration = parseDuration(duration);
          if (Math.abs(activityDuration - preferredDuration) <= 60) score += 1;
        }
        
        if (score > 0) {
          suggestions.push({
            ...activity,
            score,
            id: require('crypto').randomUUID()
          });
        }
      });
    });
    
    // Sort by score and return top suggestions
    suggestions.sort((a, b) => b.score - a.score);
    
    res.json({
      success: true,
      suggestions: suggestions.slice(0, 20),
      criteria: {
        city,
        interests: userInterests,
        budget,
        duration,
        travelStyle
      }
    });
  } catch (err) {
    console.error('Get personalized suggestions error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error generating suggestions'
    });
  }
};

// Helper function to parse duration strings
function parseDuration(durationStr) {
  if (!durationStr) return 0;
  
  const matches = durationStr.match(/(\d+(?:\.\d+)?)\s*(h|hour|min|minute)/i);
  if (!matches) return 0;
  
  const value = parseFloat(matches[1]);
  const unit = matches[2].toLowerCase();
  
  if (unit.startsWith('h')) {
    return value * 60; // Convert to minutes
  } else {
    return value; // Already in minutes
  }
}

module.exports = {
  getAllTemplates: exports.getAllTemplates,
  getTemplatesByCategory: exports.getTemplatesByCategory,
  getCategories: exports.getCategories,
  getPersonalizedSuggestions: exports.getPersonalizedSuggestions
};
