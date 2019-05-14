(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shaclDsConverter = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
let shaclDsConverter = new function () {
    this.transformDS = function(ds) {
        if (ds === undefined || ds === null){
            return "NOCONTENT";
        }
        try {
            this.errorLog = [];
            let shaclDS = {};
            shaclDS["@context"] = this.getDSContext();
            shaclDS["@graph"] = [];
            //add root node representing the "dsv:DomainSpecification" and the first "dsv:RestrictedClass" in the "dsv:class" array
            shaclDS["@graph"].push(this.generateRootNode(ds));
            //console.log(JSON.stringify(shaclDS, null, 2));
            //this.printErrorLog();
            return shaclDS;
        } catch (e) {
            console.log(JSON.stringify(ds));
            return "ERROR";
        }
    };

    this.getDSContext = function() {
        return {
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "sh": "http://www.w3.org/ns/shacl#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "schema": "http://schema.org/",
            "sh:targetClass": {
                "@id": "sh:targetClass",
                "@type": "@id"
            },
            "sh:property": {
                "@id": "sh:property",
                "@type": "@id"
            },
            "sh:path": {
                "@id": "sh:path",
                "@type": "@id"
            },
            "sh:nodeKind": {
                "@id": "sh:nodeKind",
                "@type": "@id"
            },
            "sh:datatype": {
                "@id": "sh:datatype",
                "@type": "@id"
            },
            "sh:node": {
                "@id": "sh:node",
                "@type": "@id"
            },
            "sh:class": {
                "@id": "sh:class",
                "@type": "@id"
            },
            "sh:or": {
                "@id": "sh:or",
                "@type": "@id"
            },
            "sh:in": {
                "@id": "sh:in",
                "@type": "@id"
            }
        };
    };

    this.generateRootNode = function(dsRootNode) {
        let keys = Object.keys(dsRootNode);
        let expectedProperties = [
            "@context",
            "@type",
            "schema:name",
            "schema:description",
            "schema:version",
            "schema:schemaVersion",
            "schema:author",
            "schema:authorOrganisation",
            "dsv:class",
            "schema:url" //this was very early version, will not be used in new syntax
        ];
        for (let i = 0; i < keys.length; i++) {
            if (expectedProperties.indexOf(keys[i]) === -1) {
                this.addToErrorLog("RootNode has unexpected object key -> " + keys[i]);
            }
        }
        let shaclRootNode = {};
        shaclRootNode["@id"] = "_:RootNode";
        shaclRootNode["@type"] = ["sh:NodeShape", "schema:CreativeWork"]; //CreativeWork reflects the Domain Specification as such, with this type array it will be easy to identify the rootnode
        if (dsRootNode["schema:name"] !== undefined) {
            shaclRootNode["schema:name"] = dsRootNode["schema:name"];
        }
        if (dsRootNode["schema:description"] !== undefined) {
            shaclRootNode["schema:description"] = dsRootNode["schema:description"];
        }
        if (dsRootNode["schema:version"] !== undefined) {
            shaclRootNode["schema:version"] = dsRootNode["schema:version"];
        }
        if (dsRootNode["schema:schemaVersion"] !== undefined) {
            shaclRootNode["schema:schemaVersion"] = dsRootNode["schema:schemaVersion"];
        }
        if (dsRootNode["schema:author"] !== undefined) {
            shaclRootNode["schema:author"] = dsRootNode["schema:author"];
        }
        if (dsRootNode["schema:authorOrganisation"] !== undefined) {
            shaclRootNode["schema:authorOrganisation"] = dsRootNode["schema:authorOrganisation"];
        }
        //DS will be only for 1 target class and it is supposed that all subclasses are covered
        if (Array.isArray(dsRootNode["dsv:class"]) && dsRootNode["dsv:class"].length > 0) {
            //take the first element of the array, which should be the most general type (other elements in array are subtypes)
            let restrictedClass = dsRootNode["dsv:class"][0];
            if (restrictedClass["dsv:baseClass"] !== undefined && restrictedClass["dsv:baseClass"]["@id"] !== undefined) {
                shaclRootNode["sh:targetClass"] = restrictedClass["dsv:baseClass"]["@id"];
            } else {
                this.addToErrorLog("Missing expected dsv:baseClass");
            }
            if (Array.isArray(restrictedClass["dsv:property"]) && restrictedClass["dsv:property"].length > 0) {
                shaclRootNode["sh:property"] = [];
                for (let a = 0; a < restrictedClass["dsv:property"].length; a++) {
                    shaclRootNode["sh:property"].push(this.generatePropertyNode(restrictedClass["dsv:property"][a], a));
                }
            } else {
                this.addToErrorLog("Missing expected dsv:property array with length 1+ " + restrictedClass["schema:name"]);
            }
        } else {
            this.addToErrorLog("Missing expected dsv:class array with length 1+");
        }
        return shaclRootNode;
    };

    function isString(object) {
        if (object === undefined || object === null) {
            return false;
        }
        return typeof object === 'string' || object instanceof String;
    }


    this.generatePropertyNode = function(dsPropertyNode, order) {
        let keys = Object.keys(dsPropertyNode);
        let expectedProperties = [
            "@type",
            "schema:name",
            "dsv:baseProperty",
            "dsv:isOptional",
            "dsv:multipleValuesAllowed",
            "dsv:expectedType",
            "dsv:justification"
        ];
        for (let i = 0; i < keys.length; i++) {
            if (expectedProperties.indexOf(keys[i]) === -1) {
                this.addToErrorLog("PropertyNode has unexpected object key -> " + keys[i]);
            }
        }
        let shaclPropertyNode = {};
        //type
        shaclPropertyNode["@type"] = "sh:PropertyShape";
        //path
        if (dsPropertyNode["dsv:baseProperty"] !== undefined && dsPropertyNode["dsv:baseProperty"]["@id"] !== undefined) {
            shaclPropertyNode["sh:path"] = dsPropertyNode["dsv:baseProperty"]["@id"];
        } else {
            this.addToErrorLog("Missing expected dsv:baseProperty");
        }
        //order
        if (typeof order === 'number') {
            shaclPropertyNode["sh:order"] = order;
        }
        //justification
        if (isString(dsPropertyNode["dsv:justification"])) {
            shaclPropertyNode["rdfs:comment"] = dsPropertyNode["dsv:justification"];
        }
        //cardinality
        if (dsPropertyNode["dsv:isOptional"] !== undefined) {
            if (dsPropertyNode["dsv:isOptional"] === false) {
                shaclPropertyNode["sh:minCount"] = 1;
            }
        } else {
            this.addToErrorLog("Missing expected dsv:isOptional");
        }
        if (dsPropertyNode["dsv:multipleValuesAllowed"] !== undefined) {
            if (dsPropertyNode["dsv:multipleValuesAllowed"] === false) {
                shaclPropertyNode["sh:maxCount"] = 1;
            }
        } else {
            this.addToErrorLog("Missing expected dsv:multipleValuesAllowed");
        }
        //ranges
        if (Array.isArray(dsPropertyNode["dsv:expectedType"]) && dsPropertyNode["dsv:expectedType"].length > 0) {
            shaclPropertyNode["sh:or"] = {"@list": []};
            for (let p = 0; p < dsPropertyNode["dsv:expectedType"].length; p++) {
                switch (dsPropertyNode["dsv:expectedType"][p]["@type"]) {
                    case "schema:DataType":
                        shaclPropertyNode["sh:or"]["@list"].push(this.generateDataTypeNode(dsPropertyNode["dsv:expectedType"][p]));
                        break;
                    case "schema:Class":
                        shaclPropertyNode["sh:or"]["@list"].push(this.generateClassNode(dsPropertyNode["dsv:expectedType"][p]));
                        break;
                    case "dsv:RestrictedClass":
                        shaclPropertyNode["sh:or"]["@list"].push(this.generateRestrictedClassNode(dsPropertyNode["dsv:expectedType"][p]));
                        break;
                    case "dsv:RestrictedEnumeration":
                        shaclPropertyNode["sh:or"]["@list"].push(this.generateRestrictedEnumerationNode(dsPropertyNode["dsv:expectedType"][p]));
                        break;
                    default:
                        this.addToErrorLog("Unhandled type for property range-> " + JSON.stringify(dsPropertyNode["dsv:expectedType"][p]["@type"]));
                        this.addToErrorLog(" -> " + JSON.stringify(dsPropertyNode["dsv:expectedType"][p]["schema:name"], null, 2));
                }

            }
        } else {
            this.addToErrorLog("Missing expected dsv:expectedType array with length 1+ ");
        }
        return shaclPropertyNode;
    };

    this.generateDataTypeNode = function(dsDataTypeNode) {
        let shaclDataTypeNode = {};
        let keys = Object.keys(dsDataTypeNode);
        let expectedProperties = [
            "@type",
            "schema:name",
            "@id",
            "dsv:default"
        ];
        for (let i = 0; i < keys.length; i++) {
            if (expectedProperties.indexOf(keys[i]) === -1) {
                this.addToErrorLog("DataType has unexpected object key -> " + keys[i]);
            }
        }
        switch (dsDataTypeNode["@id"]) {
            case "schema:Text":
                shaclDataTypeNode["sh:datatype"] = "xsd:string";
                break;
            case "schema:Boolean":
                shaclDataTypeNode["sh:datatype"] = "xsd:boolean";
                break;
            case "schema:Date":
                shaclDataTypeNode["sh:datatype"] = "xsd:date";
                break;
            case "schema:DateTime":
                shaclDataTypeNode["sh:datatype"] = "xsd:dateTime";
                break;
            case "schema:Time":
                shaclDataTypeNode["sh:datatype"] = "xsd:time";
                break;
            case "schema:Number":
                shaclDataTypeNode["sh:datatype"] = "xsd:double";
                break;
            case "schema:Float":
                shaclDataTypeNode["sh:datatype"] = "xsd:float";
                break;
            case "schema:Integer":
                shaclDataTypeNode["sh:datatype"] = "xsd:integer";
                break;
            case "schema:URL":
                shaclDataTypeNode["sh:datatype"] = "xsd:anyURI";
                break;
            default:
                this.addToErrorLog("Unhandled type for data type -> " + JSON.stringify(dsDataTypeNode["@id"]));
        }
        if (dsDataTypeNode["dsv:default"] !== undefined) {
            shaclDataTypeNode["sh:defaultValue"] = dsDataTypeNode["dsv:default"];
        }
        return shaclDataTypeNode;
    };

    this.generateRestrictedClassNode = function(dsRestrictedClassNode) {
        let keys = Object.keys(dsRestrictedClassNode);
        let expectedProperties = [
            "@type",
            "schema:name",
            "dsv:baseClass",
            "dsv:property"
        ];
        for (let i = 0; i < keys.length; i++) {
            if (expectedProperties.indexOf(keys[i]) === -1) {
                this.addToErrorLog("RestrictedClassNode has unexpected object key -> " + keys[i]);
            }
        }
        let shaclRestrictedClassNode = {};
        if (dsRestrictedClassNode["dsv:baseClass"] !== undefined && dsRestrictedClassNode["dsv:baseClass"]["@id"] !== undefined) {
            shaclRestrictedClassNode["sh:class"] = dsRestrictedClassNode["dsv:baseClass"]["@id"];
            if (Array.isArray(dsRestrictedClassNode["dsv:property"]) && dsRestrictedClassNode["dsv:property"].length > 0) {
                shaclRestrictedClassNode["sh:node"] = {};
                shaclRestrictedClassNode["sh:node"]["@type"] = "sh:NodeShape";
                shaclRestrictedClassNode["sh:node"]["sh:property"] = [];
                for (let a = 0; a < dsRestrictedClassNode["dsv:property"].length; a++) {
                    shaclRestrictedClassNode["sh:node"]["sh:property"].push(this.generatePropertyNode(dsRestrictedClassNode["dsv:property"][a], a));
                }
            } else {
                this.addToErrorLog("Missing expected dsv:property array with length 1+ " + dsRestrictedClassNode["schema:name"] + ". Will create a standard class instead of restricted class.");
            }
        } else {
            this.addToErrorLog("Missing expected dsv:baseClass");
        }
        return shaclRestrictedClassNode;
    };

    this.generateClassNode = function(dsClassNode) {
        let keys = Object.keys(dsClassNode);
        let expectedProperties = [
            "@type",
            "schema:name",
            "dsv:baseClass",
            "@id"
        ];
        for (let i = 0; i < keys.length; i++) {
            if (expectedProperties.indexOf(keys[i]) === -1) {
                this.addToErrorLog("ClassNode has unexpected object key -> " + keys[i]);
            }
        }
        let shaclRestrictedClassNode = {};
        if (dsClassNode["dsv:baseClass"] !== undefined && dsClassNode["dsv:baseClass"]["@id"] !== undefined) {
            shaclRestrictedClassNode["sh:class"] = dsClassNode["dsv:baseClass"]["@id"];
        } else if (dsClassNode["@id"] !== undefined) {
            shaclRestrictedClassNode["sh:class"] = dsClassNode["@id"];
        } else {
            this.addToErrorLog("Missing expected dsv:baseClass or @id");
        }
        return shaclRestrictedClassNode;
    };

    this.generateRestrictedEnumerationNode = function(dsRestrictedEnumerationNode) {
        let keys = Object.keys(dsRestrictedEnumerationNode);
        let expectedProperties = [
            "@type",
            "schema:name",
            "dsv:baseEnumeration",
            "dsv:expectedEnumerationValue"
        ];
        for (let i = 0; i < keys.length; i++) {
            if (expectedProperties.indexOf(keys[i]) === -1) {
                this.addToErrorLog("RestrictedEnumerationNode has unexpected object key -> " + keys[i]);
            }
        }
        let shaclRestrictedEnumerationNode = {};
        //must be enumeration value (has class) of the enumeration type
        if (dsRestrictedEnumerationNode["dsv:baseEnumeration"] !== undefined && dsRestrictedEnumerationNode["dsv:baseEnumeration"]["@id"] !== undefined) {
            shaclRestrictedEnumerationNode["sh:class"] = dsRestrictedEnumerationNode["dsv:baseEnumeration"]["@id"];
        } else {
            this.addToErrorLog("Missing expected dsv:baseEnumeration");
        }
        //value must be one of the valid (or selected) enumeration types, according to old DS Grammar
        if (Array.isArray(dsRestrictedEnumerationNode["dsv:expectedEnumerationValue"]) && dsRestrictedEnumerationNode["dsv:expectedEnumerationValue"].length > 0) {
            shaclRestrictedEnumerationNode["sh:in"] = {"@list": []};
            for (let a = 0; a < dsRestrictedEnumerationNode["dsv:expectedEnumerationValue"].length; a++) {
                shaclRestrictedEnumerationNode["sh:in"]["@list"].push(this.generateEnumerationMemberNode(dsRestrictedEnumerationNode["dsv:expectedEnumerationValue"][a]));
            }
        } else {
            this.addToErrorLog("Missing expected dsv:expectedEnumerationValue array with length 1+ " + dsRestrictedEnumerationNode["schema:name"] + " . Will create standard enumeration instead of restricted enumeration.");
        }
        return shaclRestrictedEnumerationNode;
    };

    this.generateEnumerationMemberNode = function(dsEnumerationMemberNode) {
        let keys = Object.keys(dsEnumerationMemberNode);
        let expectedProperties = [
            "@type",
            "schema:name",
            "@id"
        ];
        for (let i = 0; i < keys.length; i++) {
            if (expectedProperties.indexOf(keys[i]) === -1) {
                this.addToErrorLog("EnumerationNode has unexpected object key -> " + keys[i]);
            }
        }
        let shaclEnumerationMember;
        if (dsEnumerationMemberNode["@id"] !== undefined) {
            shaclEnumerationMember = dsEnumerationMemberNode["@id"];
        } else {
            this.addToErrorLog("Missing expected @id for enumeration member");
        }
        return shaclEnumerationMember;
    };

    this.errorLog = [];

    this.addToErrorLog = function(msg) {
        this.errorLog.push(msg);
    };

    this.printErrorLog = function() {
        if (this.errorLog.length !== 0) {
            console.log("Conversion: errors during execution:");
            for (let i = 0; i < this.errorLog.length; i++) {
                console.log(this.errorLog[i]);
            }
        }
    };
};

module.exports = shaclDsConverter;
},{}]},{},[1])(1)
});
