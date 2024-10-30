document.addEventListener('DOMContentLoaded', function () {

    const form = document.querySelector('.search-box');
    const input = document.getElementById('searchInput');
    const resultsContainer = document.querySelector('.results');
    const resultsCounter = document.getElementById('resultsCount');
    const sourceSelect = document.getElementById('custom-select');
    const searchButton = document.querySelector('.button-style');
    const homeButton = document.getElementById('homeButton');

    // Function to check if scrollbar is present
    function isScrollbarPresent() {
        return document.documentElement.scrollHeight > window.innerHeight;
    }

    // Function to show or hide home button based on scrollbar presence
    function toggleHomeButtonVisibility() {
        if (isScrollbarPresent()) {
            homeButton.style.display = 'block';
        } else {
            homeButton.style.display = 'none';
        }
    }

    // Call the function initially and listen for window resize events
    toggleHomeButtonVisibility();
    window.addEventListener('resize', toggleHomeButtonVisibility);

    // Listen for DOM changes and update home button visibility accordingly
    const observer = new MutationObserver(toggleHomeButtonVisibility);
    observer.observe(document.body, { childList: true, subtree: true });

    // Define search functions
    const newsAPIKey = 'ff6a37b927b04ea081c2479fe324989e';
    const duckDuckGoAPIUrl = 'https://api.duckduckgo.com/?q=%s&format=json';
    const stackExchangeAPIUrl = 'https://api.stackexchange.com/2.3/search?order=desc&sort=activity&site=stackoverflow&q=%s';
    const hackerNewsAPIUrl = 'https://hn.algolia.com/api/v1/search?query=';

    const sources = {
        'wikipedia': {
            label: 'Wikipedia',
            searchFunction: searchWikipedia
        },
        'news': {
            label: 'News',
            searchFunction: searchNews
        },
        'duckduckgo': {
            label: 'DuckDuckGo',
            searchFunction: searchDuckDuckGo
        },
        'stackexchange': {
            label: 'Stack Overflow',
            searchFunction: searchStackExchange
        },
        'hackernews': {
            label: 'Hacker News',
            searchFunction: searchHackerNews
        }
    };

    // Populate the dropdown menu with sources
    for (const key in sources) {
        if (Object.hasOwnProperty.call(sources, key)) {
            const source = sources[key];
            const option = document.createElement('option');
            option.text = source.label;
            option.value = key;
            sourceSelect.add(option);
        }
    }

    // Event listeners for search form submission and button click
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission
        search();
    });

    searchButton.addEventListener('click', function () {
        search();
    });

    sourceSelect.addEventListener('change', function () {
        search(); // Update search results when dropdown selection changes
    });

    // Search function
    function search() {
        const searchTerm = input.value;
        const selectedSource = sourceSelect.value;
        if (searchTerm && selectedSource in sources) {
            sources[selectedSource].searchFunction(searchTerm);
        }
    }

    // Wikipedia search function
    function searchWikipedia(searchTerm) {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=500&srsearch=${encodeURIComponent(searchTerm)}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayResults('Wikipedia', data.query.search);
            })
            .catch(error => console.error('Error fetching Wikipedia data:', error));
    }

    // News search function
    function searchNews(searchTerm) {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchTerm)}&apiKey=${newsAPIKey}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayResults('News', data.articles);
            })
            .catch(error => console.error('Error fetching NewsAPI data:', error));
    }

    // DuckDuckGo search function
    function searchDuckDuckGo(searchTerm) {
        const url = duckDuckGoAPIUrl.replace('%s', encodeURIComponent(searchTerm));
        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayResults('DuckDuckGo', data.RelatedTopics);
            })
            .catch(error => console.error('Error fetching DuckDuckGo data:', error));
    }

    // Stack Exchange search function
    function searchStackExchange(searchTerm) {
        const url = stackExchangeAPIUrl.replace('%s', encodeURIComponent(searchTerm));
        const updatedUrl = `${url}&intitle=${encodeURIComponent(searchTerm)}`; // Include searchTerm in the intitle parameter
        fetch(updatedUrl)
            .then(response => response.json())
            .then(data => {
                console.log(data); // Log the response from Stack Exchange API
                if (data.items && data.items.length > 0) {
                    displayResults('Stack Overflow', data.items);
                } else {
                    console.error('No results found for the search term:', searchTerm);
                }
            })
            .catch(error => console.error('Error fetching Stack Exchange data:', error));
    }

    // Hacker News search function
    function searchHackerNews(searchTerm) {
        const url = hackerNewsAPIUrl + encodeURIComponent(searchTerm);
        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayResults('Hacker News', data.hits);
            })
            .catch(error => console.error('Error fetching Hacker News data:', error));
    }

    // Function to display search results
    function displayResults(source, results) {
        resultsContainer.innerHTML = ''; // Clear previous results
        const resultSection = document.createElement('div');
        resultSection.innerHTML = `<p style="font-size: 30px; color: #616161;"><b>${source} Results:</b></p>`;
        resultsContainer.appendChild(resultSection);
        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result';
            if (source === 'Wikipedia') {
                resultElement.innerHTML = `
                    <h3>${result.title}</h3>
                    <p>${result.snippet}</p>
                    <a href="https://en.wikipedia.org/?curid=${result.pageid}" target="_blank">Read More</a>
                `;
            } else if (source === 'News') {
                resultElement.innerHTML = `
                    <h3>${result.title}</h3>
                    <p>${result.description}</p>
                    <a href="${result.url}" target="_blank">Read More</a>
                `;
            } else if (source === 'DuckDuckGo') {
                resultElement.innerHTML = `
                    <h3>${result.Text}</h3>
                    <p>${result.FirstURL}</p>
                    <a href="${result.FirstURL}" target="_blank">Read More</a>
                `;
            } else if (source === 'Stack Overflow') {
                resultElement.innerHTML = `
                    <h3>${result.title}</h3>
                    <p>${result.link}</p>
                    <a href="${result.link}" target="_blank">Read More</a>
                `;
            } else if (source === 'Hacker News') {
                resultElement.innerHTML = `
                    <h3>${result.title}</h3>
                    <p>${result.url}</p>
                    <a href="${result.url}" target="_blank">Read More</a>
                `;
            }
            resultSection.appendChild(resultElement);
        });
        resultsCounter.textContent = `Results Count : ${results.length}`;
    }

});
