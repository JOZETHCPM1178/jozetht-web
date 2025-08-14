
// Lista simulada de APKs con URL de imagen y descarga
const apks = [
    { name: "App Nueva", img: "https://via.placeholder.com/200", url: "https://example.com/apk1" },
    { name: "App Anterior", img: "https://via.placeholder.com/200", url: "https://example.com/apk2" }
];

// Mostrar más recientes primero
const apkList = document.getElementById("apk-list");
apks.forEach(apk => {
    const card = document.createElement("div");
    card.classList.add("apk-card");
    card.innerHTML = `
        <img src="${apk.img}" alt="${apk.name}">
        <h3>${apk.name}</h3>
        <a class="download-btn" href="${apk.url}" target="_blank">Descargar</a>
    `;
    apkList.appendChild(card);
});
