// Utility functions that are being used in different files
/* global glob */

// Make sure each (terminal) item in the array is unique
function uniquifyArray(array) {
    if (Array.isArray(array)) {
        return Array.from(new Set(array));
    }
    return array;
}

// Reads parameters from the actual URL
function readParams() {
    let params = {};
    let query = window.location.search.substring(1);
    let vars = query.split('&');
    for (let actVar of vars) {
        let pair = actVar.split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
}

// Get the corresponding SDO datatype from a given SHACL XSD datatype
function dataTypeMapperFromSHACL(dataType) {
    switch (dataType) {
        case "xsd:string":
            return "Text";
        case "xsd:boolean" :
            return "Boolean";
        case "xsd:date" :
            return "Date";
        case "xsd:dateTime":
            return "DateTime";
        case "xsd:time":
            return "Time";
        case "xsd:double":
            return "Number";
        case "xsd:float":
            return "Float";
        case  "xsd:integer":
            return "Integer";
        case "xsd:anyURI":
            return "URL";
    }
    return null; // If no match
}

// Converts a range object/string into a string usable in functions
function rangeToString(range) {
    if (Array.isArray(range)) {
        let string = "";
        for (let i = 0; i < range.length; i++) {
            string = string.concat(prettyPrintURI(range[i]));
            if (i + 1 !== range.length) {
                string = string.concat("+");
            }
        }
        return string;
    } else {
        return prettyPrintURI(range); // Is already string
    }
}

// Sorting helper function
function sortByKeyAsc(array, key) {
    return array.sort(function(a, b) {
        let x = a[key];
        x = x.substring(x.indexOf(":"));
        let y = b[key];
        y = y.substring(y.indexOf(":"));
        return x.localeCompare(y);
    });
}

// Read the parts of the given URL
function readUrlParts() {
    let output = {
        "DsHash": undefined,
        "DsPath": undefined
    };
    let path = window.location.pathname;
    let pathParts = path.split('/');
    if (pathParts[1] !== "") {
        output.DsHash = pathParts[1];
    }
    if (pathParts[2] !== undefined) {
        output.DsPath = path.replace("/" + pathParts[1] + "/", '');
    }
    return output;
}

function prettyPrintURI(uri) {
    if (uri.startsWith("schema:")) {
        return uri.substring("schema:".length);
    }
    return uri;
}

// Schema.org descriptions include some html code whit links. Some of them are relative links, so we repair them
// All links get a new tab as target
function repairLinksInHTMLCode(htmlCode) {
    htmlCode = htmlCode.replace(/ href="\//g, ' href="https://schema.org/');
    if (htmlCode.indexOf("href=\"https://schema.org") === -1 && htmlCode.indexOf("href=\"http://schema.org") === -1) {
        // No sdo
        htmlCode = htmlCode.replace(/<a /g, '<a class="outgoingLink" ');
    } else {
        htmlCode = htmlCode.replace(/<a /g, '<a class="outgoingLinkRed" ');
    }
    htmlCode = htmlCode.replace(/<a /g, '<a target="_blank" ');
    return htmlCode;
}

function makeURLFromIRI(IRITerm) {
    let vocabularies = glob.mySDOAdapter.getVocabularies();
    let vocabKeys = Object.keys(vocabularies);
    for (let i = 0; i < vocabKeys.length; i++) {
        if (IRITerm.startsWith(vocabKeys[i])) {
            return vocabularies[vocabKeys[i]].concat(IRITerm.substring(IRITerm.indexOf(":") + 1));
        }
    }
    return "";
}

// returns the last part of the IRI, which represents the UID of the given IRI
function extractUIDFromIRI(IRI) {
    return IRI.substr(IRI.lastIndexOf("/") + 1);
}