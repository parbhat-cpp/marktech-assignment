import express from 'express';
import userRouter from "./user.route";
import postRouter from "./post.route";
import commentRouter from "./comment.route";

interface Route {
    path: string;
    route: express.Router;
}

const router = express.Router();

const routes: Array<Route> = [
    {
        path: "/user",
        route: userRouter,
    },
    {
        path: "/posts",
        route: postRouter,
    },
    {
        path: "/comments",
        route: commentRouter,
    }
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
