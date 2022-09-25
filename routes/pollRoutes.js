import express from 'express';
import { getpoll, postpoll } from '../controllers/pollControllers.js';
import pullMid from '../middlewares/pollMiddleware.js';

const pollRoutes = express.Router();
pollRoutes.post("/poll", pullMid, postpoll); 
pollRoutes.get("/poll", getpoll); 

export default pollRoutes;