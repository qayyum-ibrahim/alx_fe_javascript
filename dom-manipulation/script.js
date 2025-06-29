let quotes = [];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      {
        text: "The only way to do great work is to love what you do.",
        category: "Inspiration",
      },
      {
        text: "Life is what happens when you're busy making other plans.",
        category: "Life",
      },
      { text: "Do or do not. There is no try.", category: "Motivation" },
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  updateCategoryDropdown();
  populateCategories();
}

function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory
    ? quotes.filter(
        (q) => q.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    : quotes;

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" - (${quote.category})`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

function createAddQuoteForm() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

function updateCategoryDropdown() {
  const categories = Array.from(new Set(quotes.map((q) => q.category)));
  categorySelect.innerHTML = '<option value="">All Categories</option>';
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function populateCategories() {
  const categories = Array.from(new Set(quotes.map((q) => q.category)));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selectedFilter = categoryFilter.value;
  localStorage.setItem("lastSelectedFilter", selectedFilter);

  const filtered =
    selectedFilter === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedFilter);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" - (${quote.category})`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

function showLastViewedQuote() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.textContent = `"${quote.text}" - (${quote.category})`;
  } else {
    showRandomQuote();
  }

  const savedFilter = localStorage.getItem("lastSelectedFilter");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchQuotesFromServer() {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const serverQuotes = data.slice(0, 5).map((post) => ({
        text: post.title,
        category: "Server",
      }));

      let added = 0;
      serverQuotes.forEach((serverQuote) => {
        const exists = quotes.some(
          (localQuote) =>
            localQuote.text === serverQuote.text &&
            localQuote.category === serverQuote.category
        );
        if (!exists) {
          quotes.push(serverQuote);
          added++;
        }
      });

      if (added > 0) {
        saveQuotes();
        notification.textContent = `${added} new quotes synced from server.`;
        setTimeout(() => (notification.textContent = ""), 4000);
      }
    })
    .catch(() => {
      notification.textContent = "Failed to sync with server.";
      setTimeout(() => (notification.textContent = ""), 4000);
    });
}

newQuoteBtn.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);

loadQuotes();
showLastViewedQuote();
fetchQuotesFromServer();
setInterval(fetchQuotesFromServer, 15000);
