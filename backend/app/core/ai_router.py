from typing import List, Optional
from app.services.ai_agents.router.model_router import ai_router

def classify_query(message: str) -> str:
    """Classify query to route to best model."""
    code_keywords = ["code", "function", "debug", "error", "python", "javascript", "java", "c++", "sql", "algorithm", "syntax", "program", "compile"]
    interview_keywords = ["interview", "explain", "difference", "describe", "what is", "how does", "system design", "complexity"]
    
    msg_lower = message.lower()
    if any(kw in msg_lower for kw in code_keywords):
        return "coding"
    elif any(kw in msg_lower for kw in interview_keywords):
        return "complex_reasoning"
    return "fast_chat"

def get_ai_response(message: str, history: Optional[List[dict]] = None, force_model: Optional[str] = None, image_data: Optional[bytes] = None) -> str:
    """Route to best AI model and return response."""
    history_list = history or []
    task_type = force_model or classify_query(message)
    
    # Use the unified ai_router
    llm = ai_router.get_best_model(task_type)
    
    if not llm:
        return "I need an AI API key to respond. Please configure `GOOGLE_API_KEY` or `GROQ_API_KEY`."

    try:
        # Construct messages for LangChain
        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
        
        system_prompt = """You are Tulasi AI — an expert, friendly learning assistant for students.
You help with: programming, career guidance, interview prep, and CS concepts.
Be concise, educational, and encouraging. Use markdown formatting for code."""
        
        messages = [SystemMessage(content=system_prompt)]
        
        # history_list is a list of dicts: [{"role": "user", "content": "..."}, ...]
        for m in history_list[-8:]:
            role = str(m.get("role", "user"))
            content = str(m.get("content", ""))
            if role == "user":
                messages.append(HumanMessage(content=content))
            else:
                messages.append(AIMessage(content=content))
        
        messages.append(HumanMessage(content=message))
        
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        print(f"AI Error: {e}")
        return f"Sorry, I encountered an error: {str(e)}"
