import express from 'express';
import { getpoll, postpoll, result } from '../controllers/pollControllers.js';
import pullMid from '../middlewares/pollMiddleware.js';

const pollRoutes = express.Router();
pollRoutes.post("/poll", pullMid, postpoll); 
pollRoutes.get("/poll", getpoll); 
pollRoutes.get("/poll/:id/result", result); 

export default pollRoutes;