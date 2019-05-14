function getDSNodeForPath() {
    //type can be "dsv:RestrictedClass", "dsv:RestrictedEnumeration", "dsv:DomainSpecification", or "error"
    //DSNode is then the corresponding node from the domain specification
    var DS = domainSpecification;
    var result = {
        "type": "",
        "DSNode": {}
    };
    //check if DS provided
    if (DS) {
        if (DSPath !== undefined) {
            DS = DS["content"]["@graph"][0];
            var pathSteps = DSPath.split('/');
            for (var i = 0; i < pathSteps.length; i++) {
                if (i === 0) {
                    //DS = DS; //is the same object with shacl
                    //DS = getClass(DS, pathSteps[i]);
                } else if (pathSteps[i].charAt(0).toUpperCase() === pathSteps[i].charAt(0)) {
                    //is uppercase -> class or Enum
                    if (DS !== null) {
                        DS = getClass(DS['sh:or']["@list"], pathSteps[i]);
                    }
                } else {
                    //property should not be the last part of an URL, skip to show containing class!
                    //although the redirectCheck() would fire before this function
                    if (DS !== null && i !== pathSteps.length - 1) {
                        if(DS["sh:targetClass"] !== undefined){
                            //root node
                            DS = getProperty(DS['sh:property'], pathSteps[i]);
                        } else {
                            //nested nodes
                            DS = getProperty(DS["sh:node"]['sh:property'], pathSteps[i]);
                        }
                    }
                }
                console.log(pathSteps[i]);
                console.log(DS);
            }
            if(DS["sh:in"] !== undefined){
                result.type = "Enumeration";
            } else {
                result.type = "Class";
            }
        } else {
            //this should not be an option anymore
            //the redirectCheck() would fire before reaching this code
            //show table with possible classes
            // result.type = "dsv:DomainSpecification";
            // DS = DS["content"];
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
    console.log(JSON.stringify(DSNode,null,2))
    console.log(name);
    for (var i = 0; i < DSNode.length; i++) {
        if (DSNode[i]["sh:class"] !== undefined && vocabRemover(DSNode[i]["sh:class"]) === name && DSNode[i]["sh:node"] !== undefined) {
            return DSNode[i];
        } else if (DSNode[i]["sh:class"] !== undefined && vocabRemover(DSNode[i]["sh:class"]) === name && DSNode[i]["sh:in"] !== undefined) {
            return DSNode[i];
        }
    }
    return null;
}

//get the property with that name
function getProperty(DSNode, name) {
    for (var i = 0; i < DSNode.length; i++) {
        if (vocabRemover(DSNode[i]["sh:path"]) === name) {
            return DSNode[i];
        }
    }
    return null;
}

//returns the SDO version used in the given DS
function getSDOVersion(DS) {
    var versionURL = DS["@graph"][0]["schema:schemaVersion"];
    const regex = /[0-9]\.[0-9]/;
    var m;
    m = regex.exec(versionURL);
    return m;
}