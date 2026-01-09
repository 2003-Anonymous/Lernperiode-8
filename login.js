const usernameField = document.getElementById("name");
const passwordField = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");

let users = [];
fetch("https://localhost:7224/api/User")
    .then(response => {
        if(!response.ok){
            throw new Error("API error");
        }
        return response.json();
    })
    .then(data => {
        users = data;
    })
    .catch(error => console.error(error));

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const userInput = usernameField.value.trim();
  const passwordInput = passwordField.value.trim();

  const user = users.find(
    u =>
      u.username === userInput &&
      u.password === passwordInput
  );

  if (user) {
    alert("Login erfolgreich!");
    location.href = "game.html";
  } else {
    alert("Login fehlgeschlagen!");
  }
});
