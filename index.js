const API_KEY = "61a531e7460f47ba8b14c8497ba944df";

fetch(`https://api.rawg.io/api/games?key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    const game = data.results[0]; // 👈 only one game

    const container = document.getElementById("game");

    container.innerHTML = `
      <h2>${game.name}</h2>
      <img src="${game.background_image}" width="300" />
      <p>Released: ${game.released}</p>
      <p>Rating: ${game.rating}</p>
    `;
  })
  .catch(err => console.error(err));