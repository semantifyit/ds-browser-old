// Removes sh:or with single values and puts the content in the parent node (prettier to read)
function makeDSPretty(ds) {
    let propertiesArray;
    if (ds["sh:targetClass"] !== undefined && Array.isArray(ds["sh:property"])) {
        propertiesArray = ds["sh:property"];
    } else if (ds["sh:class"] !== undefined && ds["sh:node"] !== undefined && Array.isArray(ds["sh:node"]["sh:property"])) {
        propertiesArray = ds["sh:node"]["sh:property"];
    }
    if (Array.isArray(propertiesArray)) {
        for (let i = 0; i < propertiesArray.length; i++) {
            // Recursive transform content first
            if (Array.isArray(propertiesArray[i]["sh:or"])) {
                for (let l = 0; l < propertiesArray[i]["sh:or"].length; l++) {
                    makeDSPretty(propertiesArray[i]["sh:or"][l]);
                }
            }
            // Transform this property
            if (Array.isArray(propertiesArray[i]["sh:or"]) && propertiesArray[i]["sh:or"].length === 1) {
                // Move to outer object
                let tempRange = JSON.parse(JSON.stringify(propertiesArray[i]["sh:or"][0]));
                let tempRangeKeys = Object.keys(tempRange);
                for (let k = 0; k < tempRangeKeys.length; k++) {
                    propertiesArray[i][tempRangeKeys[k]] = tempRange[tempRangeKeys[k]];
                }
                delete propertiesArray[i]["sh:or"];
            } else if (Array.isArray(propertiesArray[i]["sh:or"]) && propertiesArray[i]["sh:or"].length === 0) {
                // Remove empty object
                delete propertiesArray[i]["sh:or"];
            }
        }
    }
}

module.exports = {makeDSPretty};