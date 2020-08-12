/* global glob, rangeToString */

function getDSNodeForPath() {
    // DSNode is then the corresponding node from the domain specification
    let DS = JSON.parse(JSON.stringify(glob.dsUsed));
    let result = {
        "type": "",
        "DSNode": {}
    };
    // Check if DS provided
    if (DS) {
        DS = DS["content"]["@graph"][0];
        if (glob.dsPath !== undefined) {
            let pathSteps = glob.dsPath.split('/');
            for (let i = 0; i < pathSteps.length; i++) {
                if (pathSteps[i] === "") {
                    continue;
                }
                if (pathSteps[i].charAt(0).toUpperCase() === pathSteps[i].charAt(0)) {
                    // Is uppercase -> class or Enum
                    if (DS !== null) {
                        DS = getClass(DS['sh:or'], pathSteps[i]);
                    }
                } else {
                    // Property should not be the last part of an URL, skip to show containing class!
                    // Although the redirectCheck() would fire before this function
                    if (DS !== null && i !== pathSteps.length - 1) {
                        if (DS["sh:targetClass"] !== undefined) {
                            // Root node
                            DS = getProperty(DS['sh:property'], pathSteps[i]);
                        } else {
                            // Nested nodes
                            DS = getProperty(DS["sh:node"]['sh:property'], pathSteps[i]);
                        }
                    }
                }
            }
            if (DS && DS["sh:class"] && !Array.isArray(DS["sh:class"])) {
                try {
                    glob.mySDOAdapter.getEnumeration(DS["sh:class"]);
                    result.type = "Enumeration";
                } catch (e) {
                    result.type = "Class";
                }
            } else {
                result.type = "Class";
            }
        } else {
            // Root class
            result.type = "Class";
        }
    } else {
        // No DS
        result.type = "error";
    }
    result.DSNode = DS;
    return result;
}

// Get the class or enumeration with that name
function getClass(DSNode, name) {
    for (let i = 0; i < DSNode.length; i++) {
        if (DSNode[i]["sh:class"] !== undefined && rangeToString(DSNode[i]["sh:class"]) === name) {
            return DSNode[i];
        }
    }
    return null;
}

// Get the property with that name
function getProperty(propertyArray, name) {
    for (let i = 0; i < propertyArray.length; i++) {
        if (rangeToString(propertyArray[i]["sh:path"]) === name) {
            return propertyArray[i];
        }
    }
    return null;
}