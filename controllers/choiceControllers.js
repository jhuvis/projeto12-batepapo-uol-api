import mongo from '../db/db.js';
import { ObjectId } from 'mongodb';

let db = await mongo();

export async function getchoice (req, res){
    try {
        const { id } = req.params;
        await db.collection("choice").find().toArray({pollId: new ObjectId(id)}).then(choice => {
            return res.status(201).send(choice);
        });
    } catch (error) {
        console.log(error);
       res.status(500).send('Não foi possível conectar ao servidor!');
    }
};

export async function vote (req, res){
    try {
        const { id } = req.params;
        const choice = await db.collection('choice').findOne({_id: new ObjectId(id)});
        if (!choice)
        {
            res.status(404).send('choice nao existe');
            return;
        }
        const poll = await db.collection('poll').findOne({_id: new ObjectId(choice.pollId)});
        const diaEx = new Date(poll.expireAt);
        const data = new Date(Date.now());
        if(diaEx.getTime() < data.getTime())
        {
            res.status(403).send('poll expirada');
            return;
        }
        await db.collection("vote").insertOne(
            {
                title: choice.title,
                data : (data.getFullYear() + "-" + ((data.getMonth() + 1)) + "-" + (data.getDate()) + " " + (data.getHours()) + ":" + (data.getMinutes())),
                pollId: new ObjectId(choice.pollId)
            }
        );
        return res.status(201).send('voto concluido com sucesso');

    } catch (error) {
        console.log(error);
       res.status(500).send('Não foi possível conectar ao servidor!');
    }
};

export async function postchoice(req, res){
    try {

        const poll = await db.collection('poll').findOne({_id: new ObjectId(req.body.pollId)});
        if (!poll)
        {
            res.status(404).send('poll nao existe');
            return;
        }
        else
        {
            const diaEx = new Date(poll.expireAt);
            const hoje = new Date(Date.now());
            if(diaEx.getTime() < hoje.getTime())
            {
                res.status(403).send('poll expirada');
                return;
            }
        }
    
        const verchoice = await db.collection('choice').findOne({title: req.body.title, pollId: new ObjectId(req.body.pollId)});
        if(verchoice)
        {
            res.status(409).send('choice já existe');
            return;
        }
        else
        {
            
           const choice = await db.collection("choice").insertOne(
                {
                    title: req.body.title,
                    pollId: new ObjectId(req.body.pollId)
                }
            );
            
            return res.status(201).send(
            {
                _id: choice.insertedId,
                title: req.body.title,
                pollId: new ObjectId(req.body.pollId)
            });
        }  
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Não foi possível conectar ao servidor!');
        return;
    }
};