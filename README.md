# UNDP Design System starter template
Boilerplate project for sites using [UNDP Design System](https://design.undp.org)

## What's included?

### **Baseline stylesheet** (17KB minified and gzipped)
- [Grid system](https://design.undp.org/?path=/story/foundation-layout-grid--page)
- UNDP official web typefaces: ProximaNova and Söhne
- basic HTML elements styling:
  - [H1-6 headings](https://design.undp.org/?path=/story/foundation-typography-base-typography--headings)
  - Paragraph text & [links](https://design.undp.org/?path=/story/foundation-typography-links--links)
  - [Inline elements](https://design.undp.org/?path=/docs/foundation-typography-base-typography) (abbr, blockuote, cite, code, mark, quotation)
  - [Image](https://design.undp.org/?path=/story/foundation-images-image-with-credit-caption--image-with-credit-caption) and Video default styling, including captions and credit
  - [Table](https://design.undp.org/?path=/story/foundation-typography-table--table)
- served via jsDelivr CDN with <20ms latency

### **Ready to use static site generator**
Inspired by [ZURB Template](https://get.foundation/sites/docs/starter-projects.html#zurb-template)
- Sass compilaton. Using DartSass library with source maps support.
- Javascript compilation. Transpiled with [Babel](https://babeljs.io/), bundling is handled via [Webpack](https://webpack.js.org/)
- Assets copying for distribution. Image compressed and optimized using [imagemin](https://github.com/imagemin/imagemin)
- Page compilation. Based on flat file compiler [Panini](https://get.foundation/sites/docs/panini.html) using [Handlebars](https://handlebarsjs.com/) template language
- Development mode with [BrowserSync](https://browsersync.io/) server, file watching and on the fly compilation
- Content decoupled from layout for easy translation via data files

### Dependencies (referenced from external CDN)
- [jQuery](https://jquery.com/)
- [GSAP](https://greensock.com/gsap/) with ScrollTrigger and EasePack plugins - animations and transitions
- [Swiper](https://swiperjs.com/) - carousels and sliders

### **Usage**

Clone project repo locally
To manually set up the template, first download it with Git:
```
git clone https://github.com/undp/design-system-starter-template projectname
cd projectname
```

Install dependencies
```
npm install
```

Run development server (at http://localhost:8000)
```
npm run start
```

When ready for publication build production ready assets (published to /docs directory)
```
npm run build
```

Don't forget to relink Git to your own repository:
```
git remote set-url origin <remote_url>
```
