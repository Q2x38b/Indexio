const newsAPIKey = 'ff6a37b927b04ea081c2479fe324989e';
const stackExchangeAPIUrl = 'https://api.stackexchange.com/2.3/search?order=desc&sort=activity&site=stackoverflow';
const resultsCounter = document.getElementById('resultsCount');
let currentEngine = 'google';

function showSuggestions(input) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';

    suggestionsContainer.style.display = 'block';

    if (input.length < 3) {
        return;
    }

    const filteredSuggestions = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(input.toLowerCase())
    );

    if (filteredSuggestions.length === 0) {
        suggestionsContainer.innerHTML = '<div class="space-mono-regular no-suggestions">No Suggestions Available</div>';
        return;
    }

    filteredSuggestions.forEach(suggestion => {
        const highlightedSuggestion = highlightMatch(suggestion, input);
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.innerHTML = highlightedSuggestion;
        suggestionItem.onclick = () => selectSuggestion(suggestion);
        suggestionsContainer.appendChild(suggestionItem);
    });
}

function highlightMatch(suggestion, input) {
    const regex = new RegExp(`(${input})`, 'gi');
    return suggestion.replace(regex, '<span class="highlight">$1</span>');
}

function selectSuggestion(suggestion) {
    const searchInput = document.getElementById('query');
    searchInput.value = suggestion;
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('suggestions').style.display = 'none';
}

function displayResults(source, results) {
    const dropdownContent = document.getElementById('dropdownContent');
    dropdownContent.innerHTML = '';

    results.forEach(item => {
        const title = item.title || item.name || item.headline;
        const url = item.link || `https://en.wikipedia.org/?curid=${item.pageid}`;
        const snippet = item.snippet || item.excerpt || item.content || '';

        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';
        resultElement.innerHTML = `
            <div class="result-title"><a href="${url}" target="_blank">${title}</a></div>
            <div class="result-url">${url}</div>
            <div class="result-snippet">${snippet}</div>
            <div class="result-source">${source}</div>
        `;
        dropdownContent.appendChild(resultElement);
    });
    updateResultsCounter();
}

function executeSearch() {
    const searchTerm = document.getElementById('query').value;
    if (!searchTerm) {
        return;
    }
    if (currentEngine === 'wikipedia') {
        searchWikipedia(searchTerm);
    } else if (currentEngine === 'stackoverflow') {
        searchStackOverflow(searchTerm);
    } else if (currentEngine === 'news') {
        searchNews(searchTerm);
    } else if (currentEngine === 'arxiv') {
        window.open(searchEngines.arxiv + encodeURIComponent(searchTerm) + '&searchtype=all', '_blank');
    } else {
        window.open(searchEngines[currentEngine] + encodeURIComponent(searchTerm), '_blank');
    }
}

function searchWikipedia(searchTerm) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=5&srsearch=${encodeURIComponent(searchTerm)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.query.search.length > 0) {
                displayResults('Wikipedia', data.query.search);
            } else {
                document.getElementById('dropdownContent').innerHTML = '<div class="result-item">No results found on Wikipedia.</div>';
                updateResultsCounter();
            }
        })
        .catch(error => console.error('Error fetching Wikipedia data:', error));
}

function searchNews(searchTerm) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchTerm)}&apiKey=${newsAPIKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.articles.length > 0) {
                displayResults('News', data.articles);
            } else {
                document.getElementById('dropdownContent').innerHTML = '<div class="result-item">No results found in News.</div>';
                updateResultsCounter();
            }
        })
        .catch(error => console.error('Error fetching news data:', error));
}

function searchStackOverflow(searchTerm) {
    const url = `${stackExchangeAPIUrl}&intitle=${encodeURIComponent(searchTerm)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.items.length > 0) {
                displayResults('Stack Overflow', data.items);
            } else {
                document.getElementById('dropdownContent').innerHTML = '<div class="result-item">No results found on Stack Overflow.</div>';
                updateResultsCounter();
            }
        })
        .catch(error => console.error('Error fetching Stack Overflow data:', error));
}

function clearInput() {
    const dropdownContent = document.getElementById('dropdownContent');
    const searchInput = document.getElementById('query');
    const engineButtons = document.querySelectorAll('.engine-btn');
    const searchbar = document.getElementById('searchbar');
    searchInput.value = '';
    searchbar.value = '';
    dropdownContent.innerHTML = '';
    searchInput.focus();
    engineButtons.forEach(b => b.classList.remove('active'));
    Array.from(engineButtons).forEach(button => button.style.display = 'block');
    document.getElementById('suggestions').style.display = 'none';
}

function initializeSearch() {
    const searchInput = document.getElementById('query');
    const searchButton = document.querySelector('.search-button');
    const clearButton = document.querySelector('.search-button-x');
    const engineButtons = document.querySelectorAll('.engine-btn');

    searchButton.addEventListener('click', executeSearch);
    clearButton.addEventListener('click', clearInput);
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            executeSearch();
        } else {
            showSuggestions(searchInput.value);
        }
    });
    
    engineButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentEngine = button.dataset.engine;
            engineButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeSearch);

const enterSearch = document.getElementById('enterSearch');
enterSearch.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    executeSearch();
  }
});

function search_btns() {
    let input = document.getElementById("searchbar").value.toLowerCase();
    let buttons = document.getElementsByClassName("engine-btn");

    for (let i = 0; i < buttons.length; i++) {
        let buttonText = buttons[i].innerHTML.toLowerCase();
        let meta = buttons[i].getAttribute("data-meta")?.toLowerCase() || "";

        if (!buttonText.includes(input) && !meta.includes(input)) {
            buttons[i].style.display = "none";
        } else {
            buttons[i].style.display = "block";
        }
    }
}