const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');

const router = express.Router();

const posts = [
    {
        username: 'Yarik',
        password: '123',
        email: 'yarik@gmail.com',
        title: 'Post 1'
    },
    {
        username: 'Boris',
        password: '111',
        email: 'boris@gmail.com',
        title: 'Post 2'
    }
];

let refreshTokens = [];

// /api/
router.get('/test', (req, res) => {
    res.send('It Works!');
});

// /api/posts/
router.get('/posts/', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name && post.password === req.user.password));
});

// /api/register/
router.post('/register/', (req, res) => {
    try {
        const user = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            title: ''
        };

        
        posts.push(user);
        console.log(posts);
        res.json('Ok');
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

// /api/login/
router.post('/login', (req, res) => {
    // Authentication
    const user = { 
        name: req.body.username,
        password: req.body.password
    };

    const accessToken = generateToken(user);
    const refreshToken = jwt.sign(user, config.get('REFRESH_TOKEN_SECRET'));
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

// /api/logout/
router.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
});

// /api/token/
router.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, config.get('REFRESH_TOKEN_SECRET'), (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateToken({ name: user.name, password: user.password });
        res.json({ accessToken: accessToken });
    });
});

function generateToken(user) {
    return jwt.sign(user, config.get('ACCESS_TOKEN_SECRET'), { expiresIn: '25s' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) res.sendStatus(401);

    jwt.verify(token, config.get('ACCESS_TOKEN_SECRET'), (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        console.log(user);
        next();
    });
}


module.exports = router;