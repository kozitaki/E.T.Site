var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var sassGlob = require('gulp-sass-glob');
var browserSync = require( 'browser-sync' );
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssdeclsort = require('css-declaration-sorter');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var mozjpeg = require('imagemin-mozjpeg');
var ejs = require("gulp-ejs");
var rename = require("gulp-rename");
var replace = require("gulp-replace");

// scssのコンパイル
gulp.task('sass', function() {
return gulp
.src('./src/sass/**/*.scss')
.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
.pipe(sassGlob())
.pipe(sass({
outputStyle: 'expanded'
}))

.pipe(postcss([cssdeclsort({order: 'smacss'})]))
.pipe(gulp.dest('./dist/css'));
});

// 保存時のリロード
gulp.task('browser-sync', function(done){
browserSync.init({

//ローカル開発
server: {
baseDir: "./dist/",
open: 'external',
notify: false
// index: "pc/index.html"
}
});
done();
});

gulp.task('bs-reload', function(done){
browserSync.reload();
done();
});

gulp.task("ejs", (done) => {
gulp
.src(["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"])
.pipe( plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
.pipe(ejs({}, {}, {ext: '.html'}))
.pipe(rename({extname: ".html"}))
.pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
.pipe(gulp.dest("./dist/"));
done();
});

// 監視
gulp.task('watch', function(done) {
gulp.watch('./src/sass/**/*.scss', gulp.task('sass'));
gulp.watch('./src/sass/**/*.scss', gulp.task('bs-reload'));
gulp.watch('./src/js/*.js', gulp.task('bs-reload'));
gulp.watch('./src/ejs/**/*.ejs',gulp.task('ejs'));
gulp.watch('./src/ejs/**/*.ejs',gulp.task('bs-reload'));
gulp.watch('./src/img/*',gulp.task('imagemin'));
});

// default
gulp.task('default', gulp.series(gulp.parallel('browser-sync', 'watch')));

// 画像の圧縮 ($gulp imagemin)
gulp.task('imagemin', function(){
  return gulp.src('src/img/*')
  .pipe(imagemin([
    pngquant({
      quality: [0.7, 0.8],
      speed: 1
    }),
    mozjpeg({quality: 85})
  ]))
  .pipe(gulp.dest('dist/img/'));
});