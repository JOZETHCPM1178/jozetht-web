
const apkList = [
    { name: "APK Ejemplo 1", img: "https://via.placeholder.com/300", url: "#" },
    { name: "APK Ejemplo 2", img: "https://via.placeholder.com/300", url: "#" },
    { name: "APK Ejemplo 3", img: "https://via.placeholder.com/300", url: "#" }
];

function renderApks() {
    const container = document.getElementById('apk-list');
    container.innerHTML = "";
    apkList.reverse().forEach(apk => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${apk.img}" alt="${apk.name}">
            <h3>${apk.name}</h3>
            <a href="${apk.url}" class="download-btn" target="_blank">Descargar</a>
        `;
        container.appendChild(card);
    });
}

renderApks();
