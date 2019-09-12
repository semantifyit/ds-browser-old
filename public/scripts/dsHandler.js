function getDSNodeForPath() {
    //DSNode is then the corresponding node from the domain specification
    let DS = JSON.parse(JSON.stringify(domainSpecification));
    let result = {
        "type": "",
        "DSNode": {}
    };
    //check if DS provided
    if (DS) {
        DS = DS["content"]["@graph"][0];
        if (DSPath !== undefined) {
            var pathSteps = DSPath.split('/');
            for (var i = 0; i < pathSteps.length; i++) {
                if (pathSteps[i] === "") {
                    continue;
                }
                if (pathSteps[i].charAt(0).toUpperCase() === pathSteps[i].charAt(0)) {
                    //is uppercase -> class or Enum
                    if (DS !== null) {
                        DS = getClass(DS['sh:or'], pathSteps[i]);
                    }
                } else {
                    //property should not be the last part of an URL, skip to show containing class!
                    //although the redirectCheck() would fire before this function
                    if (DS !== null && i !== pathSteps.length - 1) {
                        if (DS["sh:targetClass"] !== undefined) {
                            //root node
                            DS = getProperty(DS['sh:property'], pathSteps[i]);
                        } else {
                            //nested nodes
                            DS = getProperty(DS["sh:node"]['sh:property'], pathSteps[i]);
                        }
                    }
                }
            }
            if (DS["sh:in"] !== undefined) {
                result.type = "Enumeration";
            } else {
                result.type = "Class";
            }
        } else {
            //root class
            result.type = "Class";
        }
    } else {
        //no DS
        result.type = "error";
    }
    result.DSNode = DS;
    return result;
}

//get the class or enumeration with that name
function getClass(DSNode, name) {
    for (let i = 0; i < DSNode.length; i++) {
        if (DSNode[i]["sh:class"] !== undefined && rangeToString(DSNode[i]["sh:class"]) === name && DSNode[i]["sh:node"] !== undefined) {
            return DSNode[i];
        } else if (DSNode[i]["sh:class"] !== undefined && rangeToString(DSNode[i]["sh:class"]) === name && DSNode[i]["sh:in"] !== undefined) {
            return DSNode[i];
        }
    }
    return null;
}

//get the property with that name
function getProperty(propertyArray, name) {
    for (let i = 0; i < propertyArray.length; i++) {
        if (rangeToString(propertyArray[i]["sh:path"]) === name) {
            return propertyArray[i];
        }
    }
    return null;
}