import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI(title="TalentNexus AI Predictive Core", version="3.04")

# Configure CORS for local cross-port communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# UPGRADED HIGH-DENSITY UNSTANDARDIZED DATASET (12 Profiles)
CANDIDATE_DATASET = [
    {
        "id": "TN-8842",
        "name": "Raj Kumar",
        "title": "Senior Full Stack AI Developer",
        "skills": "Python, React, FastAPI, Deep Learning models, LLMs, machine learning, vector architectures",
        "experience_years": 6.5, "cgpa": 8.9, "verified_certs": True, "repo_commits": 412, "current_company": "Redrob Premium Labs Ltd."
    },
    {
        "id": "TN-1245",
        "name": "Amit Sharma",
        "title": "ML Engineer",
        "skills": "Python, machine learning, deep learning, PyTorch, PyTorch, PyTorch, PyTorch, PyTorch", # Keyword Stuffed Cheater
        "experience_years": 2.0, "cgpa": 7.5, "verified_certs": False, "repo_commits": 45, "current_company": "Tech Solutions Corp"
    },
    {
        "id": "TN-9911",
        "name": "Priya Patel",
        "title": "Deep Learning Specialist",
        "skills": "TensorFlow, Keras, Python, Computer Vision models, deployment automation, PyTorch",
        "experience_years": 4.2, "cgpa": 9.4, "verified_certs": True, "repo_commits": 198, "current_company": "Nexus Automations"
    },
    {
        "id": "TN-3344",
        "name": "Vikram Singh",
        "title": "Senior Full Stack Developer",
        "skills": "Node.js, React, Express, MongoDB, JavaScript, TypeScript, AWS, Next.js, REST APIs",
        "experience_years": 5.0, "cgpa": 8.2, "verified_certs": True, "repo_commits": 310, "current_company": "Alpha Tech Systems"
    },
    {
        "id": "TN-5566",
        "name": "Ananya Rao",
        "title": "Full Stack Software Engineer",
        "skills": "Java, Spring Boot, Angular, PostgreSQL, Docker, Microservices, React, JavaScript",
        "experience_years": 3.5, "cgpa": 7.9, "verified_certs": False, "repo_commits": 120, "current_company": "Global Finance Tech"
    },
    {
        "id": "TN-7788",
        "name": "Rohan Das",
        "title": "Frontend Developer",
        "skills": "HTML, CSS, Tailwind CSS, JavaScript, Vue.js, Web Development, responsive design",
        "experience_years": 1.5, "cgpa": 8.5, "verified_certs": True, "repo_commits": 85, "current_company": "Creative Media Labs"
    },
    {
        "id": "TN-4411",
        "name": "Kiran Mehta",
        "title": "Data Scientist",
        "skills": "Python, SQL, R, Pandas, NumPy, Scikit-Learn, Tableau, Statistical Modeling",
        "experience_years": 4.0, "cgpa": 9.1, "verified_certs": True, "repo_commits": 150, "current_company": "Insight Analytics"
    },
    {
        "id": "TN-2233",
        "name": "Siddharth Nair",
        "title": "DevOps & Cloud Engineer",
        "skills": "Docker, Kubernetes, AWS, Jenkins, CI/CD pipelines, Linux, Terraform, Shell scripting",
        "experience_years": 5.5, "cgpa": 7.8, "verified_certs": True, "repo_commits": 240, "current_company": "CloudScale Solutions"
    },
    {
        "id": "TN-1155",
        "name": "Meera Joshi",
        "title": "Backend API Engineer",
        "skills": "Python, Django, PostgreSQL, Redis, Celery, FastAPI, gRPC, Microservices architecture",
        "experience_years": 3.0, "cgpa": 8.6, "verified_certs": False, "repo_commits": 175, "current_company": "Core Engine Systems"
    },
    {
        "id": "TN-6622",
        "name": "Arjun Malhotra",
        "title": "AI Research Scientist",
        "skills": "Natural Language Processing, NLP, Transformers, BERT, GPT, PyTorch, Research publication",
        "experience_years": 2.5, "cgpa": 9.7, "verified_certs": True, "repo_commits": 90, "current_company": "Future Intelligence Inst"
    },
    {
        "id": "TN-8899",
        "name": "Sneha Reddy",
        "title": "UI/UX Product Developer",
        "skills": "Figma, CSS, UI Design, React component structures, prototyping, web accessibilities",
        "experience_years": 3.8, "cgpa": 8.3, "verified_certs": False, "repo_commits": 60, "current_company": "Vivid Studio Enterprise"
    },
    {
        "id": "TN-4455",
        "name": "Divya Sharma",
        "title": "Junior Python Developer",
        "skills": "Python Core, Flask, SQLite, Scripting automation, Web scraping using Beautiful Soup",
        "experience_years": 1.2, "cgpa": 7.4, "verified_certs": False, "repo_commits": 35, "current_company": "AppForge Technologies"
    }
]

def analyze_keyword_stuffing(skills_text: str) -> bool:
    tokens = re.findall(r'\w+', skills_text.lower())
    for token in set(tokens):
        if tokens.count(token) > 4:
            return True
    return False

def calculate_tensor_score(candidate: dict, query_intent: str) -> tuple[float, bool]:
    """Computes a multi-dimensional ranking score and match validity flag"""
    query_lower = query_intent.strip().lower()
    
    # If no query, calculate baseline profile score and match everything
    if not query_lower:
        is_matched = True
        match_weight = 1.0
    else:
        # Build synonym intent logic mappings
        ai_keywords = ["ai", "ml", "machine learning", "deep learning", "llm", "natural language", "nlp", "vision", "pytorch", "tensorflow"]
        fullstack_keywords = ["full stack", "fullstack", "backend", "frontend", "react", "node", "api", "django", "fastapi", "spring boot", "software engineer"]
        
        # Determine query semantic group
        is_ai_query = any(k in query_lower for k in ai_keywords)
        is_fs_query = any(k in query_lower for k in fullstack_keywords)
        
        # Look for a contextual match inside the candidate data text fields
        combined_text = (candidate["title"] + " " + candidate["skills"] + " " + candidate["current_company"]).lower()
        
        # Dynamic Cross-Lingual Interpretation Layer
        if "responsive" in combined_text or "layout" in combined_text:
            combined_text += " web development frontend react"
            
        # Check strict matching thresholds
        has_direct_word = any(word in combined_text for word in query_lower.split())
        
        is_matched = False
        match_weight = 0.5
        
        if is_ai_query and any(k in combined_text for k in ai_keywords):
            is_matched = True
            match_weight = 2.5
        elif is_fs_query and any(k in combined_text for k in fullstack_keywords):
            is_matched = True
            match_weight = 2.2
        elif has_direct_word:
            is_matched = True
            match_weight = 1.8

    # Dimension 1: Academic Authority (30%)
    academic_base = (candidate["cgpa"] / 10.0) * 10
    if candidate["verified_certs"]:
        academic_base += 1.0
    academic_score = min(academic_base, 10.0) * 0.3
    
    # Dimension 2: Applied Praxis Competency (40%)
    praxis_base = min((candidate["repo_commits"] / 300.0) * 10, 10.0)
    praxis_score = praxis_base * 0.4
    
    # Dimension 3: Career Growth Velocity Forecast (30%)
    velocity_base = min((candidate["experience_years"] / 5.0) * 10, 10.0)
    velocity_score = velocity_base * 0.3
    
    # Aggregate Score Matrix
    composite_score = (academic_score + praxis_score + velocity_score) * match_weight
    final_score = round(min(composite_score, 10.0), 2)
    
    # Apply Adversarial Penalization Guard
    if analyze_keyword_stuffing(candidate["skills"]):
        final_score = round(final_score * 0.4, 2)
        
    return final_score, is_matched

@app.get("/api/rank")
def get_candidate_rankings(query: Optional[str] = ""):
    ranked_list = []
    for candidate in CANDIDATE_DATASET:
        calculated_score, is_matched = calculate_tensor_score(candidate, query or "")
        
        # Only return candidates that match the semantic query intent
        if is_matched:
            ranked_list.append({
                "id": candidate["id"],
                "name": candidate["name"],
                "title": candidate["title"],
                "skills": candidate["skills"],
                "experience_years": candidate["experience_years"],
                "current_company": candidate["current_company"],
                "score": calculated_score,
                "stuffing_detected": analyze_keyword_stuffing(candidate["skills"])
            })
        
    # Sort output payload list from highest score to lowest
    ranked_list.sort(key=lambda x: x["score"], reverse=True)
    return {"results_count": len(ranked_list), "candidates": ranked_list}