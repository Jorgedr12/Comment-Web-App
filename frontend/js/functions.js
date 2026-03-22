const API_URL = 'http://localhost:3000/';

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('btn-login');
    const errorP = document.getElementById('error-message');

    errorP.classList.add('hidden');
    btn.disabled = true;
    btn.innerText = "Procesando";

    try {
        const loginRes = await fetch(API_URL + 'login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const loginData = await loginRes.json();

        if (loginRes.ok) {
            saveSession(loginData);
            return;
        } 
        
        if (loginRes.status === 404) {
            btn.innerText = "Creando cuenta";
            
            const regRes = await fetch(API_URL + 'users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const regData = await regRes.json();

            if (regRes.ok) {
                const retryRes = await fetch(API_URL + 'login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const retryData = await retryRes.json();
                saveSession(retryData);
            } else {
                showError(regData.error || "Error al crear cuenta");
            }
        } else {
            showError(loginData.error || "Error al iniciar sesión");
        }

    } catch (err) {
        showError("No hay conexión con el servidor");
    } finally {
        if (!window.location.href.includes('index.html')) {
            btn.disabled = false;
            btn.innerText = "Entrar";
        }
    }
}

function saveSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userName', data.username);
    window.location.href = 'index.html';
}

function showError(msg) {
    const errorP = document.getElementById('error-message');
    errorP.innerText = msg;
    errorP.classList.remove('hidden');
}