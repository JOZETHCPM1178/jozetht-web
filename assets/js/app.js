const apkList = [
    { name: "Car Parking MOD", img: "https://github.com/JOZETHCPM1178/jozetht-web/raw/main/assets/carparking.png", url: "https://www.mediafire.com/file/et46cxcu69ehaok/cpm48213modt-Appsfab.net.apk/file" },
    { name: "Resident Evil 4 Wii", img: "https://github.com/JOZETHCPM1178/jozetht-web/raw/main/assets/resident.png", url: "https://www.mediafire.com/file/yimnvpsek5d1nl2/Resident_Evil_4_-_Wii_Edition_%2528USA%2529.nkit.7z/file" },
    { name: "Drift Max Pro", img: "https://github.com/JOZETHCPM1178/jozetht-web/raw/main/assets/icon.png", url: "https://www.mediafire.com/file/89t5unkkc89ql0a/drift-max-pro-mod_2.5.89-an1.com.apk/file" },
    { name: "RESIDENT EVIL CHEATS", img: "https://github.com/JOZETHCPM1178/jozetht-web/raw/main/assets/icon.png", url: "https://www.mediafire.com/file/sef6qxi7mhaezeh/CHEATS_RESIDENT_EVIL_4.7z/file" },
    { name: "", img: "", url: "" }
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
