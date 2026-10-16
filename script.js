const url = "https://berita-indo-api-next.vercel.app/api/cnn-news";
const newsContainer = document.getElementById("berita");
const preloader = document.getElementById("preloader");
const searchInput = document.getElementById("news-search");
const newsCount = document.getElementById("news-count");
let stories = [];

function showMessage(title, description) {
    const message = document.createElement("div");
    message.className = "page-message";

    const heading = document.createElement("h2");
    heading.textContent = title;
    const copy = document.createElement("p");
    copy.textContent = description;

    message.append(heading, copy);
    newsContainer.replaceChildren(message);
    newsContainer.setAttribute("aria-busy", "false");
}

function createStoryCard(story) {
    const article = document.createElement("article");
    article.className = "news-card";

    const imageUrl = story.image?.small;
    if (imageUrl) {
        const image = document.createElement("img");
        image.className = "card-image";
        image.src = imageUrl;
        image.alt = "";
        image.loading = "lazy";
        image.addEventListener("error", () => {
            image.remove();
            article.classList.add("news-card--text-only");
        }, { once: true });
        article.append(image);
    } else {
        article.classList.add("news-card--text-only");
    }

    const copy = document.createElement("div");
    copy.className = "card-copy";

    const category = document.createElement("p");
    category.className = "card-category";
    category.textContent = "CNN Indonesia";

    const title = document.createElement("h2");
    title.textContent = story.title || "Untitled story";

    copy.append(category, title);

    if (story.link) {
        const link = document.createElement("a");
        link.className = "card-link";
        link.href = story.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.append(document.createTextNode("Read the story"));

        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        link.append(arrow);
        copy.append(link);
    }

    article.append(copy);
    return article;
}

function renderStories(query = "") {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filteredStories = stories.filter((story) =>
        (story.title || "").toLocaleLowerCase().includes(normalizedQuery)
    );

    newsCount.classList.remove("is-hidden");
    newsCount.textContent = normalizedQuery
        ? `${filteredStories.length} ${filteredStories.length === 1 ? "story" : "stories"} found`
        : `${filteredStories.length} latest ${filteredStories.length === 1 ? "story" : "stories"}`;

    if (filteredStories.length === 0) {
        showMessage(
            normalizedQuery ? "No stories found" : "No stories available",
            normalizedQuery ? "Try another search term." : "Please check back in a little while."
        );
        return;
    }

    newsContainer.replaceChildren(...filteredStories.map(createStoryCard));
    newsContainer.setAttribute("aria-busy", "false");
}

searchInput.addEventListener("input", (event) => {
    renderStories(event.currentTarget.value);
});

async function loadStories() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`News service returned ${response.status}`);
        }

        const result = await response.json();
        if (!Array.isArray(result.data)) {
            throw new Error("News service returned an unexpected response");
        }

        stories = result.data;
        renderStories(searchInput.value);
    } catch (error) {
        console.error("Unable to load the latest news:", error);
        showMessage("We couldn't load the headlines", "Please refresh the page and try again.");
    } finally {
        preloader.classList.add("is-hidden");
    }
}

loadStories();
