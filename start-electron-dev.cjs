const { spawn } = require('child_process');
const { readFileSync } = require('fs');

let viteProcess;
let electronProcess;

function startVite() {
  console.log('🚀 Starting Vite dev server...');
  
  viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });

  viteProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // Look for the local URL in Vite output
    const localMatch = output.match(/Local:\s+(http:\/\/localhost:\d+)/);
    if (localMatch) {
      const viteUrl = localMatch[1];
      console.log(`✅ Vite ready at ${viteUrl}`);
      
      // Wait a moment then start Electron
      setTimeout(() => {
        startElectron(viteUrl);
      }, 1000);
    }
  });

  viteProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  viteProcess.on('close', (code) => {
    console.log(`Vite process exited with code ${code}`);
  });
}

function startElectron(viteUrl) {
  console.log(`🖥️  Starting Electron with ${viteUrl}...`);
  
  electronProcess = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      VITE_DEV_URL: viteUrl
    }
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    cleanup();
    process.exit(code);
  });
}

function cleanup() {
  console.log('🧹 Cleaning up processes...');
  if (viteProcess) {
    viteProcess.kill('SIGTERM');
  }
  if (electronProcess) {
    electronProcess.kill('SIGTERM');
  }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Start the development servers
startVite(); 