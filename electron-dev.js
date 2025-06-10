const { spawn } = require('child_process');
const { app } = require('electron');

let viteProcess;
let electronProcess;

function startVite() {
  console.log('Starting Vite dev server...');
  viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  viteProcess.on('close', (code) => {
    console.log(`Vite process exited with code ${code}`);
  });
}

function startElectron() {
  console.log('Starting Electron...');
  electronProcess = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    process.exit(code);
  });
}

function cleanup() {
  if (viteProcess) {
    viteProcess.kill();
  }
  if (electronProcess) {
    electronProcess.kill();
  }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start Vite first
startVite();

// Wait a bit for Vite to start, then start Electron
setTimeout(() => {
  startElectron();
}, 3000); 