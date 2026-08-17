const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, trim: true }
}, { timestamps: true });

fieldSchema.index({ category: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Field', fieldSchema);
