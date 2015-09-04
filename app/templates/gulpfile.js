var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache');
var minifycss = require('gulp-minify-css');
var less = require('gulp-less');
var browserSync = require('browser-sync');
var bowerResolve = require('bower-resolve');
var stringify = require('stringify');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var fs = require('fs');

var IS_PRODUCTION = (process.env.NODE_ENV === 'production');
var DESTINATION = './public';

function getBowerPackageIds() {
    var bowerManifest = {};

    try {
        bowerManifest = require('./bower.json');
    } catch (e) {
        // does not have a bower.json manifest
    }

    return bowerManifest.dependencies ? Object.keys(bowerManifest.dependencies) || [] : [];
}

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('bs-reload', function() {
    browserSync.reload();
});

gulp.task('images', function() {
    gulp.src('src/assets/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(DESTINATION + '/assets/images/'));
});

gulp.task('styles', function() {
    gulp.src(['src/assets/less/*.less'])
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(less())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(DESTINATION + '/assets/css/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(DESTINATION + '/assets/css/'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('scripts:vendor', function() {
    var b = browserify('./src/assets/js/vendor.js', {
        debug: !IS_PRODUCTION
    });

    getBowerPackageIds().forEach(function(id) {
        var pkg = bowerResolve.fastReadSync(id);

        if (fs.existsSync(pkg)) {
            // Otherwise it may be just CSS
            b.require(pkg, {
                expose: id
            });
        }
    });

    return b.bundle()
      .on('error', console.log)
      .pipe(plumber({
          errorHandler: function(error) {
              console.log(error.message);
              this.emit('end');
          }
      }))
      .pipe(source('vendor.js'))
      .pipe(gulp.dest(DESTINATION + '/assets/js'))
      .pipe(browserSync.reload({
         stream: true
      }));
});

gulp.task('scripts:app', function() {
    var b = browserify('./src/assets/js/app.js', {
        debug: !IS_PRODUCTION
    });

    getBowerPackageIds().forEach(function(id) {
        var pkg = bowerResolve.fastReadSync(id);

        if (fs.existsSync(pkg)) {
            // Otherwise it may be just CSS
            b.external(id);
        }
    });

    return b
        .transform(stringify(['.html']))
        .bundle()
        .on('error', console.log)
        .pipe(plumber({
          errorHandler: function(error) {
            console.log(error.message);
            this.emit('end');
          }
        }))
        .pipe(source('app.js'))
        .pipe(gulp.dest(DESTINATION + '/assets/js'))
        .pipe(browserSync.reload({
           stream: true
        }));
});

gulp.task('build:html', function() {
    return gulp.src('./src/index.html')
        .pipe(gulp.dest(DESTINATION));
});

gulp.task('default', ['browser-sync'], function() {
    gulp.watch("src/index.html", ['build:html']);
    gulp.watch("src/less/**/*.less", ['styles']);
    gulp.watch("src/assets/js/**/*.js", ['scripts:app']);
    gulp.watch("bower.json", ['scripts:vendor']);
    gulp.watch("src/assets/js/vendor.js", ['scripts:vendor']);
    gulp.watch("*.html", ['bs-reload']);
});

gulp.task('build', [ 'scripts:vendor', 'scripts:app', 'styles', 'images', 'build:html' ]);
