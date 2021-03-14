const express = require('express');
const config = require('config');
const routes = require('./routes/api.router');
const driveFiles = require('./routes/driveFiles.router');
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = config.get('port');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.json());
app.use('/api/', routes);
app.use('/drive/', driveFiles);


async function start() {
    try {
        app.listen(PORT, (req, res) => {
            console.log(`Server is running on port: ${PORT}.`);
        });
    } catch (e) {
        console.log(e.message);
    }
}

start();