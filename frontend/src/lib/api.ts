/**
 * API Client for TulasiAI Backend (FastAPI)
 * Defaults to http://localhost:8000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function chatWithAI(message: string, userId: string = "demo_user", context: string = "") {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, user_id: userId, context }),
        });

        if (!response.ok) throw new Error('Failed to fetch AI response');
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Chat API Error:', error);
        return "I'm having trouble connecting to my backend right now. Please make sure the FastAPI server is running.";
    }
}

export async function uploadDocument(file: File, userId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload-document`, {
            method: 'POST',
            body: formData,
        });
        return await response.json();
    } catch (error) {
        console.error('Upload Error:', error);
        return { status: "Upload failed" };
    }
}
