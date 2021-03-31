// Saml2js
// =======
// A library for parsing SAML attributes
// into a POJO (Plain Old JavaScript Object)

// Require dependencies
var xmldom    = require('xmldom'),
    xpath     = require('xpath'),
    _         = require('lodash');

// Saml2js
// -------
// Constructor function. Saves a copy
// of the raw SAML you pass to it and 
// a copy that's parsed into a JS object.
//
// `response` [String] - A SAML response string
function Saml2js (response) {
  this.rawSaml    = response;
  this.parsedSaml = this.parse(response);
}

// Saml2js.parse
// -------------
// Private function.
// Parses raw SAML assertion to JS object.
Saml2js.prototype.parse = function(saml) {
  let profile = {};
  var xml       = new Buffer(saml, 'base64').toString('ascii'),
      doc       = new xmldom.DOMParser().parseFromString(xml);

  var attributes = xpath.select('//*[local-name() = "AttributeStatement"]/*', doc);
  attributes.forEach(function(attribute){
    var name = xpath.select('string(@Name)', attribute);    
    profile[_.camelCase(name)] = xpath.select('string(*[local-name() = "AttributeValue"]/text())', attribute);
  });

  return profile;
};


// Saml2js.toJSON
// --------------
// Returns parsed SAML as a JSON string.
// (Basically just an alias to `JSON.stringify()`).
Saml2js.prototype.toJSON = function() {
  return JSON.stringify(this.parsedSaml);
};

// Saml2js.get
// -----------
// Get the value of a SAML attribute by using its
// original SAML attribute Name from the raw XML.
//
// `key` [String] - The attribute name as it appears in the raw SAML
//
// Example:
//     // Given the following SAML/XML
//     // <saml2:Attribute Name="First Name">
//     //   <saml2:AttributeValue>John</saml2:AttributeValue>
//     // </saml2:Attribute>
//     console.log(parser.get('first name')); //=> John
Saml2js.prototype.get = function(key) {
  var value = this.parsedSaml[_.camelCase(key.toLowerCase())];
  if (_.isUndefined(value)) {
    return undefined;
  } else {
    return _.isEmpty(value) ? null : value;
  }
};

// Saml2js.toObject
// ----------------
// Returns the parsed SAML as a JS object.
// This does not do any further processing, it
// just returns the object's internal value
// of `this.parsedSaml`.
Saml2js.prototype.toObject = function() {
  return this.parsedSaml;
};

module.exports = Saml2js;
