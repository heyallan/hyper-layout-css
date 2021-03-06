var gulp         = require('gulp');
var postcss      = require('gulp-postcss');
var nextcss      = require('postcss-preset-env');
var atImport     = require('postcss-import');
var autoprefix   = require('gulp-autoprefixer');
var minify       = require('gulp-minify-css');
var rename       = require('gulp-rename');
var header       = require('gulp-header');
var nunjucks     = require('gulp-nunjucks-render');
var pkgJson      = require('./package.json');
var browserSync  = require('browser-sync').create();
var fs           = require('fs');
var banner       = ['/** <%= package.version %> <%= package.repo.url %> */\n'];

// get filezise in bytes
var size = fs.statSync('./dist/layout.css').size;
var i = Math.floor( Math.log(size) / Math.log(1024) );
var fileSize = ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
pkgJson.fileSize = fileSize;

gulp.task('css', function() {
  return gulp.src('./src/css/layout.css')
    .pipe(postcss([nextcss,atImport]))
    .pipe(autoprefix())
    .pipe(rename(pkgJson.keyword + '.css'))
    .pipe(header(banner, { package: pkgJson }))
    .pipe(gulp.dest('./dist')) // <-- deliver expanded for dist
    .pipe(minify())
    .pipe(rename(pkgJson.keyword + '.min.css'))
    .pipe(header(banner, { package: pkgJson }))
    .pipe(gulp.dest('./dist')) // <-- deliver compressed for dist
    .pipe(gulp.dest('./docs')) // <-- deliver extra copy for docs
    .pipe(browserSync.stream())
})

gulp.task('docs', function() {
  return gulp.src('./src/docs/pages/**/*.njk')
    .pipe(nunjucks({
      path: './src/docs/partials',
      data: { package: pkgJson }
    }))
    .pipe(gulp.dest('./docs'))
    .pipe(browserSync.stream())
})

gulp.task('readme', function() {
  return gulp.src('./src/readme/*.njk')
    .pipe(nunjucks({
      ext: '.md',
      data: { package: pkgJson }
    }))
    .pipe(gulp.dest('./'))
})

gulp.task('server', function() {
  browserSync.init({ server: "./docs", open: false })
})

gulp.task('watch', function() {
  gulp.watch('./src/css/**/*', ['css']);
  gulp.watch('./src/docs/**/*', ['docs']);
  gulp.watch('./src/readme/**/*', ['readme']);
})

gulp.task('default', ['css', 'docs', 'readme', 'server', 'watch'])
