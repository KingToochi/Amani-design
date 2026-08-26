import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
  // Product information
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
    index: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
    index: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  
  // Sale details
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    default: 0
  },
  tax: {
    type: Number,
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: [0, 'Final amount cannot be negative']
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'cash', 'paypal', 'bank_transfer', 'crypto'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'processing',
    index: true
  },
  
  // Dates
  saleDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  deliveryDate: {
    type: Date
  },
  
  // Additional information
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // This automatically manages createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware to calculate amounts before saving
salesSchema.pre('save', function(next) {
  this.totalAmount = this.quantity * this.unitPrice;
  this.finalAmount = this.totalAmount - this.discount + this.tax;
  next();
});

// Indexes for better query performance
salesSchema.index({ saleDate: -1, paymentStatus: 1 });
salesSchema.index({ customerId: 1, saleDate: -1 });
salesSchema.index({ productId: 1, saleDate: -1 });

// Virtual for profit calculation (if cost field exists)
salesSchema.virtual('profit').get(function() {
  if (this.costPerUnit) {
    return (this.unitPrice - this.costPerUnit) * this.quantity;
  }
  return null;
});

export default mongoose.model('Sale', salesSchema);