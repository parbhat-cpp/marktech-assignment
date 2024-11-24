import { Request, Response } from "express";
import httpStatus from "http-status";

export const routeNotFound = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).send('Route not found');
}
