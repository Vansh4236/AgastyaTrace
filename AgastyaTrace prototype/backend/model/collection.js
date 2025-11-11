const mongoose = require("mongoose");

const CollectorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  species: { 
    type: String, 
    required: true, 
    trim: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  farmingType: { 
    type: String, 
    required: true, 
    enum: ["Organic", "Conventional", "Wild"] // example options
  },
  plantPart: { 
  type: String, 
  required: true, 
  enum: [
    "Leaf", "Root", "Stem", "Flower", "Seed", "Rhizome", 
    "Tubers", "Whole Plant", "Bark", "Heartwood", "Stigma", "Mycelium"
  ]
},
  location: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  sensors: {
    temperature: { type: String, default: null },
    humidity: { type: String, default: null },
    soilMoisture: { type: String, default: null },
    pH: { type: String, default: null },
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
});

// Add index for faster queries on species + timestamp
CollectorSchema.index({ species: 1, timestamp: -1 });

module.exports = mongoose.model("Collector", CollectorSchema);
