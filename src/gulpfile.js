var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.gulp.json');

gulp.task('default', () => {
  var tsResult = tsProject.src()
      .pipe(sourcemaps.init())
      .pipe(tsProject());

  return tsResult.js
      .pipe(sourcemaps.write('../dist'))
      .pipe(gulp.dest('../dist'));
});
