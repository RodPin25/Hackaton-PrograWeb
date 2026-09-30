const fs = require('fs');
const file = './Front/src/services/api.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const headers = \{/g, "const headers = {\n    'ngrok-skip-browser-warning': 'true',");
content = content.replace(/const headers = \{\};/g, "const headers = { 'ngrok-skip-browser-warning': 'true' };");

// For login which doesn't use getAuthHeaders:
content = content.replace(/headers: \{ 'Content-Type': 'application\/json' \}/g, "headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }");

fs.writeFileSync(file, content);
