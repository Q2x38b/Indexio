export default async function handler(req, res) {
	const apiUrl = 'https://api-inference.huggingface.co/models/XLabs-AI/flux-RealismLora'; // Replace with your actual API URL
	// Set CORS headers to allow requests from your GitHub Pages site
	res.setHeader('Access-Control-Allow-Origin', 'https://q2x38b.github.io'); // Replace with your GitHub Pages URL
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Add Authorization here
	// Handle preflight OPTIONS request
	if (req.method === 'OPTIONS') {
		return res.status(200).end(); // Exit early for preflight OPTIONS request
	}
	try {
		// Forward the request from the client to the backend API
		const apiResponse = await fetch(apiUrl, {
			method: req.method,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': req.headers['authorization'] || '', // Forward the Authorization header
				...req.headers,
			},
			body: req.method === 'POST' ? req.body : undefined,
		});
		// Get response data from the backend API
		const data = await apiResponse.json();
		// Send response data back to the client
		res.status(apiResponse.status).json(data);
	} catch (error) {
		console.error('Error in proxy function:', error);
		res.status(500).json({
			error: 'Failed to fetch data from the backend API'
		});
	}
}