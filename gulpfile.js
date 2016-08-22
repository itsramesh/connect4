"use strict";

let gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    client = {
        source: {
            js: 'script/index.js',
            bower: 'bower_components/pixi/bin/pixi.js'
        },
        dest: './'
    };

/* util Tasks */

livereload({ start: true });

gulp.task('build-bower-js', function() {
    return gulp.src(client.source.bower)
        .pipe(sourcemaps.init())
        .pipe(concat('comp.js'))
        .pipe(uglify().on('error', function(e){
           // console.log(e);
         }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(client.dest))
        .pipe(livereload());
});

gulp.task('build-js', function() {
    return gulp.src(client.source.js)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(gulp.dest(client.dest))
        .pipe(livereload());
});

gulp.task('start_web', function() {
    connect.server({
        root: './',
        port: 8888,
        livereload: true
    });
});

/* Default Tasks */

gulp.task('watch', function(){
    gulp.watch(client.source.bower, ['build-bower-js']);
    gulp.watch(client.source.js, ['build-js']);
    livereload.listen();
});

gulp.task('default', ['build-bower-js','build-js', 'start_web', 'watch']);
