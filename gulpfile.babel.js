// inspired by Zurb Foundation starter project
// https://github.com/foundation/foundation-zurb-template

import plugins       from 'gulp-load-plugins';
import yargs         from 'yargs';
import browser       from 'browser-sync';
import gulp          from 'gulp';
import panini        from 'panini';
import { rimraf }    from 'rimraf';
import webpackStream from 'webpack-stream';
import webpack2      from 'webpack';
import named         from 'vinyl-named';
import autoprefixer  from 'autoprefixer';
import imagemin      from 'gulp-imagemin';

const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const url = require("postcss-url");

// const uncss = require('postcss-uncss'); // uncomment if required
// const UNCSS_OPTIONS = {
//   html: 'dist/**/*.html',
//   timeout: 1000,
//   ignore: ['.foundation-mq', '!!js/regexp /\.is-\w+/'],
// }

// Load all Gulp plugins into one variable
const $ = plugins();

// file locations
const PATH_DIST = 'dist';
const PATH_PUBLISH = 'docs';
const PATH_ASSETS = ['src/assets/**/*', '!src/assets/{img,js,scss}/**/*'];
const PATH_SASS = ['node_modules/@undp/design-system/stories'];
const PATH_JS = 'src/assets/js/app.js';
const CDN = 'https://cdn.jsdelivr.net/gh/undp/design-system@1.2/docs/';
const PORT = 8000;

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

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
function copy() {
  return gulp.src(PATH_ASSETS)
    .pipe(gulp.dest(PATH_DIST + '/assets'));
}

// copy compiled assets to final destination
function publish() {
  return gulp.src(PATH_DIST + '/**/*')
    .pipe($.if(PRODUCTION, gulp.dest(PATH_PUBLISH)));
}

// Copy page templates into finished HTML files
function pages() {
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
function sassBuild() {

  const postCssPlugins = [
    // Autoprefixer
    autoprefixer(),
    // externalize icon links in imported stylesheets
    url({
      filter: '**/assets/icons/*.svg',
      url: (asset) => {
        return CDN + '/images/' + asset.url.split('/').at(-1);
      },
    }),
    // UnCSS - Uncomment to remove unused styles in production
    // PRODUCTION && uncss(UNCSS_OPTIONS),
  ].filter(Boolean);

  return gulp.src('src/assets/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe(sass({
      includePaths: PATH_SASS
    })
    .on('error', sass.logError))
    .pipe(postcss(postCssPlugins))
    .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie11', level: {1: {specialComments: 0}} })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATH_DIST + '/assets/css'))
    .pipe(browser.reload({ stream: true }));
}

let webpackConfig = {
  mode: (PRODUCTION ? 'production' : 'development'),
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ "@babel/preset-env" ],
            compact: false
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
function javascript() {
  return gulp.src(PATH_JS)
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe(webpackStream(webpackConfig, webpack2))
    .pipe($.if(PRODUCTION, $.terser()
      .on('error', e => { console.log(e); })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATH_DIST + '/assets/js'));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp.src('src/assets/img/**/*')
    .pipe($.if(PRODUCTION, imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 85, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
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
