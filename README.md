#  Video Game Search Engine

##  Project Idea
A JavaScript-based web application that allows users to search for classic and modern video games. The app provides a clean grid UI with game images and ratings.

Users can filter games based on platform (PC, PlayStation, etc.), save games to a wishlist (stored in browser local storage), and compare two games side-by-side.

The search bar uses debounce logic to improve performance and reduce unnecessary API calls.

## API Usage
This project uses the RAWG Video Games Database API.

API Docs: https://rawg.io/apidocs

The API is used to:
- Fetch games based on user search
- Get details like ratings, platforms, and images
- Filter games by platform
- Compare data of two selected games

All API calls are handled using JavaScript (Fetch API / async-await).
