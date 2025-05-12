import mongoose from "mongoose";
import crypto from "crypto";

const refreshTokenSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		token: {
			type: String,
			required: true,
			unique: true,
		},
		isRevoked: {
			type: Boolean,
			default: false,
			index: true,
		},
		revokedAt: {
			type: Date,
			default: null,
			index: {
				expireAfterSeconds: 86400,
				partialFilterExpression: { revokedAt: { $type: "date" } },
			},
		},
		expiresAt: {
			type: Date,
			required: true,
			index: { expireAfterSeconds: 0 },
		},
	},
	{ timestamps: true },
);

refreshTokenSchema.pre("save", function (next) {
	if (!this.isModified("token")) return next();

	this.token = crypto.createHash("sha256").update(this.token).digest("hex");
	next();
});

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
