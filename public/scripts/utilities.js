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

//removes the vocabulary part (before :) from a URI
function vocabRemover(URI) {
    return URI.substring(URI.indexOf(":") + 1);
}

//sorting helper function
function sortByKeyAsc(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

var actualLibrary; //the active SDO library to get data from
//change the active SDO library based on their versions
function setActualLibrary(actualVersion) {
    switch (actualVersion) {
        case "3.1":
            actualLibrary = sdoLib_3_1;
            break;
        case "3.2":
            actualLibrary = sdoLib_3_2;
            break;
        case "3.3":
            actualLibrary = sdoLib_3_3;
            break;
        case "3.4":
            actualLibrary = sdoLib_3_4;
            break;
        case "3.5":
            actualLibrary = sdoLib_3_5;
            break;
        case "3.6":
            actualLibrary = sdoLib_3_6;
            break;
        case "latest":
            actualLibrary = sdoLib_latest;
            break;
    }
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