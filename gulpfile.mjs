// inspired by Zurb Foundation starter project
// https://github.com/foundation/foundation-zurb-template

import browser from 'browser-sync';
import gulp from 'gulp';
import panini from 'panini';
import { rimraf } from 'rimraf';
import webpackStream from 'webpack-stream';
import webpack2 from 'webpack';
import named from 'vinyl-named';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'autoprefixer';
import postcss from '@sequencemedia/gulp-postcss';
import cssnano from 'cssnano';
import defaultPreset from 'cssnano-preset-default';
import sourcemaps from 'gulp-sourcemaps';
import iif from 'gulp-if';
import TerserPlugin from 'terser-webpack-plugin';

const sass = gulpSass(dartSass);

// file locations
const PATH_DIST = 'dist';
const PATH_PUBLISH = 'docs';
const PATH_ASSETS = ['src/assets/**/*', '!src/assets/{img,js,scss}/**/*'];
const PATH_SASS = ['node_modules/@undp/design-system/stories'];
const PATH_JS = 'src/assets/js/app.js';
const PORT = 8000;

// Check for --production flag
const PRODUCTION = process.argv.includes('--production');

// Build the "docs" folder by running all of the below tasks
// Sass must be run later so UnCSS can search for used classes in the others assets.
gulp.task('build',
  gulp.series(clean, gulp.parallel(pages, javascript, images, copy), sassBuild, publish)
);

// Build the site, run the server, and watch for file changes
gulp.task('default',
  gulp.series('build', server, watch)
);

// Delete the "docs" folder
// This happens every time a build starts
function clean(done) {
  rimraf.sync(PATH_DIST);
  done()
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
async function copy() {
  return gulp.src(PATH_ASSETS, { encoding: false })
    .pipe(gulp.dest(PATH_DIST + '/assets'));
}

// copy compiled assets to final destination
function publish() {
  return gulp.src(PATH_DIST + '/**/*', { encoding: false })
    .pipe(iif(PRODUCTION, gulp.dest(PATH_PUBLISH)));
}

// Copy page templates into finished HTML files
async function pages() {
  return gulp.src('src/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      partials: 'src/partials/',
      data: 'src/data/',
      helpers: 'src/helpers/'
    }))
    .pipe(gulp.dest(PATH_DIST));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
  panini.refresh();
  done();
}

// Compile Sass into CSS
// In production, the CSS is compressed
const preset = defaultPreset();

function sassBuild() {

  return gulp.src('src/assets/scss/app.scss')
    .pipe(sourcemaps.init())
    .pipe(sass.sync({
      includePaths: PATH_SASS
    }).on('error', sass.logError))
    .pipe(iif(PRODUCTION, postcss([cssnano({ preset, plugins: [autoprefixer] })])))
    .pipe(iif(!PRODUCTION, sourcemaps.write()))
    .pipe(gulp.dest(PATH_DIST + '/assets/css'))
    .pipe(browser.reload({ stream: true }));
}

let webpackConfig = {
  mode: (PRODUCTION ? 'production' : 'development'),
  optimization: {
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            module: {
              type: "es6"
            },
            minify: process.env.NODE_ENV !== "development",
            isModule: true,
            jsc: {
              minify: {
                compress: true,
                mangle: true,
                format: {
                  asciiOnly: true,
                  comments: /^ webpack/
                }
              },
              target: "es2016",
              parser: {
                syntax: "typescript",
                tsx: true
              },
              transform: {
                react: {
                  runtime: "automatic"
                }
              }
            }
          }
        }
      }
    ]
  },
  externals: {
    jquery: 'jQuery',
    gsap: 'gsap',
    swiper: 'swiper',
  },
  devtool: !PRODUCTION && 'source-map'
}

// Combine JavaScript into one file
// In production, the file is minified
async function javascript() {
  return gulp.src(PATH_JS)
    .pipe(named())
    .pipe(sourcemaps.init())
    .pipe(webpackStream(webpackConfig, webpack2))
    .pipe(iif(!PRODUCTION, sourcemaps.write()))
    .pipe(gulp.dest(PATH_DIST + '/assets/js'));
}

// Copy images to the "dist" folder
// In production, the images are compressed
async function images() {
  return gulp.src('src/assets/img/**/*', { encoding: false })
    .pipe(iif(PRODUCTION, imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({ quality: 85, progressive: true }),
      optipng({ optimizationLevel: 5 }),
      svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ])))
    .pipe(gulp.dest(PATH_DIST + '/assets/img'));
}

// Start a server with BrowserSync to preview the site in
function server(done) {
  browser.init({
    server: PATH_DIST,
    port: PORT,
  }, done);
}

// Reload the browser with BrowserSync
function reload(done) {
  browser.reload();
  done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
  gulp.watch(PATH_ASSETS, copy);
  gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
  gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/data/**/*.{js,json,yml}').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/helpers/**/*.js').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/assets/scss/**/*.scss').on('all', sassBuild);
  gulp.watch('src/assets/js/**/*.js').on('all', gulp.series(javascript, browser.reload));
  gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
}
