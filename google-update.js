const express = require('express');
const {google} = require('googleapis');
const { oauth2 } = require('googleapis/build/src/apis/oauth2');
const multer = require('multer');
const fs = require('fs');

app = express();

const OAuth2Data = require('./credentials2.json');

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URI = OAuth2Data.web.redirect_uris[1];

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
);

var authed = false;


var Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './images');
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '_' + Date.now() + '_' + file.originalname)
    },
});

var upload = multer({
    storage: Storage,
}).single('file');




const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile';

var name, pic;

app.get('/', (req, res) => {
    if (!authed) {
        var url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
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

app.get('/oauth2callback', (req, res) => {
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

                res.redirect('/');
            }
        })
    }
});

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) throw(err);
        console.log(req.file.path);

        const drive = google.drive({
            version: 'v3',
            auth: oAuth2Client
        });

        const filemetadata = {
            name: req.file.filename
        }

        const media = {
            mimeType: req.file.mimeType,
            body: fs.createReadStream(req.file.path)
        }

        drive.files.create({
            resource: filemetadata,
            media: media,
            fields: 'id'
        }, (err, file) => {
            if (err) throw(err);

            // delete 
            fs.unlinkSync(req.file.path);
        })
    })
});

app.delete('/deleteAFile', (req, res) => {
    var fileId = '1G_eyaqbqAdWurcpuRGGGgO4we-C5iuAQ'; // Desired file id to download from  google drive
  
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
});

app.get('logout', (req, res) => {
    authed = false;
    res.redirect('/');
})

app.listen(3000, () => {
    console.log('server started on port 3000');
})