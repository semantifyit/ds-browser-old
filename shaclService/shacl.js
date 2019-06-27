const request = require('request');

function con_getDomainSpecificationByID(id, res) {
    request(
        {
            url: 'https://semantify.it/api/domainSpecification/' + id,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            method: 'GET'
        },
        (err, response, body) => {
            if (err) {
                console.log(err);
                res.status(400).send({"error": "could not find a Domain Specification with that Hash-Code."});
            } else {
                res.status(200).send(JSON.parse(body)["content"]);
            }
        }
    );
}

//Retrieve all DomainSpecifications meta data
function getDSbyHash(hashcode, res) {
    request(
        {
            url: "https://semantify.it/api/domainSpecification/public/map",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            method: 'GET'
        },
        (err, response, body) => {
            if (err) {
                console.log(err);
                res.status(400).send({"error": "could not find a Domain Specification with that Hash-Code."});
            } else {
                let publicMap = JSON.parse(body);
                let keys = Object.keys(publicMap);
                let found = false;
                for (let i = 0; i < keys.length; i++) {
                    if (publicMap[keys[i]]["hash"] === hashcode) {
                        found = true;
                        con_getDomainSpecificationByID(keys[i], res);
                    }
                }
                if (!found) {
                    res.status(400).send({"error": "could not find a Domain Specification with that Hash-Code."});
                }
            }
        }
    );
}

module.exports = {getDSbyHash};