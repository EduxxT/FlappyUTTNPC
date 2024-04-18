let move_speed = 6, grativy = 0.3;
let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let sound_point = new Audio('/sounds/point.mp3');
let sound_die = new Audio('/sounds/die.mp3');
let userScores = [];
let gameOverModal = document.getElementById("myModal");
let bird_props = bird.getBoundingClientRect();

let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

let game_state = 'Start';
img.style.display = 'none';
message.classList.add('messageStyle');
// Constante para la URL de la API
const API_URL = "https://run4schoolflappy.bsite.net/api";

// Función para manejar la solicitud de la API
function onRequestHandler() {
    if(this.readyState === 4 && this.status === 200) {
        const data = JSON.parse(this.response);
        console.log(data);
    }
}


document.addEventListener('click', function(event) {
    const modal = document.getElementById("myModal");
    if (event.target === modal) {
        // Si el clic ocurre dentro del modal, no hagas nada
        return;
    } else {
        // Si el clic ocurre fuera del modal, reinicia el juego
        resetGame();
    }
});

// Realizar la llamada a la API
const xhr = new XMLHttpRequest();
xhr.open("GET", `${API_URL}/Users`);
xhr.onreadystatechange = onRequestHandler;
xhr.send();

document.addEventListener('click', function() {
    if (game_state !== 'Play') {
        startGame();
    }
});

// Función para iniciar el juego
function startGame() {
    document.querySelectorAll('.pipe_sprite').forEach((e) => {
        e.remove();
    });
    img.style.display = 'block';
    bird.style.top = '34vh';
    game_state = 'Play';
    message.innerHTML = '';
    score_title.innerHTML = 'Score : ';
    score_val.innerHTML = '0';
    message.classList.remove('messageStyle');
    play();
}

function showGameOverModal() {
    const modal = document.getElementById("myModal");
    modal.style.display = "block";
    // Agregar un evento de clic al modal
    modal.addEventListener("click", function(event) {
        // Detener la propagación del evento para que no se propague al documento principal
        event.stopPropagation();
    });

    // Obtener el formulario y el input del nombre de usuario
    const form = document.getElementById("nameForm");
    const usernameInput = document.getElementById("usernameInput");

    // Enviar el nombre de usuario cuando se envíe el formulario
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = usernameInput.value;
        if (username) {
            sendUserDataToAPI(username);
            console.log(username)
            modal.style.display = "none";        }
    });

    // Cerrar el modal al hacer clic en la "x" (cerrar)
    const closeBtn = document.getElementsByClassName("close")[0];
    closeBtn.onclick = function() {
        modal.style.display = "none";
    };
    const viewScoresBtn = document.getElementById("viewScoresBtn");
    viewScoresBtn.addEventListener("click", viewScores);

    const playAgainButton = document.getElementById("playAgainBtnModal");
    playAgainButton.addEventListener("click", resetGame); // Esta línea agrega el event listener al botón "Jugar de nuevo"

    function resetGame() {  
    // Reiniciar todas las variables y elementos del juego aquí
    // Por ejemplo, podrías recargar la página para reiniciar el juego
    location.reload();
}

}

function viewScores() {
    fetch('https://run4schoolflappy.bsite.net/api/Users')
    .then(response => response.json())
    .then(data => {
        // Construye la lista de usuarios y puntajes
        let scoresHTML = '<h2>Users and Scores</h2><ul>';
        data.forEach(user => {
            scoresHTML += `<li>${user.Username}: ${user.Score}</li>`;
        });
        scoresHTML += '</ul>';
        // Muestra los usuarios y puntajes en el contenedor
        const scoresContainer = document.getElementById('scoresContainer');
        scoresContainer.innerHTML = scoresHTML;
        scoresContainer.style.display = "block";

        // Agrega un botón para cerrar la lista de puntajes
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Close Scores";
        closeBtn.addEventListener("click", closeScores);
        scoresContainer.appendChild(closeBtn);
    })
    .catch(error => {
        console.error('Error fetching scores:', error);
        // Maneja el error, por ejemplo, muestra un mensaje al usuario
    });
}
function closeScores() {
    const scoresContainer = document.getElementById('scoresContainer');
    scoresContainer.style.display = "none";
}
function sendUserDataToAPI(username) {
    const score = parseInt(score_val.innerHTML);
    const apiUrl = 'https://run4schoolflappy.bsite.net/api/Users';

    // Realizar una solicitud GET para verificar si el usuario ya existe
    fetch(`${API_URL}/Users?Username=${encodeURIComponent(username)}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error fetching user data');
        }
        return response.json();
    })
    .then(users => {
        const existingUser = users.find(user => user.Username === username);
        if (existingUser) {
            // El usuario ya existe, actualizar su puntuación
            const userId = existingUser.Id_users;
            return updateUserDataToAPI(userId, username, score);
        } else {
            // El usuario no existe, crear un nuevo usuario
            return createNewUserDataToAPI(username, score);
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error updating/creating user data');
        }
        // La actualización o creación fue exitosa
        console.log('User data updated/created successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        // Maneja el error, por ejemplo, muestra un mensaje al usuario
    });
}

function createNewUserDataToAPI(username, score) {
    const apiUrl = 'https://run4schoolflappy.bsite.net/api/Users';

    // Construir el objeto de datos para enviar en la solicitud POST
    const userData = {
        Username: username,
        Score: score
    };

    // Realizar una solicitud POST para crear un nuevo usuario
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
}

function updateUserDataToAPI(userId, username, score) {
    const apiUrl = 'https://run4schoolflappy.bsite.net/api/Users';

    // Construir el objeto de datos para enviar en la solicitud PUT
    const userData = {
        Id_users: userId,
        Username: username,
        Score: score
    };

    // Realizar una solicitud PUT para actualizar la puntuación del usuario existente
    return fetch(`${apiUrl}/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
}

function play(){
    function move() {
        if (game_state !== 'Play') return;
    
        let pipe_sprite = document.querySelectorAll('.pipe_sprite');
        pipe_sprite.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();
    
            if (pipe_sprite_props.right <= 0) {
                element.remove();
            } else {
                if (bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width && bird_props.left + bird_props.width > pipe_sprite_props.left && bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height && bird_props.top + bird_props.height > pipe_sprite_props.top) {
                    game_state = 'End';
                    sound_die.play();
                    showGameOverModal();
              return;
            } else {
                if (pipe_sprite_props.right < bird_props.left && pipe_sprite_props.right + move_speed >= bird_props.left && element.increase_score == '1') {
                    score_val.innerHTML =+ score_val.innerHTML + 1;
                    sound_point.play();
                }
                element.style.left = pipe_sprite_props.left - move_speed + 'px';
            }
        }
    });
    requestAnimationFrame(move);
}
    requestAnimationFrame(move);

    let bird_dy = 0;
    function apply_gravity(){
        if(game_state != 'Play') return;
        bird_dy = bird_dy + grativy;
        document.addEventListener('click', () => {
            // Aplicar un impulso hacia arriba al pájaro cuando se hace clic
            bird_dy = -7.6;
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === ' ') {
            }
        });

        //images/BRINCO-removebg-preview

        //images/LEFTSIDESS-removebg-preview.png

        if(bird_props.top <= 0 || bird_props.bottom >= background.bottom){
            game_state = 'End';
            message.style.left = '28vw';
            window.location.reload();
            message.classList.remove('messageStyle');
            return;
        }
        bird.style.top = bird_props.top + bird_dy + 'px';
        bird_props = bird.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    let pipe_seperation = 0;

    let pipe_gap = 35;

    function create_pipe(){
        if(game_state != 'Play') return;

        if(pipe_seperation > 55){
            pipe_seperation = 0;

            let pipe_posi = Math.floor(Math.random() * 43) + 8;
            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';

            document.body.appendChild(pipe_sprite_inv);
            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.increase_score = '1';

            document.body.appendChild(pipe_sprite);
        }
        pipe_seperation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);
}