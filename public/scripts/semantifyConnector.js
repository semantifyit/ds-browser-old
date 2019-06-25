//Retrieve a DomainSpecification by its hash code (specified in its meta data already loaded)
function con_getDomainSpecificationByHash(hash, callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: 'https://semantify.it/api/domainSpecification/hash/'+ hash,
        success: function (data) {
            if(data && data.content && data.content["@graph"] === undefined){
                data.content = shaclDsConverter.transformDS(data.content);
            }
            //todo delete once we have shacl syntax on our server
            callback(data);
        }.bind(this),
        error: function (data, xhr, status, err) {
            callback(undefined); //send undefined in order to handle the error in the front end
            console.error("error: " + data.responseText);
        }.bind(this)
    });
}

//Retrieve all DomainSpecifications meta data
function con_getPublicDomainSpecifications(callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: 'https://semantify.it/api/domainSpecification/public/map',
        success: function (data) {
            callback(data);
        }.bind(this),
        error: function (data, xhr, status, err) {
            console.error("Could not fetch public domain specifications")
        }.bind(this)
    });
}