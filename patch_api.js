const fs = require('fs');
const file = './Front/src/services/api.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/async (getMe|getRoles|getDestinos|getProductos|getRepartidores|getProveedores|getPedidos)\(\) {/g, (match, fn) => {
    return `async ${fn}() {\n    const token = localStorage.getItem('Token');\n    const headers = token ? { 'Authorization': \`Bearer \${token}\` } : {};`;
});

content = content.replace(/fetch\(\`\$\{API_BASE_URL\}\/([^\`]+)\`\)/g, "fetch(\`\$\{API_BASE_URL\}/$1\`, { headers })");

content = content.replace(/async (registrarUsuario|crearPedido)\(([^)]+)\) {/g, (match, fn, args) => {
    return `async ${fn}(${args}) {\n    const token = localStorage.getItem('Token');\n    const headers = { 'Content-Type': 'application/json' };\n    if (token) headers['Authorization'] = \`Bearer \${token}\`;`;
});

content = content.replace(/headers: \{ 'Content-Type': 'application\/json' \}/g, "headers");

fs.writeFileSync(file, content);
console.log('Patched API.js');
