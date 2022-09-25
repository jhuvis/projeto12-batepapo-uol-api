import mongo from '../db/db.js';

let db = await mongo();

export async function getpoll (req, res){
    try {
        await db.collection("poll").find().toArray().then(polls => {
            return res.status(201).send(polls);
        });
    } catch (error) {
        console.log(error);
       res.status(500).send('Não foi possível conectar ao servidor!');
    }
};

export async function postpoll(req, res){
    try {
       
        await db.collection("poll").insertOne(res.locals.poll);
        
        return res.status(201).send(res.locals.poll);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send('Não foi possível conectar ao servidor!');
    }
};