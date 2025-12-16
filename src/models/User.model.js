const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      unique: true, 
      required: true 
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    fullName: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    otpHash: { 
      type: String, 
      select: false 
    },
    otpExpiredAt: { 
      type: Date, 
      select: false 
    },
    refreshTokens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RefreshToken"
      }
    ]
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("User", userSchema);