var path = require("path"),
    through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError;


var compiler = require('./src/compiler');


module.exports = function meteorite(opts) {

  function processFile(file, unused, callback) {
    var template;

    if(file.isStream()){
        this.emit('error', new PluginError('meteorite', 'Streaming not supported'));
        return cb();
    }

    // We parse the content as HTML
    try {
      template = compiler.compile(opts, path.basename(file.path), file.path, file.contents);
    } catch (e) {
      this.emit('error', new PluginError("meteorite", e.toString()))
      return callback();
    }

    try {
      file.contents = new Buffer(template.toText());
    } catch (e) {
      console.error(
        gutil.colors.cyan('[Meteorite]'),
        gutil.colors.red(e.toString()));

      return callback(); // It's over, let's move on
    }

    // We remove the ".html" extension
    renameToHsp(file);

    this.push(file);
    callback();
  };

  return through.obj(processFile);
}



function parsePath(filePath) {
  var extname = ".hsp.html";
  return {
    dirname: path.dirname(filePath),
    basename: path.basename(filePath, extname),
    extname: extname
  };
}

function renameToHsp(file) {
  var pathInfo = parsePath(file.path);
  file.path = path.join(pathInfo.dirname, pathInfo.basename + ".hsp");
}
