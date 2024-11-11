export default async function handler(req, res) {
	const apiUrl = 'https://api-inference.huggingface.co/models/XLabs-AI/flux-RealismLora'; // Replace with your actual API URL
	// Set CORS headers to allow requests from your GitHub Pages site
	res.setHeader('Access-Control-Allow-Origin', 'https://q2x38b.github.io'); // Replace with your GitHub Pages URL
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow Content-Type and Authorization headers
	// Handle preflight OPTIONS request
	if (req.method === 'OPTIONS') {
		return res.status(200).end(); // Exit early for preflight OPTIONS request
	}
	try {
		// Set up headers explicitly, rather than spreading req.headers
		const headers = {
			'Content-Type': 'application/json',
		};
		if (req.headers.authorization) {
			headers['Authorization'] = req.headers.authorization; // Forward Authorization if it exists
		}
		// Forward the request to the backend API
		const apiResponse = await fetch(apiUrl, {
			method: req.method,
			headers: headers,
			body: req.method === 'POST' ? JSON.stringify(req.body) : undefined, // Stringify req.body for POST requests
		});
		// Try parsing the API response as JSON
		let data;
		try {
			data = await apiResponse.json();
		} catch (jsonError) {
			// If JSON parsing fails, log the raw response
			const text = await apiResponse.text();
			console.error('Non-JSON response from backend:', text);
			return res.status(apiResponse.status).send(text);
		}
		// Send JSON response back to the client
		res.status(apiResponse.status).json(data);
	} catch (error) {
		console.error('Error in proxy function:', error);
		res.status(500).json({
			error: 'Failed to fetch data from the backend API'
		});
	}
}