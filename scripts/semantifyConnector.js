
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