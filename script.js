// Modal de login (only on non-admin pages)
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Login</h2>
            <input type="text" placeholder="Usuário" id="username">
            <input type="password" placeholder="Senha" id="password">
            <button>Entrar</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close');
    const enterBtn = modal.querySelector('button');

    loginBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Implementação de autenticação simples
    enterBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username === 'Admin' && password === 'Prf190') {
            window.location.href = 'admin.html';
        } else {
            alert('Credenciais inválidas!');
        }
        modal.style.display = 'none';
    });
}

// Logout functionality for admin page
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Course management for admin page
let courses = JSON.parse(localStorage.getItem('courses')) || [];

function generateMessage() {
    let message = '**# 📅 Cronograma de Cursos – PRF.**\n\n';
    const days = [
        { name: 'Segunda-feira', key: 'segunda' },
        { name: 'Terça-feira', key: 'terca' },
        { name: 'Quarta-feira', key: 'quarta' },
        { name: 'Quinta-feira', key: 'quinta' },
        { name: 'Sexta-feira', key: 'sexta' },
        { name: 'Sábado', key: 'sabado' },
        { name: 'Domingo', key: 'domingo' }
    ];

    const defaultTimes = {
        'segunda': 'Hr',
        'terca': 'Hr',
        'quarta': '19:00Hr',
        'quinta': 'Hr',
        'sexta': 'Hr',
        'sabado': 'Hr',
        'domingo': 'Hr'
    };

    days.forEach(day => {
        const dayCourses = courses.filter(course => course.day === day.key);
        const hasCourses = dayCourses.length > 0;
        const status = hasCourses ? '✅' : '❌';
        const time = hasCourses ? dayCourses[0].time : defaultTimes[day.key];
        const tolerance = hasCourses ? dayCourses[0].tolerance : 'minutos';
        const coursesList = hasCourses ? dayCourses.map(c => c.courses).join(', ') : '';
        const instructor = hasCourses ? dayCourses[0].instructor : '';

        message += `**## ${day.name} - ⏰ ${time} (tolerância de: ${tolerance})**\n`;
        message += `${status} Cursos: ${coursesList}\n\n`;
        message += `👨‍🏫 Instrutor: ${instructor}\n\n`;
    });

    return message;
}

function renderCourses() {
    const tbody = document.querySelector('#courses-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        const dayNames = {
            'segunda': 'Segunda-feira',
            'terca': 'Terça-feira',
            'quarta': 'Quarta-feira',
            'quinta': 'Quinta-feira',
            'sexta': 'Sexta-feira',
            'sabado': 'Sábado',
            'domingo': 'Domingo'
        };

        courses.forEach((course, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dayNames[course.day] || course.day}</td>
                <td>${course.courses}</td>
                <td>${course.instructor}</td>
                <td>${course.time}</td>
                <td><button class="delete-btn" data-index="${index}">Excluir</button></td>
            `;
            tbody.appendChild(row);
        });
    }
}

function updateScheduleDisplay() {
    const scheduleDisplay = document.getElementById('schedule-display');
    if (scheduleDisplay) {
        scheduleDisplay.innerHTML = `<pre>${generateMessage()}</pre>`;
    }

    const discordMessage = document.getElementById('discord-message');
    if (discordMessage) {
        discordMessage.innerText = generateMessage();
    }
}

// Handle save all days button
const saveAllBtn = document.getElementById('save-all-btn');
if (saveAllBtn) {
    saveAllBtn.addEventListener('click', () => {
        const daySections = document.querySelectorAll('.day-section');
        const newCourses = [];

        daySections.forEach(section => {
            const day = section.getAttribute('data-day');
            const time = section.querySelector(`#time-${day}`).value;
            const tolerance = section.querySelector(`#tolerance-${day}`).value;
            const coursesText = section.querySelector(`#courses-${day}`).value;
            const instructor = section.querySelector(`#instructor-${day}`).value;

            // Only add if there's actual content
            if (coursesText.trim() || time.trim() || instructor.trim()) {
                newCourses.push({ day, time, tolerance, courses: coursesText, instructor });
            }
        });

        // Replace all courses with the new ones
        courses = newCourses;
        localStorage.setItem('courses', JSON.stringify(courses));
        renderCourses();
        updateScheduleDisplay();

        alert('Todos os dias foram salvos com sucesso!');
    });
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const index = e.target.getAttribute('data-index');
        courses.splice(index, 1);
        localStorage.setItem('courses', JSON.stringify(courses));
        renderCourses();
        updateScheduleDisplay();
    }
});

// Also handle delete for schedule display
const scheduleDisplay = document.getElementById('schedule-display');
if (scheduleDisplay) {
    scheduleDisplay.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const dayKey = e.target.getAttribute('data-day');
            courses = courses.filter(course => course.day !== dayKey);
            localStorage.setItem('courses', JSON.stringify(courses));
            renderCourses();
        }
    });
}

renderCourses();
updateScheduleDisplay();

const copyBtn = document.getElementById('copy-btn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const discordMessage = document.getElementById('discord-message');
        if (!discordMessage || !discordMessage.innerText.trim()) {
            alert('Nenhum cronograma para copiar!');
            return;
        }

        navigator.clipboard.writeText(discordMessage.innerText).then(() => {
            alert('Cronograma copiado para o Discord!');
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
            alert('Erro ao copiar a mensagem.');
        });
    });
}

// Subdivision modal functionality
const subdivisionModal = document.getElementById('subdivision-modal');
if (subdivisionModal) {
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');
    const modalRequirements = document.getElementById('modal-requirements');
    const closeBtn = subdivisionModal.querySelector('.close');

    // Handle card clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.card')) {
            const card = e.target.closest('.card');
            const title = card.getAttribute('data-title');
            const description = card.getAttribute('data-description');
            const requirements = card.getAttribute('data-requirements');
            const image = card.getAttribute('data-image');

            modalTitle.textContent = title;
            modalDescription.textContent = description;
            modalRequirements.innerHTML = requirements;

            if (image) {
                modalImage.src = image;
                modalImage.alt = title;
                modalImage.style.display = 'block';
            } else {
                modalImage.style.display = 'none';
            }

            subdivisionModal.style.display = 'flex';
        }
    });

    // Handle req-btn click to open requirements modal
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('gtm-btn')) {
            const gtmRequirementsModal = document.getElementById('gtm-requirements-modal');
            gtmRequirementsModal.style.display = 'flex';
            // Close subdivision modal
            subdivisionModal.style.display = 'none';
        }
        if (e.target.classList.contains('noe-btn')) {
            const noeRequirementsModal = document.getElementById('noe-requirements-modal');
            noeRequirementsModal.style.display = 'flex';
            // Close subdivision modal
            subdivisionModal.style.display = 'none';
        }
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        subdivisionModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === subdivisionModal) {
            subdivisionModal.style.display = 'none';
        }
    });
}

// Requirements modal functionality
const requirementsModal = document.getElementById('requirements-modal');
if (requirementsModal) {
    const closeBtn = requirementsModal.querySelector('.close');

    // Close modal
    closeBtn.addEventListener('click', () => {
        requirementsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === requirementsModal) {
            requirementsModal.style.display = 'none';
        }
    });
}

// GTM Requirements modal functionality
const gtmRequirementsModal = document.getElementById('gtm-requirements-modal');
if (gtmRequirementsModal) {
    const closeBtn = gtmRequirementsModal.querySelector('.close');

    // Close modal
    closeBtn.addEventListener('click', () => {
        gtmRequirementsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === gtmRequirementsModal) {
            gtmRequirementsModal.style.display = 'none';
        }
    });
}

// NOE Requirements modal functionality
const noeRequirementsModal = document.getElementById('noe-requirements-modal');
if (noeRequirementsModal) {
    const closeBtn = noeRequirementsModal.querySelector('.close');

    // Close modal
    closeBtn.addEventListener('click', () => {
        noeRequirementsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === noeRequirementsModal) {
            noeRequirementsModal.style.display = 'none';
        }
    });
}

// Particles.js initialization
particlesJS('particles-js', {
    "particles": {
        "number": {
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            },
            "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 6,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});
