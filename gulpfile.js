var gulp = require('gulp')
    ,babel = require('gulp-babel')
    ,sourcemaps = require('gulp-sourcemaps')
    ,rollup = require('gulp-rollup')
    ,path = require('path')
    ,rename = require('gulp-rename')
    ,debug = require('gulp-debug')
    ,livereload = require('gulp-livereload')
    ,del = require('del');

var resourceDir = 'resources/public/';

gulp.task('compile', function () {
    console.log("COMPILE SCRIPTS");
    return gulp.src([resourceDir + 'js/main.js'])
        .pipe(sourcemaps.init())
        .pipe(rollup({
            sourceMap: true,
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename('main.bundle.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(resourceDir + 'js/'))
        .pipe(livereload());
});


gulp.task('clean', function () {
  del(resourceDir + 'js/*.bundle.js*').then(function (paths) {
      console.log(paths.join(', ') + " deleted");
  });
});

gulp.task('reload-css', function () {
    gulp.src([resourceDir + '/css/*.css']).pipe(livereload());
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch([resourceDir + '/js/*.js', '!' + resourceDir + '/js/main.bundle.js'], ['compile']);
    gulp.watch([resourceDir + '/css/*.css'], ['reload-css']);
});

gulp.task('default', ['compile', 'watch'], function () {
    livereload();
});
