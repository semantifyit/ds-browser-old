// Functions regarding the overview-page showing all DS
//  Route: /

function init_overview() {
    globUI.$dsListTableContent.html("");
    globUI.$dsListTableContent.append(genHTML_dsList());
    document.title = "Schema Tourism - Domain Specifications";
    setActualVisibility(glob.VIS_DS_TABLE);
    globUI.$loadingContainer.hide();
    globUI.$contentContainer.show();
}

// Generates the HTML code for the DS overview page
function genHTML_dsList() {
    let code = "";
    let arr = sortByKeyAsc(glob.dsList["schema:hasPart"], "schema:name");
    for (const actDS of arr) {
        let name = actDS['schema:name'];
        let uid = extractUIDFromIRI(actDS['@id']);
        let desc = "";
        if (actDS['schema:description']) {
            desc = actDS['schema:description'];
        }
        let types = actDS["sh:targetClass"];
        if(!Array.isArray(types)){
            types = [types];
        }
        types = uniquifyArray(types);
        let typesCode = "<td class=\"prop-types\" hidden>" + genHTML_overview_dsName(uid, types) + "</td>";
        let descCode = "<td class=\"prop-desc\">" + repairLinksInHTMLCode(desc) + "</td>";
        let linkCode = "<a href='javascript:nav(\"" + uid + "\")'>" + name + "</a>";
        code = code.concat("<tr><th class=\"prop-nam\"><code property=\"rdfs:label\">" + linkCode + "</code></th>" + typesCode + descCode + "</tr>");
    }
    return code;
}

// Generates the HTML code for the name/type of a DS in the DS overview page
function genHTML_overview_dsName(uid, typesArray) {
    let code = "";
    for (let i = 0; i < typesArray.length; i++) {
        let name = typesArray[i];
        // Let newUrl = location.href.concat("?ds=" + uid + "&path=" + name);
        let newUrl = uid + "/" + name;
        code = code.concat("<a href='javascript:nav(\'" + newUrl + "\')'>" + name + "</a><br>");
    }
    return code;
}