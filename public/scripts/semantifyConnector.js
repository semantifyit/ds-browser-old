//Retrieve a DomainSpecification by its hash code (specified in its meta data already loaded)
function con_getDomainSpecificationByHash(hash, callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: 'https://semantify.it/api/domainSpecification/hash/'+ hash,
        //url: 'http://localhost:8081/api/domainSpecification/hash/'+ hash, //debug local
        success: function (data) {
            data.content = convertToDSv3(data.content);
            callback(data);
        }.bind(this),
        error: function (data, xhr, status, err) {
            callback(undefined); //send undefined in order to handle the error in the front end
            console.error("error: " + data.responseText);
        }.bind(this)
    });
}

//Retrieve all DomainSpecifications meta data
function con_getPublicDomainSpecifications(callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: 'https://semantify.it/api/domainSpecification/public/map',
        //url: 'http://localhost:8081/api/domainSpecification/public/map', //debug local
        success: function (data) {
            callback(data);
        }.bind(this),
        error: function (data, xhr, status, err) {
            console.error("Could not fetch public domain specifications")
        }.bind(this)
    });
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
                    dsNode["sh:in"][j] = wrapEnumerationValue(dsNode["sh:in"][j]);
                }
            } else {
                recChangeEnumerations(dsNode[keys[i]])
            }
        }
    }
}

function wrapEnumerationValue(ev) {
    return {
        "@id": ev
    }
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