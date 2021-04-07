const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const os = require('os');
const path = require('path');

const googleDownload = require('../google-drive');

var Afiles = [];

// var filename, fileId, filePath;

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];


const TOKEN_PATH = 'token.json';


// /drive/list/
router.get('/list/', authenticateToken, (req, res) => {
    fs.readFile('credentials2.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), listFiles);
    });
      
      
    function authorize(credentials, callback) {
        // const {client_secret, client_id, redirect_uris} = credentials.installed;
        const client_secret = 'g-10OvBFgYiNWZtt9BpS1Gxl';
        const client_id = '3479913194-ktq8u5n5n0sqk0bq501nic63gv34o1tq.apps.googleusercontent.com';
        const redirect_uris = ["http://localhost:3000/","http://localhost:3000/oauth2callback","http://localhost:3002/oauth2callback","http://localhost:3001/drive/oauth2callback"];
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
          pageSize: 1000,
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

// /drive/getFile
router.post('/getFile', authenticateToken, async (req, res) => {
    console.log(`req.body.fileId: ${req.body.fileId}`);

    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader("Access-Control-Allow-Headers", "Authorization, Cache-Control, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    // res.setHeader('Access-Control-Allow-Headers', '*');


    const fileId = req.body.fileId;

    try {
        googleDownload(fileId);

        const file = path.join(os.tmpdir(), `google-download-${fileId}`);
        console.log(`FILEPATH: ${file}`);

        fs.readFile(file, 'utf8', function(err, data) {
            // if (err) throw err;
            console.log('OK: ' + file);
            console.log(data);

            res.status(200).json({data: data});
        });
    } catch(e) {

        console.log(`something wrong: ${e}`);

        res.status(502).json({id: fileId, data: null});
    }
});


////////////////////////////////////////////////////////////////////////////////////////


// /drive/upload
router.post('/upload', (req, res) => {
    console.log(req.body);
    filename = req.body.filename;
    fileId = req.body.fileId;
    filePath = path.join(os.tmpdir(), `google-download-${fileId}`);

    const upload = require('../google/upload.js');
    upload(filename, filePath);
    
  

  res.status(200);
  
});



const OAuth2Data = require('../credentials2.json');

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URI = OAuth2Data.web.redirect_uris[3];

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
);

var authed = false;
var name, pic;

// /drive/deleteAFile
router.delete('/deleteAFile', (req, res) => {
    fileId = req.body.fileId; // Desired file id to download from  google drive
    console.log(`Trying to delete file: ${fileId}`);
  
    const drive = google.drive({ version: 'v3', auth: oAuth2Client }); // Authenticating drive API
  
    // Deleting the image from Drive
    drive.files
      .delete({
        fileId: fileId,
      })
      .then(
        async function (response) {
          res.status(204).json({ status: 'success' });
        },
        function (err) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Deletion Failed for some reason' }] });
        }
      );

    res.status(204);
});


// /drive/
router.get('/', (req, res) => {
    if (!authed) {
        var url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
        });
    
        console.log(url);
        res.redirect(url)
    } else {
        var oauth2 = google.oauth2({
            auth: oAuth2Client,
            version: 'v2',
        });
        // user info

        oauth2.userinfo.get((err, res) => {
            if (err) throw(err);
            
            console.log(res);
            
            name = res.data.name;
            pic = res.data.picture;


        })


        res.send('Success');
    }
});

// /drive/oauth2callback
router.get('/oauth2callback', (req, res) => {
    const code = req.query.code;

    if (code) {
        //  get access token

        oAuth2Client.getToken(code, (err, tokens) => {
            if (err) {
                console.log('Error in authenticating.');
                console.log(err);
            } else {
                console.log('Success');
                console.log(tokens);

                oAuth2Client.setCredentials(tokens);

                authed = true;

                res.redirect('/drive');
            }
        })
    }
});




// TOKEN:
// {
//     "access_token": "ya29.a0AfH6SMD8g3wb9f-gdy5e2FrsaerJN93PTn3yi7oXoTh7jwEnLRyYgY5dUfkIiZ0hUZO6GQb6sLT9W0JaeHYg1PFCYflYvQ2PVE6Y9OudGBOgvdxOBirc-4ySuzbVM3ZAp-qYUp9TURm3wo8cWud9KO03YpQB",
//     "scope": "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file",
//     "token_type": "Bearer",
//     "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImUxYWMzOWI2Y2NlZGEzM2NjOGNhNDNlOWNiYzE0ZjY2ZmFiODVhNGMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNDc5OTEzMTk0LWt0cTh1NW41bjBzcWswYnE1MDFuaWM2M2d2MzRvMXRxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMzQ3OTkxMzE5NC1rdHE4dTVuNW4wc3FrMGJxNTAxbmljNjNndjM0bzF0cS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMzUyMTMwOTYzMzE3NjE2OTU1MSIsImF0X2hhc2giOiJ1bTVKdE9fNkFCV1JwdEZoRXg3eTFRIiwibmFtZSI6Illhcm9zbGF2IFBvcG92aWNoIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tMzNXSXdsZnJMQ1kvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVjbUxhdHozMFhQNVhjaFRuN3lTRkJyVHRKdGRsZy9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiWWFyb3NsYXYiLCJmYW1pbHlfbmFtZSI6IlBvcG92aWNoIiwibG9jYWxlIjoicnUiLCJpYXQiOjE2MTc3OTEzMzEsImV4cCI6MTYxNzc5NDkzMX0.dO73hqccnSkrAEF5sfDTo3hJM5LYs8QqZswK7gAq74hCRVlbqmU31_NMfqzGOq3-8PaAt1flD78UdclJTAWVcWzjqi_CkkdIdKHS_q-Q5oHn_-9B6tk8CfpVZRBPmDRlfmSMTud6t3yRMmcEpfATbyBrS-g6qALb3RHzQ0cL_2R2zRe93xJuQKfUsqFe3fb67czJhjJOJSO4eCnyQNXAfankABZcW3qUg9zaHqJGOIgpkLEuAtKd5JSZjQEJeJSP3S3iFDzVyPNIteUP5uK7NZIlVf-E_xKLgUkKu4HBGATyYlJFhlEiMToV5W2bi-5-VVA7FpcLRvL8PMlYg0rvPg",
//     "expiry_date": 1617794930813
// }
  




////////////////////////////////////////////////////////////////////////////////////////


function authenticateToken(req, res, next) {
    const authHeader = req.body.Authorization || req.headers['authorization'];
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