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
  }
}, {
  timestamps: true
});

gameSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Game', gameSchema);