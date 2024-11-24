import { Request, Response } from "express";

import { ApiResponse } from "../utils/ApiResponse";
import httpStatus from 'http-status';
import { User } from "../models/user.model";
import jwt from 'jsonwebtoken';
import config from "../common/config";

export const signupUser = async (req: Request, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const { fullname, username, email, password } = req.body;

        // Check if all required data is present
        if (!fullname || !username || !email || !password) {
            // error is any ny default, so changing its type to string here.
            apiResponse.error = "";

            if (!fullname) {
                apiResponse.error = "Fullname missing";
            }
            if (!username) {
                apiResponse.error += "\nUsername missing";
            }
            if (!email) {
                apiResponse.error += "\nEmail missing";
            }
            if (!password) {
                apiResponse.error += "\nPassword missing";
            }

            apiResponse.status_code = httpStatus.UNPROCESSABLE_ENTITY;
            res.status(httpStatus.UNPROCESSABLE_ENTITY).send(apiResponse);
            return;
        }

        // Try to fetch user with provided email and username. To check if user already exists.
        const userExists = await User.aggregate([
            {
                $match: {
                    $or: [
                        {
                            username: username
                        },
                        {
                            email: email
                        }
                    ]
                }
            }
        ]);

        // check if user already exists with provided email and username
        if (userExists[0]) {
            apiResponse.error = "User already exists with the provided username or email";
            apiResponse.status_code = httpStatus.BAD_REQUEST;

            res.send(apiResponse);
            return;
        }

        // creating new user
        const createNewUser = new User({
            fullname, username, email, password
        });

        createNewUser.save();

        const userData = {
            _id: createNewUser._id,
            fullname: createNewUser.fullname,
            username: createNewUser.username,
            email: createNewUser.email,
        };

        const token = jwt.sign(userData, config.JWT_SECRET, { expiresIn: '30d' });

        apiResponse.data = [
            {
                ...userData, token,
            }
        ];

        apiResponse.status_code = httpStatus.CREATED;
        res.status(httpStatus.CREATED).send(apiResponse);
    } catch (error) {
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;
        apiResponse.error = error?.toString();

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            // assigning empty string to error to change its type to string
            apiResponse.error = "";

            if (!email) {
                apiResponse.error += "Email missing";
            }
            if (!password) {
                apiResponse.error += "\nPassword missing";
            }
            apiResponse.status_code = httpStatus.UNPROCESSABLE_ENTITY;
            res.send(apiResponse);
            return;
        }

        const userExists = await User.findOne({
            email
        });

        // if user doesn't exists
        if (!userExists) {
            apiResponse.error = "User doesn't exists";
            apiResponse.status_code = httpStatus.NOT_FOUND;

            res.send(apiResponse);
            return;
        }

        const correctPassword = await userExists.isPasswordMatch(password);

        // check if password is correct
        if (!correctPassword) {
            apiResponse.error = "Incorrect password";
            apiResponse.status_code = httpStatus.BAD_REQUEST;

            res.send(apiResponse);
            return;
        }

        const userData = {
            _id: userExists._id,
            fullname: userExists.fullname,
            username: userExists.username,
            email: userExists.email,
        }

        const token = jwt.sign(userData, config.JWT_SECRET, { expiresIn: '30d' });

        apiResponse.data = [
            { ...userData, token }
        ];
        apiResponse.status_code = httpStatus.OK;

        res.send(apiResponse);
    } catch (error) {
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;
        apiResponse.error = error?.toString();

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}
