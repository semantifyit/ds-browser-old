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
// Enable NPM Package in the frontend
app.use('/lib/schema-org-adapter.min.js', express.static(__dirname + '/node_modules/schema-org-adapter/dist/schema-org-adapter.min.js')); // Sdo library
app.use(express.static('public'));

/* API endpoints for frontend */
// Get the default DS-List
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
// Get a specific DS-List by its UID
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
// Get a specific DS by its UID
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
/* Frontend Routes */
// RAW content for Domain Specifications
app.get('/shacl/:uid', async(req, res) => {
    try {
        const response = await got('https://semantify.it/ds/' + req.params.uid, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            }
        });
        let ds = JSON.parse(response.body);
        shacl.makeDSPretty(ds["@graph"][0]);
        res.status(200).send(ds);
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
