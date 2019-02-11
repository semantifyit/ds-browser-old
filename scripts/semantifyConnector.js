
//AJAX function get all DomainSpecifications (later will be per website basis)
function con_getDomainSpecificationByHash(hash, callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: 'https://semantify.it/api/domainSpecification/hash/'+ hash,
        success: function (data) {
            callback(data);
        }.bind(this),
        error: function (data, xhr, status, err) {
            callback(undefined);
            console.error("error: " + data.responseText);
        }.bind(this)
    });
}

//AJAX function get all DomainSpecifications
function con_getPublicDomainSpecifications(callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: 'https://semantify.it/api/domainSpecification/public/map',
        // url: 'https://semantify.it/api/domainSpecification/public',
        success: function (data) {
            callback(data);
            // callback(cleanDSList(data));
        }.bind(this),
        error: function (data, xhr, status, err) {
            showError("Could not fetch public domain specifications")
        }.bind(this)
    });
}

function cleanDSList(data) {
    var result = [];
    for(var i=0;i<data.length;i++){
        if(data[i]["isPrivate"] === false && data[i]["isInstantAnnotation"] === false ){
            result.push(data[i]);
        }
    }
    return result;
}