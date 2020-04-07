var gulp = require("gulp");
var rename = require("gulp-rename");
var ts = require("gulp-typescript");
var uglify = require("gulp-uglify-es").default;

gulp.task("ts", function () {
  var tsProject = ts.createProject("tsconfig.json");
  return tsProject.src()
    .pipe(tsProject())
    .pipe(gulp.dest("bin"));
});

gulp.task("uglify", function () {
  return gulp.src("bin/douUI.js")
    .pipe(uglify({ compress: { global_defs: { DEBUG: false, RELEASE: true } } }))
    .pipe(rename({ basename: "douUI.min" }))
    .pipe(gulp.dest("bin"));
});

gulp.task("copy", function () {
  return gulp.src("bin/**/*")
    .pipe(gulp.dest("../examples/lib"));
});

gulp.task("default", gulp.series("ts", "uglify", "copy"));