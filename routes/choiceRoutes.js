import express from 'express';
import { getchoice, postchoice, vote } from '../controllers/choiceControllers.js';
import choiceMid from '../middlewares/choiceMiddleware.js';

const choiceRoutes = express.Router();
choiceRoutes.post("/choice", choiceMid, postchoice); 
choiceRoutes.get("/poll/:id/choice", getchoice); 
choiceRoutes.post("/choice/:id/vote", vote); 

export default choiceRoutes;