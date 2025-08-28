import os
import json
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import pdfplumber
import docx

load_dotenv()

app = FastAPI()

try:
    client = OpenAI()
    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError("OPENAI_API_KEY environment variable not found.")
except Exception as e:
    client = None
    print(f"Error initializing OpenAI client: {e}")

class AnalysisRequest(BaseModel):
    resume_text: str
    job_description_text: str


@app.post("/analyze")
def analyze_documents(request: AnalysisRequest):
    if not client:
        return {"error": "OpenAI client is not configured correctly. Check your API key."}

    system_prompt = """
    You are a resume optimization expert helping job seekers improve their chances of getting interviews. 
    Your goal is to help the applicant understand how well their resume matches the job and what they need to improve.

    Analyze the resume against the job description and return a JSON object with this structure:

    {
        "match_score": <integer 1-100>,
        "match_summary": "<1-2 sentence summary of how well the resume fits this job>",
        "what_you_have_going_for_you": {
            "matched_skills": ["<skills from resume that match job requirements>"],
            "relevant_experience": ["<experience that aligns with job needs>"],
            "strong_achievements": ["<accomplishments that make you stand out>"]
        },
        "areas_to_improve": {
            "missing_keywords": ["<important keywords from job description missing from resume>"],
            "skills_to_emphasize": ["<skills you have but need to highlight more>"],
            "experience_gaps": ["<areas where you need more relevant experience>"]
        },
        "ats_optimization": {
            "keyword_match_rate": "<percentage of job keywords found in resume>",
            "formatting_issues": ["<ATS formatting problems to fix>"],
            "suggested_keywords_to_add": ["<specific keywords to incorporate>"]
        },
        "resume_improvements": {
            "sections_to_strengthen": ["<which resume sections need work>"],
            "quantify_achievements": ["<where to add numbers/metrics>"],
            "better_bullet_points": [
                {
                    "current": "<existing weak bullet point>",
                    "improved": "<stronger version with keywords/metrics>"
                }
            ]
        },
        "next_steps": {
            "quick_wins": ["<easy improvements you can make right now>"],
            "skill_development": ["<skills worth learning for this role>"],
            "application_strategy": ["<tips for applying to this specific job>"]
        },
        "interview_prep": {
            "your_strongest_selling_points": ["<what to emphasize in interviews>"],
            "potential_weak_spots": ["<areas you might be questioned about>"],
            "stories_to_prepare": ["<examples/stories that would impress interviewers>"]
        }
    }

    Focus on actionable advice that helps the applicant improve their chances. Be encouraging but honest about areas needing improvement.
    """

    user_prompt = f"""
    Please analyze how well my resume matches this job and tell me exactly what I need to improve to increase my chances of getting an interview.

    MY RESUME:
    ---
    {request.resume_text}
    ---

    JOB I'M APPLYING FOR:
    ---
    {request.job_description_text}
    ---

    Please provide specific, actionable advice to help me optimize my application.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3  # Lower temperature for more consistent, professional analysis
        )
        analysis_result = json.loads(response.choices[0].message.content)
        return analysis_result
    except Exception as e:
        print(f"An error occurred during the OpenAI API call: {e}")
        return {"error": f"Failed to get analysis from OpenAI: {e}"}

@app.post("/optimize/resume")
def optimize_resume(request: AnalysisRequest):
    """
    Analyzes a resume and job description to provide specific, actionable optimization suggestions.
    """
    if not client:
        return {"error": "OpenAI client is not configured correctly."}

    optimization_system_prompt = """
    You are an expert technical recruiter and resume writer with deep knowledge of ATS systems and hiring manager preferences.
    Your task is to provide concrete, actionable suggestions to improve a resume based on a target job description.
    
    Analyze the provided resume and job description, then return a JSON object with the following structure:
    
    {
        "ats_optimization": {
            "missing_keywords": ["<critical keywords to add>"],
            "keyword_placement_suggestions": ["<where and how to incorporate keywords>"],
            "formatting_improvements": ["<ATS-friendly formatting suggestions>"]
        },
        "content_improvements": {
            "bullet_point_enhancements": [
                {
                    "section": "<section name>",
                    "original_bullet": "<exact original text>",
                    "improved_bullet": "<enhanced version with metrics and impact>",
                    "improvement_rationale": "<why this change helps>"
                }
            ],
            "new_sections_to_add": ["<suggestions for additional resume sections>"],
            "sections_to_strengthen": ["<existing sections that need work>"]
        },
        "skills_and_projects": {
            "skills_to_highlight": ["<existing skills to emphasize more>"],
            "skills_to_acquire": ["<skills to learn for better fit>"],
            "project_suggestions": ["<specific project ideas to add>"]
        },
        "quantification_opportunities": [
            "<areas where candidate should add numbers, metrics, percentages>"
        ],
        "tailoring_strategy": {
            "role_specific_customizations": ["<how to customize for this specific role>"],
            "company_specific_elements": ["<how to appeal to this specific company>"],
            "industry_alignment": ["<how to better align with industry expectations>"]
        },
        "priority_actions": [
            "<top 3-5 most impactful changes to make first>"
        ]
    }

    Focus on high-impact, evidence-based recommendations. Be specific and actionable.
    """

    user_prompt = f"""
    Please provide detailed optimization suggestions for the following resume and job description.

    RESUME:
    ---
    {request.resume_text}
    ---
    
    JOB DESCRIPTION:
    ---
    {request.job_description_text}
    ---

    Provide specific, actionable optimization recommendations in the required JSON format.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": optimization_system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        optimization_result = json.loads(response.choices[0].message.content)
        return optimization_result
    except Exception as e:
        print(f"An error occurred during resume optimization: {e}")
        return {"error": f"Failed to get optimization from OpenAI: {e}"}

@app.post("/quick-score")
def quick_score(request: AnalysisRequest):
    """
    Quick match score and top improvements - like popular resume checkers
    """
    if not client:
        return {"error": "OpenAI client is not configured correctly."}

    quick_prompt = """
    You are a resume optimization tool like Jobscan or ResumeWorded. Give the user a quick assessment focused on their immediate needs.
    
    Return JSON with this structure:
    {
        "overall_score": <integer 1-100>,
        "score_breakdown": {
            "keyword_optimization": <integer 1-100>,
            "skills_match": <integer 1-100>, 
            "experience_relevance": <integer 1-100>,
            "ats_compatibility": <integer 1-100>
        },
        "top_3_improvements": [
            "<most impactful change you can make>",
            "<second most important fix>", 
            "<third priority improvement>"
        ],
        "missing_keywords": ["<5 most important keywords to add>"],
        "your_competitive_advantage": "<what makes your resume stand out for this role>",
        "biggest_concern": "<main weakness that could hurt your chances>"
    }
    
    Be direct and actionable. Focus on what the applicant needs to do to improve their match score.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": quick_prompt},
                {"role": "user", "content": f"Score my resume for this job:\n\nRESUME:\n{request.resume_text}\n\nJOB:\n{request.job_description_text}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"error": f"Failed to get quick score: {e}"}


@app.post("/skills-gap-analysis")
def skills_gap_analysis(request: AnalysisRequest):
    """
    Provides detailed skills gap analysis between resume and job requirements.
    """
    if not client:
        return {"error": "OpenAI client is not configured correctly."}

    skills_analysis_prompt = """
    You are a technical skills assessment expert. Analyze the resume and job description to provide a detailed skills gap analysis.
    
    Return a JSON object with this structure:
    {
        "technical_skills_assessment": {
            "matched_skills": [
                {
                    "skill": "<skill name>",
                    "proficiency_evidence": "<evidence from resume>",
                    "job_requirement_level": "<required level from JD>",
                    "gap_assessment": "<assessment of any gap>"
                }
            ],
            "missing_critical_skills": [
                {
                    "skill": "<missing skill>",
                    "importance": "<HIGH/MEDIUM/LOW>",
                    "learning_path": "<suggested way to acquire>"
                }
            ]
        },
        "soft_skills_analysis": {
            "demonstrated_soft_skills": ["<soft skills evident from resume>"],
            "required_soft_skills": ["<soft skills from job description>"],
            "development_areas": ["<soft skills to develop>"]
        },
        "experience_depth_analysis": {
            "senior_level_indicators": ["<evidence of senior-level work>"],
            "growth_trajectory": "<assessment of career progression>",
            "leadership_evidence": ["<examples of leadership/mentoring>"]
        },
        "industry_knowledge_assessment": {
            "relevant_domain_experience": ["<industry-specific experience>"],
            "transferable_knowledge": ["<skills that transfer across industries>"],
            "domain_gaps": ["<industry knowledge gaps>"]
        },
        "learning_and_development_plan": {
            "short_term_goals": ["<skills to develop in 3-6 months>"],
            "medium_term_goals": ["<skills to develop in 6-12 months>"],
            "certification_recommendations": ["<relevant certifications to pursue>"]
        }
    }
    """

    user_prompt = f"""
    Please provide a detailed skills gap analysis for this resume against the job requirements.

    RESUME:
    ---
    {request.resume_text}
    ---
    
    JOB DESCRIPTION:
    ---
    {request.job_description_text}
    ---
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": skills_analysis_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        skills_result = json.loads(response.choices[0].message.content)
        return skills_result
    except Exception as e:
        print(f"An error occurred during skills analysis: {e}")
        return {"error": f"Failed to get skills analysis from OpenAI: {e}"}



@app.post("/parse-resume-file")
async def parse_resume_file(file: UploadFile = File(...)):
    """
    Parse resume files (PDF, DOCX) and extract text content.
    """
    text = ""
    filename = file.filename
    try:
        if filename.endswith(".pdf"):
            with pdfplumber.open(file.file) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        elif filename.endswith(".docx"):
            document = docx.Document(file.file)
            for para in document.paragraphs:
                text += para.text + "\n"
        else:
            return {"error": "Unsupported file type. Please upload PDF or DOCX files."}
        
        return {"text": text.strip()}
    except Exception as e:
        return {"error": f"Failed to parse file: {e}"}

@app.get("/")
def read_root():
    return {
        "message": "Professional Resume Analysis Service is running",
        "endpoints": {
            "/analyze": "Complete resume optimization analysis for job seekers",
            "/quick-score": "Fast match score with top 3 improvements (like Jobscan)",
            "/optimize/resume": "Detailed resume enhancement suggestions", 
            "/skills-gap-analysis": "Skills assessment and learning roadmap",
            "/parse-resume-file": "Parse resume files (PDF/DOCX)"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "openai_configured": client is not None,
        "version": "2.0"
    }




