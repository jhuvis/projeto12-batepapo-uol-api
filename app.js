import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import joi from 'joi';
import dayjs from 'dayjs';

const userSchema = joi.object({
  name: joi.string().required(),
});

const msgSchema = joi.object({
  to: joi.string().required(),
  text: joi.string().required(),
  type: joi.string().required(),
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
      const msg = {from: user.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format("HH:mm:ss")};
      db.collection('participants').insertOne(participant);
      db.collection('msgs').insertOne(msg);
      res.sendStatus(201);
    }
    

  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

server.get('/participants', async (req, res) => {
  try {
    const participants = await db.collection('participants').find().toArray();
    res.send(participants);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

server.post('/messages', async (req, res) => {
  const to = req.body.to;
  const text = req.body.text;
  const type = req.body.type;
  const { user } = req.headers;
  console.log(user);
  
  const validation = msgSchema.validate(req.body, { abortEarly: false });
  if (validation.error) 
  {
    const erros = validation.error.details.map((detail) => detail.message);
    res.status(422).send(erros);
    return;
  }
  if((type === "message") || (type === "private_message")){}
  else
  {
    console.log("salve carai");
    res.status(422).send("type errado");
    return;
  }
  try {
    const u = await db.collection('participants').findOne({name : user });
    if(u) 
    {
      const msg = {from: user, to: to, text: text, type: type, time: dayjs().format("HH:mm:ss")};
      db.collection('msgs').insertOne(msg);
      return res.sendStatus(201);
    }
    else
    {
      return res.sendStatus(409);
    }
    

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

server.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});
