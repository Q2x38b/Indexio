// api/proxy.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const apiUrl = 'https://api-inference.huggingface.co/models/XLabs-AI/flux-RealismLora'; // Replace with your API URL

  try {
    // Forward the request from the client to the backend API
    const apiResponse = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    // Get response data from the backend API
    const data = await apiResponse.json();

    // Send response data back to the client
    res.status(apiResponse.status).json(data);
  } catch (error) {
    console.error('Error in proxy function:', error);
    res.status(500).json({ error: 'Failed to fetch data from the backend API' });
  }
}