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
                ds = convertToDSv3(ds);
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



const wishedContext = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "sh": "http://www.w3.org/ns/shacl#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "schema": "http://schema.org/",
    "sh:targetClass": {
        "@id": "sh:targetClass",
        "@type": "@id"
    },
    "sh:property": {
        "@id": "sh:property"
    },
    "sh:path": {
        "@id": "sh:path",
        "@type": "@id"
    },
    "sh:datatype": {
        "@id": "sh:datatype",
        "@type": "@id"
    },
    "sh:node": {
        "@id": "sh:node"
    },
    "sh:class": {
        "@id": "sh:class",
        "@type": "@id"
    },
    "sh:or": {
        "@id": "sh:or",
        "@container": "@list"
    },
    "sh:in": {
        "@id": "sh:in",
        "@container": "@list"
    },
    "sh:languageIn": {
        "@id": "sh:languageIn",
        "@container": "@list"
    },
    "sh:equals": {
        "@id": "sh:equals",
        "@type": "@id"
    },
    "sh:disjoint": {
        "@id": "sh:disjoint",
        "@type": "@id"
    },
    "sh:lessThan": {
        "@id": "sh:lessThan",
        "@type": "@id"
    },
    "sh:lessThanOrEquals": {
        "@id": "sh:lessThanOrEquals",
        "@type": "@id"
    }
};


//returns the DSv3 syntax of a given DS with DSv2 syntax
function convertToDSv3(dsV2) {
    //change/add @context to wished context (old context could have old vocabulary, so: care!
    let wishedContextKeys = Object.keys(wishedContext);
    for (let i = 0; i < wishedContextKeys.length; i++) {
        dsV2["@context"][wishedContextKeys[i]] = wishedContext[wishedContextKeys[i]];
    }
    //change used URIs in sh:in to absolute URIs
    recChangeEnumerations(dsV2["@graph"][0]);
    //change the author and the authorOrganisation
    let author = null;
    let authorOrganisation = null;
    if (dsV2["@graph"][0]["schema:author"]) {
        author = dsV2["@graph"][0]["schema:author"];
    }
    if (dsV2["@graph"][0]["schema:authorOrganisation"]) {
        authorOrganisation = dsV2["@graph"][0]["schema:authorOrganisation"];
    }
    if (author !== null) {
        dsV2["@graph"][0]["schema:author"] = {
            "@type": "schema:Person",
            "schema:name": author
        }
        if (authorOrganisation !== null) {
            dsV2["@graph"][0]["schema:author"]["schema:memberOf"] = {
                "@type": "schema:Organization",
                "schema:name": authorOrganisation
            }
            delete dsV2["@graph"][0]["schema:authorOrganisation"]; //delete old authorOrganisation entry
        }
    }
    return dsV2;
}

function recChangeEnumerations(dsNode) {
    if (Array.isArray(dsNode)) {
        for (let i = 0; i < dsNode.length; i++) {
            recChangeEnumerations(dsNode[i])
        }
    } else if (isObject(dsNode)) {
        let keys = Object.keys(dsNode);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === "sh:in") {
                for (let j = 0; j < dsNode["sh:in"].length; j++) {
                    dsNode["sh:in"][j] = convertURIToAbsolute(dsNode["sh:in"][j]);
                }
            } else {
                recChangeEnumerations(dsNode[keys[i]])
            }
        }
    }
}

function convertURIToAbsolute(uri) {
    if (typeof uri === "string") {
        if (uri.startsWith("schema:")) {
            return "http://schema.org/" + uri.substring("schema:".length)
        }
    }
    return uri;
}

function isObject(object) {
    if (Array.isArray(object)) {
        return false;
    }
    if (object === undefined || object === null) {
        return false;
    }
    return typeof object === 'object';
}

module.exports = {getDSbyHash};