import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb'
import joi from 'joi'

const userSchema = joi.object({
  name: joi.string().required(),
});

dotenv.config();

const server = express();
server.use(cors());
server.use(json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

console.log(process.env.MONGO_URI);

let db;

mongoClient.connect().then(()=> {
  db = mongoClient.db('batepapo');
});

server.post('/participants', async (req, res) => {
  const user = req.body;
  const validation = userSchema.validate(user, { abortEarly: false });
  if (validation.error) 
  {
      console.log(validation.error.details);
      res.sendStatus(422);
  }
  try {
    const u = await db.collection('participants').findOne({name : user.name });
    if(u) 
    {
      return res.sendStatus(409);
    }
    else
    {
      const participant = {name : user.name, lastStatus: Date.now()};
      const msg = {from: user.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: 'HH:MM:SS'};
      db.collection('participants').insertOne(participant);
      db.collection('msgs').insertOne(msg);
      res.sendStatus(201);
    }
    

  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});


server.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});
