// Retrieve a DomainSpecification by its hash code (specified in its meta data already loaded)
function con_getDomainSpecificationByHash(hash, callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: 'https://semantify.it/api/domainSpecification/hash/' + hash,
        // url: 'http://localhost:8081/api/domainSpecification/hash/'+ hash, //debug local
        success: function(data) {
            glob.dsMemory[hash] = data;
            glob.dsUsed = glob.dsMemory[hash];
            callback();
        }.bind(this),
        error: function(data, xhr, status, err) {
            glob.dsUsed = glob.dsMemory[hash];
            callback(); // send undefined in order to handle the error in the front end
            console.error("error: " + data.responseText);
        }.bind(this)
    });
}

// Retrieve all DomainSpecifications meta data
function con_getPublicDomainSpecifications() {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "GET",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            // url: 'http://localhost:8081/list/QAmcV0lZH',
            url: 'https://semantify.it/api/domainSpecification/public/map',
            // url: 'http://localhost:8081/api/domainSpecification/public/map', //debug local
            success: function(data) {
                resolve(data);
            }.bind(this),
            error: function(data, xhr, status, err) {
                console.error("Could not fetch public domain specifications");
                reject(data);
            }.bind(this)
        });
    });

}

// Retrieve a DS-List from semantify.it
async function con_getDSList(uid) {
    return $.ajax({
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        // url: 'https://semantify.it/list/'+uid', // live
        url: 'http://localhost:8081/list/'+uid, //debug local
        data: {representation: "lean"}
    });
}