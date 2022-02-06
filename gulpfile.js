const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-dart-sass");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const terser = require("gulp-terser");
const webpack = require("webpack-stream");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const mode = require("gulp-mode")();
const browserSync = require("browser-sync").create();
const php2html = require("gulp-php2html");

// clean tasks
const clean = () => {
  return del(["dist"]);
};

const cleanImages = () => {
  return del(["dist/assets/images"]);
};

const cleanFonts = () => {
  return del(["dist/assets/fonts"]);
};

const cleanLibs = () => {
  return del(["dist/js/libs"]);
};

// css task
const css = () => {
  return src("src/scss/main.scss")
    .pipe(mode.development(sourcemaps.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(rename("css/app.css"))
    .pipe(mode.production(csso()))
    .pipe(mode.development(sourcemaps.write()))
    .pipe(dest("dist"))
    .pipe(mode.development(browserSync.stream()));
};

// js task
const js = () => {
  return (
    src("src/js/*.js")
      // .pipe(
      //   babel({
      //     presets: ["@babel/env"],
      //   })
      // )
      // .pipe(
      //   webpack({
      //     mode: "development",
      //     devtool: "inline-source-map",
      //   })
      // )
      // .pipe(mode.development(sourcemaps.init({ loadMaps: true })))
      // .pipe(rename("js/app.js"))
      .pipe(mode.production(terser({ output: { comments: true } })))
      .pipe(mode.development(sourcemaps.write()))
      .pipe(dest("dist/js"))
      .pipe(mode.development(browserSync.stream()))
  );
};

// copy tasks
const copyImages = () => {
  return src("src/assets/images/**/*.{jpg,jpeg,png,gif,svg}").pipe(
    dest("dist/assets/images")
  );
};

const copyFonts = () => {
  return src("src/assets/fonts/**/*.{svg,eot,ttf,woff,woff2}").pipe(
    dest("dist/assets/fonts")
  );
};

const copyLibs = () => {
  return src("src/js/libs/**/*.*").pipe(dest("dist/js/libs"));
};

const convertPhp2Html = () => {
  return src(["src/*.php", "src/**/*.php"]).pipe(php2html()).pipe(dest("dist"));
};

const copyRootFiles = () => {
  return src(["src/*.*", "!src/*.php"]).pipe(dest("dist/"));
};

var reload = browserSync.reload;

// watch task
const watchForChanges = () => {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });

  watch("src/scss/**/*.scss", css).on("change", reload);
  watch("src/**/*.js", js).on("change", reload);
  watch(["src/*.php", "src/**/*.php"], convertPhp2Html).on("change", reload);
  watch(
    "src/assets/images/**/*.{png,jpg,jpeg,gif,svg}",
    series(cleanImages, copyImages)
  );
  watch(
    "src/assets/fonts/**/*.{svg,eot,ttf,woff,woff2}",
    series(cleanFonts, copyFonts)
  );
  watch("src/js/libs/**/*.*", series(cleanLibs, copyLibs));
};

// public tasks
exports.default = series(
  clean,
  parallel(
    css,
    js,
    copyRootFiles,
    convertPhp2Html,
    copyImages,
    copyFonts,
    copyLibs
  ),
  watchForChanges
);
exports.build = series(
  clean,
  parallel(
    css,
    js,
    copyRootFiles,
    convertPhp2Html,
    copyImages,
    copyFonts,
    copyLibs
  )
);
