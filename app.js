const express = require('express');
const shacl = require('./shaclService/shacl');

const app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/lib/schema-org-adapter.min.js', express.static(__dirname + '/node_modules/schema-org-adapter/dist/schema-org-adapter.min.js')); //sdo library
app.use(express.static('public'));
app.get('/shacl/:id', async (req, res) => {
    try {
        shacl.getDSbyHash(req.params.id, res);
    } catch (e) {
        console.log(e);
    }
});
app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(process.env.PORT || 8080,
    () => console.log(`Listening on port ${process.env.PORT || 8080}!`));