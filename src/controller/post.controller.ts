import { Request, Response } from "express";

import { VerifiedRequest } from "../common/types";
import { ApiResponse } from "../utils/ApiResponse";
import httpStatus from 'http-status';
import { Post } from "../models/post.model";

export const createPost = async (req: VerifiedRequest, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const userId = req.user._id;
        const { title, subtitle, content } = req.body;

        // validating required fields
        if (!title || !content) {
            apiResponse.error = "";

            if (!title) {
                apiResponse.error += "Title is missing";
            }
            if (!content) {
                apiResponse.error += "\nContent is missing";
            }

            apiResponse.status_code = httpStatus.BAD_REQUEST;

            res.status(httpStatus.BAD_REQUEST).send(apiResponse);
            return;
        }

        // creating new post
        const createNewPost = new Post({
            userId: userId,
            title: title,
            subtitle: subtitle,
            content: content,
        });

        // save post
        createNewPost.save();

        apiResponse.data = ['Uploaded new post'];
        apiResponse.status_code = httpStatus.CREATED;

        res.status(httpStatus.CREATED).send(apiResponse);
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}

export const getPosts = async (req: Request, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 5);

        const offset = (page - 1) * limit;

        const allPosts = await Post.aggregate([
            {
                $project: {
                    "userId": "$userId",
                    "title": "$title",
                    "subtitle": "$subtitle",
                    "content": "$content",
                    "comments": "$comments",
                    "noOfComments": { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: 0 } },
                    "updatedAt": "$updatedAt",
                    "createdAt": "$createdAt"
                },
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "comments",
                    foreignField: "_id",
                    as: "allComments",
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $project: {
                    "postedBy": {
                        "_id": { $arrayElemAt: ["$userDetails._id", 0] },
                        "fullname": { $arrayElemAt: ["$userDetails.fullname", 0] },
                        "username": { $arrayElemAt: ["$userDetails.username", 0] },
                    },
                    "title": 1,
                    "subtitle": 1,
                    "content": 1,
                    "comments": "$allComments",
                    "noOfComments": 1,
                    "commentUsers": 1,
                    "updatedAt": 1,
                    "createdAt": 1,
                }
            },
            {
                $set: {
                    comments: {
                        $map: {
                            input: "$comments",
                            as: "comments",
                            in: {
                                "_id": "$$comments._id",
                                "comment": "$$comments.comment",
                                "createdAt": "$$comments.createdAt",
                                "updatedAt": "$$comments.updatedAt",
                                "userId": {
                                    $convert: {
                                        input: "$$comments.userId",
                                        to: "objectId",
                                        onError: null,
                                        onNull: null,
                                    }
                                }
                            },
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "comments.userId",
                    foreignField: "_id",
                    as: "commentedBy"
                }
            },
            {
                $set: {
                    commentedBy: {
                        $map: {
                            input: "$commentedBy",
                            as: "commentedBy",
                            in: {
                                "_id": "$$commentedBy._id",
                                "fullname": "$$commentedBy.fullname",
                                "username": "$$commentedBy.username",
                            }
                        }
                    }
                }
            }
        ]).skip(offset).limit(limit);

        apiResponse.data = [
            {
                allPosts: allPosts,
            }
        ];
        apiResponse.status_code = httpStatus.OK;

        res.status(httpStatus.OK).send(apiResponse);
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}
