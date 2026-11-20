const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    isVeg: {
      type: Boolean,
      default: true
    },
    spiceLevel: {
      type: String,
      enum: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'],
      default: 'Medium'
    },
    servingSize: {
      type: String,
      default: 'Serves 1-2'
    },
    image: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isChefSpecial: {
      type: Boolean,
      default: false
    },
    preparationTime: {
      type: String,
      default: '15-20 mins'
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

menuItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

menuItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Menu', menuItemSchema);
