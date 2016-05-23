var gulp = require('gulp')
    ,babel = require('gulp-babel')
    ,sourcemaps = require('gulp-sourcemaps')
    ,rollup = require('gulp-rollup')
    ,path = require('path')
    ,rename = require('gulp-rename')
    ,debug = require('gulp-debug')
    ,del = require('del');

var resourceDir = 'resources/public/';

gulp.task('compile', function () {
    console.log("COMPILE SCRIPTS");
    return gulp.src([resourceDir + 'js/application.js'])
        .pipe(sourcemaps.init())
        .pipe(rollup({
            // any option supported by Rollup can be set here, including sourceMap 
            sourceMap: true
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename('application.bundle.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(resourceDir + 'js/'));
});


gulp.task('clean', function () {
  return del(resourceDir + 'js/bundle.js*');
});

gulp.task('watch', function () {
    gulp.watch([resourceDir + '/js/*.js'], ['compile']);
});

gulp.task('default', ['compile', 'watch']);
