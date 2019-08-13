//utility functions that are being used in different files

//make sure each (terminal) item in the array is unique
function uniquifyArray(array) {
    return Array.from(new Set(array));
}

//get the value for a specific URL parameter
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
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
    return array.sort(function (a, b) {
        let x = a[key];
        x = x.substring(x.indexOf(":"));
        let y = b[key];
        y = y.substring(y.indexOf(":"));
        return x.localeCompare(y);
        // return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

//read the parts of the given URL
function readUrlParts() {
    var output = {
        "DsUid": undefined,
        "DSPath": undefined
    };
    var path = window.location.pathname;
    var pathParts = path.split('/');
    if (pathParts[1] !== "") {
        output.DsUid = pathParts[1];
    }
    if (pathParts[2] !== undefined) {
        output.DSPath = path.replace("/" + pathParts[1] + "/", '');
    }
    return output;
}

function prettyPrintClassDefinition(classDefinition) {
    //classDefinition can be a string, or an array of strings (MTE)
    //classDefinition include strings with the vocab indicator in them
    //remove vocab if it is the standard schema:
    //return a human readable string of the classDefinition
    if (Array.isArray(classDefinition)) {
        let string = "";
        for (let i = 0; i < classDefinition.length; i++) {
            string = string.concat(prettyPrintURI(classDefinition[i]));
            if (i + 1 !== classDefinition.length) {
                string = string.concat(", ");
            }
        }
        return string
    } else {
        return prettyPrintURI(classDefinition);
    }
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