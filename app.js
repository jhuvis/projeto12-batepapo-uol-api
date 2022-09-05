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
      return res.sendStatus(201);
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

server.get('/messages', async (req, res) => {
  const { user } = req.headers;
  const { limit } = req.query;
 
  try {
    const msgs = await db.collection('msgs').find({ $or: [
      {from : user}, 
      {to : "Todos"},
      {to : user}
    ]
    }).toArray();

    if(limit < msgs.length)
    {
      const msg = msgs.slice(-limit);
      return res.send(msg);
    }
    else
    {
      return res.send(msgs);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

server.post('/status', async (req, res) => {
  const { user } = req.headers;
  const lastStatus = Date.now();
  try {
    const u = await db.collection('participants').findOne({name : user });
    if(!u)
    {
      return res.sendStatus(404);
    }
    else
    {
      await db.collection('participants').updateOne({ name: user }, { $set: {lastStatus} });
      res.sendStatus(200);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

setInterval(async () => {
  const limit = 10000;
  const now = Date.now();
  try {
    const p = await db.collection('participants').find().toArray();
    for(let i = 0; i < p.length; i++)
    {
      if(p[i].lastStatus + limit < now )
      {
        const msg = {from: p[i].name, to: 'Todos', text: 'sai da sala...', type: 'status', time: dayjs().format("HH:mm:ss")};
        db.collection('msgs').insertOne(msg);
        await db.collection('participants').deleteOne({ _id: new ObjectId(p[i]._id) });  
      }
    }
  } catch (error) {
    console.error(error);
  }
  
}, 15000);


server.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});
