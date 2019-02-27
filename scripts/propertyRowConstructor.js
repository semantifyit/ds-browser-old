function createHTMLForProperty(dsNode) {
    var name = dsNode['schema:name'];
    var isOptional = "";
    if (dsNode['dsv:isOptional'] === true) {
        isOptional = " (optional)";
    }
    var description = sdoLibrary.get_property(name).description;
    var expectedTypes = createHTMLForExpectedTypes(name, dsNode["dsv:expectedType"]);
    var code = "<tr class='removable'>";
    //property
    code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + repairLinksInHTMLCode('<a href="/' + name + '">' + name + '</a>') + "</code>" + isOptional + "</th>");
    //expected type
    code = code.concat("<td class=\"prop-ect\">" + expectedTypes + "</td>");
    //description
    code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(description) + "</td>");
    return code;
}

function createHTMLForEnumerationMember(dsNode) {
    var name = dsNode['schema:name'];
    var description = sdoLibrary.get_enumerationMember(name).description;
    var code = "<tr>";
    //property
    code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + repairLinksInHTMLCode('<a href="/' + name + '">' + name + '</a>') + "</code></th>");
    //description
    code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(description) + "</td>");
    return code;
}

function createHTMLForDSType(dsNode) {
    var name = dsNode['schema:name'];
    var description = sdoLibrary.get_class(name).description;
    var code = "<tr>";
    //type
    var newUrl = location.href.concat("&path=" + name);
    var linkCode = "<a href='" + newUrl + "'>" + name + "</a>";
    code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + linkCode + "</code></th>");
    //description
    code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(description) + "</td>");
    return code;
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

function createHTMLForExpectedTypes(propertyName, expectedTypes) {
    var code = "";
    for (var i = 0; i < expectedTypes.length; i++) {
        var name = expectedTypes[i]['schema:name'];
        try {
            sdoLibrary.get_dataType(name);
            //no error -> is data type
            code = code.concat(repairLinksInHTMLCode('<a href="/' + name + '">' + name + '</a><br>'));
        } catch (e) {
            //is class
            var newUrl = location.href.replace("path=" + DSPath, "path=" + DSPath + "/" + propertyName + "/" + name);
            code = code.concat("<a href='" + newUrl + "'>" + name + "</a><br>");
        }
    }
    return code;
}

function createHTMLForDSList(dsListObj) {
    var code = "";
    var keys = Object.keys(dsListObj);
    for (var i = 0; i < keys.length; i++) {
        var name = dsListObj[keys[i]]['name'];
        var hash = dsListObj[keys[i]]['hash'];
        //var newUrl = location.href.concat("?ds=" + hash);
        var newUrl = location.href.concat(hash + "/" + name + "/");
        //var newUrl = location.href.concat(hash + "/");
        var linkCode = "<a href='" + newUrl + "'>" + name + "</a>";
        code = code.concat("<tr><th class=\"prop-nam\"><code property=\"rdfs:label\">" + linkCode + "</code></th></tr>");
    }
    return code;
}