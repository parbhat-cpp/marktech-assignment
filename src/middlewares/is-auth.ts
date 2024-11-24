import { NextFunction, Response } from "express";
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import { VerifiedRequest } from "../common/types";
import { ApiResponse } from "../utils/ApiResponse";
import config from "../common/config";

export const isAuth = (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const apiResponse = new ApiResponse();

    try {
        const token = req.headers.authorization?.split(" ")[1] as string;

        if (!token) {
            apiResponse.error = "Authorization Error: No token provided";
            apiResponse.status_code = httpStatus.UNAUTHORIZED;

            res.status(httpStatus.UNAUTHORIZED).send(apiResponse);
            return;
        }

        const decoded = jwt.verify(token, config.JWT_SECRET as string);

        req.user = decoded;
        next();
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}
