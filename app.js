const express = require('express');
const shacl = require('./shaclService/shacl');
const morgan = require('morgan');
const got = require('got');

const app = express();
app.use(morgan('combined'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/lib/schema-org-adapter.min.js', express.static(__dirname + '/node_modules/schema-org-adapter/dist/schema-org-adapter.min.js')); // Sdo library
app.use(express.static('public'));

// API endpoints for frontend
app.get('/api/list/', async(req, res) => {
    try {
        const response = await got('https://semantify.it/list/wS4r3c9hQ?representation=lean', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }
        });
        res.status(200).send(response.body);
    } catch (error) {
        console.log(error);
        res.status(400).send({"error": "could not find the standard list"});
    }
});

app.get('/api/list/:uid', async(req, res) => {
    try {
        const response = await got('https://semantify.it/list/'+req.params.uid+'?representation=lean', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }
        });
        res.status(200).send(response.body);
    } catch (error) {
        res.status(400).send({"error": "could not find a DS-List with the given UID."});
    }
});

app.get('/api/ds/:uid', async(req, res) => {
    try {
        const response = await got('https://semantify.it/ds/' + req.params.uid, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }
        });
        res.status(200).send(response.body);
    } catch (error) {
        res.status(400).send({"error": "could not find a DS with the given UID."});
    }
});

// RAW content for Domain Specifications
app.get('/shacl/:hash', async(req, res) => {
    try {
        await shacl.con_getDSByHash(req.params.hash, res);
    } catch (e) {
        console.log(e);
    }
});

// Any other route is handled by the frontend
app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(process.env.PORT || 8080,
    () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
