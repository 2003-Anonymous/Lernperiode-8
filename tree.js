
const backBtn = document.getElementById("backBtn");

const trees = {
    longrange: {
        name: "Longrange",
        levels: 14
    },
    shortrange: {
        name: "Shortrange",
        levels: 4
    }
};


function buildTrees() {
    for (const tree in trees) {
        const treePa = document.getElementById(tree);
        treePa.innerHTML = "";

        for (let i = 1; i <= trees[tree].levels; i++) {
            const box = document.createElement("div");
            box.className = "box";

            const price = Math.pow(i * (1 + i), 3);

            if (i > unlocked[tree]) {
                box.classList.add("locked");
                box.innerHTML = `
                    <strong>Level ${i}</strong>
                    <div class="lock-overlay">🔒 ${price}$</div>
                `;

                 box.addEventListener("click", () => {
                    unlockLevel(tree, i, price);
                 });
                
            } else {
                box.innerHTML = `
                    <strong>Level ${i}</strong>
                    <div>Unlocked</div>
                `;
            }
           
            
            treePa.appendChild(box);
        }
    }
}

function unlockLevel(tree, level, price){
    if  (currentMoney >= price){
        if (unlocked[tree] + 1 === level){
            unlocked[tree] = level;
            currentMoney -= price;
            updateMoney();

            missiles[tree].forEach(missile =>{
                if(missile.stage === level){
                    missile.unlocked = true;
                }
            })

            Object.values(buildings).forEach(category => {
                category.forEach(building => {
                    if(building.stage === level){
                        building.unlocked = true;
                    }
                });
            });

            handleClick(selectedType);

            buildTrees();
        }
    } else {
        alert("Nicht genug Geld!");
    }

   
}



function showTree(name) {
    document.querySelectorAll(".tree").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

    document.getElementById(name).classList.add("active");
    event.target.classList.add("active");
}

backBtn.addEventListener("click", () => {
    skillTree.style.display = "none";
})

buildTrees();
