const API_URL = 'https://comment-web-app.onrender.com/comments';
const requestConfig = {
    headers: {
        'Content-Type': 'application/json'
    }
};

async function loadComments() {
    const loader = document.getElementById('loading');
    const listaUnica = document.getElementById('lista-comentarios');

    if (!loader || !listaUnica) {
        return;
    }

    loader.classList.remove('hidden');
    listaUnica.innerHTML = ""; 

    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();

        loader.classList.add('hidden');
        renderComments(datos);

    } catch (error) {
        console.error("Error al cargar comentarios: ", error);
        loader.classList.add('hidden');
        listaUnica.innerHTML = "<p class='text-red-400'>Error al conectar con el servidor.</p>";
    }
}

async function createNewComment() {
    const inputUser = document.getElementById('userInput');
    const inputComment = document.getElementById('commentInput');
    
    const usuario = inputUser.value.trim();
    const comentario = inputComment.value.trim();

    if (usuario === "" || comentario === ""){
        return;   
    }

    if (usuario.length < 3) {
        alert("El nombre de usuario debe tener al menos 3 caracteres");
        return;
    }

    if (comentario.length < 5) {
        alert("El mensaje debe tener al menos 5 caracteres");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: requestConfig.headers,
            body: JSON.stringify({ 
                username: usuario,
                message: comentario 
            })
        });

        if (response.ok) {
            inputComment.value = ""; 
            await loadComments();
        } else {
            const errorData = await response.json();
            alert("Error: " + (errorData.error || "No se pudo publicar"));
        }
    } catch (e) {
        console.error("Error al publicar:", e);
    }
}

async function deleteComment(id) {
    if (confirm("¿Eliminar este comentario permanentemente?")) {
        try {
            await fetch(`${API_URL}/${id}`, { 
                method: 'DELETE'
            });
            await loadComments();
        } catch (e) {
            console.error("Error al eliminar", e);
        }
    }
}

function formatRelativeTime(dateString) {
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);

    var minute = 60
    var hour = minute * 60
    var day = hour * 24

    if (diff < minute) return "Hace un momento";
    if (diff < hour) return `Hace ${Math.floor(diff / minute)} min`;
    if (diff < day) return `Hace ${Math.floor(diff / hour)} h`;

    return new Date(dateString).toLocaleDateString();
}

function renderComments(comentarios) {
    const lista = document.getElementById('lista-comentarios');
    if (!lista) {
        return;
    }
    
    if (comentarios.length === 0) {
        lista.innerHTML = "<p class='text-gray-500 text-center py-10'>No hay comentarios aún</p>";
        return;
    }

    comentarios.forEach(c => {
        const item = document.createElement('article');
        item.className = "bg-[#1c1c1c] border border-white/5 p-5 rounded-xl group hover:border-[#ff6400]/10 transition-all duration-300 shadow-lg flex flex-col gap-2 relative";
        
        const nombreAutor = c.username || "Anónimo";
        const textoComentario = c.message || "";
        const tiempoRelativo = formatRelativeTime(c.date);

        item.innerHTML = `
            <div class="flex justify-between items-start w-full">
                <div class="flex flex-col gap-1">
                    <span class="text-[#b7cad4] text-xs font-bold tracking-widest px-2 py-1 rounded w-fit">
                        ${nombreAutor}
                    </span>
                    <span class="text-[10px] text-gray-500 font-medium ml-1">
                        ${tiempoRelativo}
                    </span>
                </div>
                <button onclick="deleteComment('${c.id}')" 
                    class="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <p class="text-gray-200 text-sm leading-relaxed break-words mt-1">
                ${textoComentario}
            </p>
        `;

        lista.appendChild(item);
    });
}

document.addEventListener('DOMContentLoaded', loadComments);

/*
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
*/