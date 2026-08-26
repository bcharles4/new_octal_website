import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    type: { type: String, default: 'Full-time', trim: true },
    description: { type: String, required: true },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
  },
  {
    timestamps: true,
    /* The API has always handed the frontend a plain `id` string, so keep that
       contract and hide Mongo's internals. */
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

/* Newest listing first on the careers page and in the dashboard. */
jobSchema.index({ createdAt: -1 });

export const Job = mongoose.model('Job', jobSchema);
