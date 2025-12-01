/**
 * @param {string} message
 * @param {Array} history
 * @param {string} scale
 * @returns {Promise<string>} 
 */
export async function fetchLocalAIResponse(message, history, scale, persona) {
    try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history, scale, persona}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error');
    }

    const data = await response.json();
    return data.content;

  } catch (error) {
    console.error('Error fetching from local API:', error);
    throw new Error(`Failed to connect to AI: ${error.message}`);
  }
}