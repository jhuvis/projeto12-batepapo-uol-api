import joi from 'joi';


export default async function choiceMid(req, res, next) {

    const userSchema = joi.object({
        title: joi.string().required(),
        pollId: joi.string().required(),
    
    });
    
    
    const validation = userSchema.validate(req.body, { abortEarly: true });
    if (validation.error) {
        return res.status(422).send('Digite os seus dados corretamente!');
    }
    next();
}