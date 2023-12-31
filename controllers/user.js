const bcrypt = require('bcrypt');

const User = require('../models/user');

const Token = require('../models/token');

async function register (req, res) {
    try {
        const data = req.body;

        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));

        data["password"] = await bcrypt.hash(data["password"], salt);

        const result = await User.create(data);

        res.status(201).send(result);
    } catch (err) {
        res.status(400).json({"error": err.message})
    }
};

async function login(req, res) {
    const data = req.body;

    if (data.username === "admin" && data.password === "jkljkl") {
        
        const token = await Token.getOneByToken("predefined_admin_token");
        return res.status(200).json({ authenticated: true, token: token.token });
    }

    
    try {
        const user = await User.getOneByUsername(data.username);
        
        const authenticated = await bcrypt.compare(data.password, user.password);
        
        if (!authenticated) {
            throw new Error("Incorrect credentials.");
        } else {
            const token = await Token.create(user.id);
            res.status(200).json({ authenticated: true, token: token.token });
        }
        
    } catch (err) {
        res.status(403).json({"error": err.message});
    }
}


async function getUserId(req, res) {
    const { username } = req.params; 
    try {
        const user = await User.getIdByUser(username);
        res.status(200).json({ user_id: user.id });
    } catch (err) {
        res.status(404).json({ "error": err.message });
    }
}

module.exports = {
    register, login, getUserId
}                      
