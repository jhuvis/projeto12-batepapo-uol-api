import mongo from '../db/db.js';
import { ObjectId } from 'mongodb';

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

export async function result(req, res){
    try {
        const { id } = req.params;
        const poll = await db.collection('poll').findOne({_id: new ObjectId(id)});
        if (!poll)
        {
            res.status(404).send('poll nao existe');
            return;
        }
        const choices = await db.collection('vote').find({pollId: new ObjectId(id)}).toArray();
        if(choices.length === 0)
        {
            return res.status(201).send([]);
        }
        
        let results = [{
            "title" : choices[0].title,
            "votes" : 1,
        }];
        let novo = true;
        for(let i = 1; i < choices.length; i++)
        {
            novo = true;
            for(let j = 0; j < results.length; j++)
            {
                if(results[j].title === choices[i].title)
                {
                    results[j].votes += 1;
                    novo = false;
                    break;
                }
            }
            if(novo === true)
            {
                results.push({
                    "title" : choices[i].title,
                    "votes" : 1,
                });
            }
        }
        let maior = 0;
        for(let i = 1; i < results.length; i++)
        {
            if(results[i].votes > results[maior].votes)
            {
                maior = i;
            }
        }
        console.log(results);
        return res.status(201).send({
            _id : id,
            title : poll.title,
            expireAt : poll.expireAt,
            result : results[maior]
        });

    } catch (error) {
        console.log(error);
       res.status(500).send('Não foi possível conectar ao servidor!');
    }
};