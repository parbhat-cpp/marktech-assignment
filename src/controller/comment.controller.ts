import { Response } from "express";
import { VerifiedRequest } from "../common/types";
import { ApiResponse } from "../utils/ApiResponse";
import httpStatus from 'http-status';
import { Post } from "../models/post.model";
import { Comment } from "../models/comment.model";
import * as SocketIO from 'socket.io';

export const postComment = async (req: VerifiedRequest, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const id = req.user._id;
        const socket: SocketIO.Server = req.app.get("socket");

        const { post_id, comment } = req.body;

        if (!post_id || !comment) {
            apiResponse.error = "";

            if (!post_id) {
                apiResponse.error += "No post_id provided";
            }

            if (!comment) {
                apiResponse.error += "\nAdd a comment";
            }

            apiResponse.status_code = httpStatus.BAD_REQUEST;
            res.status(httpStatus.BAD_REQUEST).send(apiResponse);
            return;
        }

        const postExists = await Post.findOne({
            _id: post_id
        });

        if (!postExists) {
            apiResponse.error = "Post doesn't exists with the provided post_id";
            apiResponse.status_code = httpStatus.NOT_FOUND;

            res.status(httpStatus.NOT_FOUND).send(apiResponse);
            return;
        }

        const postOwnerId = postExists.userId;

        const postNewComment = new Comment({
            userId: id,
            comment: comment,
        });

        postNewComment.save();
        postExists.comments.push(postNewComment._id);
        postExists.save();

        apiResponse.data = ['Comment posted'];
        apiResponse.status_code = httpStatus.CREATED;

        res.status(httpStatus.CREATED).send(apiResponse);
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}
