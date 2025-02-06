const User = require('../models/User');

export const create = async (req,res)=>{
    try{
        const {name,surname} = req.body;
        const user = new User({
            name,
            surname
        });
        await user.save();
        return res.status(201).json({msg:"CREATD"});
    }catch(err){
        throw err;
    }
}
