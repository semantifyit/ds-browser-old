//utility functions that are being used in different files

//make sure each (terminal) item in the array is unique
function uniquifyArray(array) {
    return Array.from(new Set(array));
}

//get the value for a specific URL parameter
let getUrlParameter = function getUrlParameter(sParam) {
    let sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

//get the corresponding SDO datatype from a given SHACL XSD datatype
function dataTypeMapperFromSHACL(dataType) {
    switch (dataType) {
        case "xsd:string":
            return "Text";
        case "xsd:boolean":
            return "Boolean";
        case "xsd:date":
            return "Date";
        case "xsd:dateTime":
            return "DateTime";
        case "xsd:time":
            return "Time";
        case "xsd:double":
            return "Number";
        case "xsd:float":
            return "Float";
        case "xsd:integer":
            return "Integer";
        case "xsd:anyURI":
            return "URL";
    }
    return null; //if no match
}

function rangeToString(range) {
    //converts a range object/string into a string usable in functions
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
        return prettyPrintURI(range); //is already string
    }
}

//sorting helper function
function sortByKeyAsc(array, key) {
    return array.sort(function(a, b) {
        let x = a[key];
        x = x.substring(x.indexOf(":"));
        let y = b[key];
        y = y.substring(y.indexOf(":"));
        return x.localeCompare(y);
    });
}

//read the parts of the given URL
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
        return uri.substring("schema:".length)
    }
    return uri;
}

//schema.org descriptions include some html code whit links. Some of them are relative links, so we repair them
//all links get a new tab as target
function repairLinksInHTMLCode(htmlCode) {
    htmlCode = htmlCode.replace(/ href="\//g, ' href="https://schema.org/');
    if (htmlCode.indexOf("href=\"https://schema.org") === -1 && htmlCode.indexOf("href=\"http://schema.org") === -1) {
        //no sdo
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