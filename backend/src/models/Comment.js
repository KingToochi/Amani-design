import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
  // Target of the comment
  targetType: {
    type: String,
    enum: ['product', 'post', 'article', 'sale', 'user'],
    required: [true, 'Target type is required'],
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required'],
    refPath: 'targetType',
    index: true
  },
  
  // Parent comment for nested/reply functionality
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  
  // Author information
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author ID is required'],
    index: true
  },
  

  // Comment content
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must have at least 1 character'],
    maxlength: [5000, 'Comment cannot exceed 5000 characters']
  },
  
  // Rating (if applicable)
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: null
  },
  
  // Status and moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam', 'deleted'],
    default: 'pending',
    index: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  
  // Engagement metrics
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'file', 'link']
    },
    url: String,
    thumbnailUrl: String
  }],
  
  // Metadata
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  editedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware to update likeCount before saving
commentSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likeCount = this.likes.length;
  }
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId'
});

// Virtual for nested replies count
commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId',
  count: true
});

// Indexes for performance
commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
commentSchema.index({ authorId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ status: 1, createdAt: -1 });
commentSchema.index({ rating: -1 });
commentSchema.index({ likeCount: -1 });

// Static method to get comments with pagination
commentSchema.statics.getPaginatedComments = async function(targetType, targetId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const comments = await this.find({
    targetType,
    targetId,
    parentCommentId: null,
    status: 'approved'
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('authorId', 'name avatar');
  
  const total = await this.countDocuments({
    targetType,
    targetId,
    parentCommentId: null,
    status: 'approved'
  });
  
  return {
    comments,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};


export default mongoose.model('Comments', commentSchema);