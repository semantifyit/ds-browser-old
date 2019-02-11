function getDSNodeForPath(DS, path) {
    //type can be "dsv:RestrictedClass", "dsv:RestrictedEnumeration", "dsv:DomainSpecification", or "error"
    //DSNode is then the corresponding node from the domain specification
    var result = {
        "type": "",
        "DSNode": {}
    };
    //check if DS provided
    if (DS) {
        if (path !== undefined) {
            DS = DS["content"]["dsv:class"];
            var pathSteps = path.split('/');
            for (var i = 0; i < pathSteps.length; i++) {
                if (i === 0) {
                    DS = getClass(DS, pathSteps[i]);
                } else if (pathSteps[i].charAt(0).toUpperCase() === pathSteps[i].charAt(0)) {
                    //is uppercase -> class
                    if (DS !== null) {
                        DS = getClass(DS['dsv:expectedType'], pathSteps[i]);
                    }
                } else {
                    //property should not be the last part of an URL, skip to show containing class
                    if (DS !== null && i !== pathSteps.length - 1) {
                        DS = getProperty(DS['dsv:property'], pathSteps[i]);
                    }
                }
            }
            result.type = DS["@type"];
        } else {
            //show table with possible classes
            result.type = "dsv:DomainSpecification";
            DS = DS["content"];
        }
    } else {
        //no DS
        result.type = "error";
    }
    result.DSNode = DS;
    return result;
}

//return false if no path given and there is only 1 possible class in the DS
function pathCheck(DS, path) {
    if (path === undefined && DS["content"]["dsv:class"].length === 1) {
        return false
    }
    return true;
}

function getClass(DS, name) {
    for (var i = 0; i < DS.length; i++) {
        if (DS[i]["schema:name"] === name) {
            return DS[i];
        }
    }
    return null;
}

function getProperty(DS, name) {
    for (var i = 0; i < DS.length; i++) {
        if (DS[i]["schema:name"] === name) {
            return DS[i];
        }
    }
    return null;
}

function getSDOVersion(DS) {
    var versionURL = DS["content"]["schema:schemaVersion"];
    const regex = /[0-9]\.[0-9]/;
    var m;
    m = regex.exec(versionURL);
    return m;
}