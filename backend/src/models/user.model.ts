import mongoose from "mongoose";

// Mongoose schema for the User collection
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6, // password should be hashed anyways
        },
        profilePic: {
            type: String,
            default: "", // Optional, should use a placeholder image if empty
        },
        aboutMe: {
            type: String,
            default: "", // Optional
        },
    },
    { timestamps: true } // Automatically creates `createdAt` & `updatedAt` fields
);

// Creates a Mongoose model named "User" based on the userSchema
// NOTE: use capitalised singular form word for the model name (first argument) as
// Mongoose will automatically pluralise (and lowercase) it to make the collection name in MongoDB
const User = mongoose.model("User", userSchema);

// Export User to be usable in other files
export default User;