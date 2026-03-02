# backend/routers/leetcode.py
from fastapi import APIRouter
import httpx

router = APIRouter()

LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

@router.get("/problems")
async def get_problems(difficulty: str = "EASY", limit: int = 20):
    query = """
    query problemsetQuestionList($categorySlug: String, $limit: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        filters: $filters
      ) {
        questions: data {
          questionId
          title
          titleSlug
          difficulty
          topicTags { name }
          isPaidOnly
        }
      }
    }
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            LEETCODE_GRAPHQL,
            json={
                "query": query,
                "variables": {
                    "categorySlug": "",
                    "limit": limit,
                    "filters": {"difficulty": difficulty}
                }
            },
            headers={"Content-Type": "application/json"}
        )
    return response.json()

@router.get("/problem/{slug}")
async def get_problem_detail(slug: str):
    query = """
    query getQuestion($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        content
        difficulty
        exampleTestcases
        topicTags { name }
        hints
      }
    }
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            LEETCODE_GRAPHQL,
            json={"query": query, "variables": {"titleSlug": slug}},
            headers={"Content-Type": "application/json"}
        )
    return response.json()

@router.post("/solve-with-ai")
async def solve_leetcode_with_ai(problem: dict, user_id: str, language: str = "python"):
    from services.langchain_service import llm
    
    prompt = f"""
    Solve this LeetCode problem completely:
    
    Title: {problem.get('title')}
    Difficulty: {problem.get('difficulty')}
    Problem: {problem.get('content')}
    
    Provide:
    1. Problem Understanding
    2. Approach / Algorithm
    3. Complete {language} solution with comments
    4. Time Complexity: O(?)
    5. Space Complexity: O(?)
    6. Alternative approaches
    7. Similar problems to practice
    """
    
    response = llm.invoke(prompt)
    return {"solution": response.content}
