import { Request, Response } from "express";

// Handle user sign up requests
export const signup = (req: Request, res: Response) => {
    res.send("signup route")
}

// Handle user login requests
export const login = (req: Request, res: Response) => {
    res.send("login route")
}

// Handle user logout requests
export const logout = (req: Request, res: Response) => {
    res.send("logout route")
}