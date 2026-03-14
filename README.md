# Cork Cookie Manager

> **In Progress**

This helps users remove unnecessary cookies (e.g. Google Analytics cookies on shared domains like `.ucdavis.edu`) that can contribute to request header size issues.

## Local Development

Install dependencies for the demo app:

```bash
cd app && npm install
```

Start the webpack watcher (rebuilds on file changes):

```bash
npm run dev
```

In a separate terminal, start the local HTTP server:

```bash
npm run serve
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.
