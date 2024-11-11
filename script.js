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

async function getAIResponse() {
    const question = document.getElementById("query").value.trim();
    if (!question) {
        return;
    }

    const dropdownContent = document.getElementById("dropdownContent");

    dropdownContent.innerHTML = "<div class='result-item'>Loading...</div>";
    try {
        const response = await fetch("https://indexio.vercel.app/api/proxy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer oYNcT7mG.XQ9I88SNwlWXoInpODsT6fYPgafV6prT",
            },
            body: JSON.stringify({
                "model": "openrouter/huggingfaceh4/zephyr-7b-beta:free",
                "messages": [
                    {"role": "system", "content": "Dont explain anything just give the answer."},
                    {"role": "user", "content": question}
                ],
                "tools": []
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data?.choices?.[0]?.message?.content;

        if (aiResponse) {
            dropdownContent.innerHTML = `  
                <div class="result-item">
                    <div class="result-title">AI Response</div>
                    <div class="result-snippet">${aiResponse}</div>
                </div>
            `;
        } else {
            dropdownContent.innerHTML = "<div class='result-item'>Unexpected response structure.</div>";
            console.log("Full response data:", data);
        }
    } catch (error) {
        dropdownContent.innerHTML = "<div class='result-item'>There was an error fetching the response. Check the console for details.</div>";
        console.error("Error:", error);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAIImage() {
    const queryText = document.getElementById("query").value.trim();
    if (!queryText) return;

    const resultsContainer = document.getElementById("dropdownContent");
    resultsContainer.innerHTML = "<div class='loading'>Generating Image</div><div class='loader-center'><div class='loader'><li class='ball'></li><li class='ball'></li><li class='ball'></li></div></div>";

    try {
        const response = await fetch(`https://indexio.vercel.app/api/proxy2`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer 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",
                "Content-Type": "application/json",
                "x-use-cache": "false",
            },
            body: JSON.stringify({ inputs: queryText })
        });

        if (response.status === 429) {
            console.log("Rate limit hit. Retrying in 5 seconds...");
            await sleep(5000);s
            return getAIImage();
        }

        if (!response.ok) {
            throw new Error('Image generation failed');
        }

        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);

        resultsContainer.innerHTML = "";

        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = "Generated Image";
        imgElement.width = 300;
        imgElement.height = 300;

        imgElement.onload = function() {
            resultsContainer.appendChild(imgElement);
        };

        imgElement.onerror = function() {
            resultsContainer.innerHTML = "<div class='error'>Failed to load image. Try again.</div>";
        };
    } catch (error) {
        console.error("Error generating image:", error);
        resultsContainer.innerHTML = "<div class='error'>Error generating image. Please try again later.</div>";
    }
}

function downloadImage() {
    const imageElement = document.querySelector("#dropdownContent img");
    if (!imageElement) {
        return;
    }

    const link = document.createElement("a");
    link.href = imageElement.src;
    link.download = "generated_image.png";
    link.click();
}

document.querySelector("button:contains('AI Image Generation')").addEventListener("click", getAIImage); 


async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("No file selected!");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64String = e.target.result.split(',')[1];

        const result = await queryWithImage(base64String);
        
        displayAIResponse(result);
    };
    
    reader.readAsDataURL(file);
}

async function queryWithImage(base64String) {
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/detr-resnet-101", {
        method: "POST",
        headers: {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: {
                image: base64String,
            }
        })
    });

    if (!response.ok) {
        console.error("Error querying the AI model:", response.status);
        return null;
    }

    const data = await response.json();
    return data;
}

function displayAIResponse(response) {
    const dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.innerHTML = "";

    if (response && response.length > 0) {
        const labelCount = {};

        response.forEach(item => {
            const label = item.label;
            if (labelCount[label]) {
                labelCount[label]++;
            } else {
                labelCount[label] = 1;
            }
        });

        let resultText = "<div class='result-item'><div class='result-title'>Detected Objects</div><div class='result-snippet'>";

        for (const label in labelCount) {
            resultText += `${label}: ${labelCount[label]}<br>`;
        }

        resultText += "</div></div>";

        dropdownContent.innerHTML = resultText;
    } else {
        dropdownContent.innerHTML = "<div class='result-item'>No objects detected in the image.</div>";
    }
}

function resetFileInput() {
    const fileInput = document.getElementById('imageInput');
    fileInput.value = '';
    
    const dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.innerHTML = "";
}