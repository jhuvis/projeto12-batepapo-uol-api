
import DateExtension from '@joi/date';
import JoiImport from 'joi';


export default async function pollMid(req, res, next) {
    const joi = JoiImport.extend(DateExtension);
    const userSchema = joi.object({
        title: joi.string().required(),
        expireAt: joi.date().format('YYYY-MM-DD HH:mm'),
    
    });
    let poll = req.body;
    let trintadias = 2592000000;
    if(!poll.expireAt)
    {
        trintadias += Date.now(); 
        const data = new Date(trintadias);
        poll = 
            {
                title: poll.title,
                expireAt: (data.getFullYear() + "-" + ((data.getMonth() + 1)) + "-" + (data.getDate()) + " " + (data.getHours()) + ":" + (data.getMinutes()))
            };
    }
    else
    {
        poll = 
            {
                title: poll.title,
                expireAt: poll.expireAt
            }
   
    }
    
    const validation = userSchema.validate(poll, { abortEarly: true });
    res.locals.poll = poll;
    if (validation.error) {
        return res.status(422).send('Digite os seus dados corretamente!');
    }
    next();
}