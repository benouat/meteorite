var Template = function Template(name, path, content) {
  this.name = name;
  this.path = path;
  this.content = content;

  this.text = "";
  this.dom = [];
};

Template.prototype.toText = function() {
  this.checkIsValid();
  return this.dom.map(function(node) {
    var type = node.type === "text" ? node.type : node.name;
    return processors[type](node);
  }).join('');
};

Template.prototype.checkIsValid = function () {
  var self = this;
  this.dom.forEach(function(node) {
    if(node.type === "text" && /\s*(\r|\n|[\r\n])*/.test(node.data)) {
      return;
    }
    if (["script", "template"].indexOf(node.name) === -1) {
      throw new InvalidTagError(node, self.path);
    }
  });
};

Template.prototype._node2text = function (node) {
  var text = node2Text(node);
  return text
};

module.exports = Template;


var processors = {
  'template': function(node) {
    var out = [],
        statement = "template",
        start = [],
        end = "{/template}",
        attributes = node.attribs,
        name = attributes.id,
        args = attributes.args || false,
        exported = attributes.export || false,
        component = attributes.using || false,
        refComponent = attributes.ref;

    start.push(["{", exported ? "export ": "", statement, " ", name ].join(''));
    if (args) {
      start.push(["(", args, ")"].join(''));
    } else if (component) {
      start.push([" using ", refComponent, ":", component].join(''));
    }
    start.push("}");

    // we push the template definition
    out.push(start.join(""));
    // we push the content
    (node.children || []).forEach(function(child) {
      childrenWalk(child, out);
    })
    // we push the template end definition
    out.push(end);

    return out.join("");
  },

  'script': function(node) {
    return reindent(node.children[0].raw);
  },
  'text': function(node) {
    return node.raw;
  }
};

function childrenWalk(node, out) {
  var selfClosed = (/\/$/).test(node.raw);
  if (node.type === "text") {
    return out.push(node.raw);
  }
  out.push(["<", node.raw, ">"].join(''));
  (node.children || []).forEach(function(child) {
    childrenWalk(child, out);
  });
  if (!selfClosed) {
    out.push(["</", node.name, ">"].join(''));
  }
}


function reindent(text) {
  var lines = text.split(/[\r\n]|\r\n/).filter(function(line) { return line.length > 0; }),
      indentFactor = /^\s*/.exec(lines[0])[0].length;

  return lines.map(function(line) {
    return line.substr(indentFactor);
  }).join("\n");
}


// Error Management
var InvalidTagError = function InvalidTagError(node, file) {
  this.name = "InvalidTagError";
  this.message = "Invalid html tag. Can not use <" + node.name + ">";
  this.stack = [];
  this.fileName =  file;
  this.node = node;
};
InvalidTagError.prototype = Object.create(Error.prototype);
InvalidTagError.prototype.name = "InvalidTagError";
InvalidTagError.prototype.toString = function() {
  return [
    this.name + ": " + this.message,
    "    at " + this.fileName + (this.node.location ? (":" + this.node.location.line + ":" + this.node.location.col): "")
  ].join("\n");
};
