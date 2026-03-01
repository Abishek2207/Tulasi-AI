import http.server
import json
import urllib.parse
import os
import requests
from dotenv import load_dotenv

load_dotenv()

PORT = 8000
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

class TulasiAIHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def send_json(self, data, status=200):
        try:
            body = json.dumps(data).encode('utf-8')
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            self.wfile.flush()
        except Exception as e:
            print(f"Error sending response: {e}")

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/" or path == "/api/health":
            self.send_json({
                "status": "TulasiAI Backend is ONLINE",
                "gemini": "Ready" if GOOGLE_API_KEY else "Missing",
                "groq": "Ready" if GROQ_API_KEY else "Missing"
            })
        elif path.startswith("/api/leetcode/stats/"):
            username = path.split("/")[-1]
            try:
                res = requests.get(f"https://leetcode-api-faisalshohag.vercel.app/{username}", timeout=5)
                self.send_json(res.json())
            except:
                self.send_json({"error": "Stats unavailable"}, 500)
        else:
            self.send_json({"error": "Route not found"}, 404)

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_json({"error": f"Invalid request: {str(e)}"}, 400)
            return

        path = urllib.parse.urlparse(self.path).path
        if path == "/api/chat":
            user_message = data.get("message", "Hi")
            print(f"Chat request: {user_message[:30]}...")
            ai_reply = self.get_ai_response(user_message)
            self.send_json({"response": ai_reply})
        elif path == "/api/upload-document":
            self.send_json({"status": "Success", "message": "File received"})
        else:
            self.send_json({"error": "Endpoint not found"}, 404)

    def get_ai_response(self, text):
        # Try Gemini
        gem_res, gem_err = self.get_gemini_response(text)
        if gem_res != "Error": return gem_res
        
        print(f"Gemini failed ({gem_err}), trying Groq...")
        # Try Groq
        groq_res, groq_err = self.get_groq_response(text)
        if groq_res != "Error": return groq_res
        
        return f"AI Offline. Gemini: {gem_err}. Groq: {groq_err}."

    def get_gemini_response(self, text):
        if not GOOGLE_API_KEY: return "Error", "No Key"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"
        payload = {"contents": [{"parts": [{"text": text}]}]}
        try:
            r = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
            if r.status_code == 200:
                return r.json()['candidates'][0]['content']['parts'][0]['text'], ""
            return "Error", f"HTTP {r.status_code}: {r.text[:100]}"
        except Exception as e:
            return "Error", str(e)

    def get_groq_response(self, text):
        if not GROQ_API_KEY: return "Error", "No Key"
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "system", "content": "You are TulasiAI."}, {"role": "user", "content": text}]
        }
        try:
            r = requests.post(url, json=payload, headers=headers, timeout=12)
            if r.status_code == 200:
                return r.json()['choices'][0]['message']['content'], ""
            return "Error", f"HTTP {r.status_code}: {r.text[:100]}"
        except Exception as e:
            return "Error", str(e)

def run():
    # Use ThreadingHTTPServer for concurrency
    server_address = ('', PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, TulasiAIHandler)
    print(f"🚀 TulasiAI Multi-threaded Backend on port {PORT}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
