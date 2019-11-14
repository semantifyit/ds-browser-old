const request = require('request');

function con_getDomainSpecificationByID(id, res) {
    request(
        {
            url: 'https://semantify.it/api/domainSpecification/' + id,
            //url: 'http://localhost:8081/api/domainSpecification/'+ id, //debug local
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
                let ds = JSON.parse(body)["content"];
                makeDSPretty(ds["@graph"][0]);
                res.status(200).send(ds);
            }
        }
    );
}

//removes sh:or with single values and puts the content in the parent node (prettier to read)
function makeDSPretty(ds) {
    let propertiesArray = undefined;
    if (ds["sh:targetClass"] !== undefined && Array.isArray(ds["sh:property"])) {
        propertiesArray = ds["sh:property"];
    } else if (ds["sh:class"] !== undefined && ds["sh:node"] !== undefined && Array.isArray(ds["sh:node"]["sh:property"])) {
        propertiesArray = ds["sh:node"]["sh:property"];
    }
    if (Array.isArray(propertiesArray)) {
        for (let i = 0; i < propertiesArray.length; i++) {
            //recursive transform content first
            if (Array.isArray(propertiesArray[i]["sh:or"])) {
                for (let l = 0; l < propertiesArray[i]["sh:or"].length; l++) {
                    makeDSPretty(propertiesArray[i]["sh:or"][l])
                }
            }
            //transform this property
            if (Array.isArray(propertiesArray[i]["sh:or"]) && propertiesArray[i]["sh:or"].length === 1) {
                //move to outer object
                let tempRange = JSON.parse(JSON.stringify(propertiesArray[i]["sh:or"][0]));
                let tempRangeKeys = Object.keys(tempRange);
                for (let k = 0; k < tempRangeKeys.length; k++) {
                    propertiesArray[i][tempRangeKeys[k]] = tempRange[tempRangeKeys[k]];
                }
                delete propertiesArray[i]["sh:or"];
            } else if (Array.isArray(propertiesArray[i]["sh:or"]) && propertiesArray[i]["sh:or"].length === 0) {
                //remove empty object
                delete propertiesArray[i]["sh:or"];
            }
        }
    }
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