var gulp = require('gulp')
    ,babel = require('gulp-babel')
    ,sourcemaps = require('gulp-sourcemaps')
    ,rollup = require('gulp-rollup')
    ,path = require('path')
    ,rename = require('gulp-rename')
    ,debug = require('gulp-debug')
    ,livereload = require('gulp-livereload')
    ,template = require('gulp-template')
    ,data = require('gulp-data')
    ,del = require('del');

var resourceDir = 'resources/public/';

gulp.task('compile', function () {
    console.log("COMPILE SCRIPTS");
    return gulp.src([resourceDir + 'js/application.js'])
        .pipe(template({
                // backend: "http://127.0.0.1:3000",
            }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename('application.bundle.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(resourceDir + 'js/'))
        .pipe(livereload());
});


gulp.task('clean', function () {
  del(resourceDir + 'js/application.bundle.js*').then(function (paths) {
      console.log(paths.join(', ') + " deleted");
  });
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch([resourceDir + '/js/*.js'], ['compile']);
});

gulp.task('default', ['compile', 'watch']);
