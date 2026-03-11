const httpServer = require('http-server');
const path = require('path');

const rootDir = path.join(__dirname, 'public');

const server = httpServer.createServer({
  root: rootDir,
  cache: -1,
  showDir: true,
  autoIndex: true
});

const PORT = 7000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});