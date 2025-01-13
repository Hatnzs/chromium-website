module.exports = config => {
  // `sass` is a Node package that compiles Sass to CSS.
  const sass = require("sass");

  // `markdown-it` is Eleventy's default Markdown rendering engine.
  // We need a reference to it to customize its behavior, below.
  const md = require('markdown-it');

  // `markdown-it-anchor` is an Eleventy plugin that will add <a> tags to header elements.
  // (this improves the accessibility of linking to headers.)
  const anchor = require('markdown-it-anchor');

  // `uslug` is a Node package that convert text strings into "slugs" in a
  // Unicode-friendly way. (Slugs are the kebab-cased equivalents of text that
  // we use for page names, id's, etc. "Hello world" turns into 'hello-world".
  const uslug = require('uslug');

  // `highlight.js` is a Node package that does syntax highlighting.
  const hljs = require('highlight.js');

  // `markdown-it-attrs` is a markdown-it plugin that lets us customize the
  // `id` and `class` attributes of an element in the generated output;
  // we use this mostly for customizing the links in header tags.
  //
  // `markdown-it-toc-done-right` is a markdown-it plugin that adds support
  // for the `[TOC]` mechanism for generating the table of contents in a page.
  let mdlib = md({
    highlight: (str, lang) => {
      if (lang) {
        if (hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, {language: lang}).value;
          } catch (_) {}
        }
      } else {
        // highlight.js supports a ton of languages, but we only ever use a
        // much smaller subset.  Restrict auto-detection to the ones we use
        // to avoid detecting incorrectly.  If someone wants to override,
        // they can specify the language explicitly in the markdown.
        const result = hljs.highlightAuto(str, [
          // keep-sorted start
          'bash',
          'c',
          'cpp',
          'css',
          'gn',
          'go',
          'html',
          'ini',
          'javascript',
          'json',
          'md',
          'protobuf',
          'python',
          'rust',
          'shell',
          'typescript',
          'xml',
          // keep-sorted end
        ]);
        return result.value;
      }

      // Return an empty string to get default code blocks.
      return '';
    },
    html: true,
  }).use(require('markdown-it-attrs'), {
    leftDelimiter: '{:',
    rightDelimiter: '}',
    allowedAttributes: ['id', 'class'],
  }).use(require('markdown-it-footnote'), {
  }).use(anchor, {
    slugify: s => uslug(s),
    level: 2,
    permalink: anchor.permalink.headerLink(),
  }).use(require('markdown-it-toc-done-right'), {
    slugify: uslug,
    tocClassName: 'toc',
    tocFirstLevel: 2,
    tocPattern: /\[TOC\]/,
  });

  config.setLibrary('md', mdlib);

  // Enable indented code blocks.
  config.amendLibrary("md", (mdLib) => mdLib.enable("code"));

  config.addCollection('allSortedByLowerCasedUrl', function(collectionApi) {
    return collectionApi.getAll().sort(function(a, b) {
      let x = a.url.toLowerCase();
      let y = b.url.toLowerCase()
      return (x > y) ? 1 : ((x < y) ? -1 : 0);
    });
  });

  // TODO(crbug.com/1271672): Figure out how to make this syntax and API
  // less clunky.
  const subpages = require('./subpages.js')
  function handleSubPages(collectionAll) {
    let pageUrl = this.page.url;
    return subpages.render(pageUrl, collectionAll);
  };
  config.addNunjucksShortcode("subpages", handleSubPages);

  // Compile SCSS files to CSS on build.

  const path = require("path");
  config.on("beforeBuild", () => {
    const scssDir = path.join(__dirname, "site/_stylesheets/");
    const cssDir = path.join(__dirname, "build/_stylesheets/");

    fs.readdirSync(scssDir).forEach((file) => {
      if (file.endsWith(".scss")) {
        const scssFilePath = path.join(scssDir, file);
        const cssFilePath = path.join(cssDir, file.replace(".scss", ".css"));

        const result = sass.compile(scssFilePath, {
          style: "compressed",
        });

        fs.writeFileSync(cssFilePath, result.css);
      }
    });
  });

  // Copy binary assets over to the build/ directory.

  // This list must be kept in sync with the lists in `.eleventy.js`.
  // TODO(crbug.com/1457683): Figure out how to share these lists to eliminate
  // the duplication and need to keep them in sync.
  let lob_extensions = [
    // keep-sorted start
    '.PNG',
    '.ai',
    '.bin',
    '.bmp',
    '.brd',
    '.bz2',
    '.config',
    '.crx',
    '.dia',
    '.gif',
    '.graffle',
    '.ico',
    '.jpeg',
    '.jpg',
    '.mp4',
    '.msi',
    '.pdf',
    '.png',
    '.svg',
    '.swf',
    '.tar.gz',
    '.tiff',
    '.webp',
    '.xcf',
    '.xlsx',
    '.zip',
    '_trace',
    // keep-sorted end
  ];

  // This should basically pick up everything that isn't a .md file.
  // TODO(crbug.com/1457688): Figure out how to actually enforce this and get
  // rid of the "basically". There has to be a better approach. :).
  let extensions = lob_extensions.concat([
    // keep-sorted start
    '.cpp',
    '.css',
    '.csv',
    '.dot',
    '.ebuild',
    '.el',
    '.html',
    '.js',
    '.json',
    '.patch',
    '.py',
    '.txt',
    '.xml',
    // keep-sorted end
  ]);

  for (let ext of extensions) {
    config.addPassthroughCopy('site/**/*' + ext);
  }


  // Add a filter to convert a value to JSON.
  config.addFilter("jsonify", function (value) {
    return JSON.stringify(value);
  });

  // Add a filter to truncate a string to a certain number of bytes.
  config.addFilter("truncateBytes", function (str, maxBytes) {
    if (typeof str !== "string" || str.length === 0) return str;
    const buffer = Buffer.from(str, "utf8");
    if (buffer.length <= maxBytes) return str;
    const truncatedBuffer = buffer.slice(0, maxBytes);
    return truncatedBuffer.toString("utf8");
  });

  // Set up the Content-Security-Policy (CSP) hash filter. Every <script>
  // tag must be run through this filter so that the hash of its contents
  // will be in the list of approved scripts in the CSP HTTP header.
  const crypto = require('crypto');
  const fs = require('fs');

  let script_hashes = new Set();
  function cspHash(raw) {
    const c = crypto.createHash('sha256');
    c.update(raw);
    let digest = c.digest('base64');
    script_hashes.add(`'sha256-${digest}'`);
    return raw;
  }

  config.addFilter('cspHash', cspHash);

  // Write out the firebase.json config file once we know which CSP
  // headers to set.
  config.on('afterBuild', () => {
    let script_src = " 'none'";
    if (script_hashes.size > 0) {
      script_src = '';
      for (const script_hash of script_hashes.values()) {
        script_src += ' ' + script_hash;
      }
      script_src += " 'unsafe-inline' 'strict-dynamic'";
    }

    fs.writeFileSync('firebase.json',
      JSON.stringify({
        'hosting': {
          'public': 'build',
          'ignore': [
            'firebase.json',
            '**/.*',
            '**/node_modules/**',
          ],
          'headers': [{
            'source': '**/*',
            'headers': [{
              'key': 'Content-Security-Policy',
              'value':
                "script-src" + script_src +
                "; object-src 'none'; base-uri 'none'; " +
                "report-uri https://csp.withgoogle.com/csp/chromium-website/",
              }],
          }],
        },
      }, null, 2) + '\n');
  });

  // Copy over Algolia files.
  config.addPassthroughCopy({
     'node_modules/@docsearch/js/dist/umd':
       '_scripts/@docsearch',
     'node_modules/@docsearch/css/dist':
       '_stylesheets/@docsearch',
     'node_modules/highlight.js/styles/github*.min.css':
       '_stylesheets/highlight.js/',
  });

  return {
    dir: {
      input: 'site',
      output: 'build'
    },
    markdownTemplateEngine: 'njk',
    templateFormats: ['md', 'njk'],
    htmlTemplateEngine: 'njk',
    xmlTemplateEngine: 'njk',
  };
};
