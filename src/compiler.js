var htmlparser = require("htmlparser"),
    domUtils = htmlparser.DomUtils;

var Template = require('./template');

var getHandler = function(template) {
  return function (error, dom) {
    if (error) {
      throw new Error(error);
    }
    template.dom = dom;
  };
}

function compile(options, filename, filepath, content) {
  var template = new Template(filename, filepath, content),
      handler = new htmlparser.DefaultHandler(getHandler(template), options),
      parser = new htmlparser.Parser(handler, { includeLocation: true });

  parser.parseComplete(template.content);
  return template;
};

module.exports = {
  compile: compile
};
