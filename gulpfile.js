const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const sassGlob = require('gulp-sass-glob');
const browserSync = require('browser-sync');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssdeclsort = require('css-declaration-sorter');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const cleanCSS = require('gulp-clean-css');

// scssのコンパイル
gulp.task('sass', function() {
  return gulp
  // 対象ファイルの指定
  .src('./src/sass/**/*.scss')
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(sassGlob())
  // CSSの整形（圧縮する場合は必要ないかも）
  .pipe(sass({
    outputStyle: 'expanded'
  }))
  // プレフィックス付与
  .pipe(postcss([autoprefixer({
    cascade: false
  })]))
  // CSSプロパティの並び順指定
  .pipe(postcss([cssdeclsort({
    order: 'smacss'
  })]))
  // CSSコード圧縮
  .pipe(cleanCSS())
  // ファイル名の後に'.min'を付与
  .pipe(rename({ suffix: '.min' }))
  // CSSファイルの保存先指定
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
    }
  });
  done();
});
// ブラウザリロード
gulp.task('bs-reload', function(done){
  browserSync.reload();
  done();
});

// ejsコンパイル
gulp.task("ejs", (done) => {
  gulp
  .src(["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"])
  .pipe( plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(ejs({}, {}, {
    ext: '.html'
  }))
  .pipe(rename({
    extname: ".html"
  }))
  .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
  .pipe(gulp.dest("./dist/"));
  done();
});

// CSSコード圧縮（gulp-sass内で指定しているので必要ない）
// gulp.task('mincss', function() {
//   return gulp.src("./dist/css/*.css")
//     .pipe(cleanCSS())
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(gulp.dest('./dist/css/'));
// });

// 監視
gulp.task('watch', function(done) {
  gulp.watch('./src/sass/**/*.scss', gulp.task('sass'));
  gulp.watch('./src/sass/**/*.scss', gulp.task('bs-reload'));
  gulp.watch('./src/js/*.js', gulp.task('bs-reload'));
  gulp.watch('./src/ejs/**/*.ejs', gulp.task('ejs'));
  gulp.watch('./src/ejs/**/*.ejs', gulp.task('bs-reload'));
  gulp.watch('./src/img/*', gulp.task('imagemin'));
});

// default
gulp.task('default', gulp.series(gulp.parallel('browser-sync', 'watch', 'bs-reload')));

// 画像の圧縮 ($gulp imagemin)
gulp.task('imagemin', function(){
  return gulp
  // 対象ファイルのパス
  .src('src/img/*')
  .pipe(imagemin([
    // pngの圧縮率指定
    pngquant({
      quality: [0.7, 0.8],
      speed: 1
    }),
    // jpegの圧縮率指定
    mozjpeg({quality: 85})
  ]))
  // 圧縮後の保存先
  .pipe(gulp.dest('dist/img/'));
});

