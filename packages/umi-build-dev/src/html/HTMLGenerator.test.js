import { join } from 'path';
import HTMLGenerator from './HTMLGenerator';

describe('HG', () => {
  it('getFlatRoutes', () => {
    const hg = new HTMLGenerator();
    const result = hg.getFlatRoutes([
      {
        path: '/a',
        routes: [{ path: '/a/b', component: './a/b' }],
      },
      { path: '/b', component: './b' },
      { component: './c' },
    ]);
    expect(result).toEqual([
      { path: '/a' },
      { path: '/a/b', component: './a/b' },
      { path: '/b', component: './b' },
    ]);
  });

  it('getHtmlPath', () => {
    const hg = new HTMLGenerator({
      config: {
        mountElementId: 'root',
      },
    });
    expect(hg.getHtmlPath('/')).toEqual('index.html');
    expect(hg.getHtmlPath('/a')).toEqual('a/index.html');
    expect(hg.getHtmlPath('/a/')).toEqual('a/index.html');
  });

  it('getHtmlPath with exportStatic.htmlSuffix = true', () => {
    const hg = new HTMLGenerator({
      config: {
        exportStatic: { htmlSuffix: true },
        mountElementId: 'root',
      },
    });
    expect(hg.getHtmlPath('/')).toEqual('index.html');
    expect(hg.getHtmlPath('/a.html')).toEqual('a.html');
  });

  it('getLinksContent', () => {
    const hg = new HTMLGenerator();
    const result = hg.getLinksContent([
      { rel: 'stylesheet', href: './a.css' },
      { a: 1, c: 'd', e: true },
    ]);
    expect(result).toEqual(
      `
<link rel="stylesheet" href="./a.css" />
<link a="1" c="d" e="true" />
    `.trim(),
    );
  });

  it('getMetasContent', () => {
    const hg = new HTMLGenerator();
    const result = hg.getMetasContent([{ a: 1, c: 'd', e: true }]);
    expect(result).toEqual(
      `
<meta a="1" c="d" e="true" />
    `.trim(),
    );
  });

  it('getScriptsContent', () => {
    const hg = new HTMLGenerator();
    const result = hg.getScriptsContent([
      { src: './a.js' },
      { src: './a.js', crossorigin: 'anonymous' },
      { content: "alert('hello');\nalert('umi');", a: 'b' },
    ]);
    expect(result).toEqual(
      `
<script src="./a.js"></script>
<script src="./a.js" crossorigin="anonymous"></script>
<script a="b">
  alert('hello');
  alert('umi');
</script>
    `.trim(),
    );
  });

  it('getStylesContent', () => {
    const hg = new HTMLGenerator();
    const result = hg.getStylesContent([
      { content: 'body { color: red; }', a: 'b' },
    ]);
    expect(result).toEqual(
      `
<style a="b">
  body { color: red; }
</style>
    `.trim(),
    );
  });

  it('getContent', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      minify: false,
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
      modifyLinks: links => {
        links.push({
          rel: 'stylesheet',
          href: 'http://ant.design/test.css',
        });
        return links;
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(content.trim()).toEqual(
      `
<head>

<link rel="stylesheet" href="http://ant.design/test.css" />
<link rel="stylesheet" href="/umi.css" />
<script>
  window.routerBase = "/";
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="/umi.js"></script>
</body>
    `.trim(),
    );
  });

  it('getContent with runtimePublicPath', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      minify: false,
      config: {
        runtimePublicPath: true,
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(content.trim()).toEqual(
      `
<head>

<link rel="stylesheet" href="/umi.css" />
<script>
  window.routerBase = "/";
  window.publicPath = "/";
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="/umi.js"></script>
</body>
    `.trim(),
    );
  });

  it('getContent in development', () => {
    const hg = new HTMLGenerator({
      env: 'development',
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(content.trim()).toEqual(
      `
<head>

<link rel="stylesheet" href="/umi.css" />
<script>
  window.routerBase = "/";
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="/umi.js"></script>
</body>
    `.trim(),
    );
  });

  it('getRoute and minify', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: true,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });
    const content = hg.getContent({
      path: '/',
    });
    expect(content.trim()).toEqual(
      `
<head><link rel="stylesheet" href="/umi.css"><script>window.routerBase = "/";</script></head><body><div id="documenttestid"></div><script src="/umi.js"></script></body>
    `.trim(),
    );
  });

  it('getRoute dynamicRoot', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        exportStatic: {
          dynamicRoot: true,
        },
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });

    const c1 = hg.getContent({
      path: '/',
    });
    expect(c1.trim()).toEqual(
      `
<head>

<link rel="stylesheet" href="./umi.css" />
<script>
  window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = location.origin + window.routerBase;
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="./umi.js"></script>
</body>
    `.trim(),
    );

    const c2 = hg.getContent({
      path: '/a',
    });
    expect(c2.includes('"../umi.js"') && c2.includes('"../umi.css"')).toEqual(
      true,
    );
    const c3 = hg.getContent({
      path: '/a/b',
    });
    expect(
      c3.includes('"../../umi.js"') && c3.includes('"../../umi.css"'),
    ).toEqual(true);
  });

  it('getRoute dynamicRoot with exportStatic.htmlSuffix = true', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        exportStatic: {
          htmlSuffix: true,
          dynamicRoot: true,
        },
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
    });

    const c1 = hg.getContent({
      path: '/',
    });
    expect(c1.trim()).toEqual(
      `
<head>

<link rel="stylesheet" href="./umi.css" />
<script>
  window.routerBase = location.pathname.split('/').slice(0, -1).concat('').join('/');
  window.publicPath = location.origin + window.routerBase;
</script>
</head>
<body>
<div id="documenttestid"></div>
<script src="./umi.js"></script>
</body>
    `.trim(),
    );

    const c2 = hg.getContent({
      path: '/a',
    });
    expect(c2.includes('"./umi.js"') && c2.includes('"./umi.css"')).toEqual(
      true,
    );
    const c3 = hg.getContent({
      path: '/a/b',
    });
    expect(c3.includes('"../umi.js"') && c3.includes('"../umi.css"')).toEqual(
      true,
    );
  });

  it('getMatchedContent', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
      routes: [
        { path: '/a' },
        {
          path: '/b',
          routes: [{ path: '/b/c' }],
        },
        { path: '/c/d' },
        { path: '/e/:id' },
      ],
    });

    const c1 = hg.getMatchedContent('/a');
    expect(c1.includes('"/umi.js"') && c1.includes('"/umi.css"')).toEqual(true);
    const c2 = hg.getMatchedContent('/a/b');
    expect(c2.includes('"/umi.js"') && c2.includes('"/umi.css"')).toEqual(true);
  });

  it('getMatchedContent with exportStatic', () => {
    const hg = new HTMLGenerator({
      env: 'production',
      minify: false,
      chunksMap: {
        umi: ['umi.js', 'umi.css'],
      },
      config: {
        exportStatic: {
          htmlSuffix: true,
          dynamicRoot: true,
        },
        mountElementId: 'documenttestid',
      },
      paths: {
        cwd: '/a',
        absPageDocumentPath: '/tmp/files-not-exists',
        defaultDocumentPath: join(__dirname, 'fixtures/document.ejs'),
      },
      routes: [
        { path: '/a' },
        {
          path: '/b',
          routes: [{ path: '/b/c' }],
        },
        { path: '/c/d' },
        { path: '/e/:id' },
      ],
    });

    const c1 = hg.getMatchedContent('/a');
    expect(c1.includes('"./umi.js"') && c1.includes('"./umi.css"')).toEqual(
      true,
    );
    const c2 = hg.getMatchedContent('/b/c');
    expect(c2.includes('"../umi.js"') && c2.includes('"../umi.css"')).toEqual(
      true,
    );
    const c3 = hg.getMatchedContent('/c');
    expect(c3.includes('"./umi.js"') && c3.includes('"./umi.css"')).toEqual(
      true,
    );
    const c4 = hg.getMatchedContent('/e/123');
    expect(c4.includes('"../umi.js"') && c4.includes('"../umi.css"')).toEqual(
      true,
    );
  });
});
