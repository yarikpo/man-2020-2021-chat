const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

var Afiles = [];

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

const TOKEN_PATH = 'token.json';


// /drive/list/
router.get('/list/', authenticateToken, (req, res) => {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), listFiles);
    });
      
      
    function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
      
      
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
      }
      
      
    function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
      
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
      }
      
      
      function listFiles(auth) {
        const drive = google.drive({version: 'v3', auth});
        drive.files.list({
          pageSize: 10,
          fields: 'nextPageToken, files(id, name)',
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          const files = res.data.files;
          Afiles = files;
          if (files.length) {
              console.log('Files:');
              console.log(files);
          } else {
            console.log('No files found.');
          }
          console.log(`Afiles: ${Afiles[0].name}`);
        });
        
    }



    res.json({ files: Afiles });
});




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