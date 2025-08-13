
fetch('apps.json')
    .then(response => response.json())
    .then(data => {
        const appsList = document.getElementById('apps-list');
        data.forEach(app => {
            const card = document.createElement('div');
            card.classList.add('app-card');
            card.innerHTML = `
                <img src="${app.image}" alt="${app.name}">
                <h3>${app.name}</h3>
                <a href="${app.link}" target="_blank">Descargar</a>
            `;
            appsList.appendChild(card);
        });
    })
    .catch(error => console.error('Error al cargar apps:', error));
