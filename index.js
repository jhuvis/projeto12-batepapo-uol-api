import express from 'express';
import cors from 'cors';
import mongo from './db/db.js';
import pollRoutes from './routes/pollRoutes.js';
import choiceRoutes from './routes/choiceRoutes.js';

let db = await mongo();

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();
router.use(pollRoutes);
router.use(choiceRoutes);



app.use(router);

app.listen(process.env.PORT, () => console.log(`App running in port: 5000`));