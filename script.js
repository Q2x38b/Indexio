const newsAPIKey = 'YOUR_NEWSAPI_KEY';
const stackExchangeAPIUrl = 'https://api.stackexchange.com/2.3/search?order=desc&sort=activity&site=stackoverflow';
const resultsCounter = document.getElementById('resultsCount');
const searchEngines = {
	google: 'https://www.google.com/search?q=',
	bing: 'https://www.bing.com/search?q=',
	yahoo: 'https://search.yahoo.com/search?p=',
	duckduckgo: 'https://duckduckgo.com/?q=',
	ecosia: 'https://www.ecosia.org/search?q=',
	scholar: 'https://scholar.google.com/scholar?q=',
	scispace: 'https://typeset.io/search?q=',
	jstor: 'https://www.jstor.org/action/doBasicSearch?Query=',
	sciencedirect: 'https://www.sciencedirect.com/search?qs=',
	core: 'https://core.ac.uk/search/?q=',
	github: 'https://github.com/search?q=',
	stackoverflow: 'https://stackoverflow.com/search?q=',
	npm: 'https://www.npmjs.com/search?q=',
	mdn: 'https://developer.mozilla.org/en-US/search?q=',
	icons: 'https://www.flaticon.com/search?word=',
	mapquest: 'https://www.mapquest.com/search/',
	dictionary: 'https://www.merriam-webster.com/dictionary/',
	pewresearch: 'https://www.pewresearch.org/search/',
	wolframalpha: 'https://www.wolframalpha.com/input?i=',
	statista: 'https://www.statista.com/search/?q=',
	quickmath: 'https://quickmath.com/#c=solve&v1=',
	openlibrary: 'https://openlibrary.org/search?q=',
	base: 'https://www.base-search.net/Search/Results?type=all&lookfor=',
	nasa: 'https://www.nasa.gov/?search=',
	britannica: 'https://www.britannica.com/search?query=',
    translate: 'https://translate.google.com/?sl=auto&tl=en&text=',
    googlemaps: 'https://www.google.com/maps/search/',
    pinterest: 'https://www.pinterest.com/search/pins/?q=',
    reddit: 'https://www.reddit.com/search/?q=',
    encyclopedia: 'https://encyclopedia.thefreedictionary.com/'
};
let currentEngine = 'google';

function updateResultsCounter() {
	const dropdownContent = document.getElementById('dropdownContent');
	const resultItems = dropdownContent.getElementsByClassName('result-item');
	resultsCounter.textContent = `Results Count : ${resultItems.length}`;
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

async function getDefinition() {
	const word = document.getElementById("query").value;
	const dropdownContent = document.getElementById("dropdownContent");
	const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

	dropdownContent.innerHTML = '';

	const response = await fetch(url);
	if (response.ok) {
		const data = await response.json();
		const definition = data[0].meanings[0].definitions[0].definition;

		dropdownContent.innerHTML = `<div class="dictionary-result">Definition: ${definition}</div>`;
	} else {
		dropdownContent.innerHTML = `<div class="dictionary-result">Definition not found.</div>`;
	}

	updateResultsCounter();
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
}


function initializeSearch() {
	const searchInput = document.getElementById('query');
	const searchButton = document.querySelector('.search-button');
	const clearButton = document.querySelector('.search-button-x');
	const engineButtons = document.querySelectorAll('.engine-btn');

	searchButton.addEventListener('click', executeSearch);
	clearButton.addEventListener('click', clearInput);

	searchInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			executeSearch();
		}
	});

	// Engine Selection
	engineButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			engineButtons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			currentEngine = btn.dataset.engine; // Update current engine
		});
	});

	// Focus search input on load
	searchInput.focus();
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