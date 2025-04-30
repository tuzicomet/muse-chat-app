import { UserDocument } from "../../models/user.model.js";

/**
 * This file extends the Express `Request` interface to include a custom `user` property.
 * The `user` property will hold the authenticated user object, typically set by the JWT middleware after verifying the user's token.
 * 
 * The global augmentation ensures that anywhere in the app, we can safely access `req.user` without TypeScript errors.
 * The `UserDocument` type is imported from the User model, ensuring that the user data matches the structure defined in the database.
 */

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}