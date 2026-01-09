let currentMoney = 100000000;
updateMoney();
var map = L.map('map').setView([47.3769, 8.5417], 13);

        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            //attribution: '© OpenStreetMap-Mitwirkende'
        }).addTo(map);

        
        // L.marker([47.29977627719577, 8.12394213320905]).addTo(map)
        //     .bindPopup("Oberkulm")
        //     .openPopup();

let missiles = [];
fetch("https://localhost:7224/api/Missile")
    .then(response => response.json())
    .then(data =>{
        missiles = data;

        unlockElements(missiles.shortrange, "missile");
        unlockElements(missiles.longrange, "missile");
    })
    .catch(error => console.error(error));

let buildings = [];
fetch("https://localhost:7224/api/Building")
    .then(response => response.json())
    .then(data => {
        buildings = data;

        Object.values(buildings).forEach(category => {
            unlockElements(category, "building");
        })
        
        handleClick("base");
    })
    .catch(error => console.error(error));




var BaseIcon = L.icon({
    iconUrl: 'Images/barracks.png',    
    iconSize: [20, 20],       
    iconAnchor: [10, 10],     
    popupAnchor: [0, -40]     
});

function createIcon(url, x, y){
    var building_icon = L.icon({
        iconUrl: url,
        iconSize: [x, y],
        iconAnchor: [(x/2), (y/2)]
    });
    return building_icon;
}


let silos = [];
let targets = [];
let airdefenses = [];
let selectedMissile;
let selectedBuilding;
let selectedSilo;
const viewer = document.getElementById("modelViewer");
const menu_missile = document.getElementById("menu_missile");
const menu_building = document.getElementById("menu_building");
const menu_silo = document.getElementById("menu_silo");
const type_menu = document.getElementById("type_menu");
const type_attack = document.getElementById("type_attack");
const type_defense = document.getElementById("type_defense");
const type_base = document.getElementById("type_base");
const missileList = document.getElementById("missileList");
const searchField = document.getElementById("searchField");
const siloBox = document.getElementById("selectedSilo");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const gameOver = document.getElementById("gameOver");
const treeBtn = document.getElementById("treeBtn");
const skillTree = document.getElementById("skillTree");
const logoutBtn = document.getElementById("logoutBtn");

let previewRadius;
let rangeCircle;
let selectedElement;
let previewCenter;
let target;
let menuSelected = "building";
let selectedType = "base";
let base;

let unlocked = {
    longrange: 1,
    shortrange: 1
};

function selectVisuals(element, bg){
    element.style.backgroundColor = bg;
    element.style.color = "var(--bg-color)";
}

function deselectVisuals(element, bg){
    element.style.backgroundColor = bg;
    element.style.color = "var(--text-color)";
}

selectVisuals(menu_building, "var(--highlight)");

function unlockElements(list, t){
    if(t === "missile"){
        list.forEach(missile => {
            if(missile.stage <= unlocked[missile.type]){
                missile.unlocked = true;
            }
        });
    }

    if(t === "building"){
        const totalUnlockedStages = unlocked.shortrange + unlocked.longrange;

        list.forEach(building => {
            if(building.stage <= totalUnlockedStages){
                building.unlocked = true;
            }
        });
    }
}


function hideElement(element){
    element.style.visibility = 'hidden';
}

function showElement(element){
    element.style.visibility = 'visible';
}

function createList(list){
    missileList.innerHTML = "";

    list.forEach ((element) => {

        const newLi = document.createElement("li");

        if(!element.unlocked){
            newLi.classList.add("locked");
            newLi.textContent = "🔒 Locked"
        } else {
            newLi.textContent = element.name;

            newLi.addEventListener('click', () =>{

            const name = document.getElementById("name_field");
            const type = document.getElementById("type_field");
            const range = document.getElementById("range_field");
            const damage = document.getElementById("damage_field");
            const radius = document.getElementById("radius_field");

            const rangeLabel = document.getElementById("range_label");
            const damageLabel = document.getElementById("damage_label");
            const radiusLabel = document.getElementById("radius_label");

            name.textContent = element.name;
            type.textContent = element.type;
            
            if(menuSelected === "missile"){
                selectedMissile = element;
                selectedBuilding = null;

                showElement(damage);
                showElement(radius);
                showElement(range);
                showElement(damageLabel);
                showElement(radiusLabel);
                showElement(rangeLabel);
                damage.textContent = element.warhead;
                radius.textContent = element.radius;
                range.textContent = element.range;

                createPreviewCircles();

            } else if(menuSelected === "building"){
                selectedBuilding = element;
                selectedMissile = null;

                hideElement(damage);
                hideElement(radius);
                hideElement(damageLabel);
                hideElement(radiusLabel);

                if(selectedBuilding.range){
                    showElement(rangeLabel);
                    showElement(range);
                    range.textContent = selectedBuilding.range;
                } else {
                    hideElement(rangeLabel);
                    hideElement(range);
                }
                

                deletePreviewCircles();

            } else if(menuSelected === "silo"){
                selectedSilo = element;
                siloBox.textContent = "Silo: " + selectedSilo.name;
                hideElement(range);
                hideElement(damage);
                hideElement(radius);
                hideElement(rangeLabel);
                hideElement(damageLabel);
                hideElement(radiusLabel);
            }

            if(element.src) viewer.src = element.src;

        });
        }

        missileList.appendChild(newLi);
    });  
}

function createPreviewCircles(){
    if(previewRadius){
        map.removeLayer(previewRadius);                    
        previewRadius = null;
    }
    previewRadius = L.circle([0, 0], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3,
        radius: selectedMissile.radius,
        weight: 1
    }).addTo(map);

    if(previewCenter){
        map.removeLayer(previewCenter);
        previewCenter = null;
    }
    previewCenter = L.circleMarker([0, 0],{
        color: 'red',
        fillColor: '#f03',
        radius: 2,
    }).addTo(map);

    if(rangeCircle){
        map.removeLayer(rangeCircle);
        
        rangeCircle = null;
    }

    if(selectedMissile && selectedSilo){
        rangeCircle = L.circle(selectedSilo.marker.getLatLng(), {
            color: 'green',
            fillColor: '#0fa11b',
            fillOpacity: 0.3,
            radius: selectedMissile.range
        }).addTo(map);
        
    }
    else {
        alert("Bitte zuerst ein Silo auswählen!");
    }
}

function deletePreviewCircles(){
    if(previewRadius){
        map.removeLayer(previewRadius);
        previewRadius = null;
    }
    if(previewCenter){
        map.removeLayer(previewCenter);
        previewCenter = null;
    }
    if(rangeCircle){
        map.removeLayer(rangeCircle);
        rangeCircle = null;
    }
}

function createCircles(position){
    if(previewRadius){
        radius = L.circle(position, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.3,
            radius: selectedMissile.radius,
            weight: 1
        }).addTo(map);
        target = {
            radius: radius,
            center: null,
            missile: selectedMissile
        }
        targets.push(target);
    }

    if(previewCenter){
        center = L.circle(position,{
            color: 'red',
            fillColor: '#f03',
            radius: 4,
            weight: 1
        }).addTo(map);

        target.center = center;
    }
    map.removeLayer(previewCenter);
    previewCenter = null;
    map.removeLayer(previewRadius);
    previewRadius = null;
}
// Wenn du auf die Karte klickst, füge einen Marker hinzu
map.on('click', function(e) {
    if(base != null){
        
        if(selectedMissile){
            let distance = map.distance(selectedSilo.marker.getLatLng(), e.latlng);

            if(distance <= selectedMissile.range){
                createCircles(e.latlng);
            }
        }
    }

    if(selectedBuilding){
        let icon = createIcon(selectedBuilding.icon, selectedBuilding.iconX, selectedBuilding.iconY);

        if(selectedBuilding.name === "Mainbase"){
            if(base) map.removeLayer(base);
            base = L.marker(e.latlng, {icon: icon}).addTo(map);

        } else if(selectedBuilding.name === "Factory"){
            let icon = createIcon(selectedBuilding.icon, selectedBuilding.iconX, selectedBuilding.iconY);
            let factory = L.marker(e.latlng, {icon: icon}).addTo(map);
            

        } else if(selectedBuilding.name === "Missilesilo"){
            
            createSilo(e.latlng);

        } else if(selectedBuilding.name === "Shortrange Silo"){
            
            createSilo(e.latlng);
        
        } else if(selectedBuilding.name === "Missiledefense"){

            createDefense("blue", e.latlng);

        } else if(selectedBuilding.name === "Airdefense"){    

           createDefense("yellow", e.latlng);

        }
        
    }
});

function createDefense(color, latlng) {
    let icon = createIcon(selectedBuilding.icon, selectedBuilding.iconX, selectedBuilding.iconY);

    let marker = L.marker(latlng, {icon: icon}).addTo(map)
        .bindPopup(selectedBuilding.name + " " + (airdefenses.length + 1));

    let object = {
        ...selectedBuilding,
        marker: marker,
    }

    let range = L.circle(latlng, {
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        radius: object.range
    }).addTo(map);

    object.name = selectedBuilding.name + " " + (airdefenses.length + 1);
    object.rangeCircle = range;
    airdefenses.push(object);
}

function createSilo(latlng) {
    let icon = createIcon(selectedBuilding.icon, selectedBuilding.iconX, selectedBuilding.iconY);
    let marker = L.marker(latlng, {icon: icon}).addTo(map)
        .bindPopup(selectedBuilding.name + " " + (silos.length + 1));

    let silo = {
        ...selectedBuilding,
        marker: marker,
    }
    silo.name = selectedBuilding.name + " " + (silos.length + 1),
    silos.push(silo);
}


map.on('mousemove', (e) => {
    if(previewRadius){
        previewRadius.setStyle({opacity: 1, fillOpacity: 0.3});
        previewRadius.setLatLng(e.latlng);
    }
    if(previewCenter){
        previewCenter.setStyle({opacity: 1, fillOpacity: 0.3});
        previewCenter.setLatLng(e.latlng);
    }
});

map.on('mouseout', () => {
    if(previewRadius){
        hideMarker(previewRadius);
    }
    if(previewCenter){
        hideMarker(previewCenter);
    }
});

function hideMarker(element){
    element.setStyle({opacity: 0, fillOpacity: 0});
}

//lineare interpolation
function lerp(a, b, t){ return a + (b - a) * t; }
function launchMissile(start, target, durationSec = 3){
    const startLatLng = start.marker.getLatLng();
    const targetLatLng = target.center.getLatLng();

    let missileIcon = L.icon({iconUrl: 'Images/missile.png', iconSize:[20,20], iconAnchor:[10,10]});
    const missile = L.marker(startLatLng, { icon: missileIcon }).addTo(map);

    const startTime = performance.now();
    const durationMs = durationSec * 1000;

    let missileDestroyed = false;

    function step(now){
        const elapsed = now - startTime;

        //gibt einen Wert zwischen 0 und 1 zurück: 1 = am Ziel.
        const t = Math.min(1, elapsed / durationMs);

        const lat = lerp(startLatLng.lat, targetLatLng.lat, t);
        const lng = lerp(startLatLng.lng, targetLatLng.lng, t);
        missile.setLatLng([lat, lng]);

        for (let a of airdefenses)
        {
            let distanceToA = map.distance(a.marker.getLatLng(), missile.getLatLng());

            if(distanceToA < a.range){
                if(Math.random() < a.hitOdds) {
                    missile.remove();
                    missileDestroyed = true;
                    return;
                }
            }
        }

        if(t < 1){
            requestAnimationFrame(step);
            
        } else {
            missile.remove();
            if(!missileDestroyed){
                target.radius.setStyle({ fillColor: 'black', color: 'black'});
                target.center.setStyle({fillcolor: 'black', color: 'black'});
                
                targets = targets.filter(t => t !== target);


                let distanceToBase = map.distance(base.getLatLng(), target.center.getLatLng());
                
                if(distanceToBase <= target.missile.radius){
                    gameOver.style.display = "flex";
                    gameOverOverlay.style.display = "flex";
                }

                airdefenses = airdefenses.filter(a => {
                    let distanceToA = map.distance(a.marker.getLatLng(), target.center.getLatLng());
                    
                    if(distanceToA <= target.missile.radius){
                        map.removeLayer(a.marker);
                        map.removeLayer(a.rangeCircle);
                        return false;
                    }
                    return true;
                });

                silos = silos.filter(s => {
                    let distanceToS = map.distance(s.marker.getLatLng(), target.center.getLatLng());

                    if(distanceToS <= target.missile.radius){
                        map.removeLayer(s.marker);
                        selectedSilo = null;
                        return false;
                    }
                    return true;
                })

                getBuildings(target.center.getLatLng(), target.missile.radius)
                    .then(hitCount => {
                        alert("Zerstörte Gebäude: " + hitCount);

                        let money = hitCount * target.missile.warhead / 1000;
                        Math.round(money);
                        generateIncome(money);

                        
                    });
            
            }
        }
    }
    requestAnimationFrame(step);
    
}

const launchBtn = document.getElementById("launchBtn");
launchBtn.addEventListener('click', () =>{
    
    if (!target) {
        alert("Bitte zuerst ein Ziel auswählen!");
        return;
    }
    if(target){
        targets.forEach((t) => {
            launchMissile(selectedSilo, t, 3);
        })
    }
});


menu_missile.addEventListener('click', () => {

    menuSelected = "missile";
    type_menu.style.display = 'none';

    if(selectedSilo){
        if(selectedSilo.type === "shortrange"){
            const shortrangeMissiles = missiles.shortrange;
            createList(shortrangeMissiles);
        } else {
            const icbms = missiles.longrange;
            createList(icbms);
        }
        
    }
   
    selectVisuals(menu_missile, "var(--highlight)");
    deselectVisuals(menu_building, "var(--accent-green)");
    deselectVisuals(menu_silo, "var(--accent-green)");
})

menu_building.addEventListener('click', () => {
    menuSelected = "building";
    type_menu.style.display = 'flex';
    handleClick("base");
    deselectVisuals(menu_missile, "var(--accent-green)");
    selectVisuals(menu_building, "var(--highlight)");
    deselectVisuals(menu_silo, "var(--accent-green)");
})

menu_silo.addEventListener('click', () => {
    createList(silos);
    menuSelected = "silo";
    type_menu.style.display = 'none';
    deselectVisuals(menu_missile, "var(--accent-green)");
    deselectVisuals(menu_building, "var(--accent-green)");
    selectVisuals(menu_silo, "var(--highlight)");
})

gameOver.addEventListener('click', () =>{
    location.reload();
})

searchField.addEventListener('input', () =>{
    const input = searchField.value.toLowerCase();
    const newList = [];

    if(menuSelected === "missile"){
        missiles.forEach((element) => {
            let name = element.name.toLowerCase();
            if(name.includes(input)){
                newList.push(element);
            }
        })
        createList(newList);
    }else if(menuSelected === "building"){
        [...buildings.base, ...buildings.attack, ...buildings.defense].forEach((element) =>{
            let name = element.name.toLowerCase();
            if(name.includes(input)){
                newList.push(element);
            }
        })
        createList(newList);
    }
})

document.querySelectorAll(".type").forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;

        handleClick(type);
    });
});

function handleClick(type){

    menuSelected = "building";
    const b = buildings[type];
    createList(b);

    deselectVisuals(type_base, "var(--bg-color)");
    deselectVisuals(type_attack, "var(--bg-color)");
    deselectVisuals(type_defense, "var(--bg-color)");

    if (type === "base") {
        selectVisuals(type_base, "var(--highlight)");
    } 
    else if (type === "attack") {
        selectVisuals(type_attack, "var(--highlight)");
    } 
    else if (type === "defense") {
        selectVisuals(type_defense, "var(--highlight)");
    }
}




function getBuildings(latlng, radius) {
    const overpassUrl = "https://overpass-api.de/api/interpreter";
    const query = `
        [out:json][timeout:5];
        (
            way["building"](around:${radius},${latlng.lat},${latlng.lng});
            relation["building"](around:${radius},${latlng.lat},${latlng.lng});
        );
        out count;
        `;

        return fetch(overpassUrl, {
            method: "POST",
            body: query
        })
        .then(res => res.json())
        .then(data => {
           const count = data.elements[0]?.tags?.total || 0;
           return count;
        });
}


function generateIncome(income) {
    currentMoney += income;
    currentMoney = Math.round(currentMoney);
    
    updateMoney();
}

function updateMoney(){
    const money = document.getElementById("money");
    money.textContent = `Money: ${currentMoney}`;
}

treeBtn.addEventListener("click", () => {
    skillTree.style.display = "block";
    buildTrees();
})


logoutBtn.addEventListener("click", () => {

    fetch("https://localhost:7224/api/Save", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringigy({
            name: "Joshua",
            money: 150
        })
    })
    




    location.href = "login.html";
})







































//<a href="https://www.flaticon.com/free-icons/missile" title="missile icons">Missile icons created by Nhor Phai - Flaticon</a>