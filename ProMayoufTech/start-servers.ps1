# Kill any existing Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Set environment variables
$env:PORT = "5000"
$env:NODE_ENV = "development"

# Start backend server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Wait a bit for backend to initialize
Start-Sleep -Seconds 5

# Start frontend server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" 