var http      = require('http');

var gulp      = require('gulp'),
    gutil     = require('gulp-util'),
    connect   = require('connect'),
    hsp       = require('gulp-hashspace'),
    plumber   = require('gulp-plumber');

var meteorite = require('./index');

var PATHS = {
  'static': ['./examples/**/*.html', '!./examples/**/*.hsp.html'],
  'hsp_dynamic': './examples/**/*.hsp.html',
  'dynamic': './examples/**/*.js'
}



gulp.task('build-hsp', function() {
  return gulp.src(PATHS.hsp_dynamic)
    .pipe(meteorite())
    .pipe(hsp.process())
    .pipe(gulp.dest('./build'));
});


gulp.task('build-dynamic', function() {
  return gulp.src(PATHS.dynamic)
    .pipe(hsp.process())
    .pipe(gulp.dest('./build'));
});


gulp.task('build-static', function() {
  return gulp.src(PATHS.static)
  .pipe(gulp.dest('./build'));
});

gulp.task('play', ['build-static', 'build-dynamic', 'build-hsp'], function() {
  var wwwServerPort = gutil.env.port || 8000;

  //observe files for changes
  gulp.watch(PATHS.static, ['build-static']);
  gulp.watch(PATHS.dynamic, ['build-dynamic']);
  gulp.watch(PATHS.hsp_dynamic, ['build-hsp']);

  http.createServer(connect().use(connect.static('./build'))).listen(wwwServerPort, function() {
    gutil.log('Server started at http://localhost:' + wwwServerPort);
  });
});

gulp.task('default', ['play']);

