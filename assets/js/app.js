const apkList = [
    { name: "Car Parking MOD", img: "https://via.placeholder.com/300", url: "https://www.mediafire.com/file/et46cxcu69ehaok/cpm48213modt-Appsfab.net.apk/file" },
    { name: "APK Ejemplo 2", img: "https://via.placeholder.com/300", url: "https://example.com/apk2" },
    { name: "APK Ejemplo 3", img: "https://via.placeholder.com/300", url: "https://example.com/apk3" }
];

function renderApks() {
    const container = document.getElementById('apk-list');
    container.innerHTML = "";
    
    apkList.forEach(apk => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h3>${apk.name}</h3>
            <img src="${apk.img}" alt="${apk.name}">
            <a href="${apk.url}" class="download-btn" target="_blank">Descargar</a>
        `;
        container.appendChild(card);
    });
}

renderApks();
