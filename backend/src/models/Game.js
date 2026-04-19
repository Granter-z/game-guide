const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  official_name_zh: String,
  slug: String,
  description: String,
  backgroundImage: String,
  released: String,
  metacritic: Number,
  platforms: [{
    platform: {
      id: Number,
      name: String,
      slug: String
    }
  }],
  genres: [{
    id: Number,
    name: String,
    slug: String
  }],
  tags: [{
    id: Number,
    name: String,
    slug: String
  }],
  developers: [{
    id: Number,
    name: String
  }],
  publishers: [{
    id: Number,
    name: String
  }],
  website: String,
  reddit_url: String,
  stores: [{
    id: Number,
    url: String,
    store: {
      id: Number,
      name: String,
      slug: String,
      domain: String,
      games_count: Number,
      image_background: String
    }
  }],
  screenshots: [String],
  trailers: [{
    id: Number,
    name: String,
    preview: String,
    data: {
      max: String
    }
  }],
  requirements: {
    minimum: String,
    recommended: String
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  enhancedContent: {
    schemaVersion: { type: Number, default: 1 },
    highlights: [String],
    beginnerTips: [String],
    advancedTips: [String],
    faq: [{
      q: String,
      a: String
    }]
  }
}, {
  timestamps: true
});

gameSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Game', gameSchema);