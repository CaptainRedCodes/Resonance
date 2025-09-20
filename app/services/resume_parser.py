import json
import re
from ..client.ai_client import client

def fix_common_json_issues(json_str: str) -> str:
    """Fix common JSON formatting issues"""
    # Remove any trailing commas before closing braces/brackets
    json_str = re.sub(r',\s*}', '}', json_str)
    json_str = re.sub(r',\s*]', ']', json_str)
    
    # Fix incomplete objects by ensuring they have closing braces
    # Count opening and closing braces
    open_braces = json_str.count('{')
    close_braces = json_str.count('}')
    
    # Add missing closing braces
    if open_braces > close_braces:
        missing_braces = open_braces - close_braces
        json_str += '}' * missing_braces
    
    # Count opening and closing brackets
    open_brackets = json_str.count('[')
    close_brackets = json_str.count(']')
    
    # Add missing closing brackets
    if open_brackets > close_brackets:
        missing_brackets = open_brackets - close_brackets
        json_str += ']' * missing_brackets
    
    return json_str

def try_extract_partial_json(json_str: str) -> dict:
    """Try to extract valid parts from malformed JSON"""
    try:
        # Try to find the technical_skills array
        technical_skills = []
        skills_match = re.search(r'"technical_skills"\s*:\s*\[(.*?)\]', json_str, re.DOTALL)
        if skills_match:
            skills_content = skills_match.group(1)
            # Extract strings from the array
            skill_matches = re.findall(r'"([^"]+)"', skills_content)
            technical_skills = skill_matches
        
        
        # For projects and experience, return empty arrays if parsing fails
        # This ensures the system continues to work even with partial data
        return {
            "technical_skills": technical_skills,
            "projects": [],
            "experience": []
        }
        
    except Exception as e:
        print(f"Partial extraction failed: {e}")
        return {
            "technical_skills": [],
            "projects": [],
            "experience": []
        }

def call_ai_for_optimization(ai_data: dict, job_description: str, additional_info: str | None) -> dict:
    """Call AI to optimize resume sections and return JSON dict"""
    prompt = f"""
You are an expert career coach and professional resume writer.

CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no extra text.

Task: Optimize these resume sections for the job description:
- technical_skills: Array of skill strings  
- projects: Array of objects with "title" and "description"
- experience: Array of objects with "role", "company", "duration", and "details"

Required JSON format (copy this structure exactly):
{{
  "technical_skills": ["skill1", "skill2"],
  "projects": [
    {{
      "title": "Project Name", 
      "description": "Brief description"
    }}
  ],
  "experience": [
    {{
      "role": "Job Title",
      "company": "Company Name", 
      "duration": "2022-2023",
      "details": ["Achievement 1", "Achievement 2"]
    }}
  ]
}}

Job Description:
{job_description}

Resume Data to Optimize:
{ai_data}

Additional Context:
{additional_info or "None"}

Return optimized JSON now:
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=prompt
        )
        
        if not response or not response.text:
            print("Empty AI response")
            return {}

        optimized_text = response.text.strip()
        print(f"Raw AI response: {optimized_text[:200]}...")  # Debug: first 200 chars

        # Clean up potential markdown formatting
        if optimized_text.startswith("```json"):
            optimized_text = optimized_text.removeprefix("```json").strip()
        elif optimized_text.startswith("```"):
            optimized_text = optimized_text.removeprefix("```").strip()
        if optimized_text.endswith("```"):
            optimized_text = optimized_text.removesuffix("```").strip()

        print(f"Cleaned AI response length: {len(optimized_text)} chars")  # Debug: length
        
        # Try to fix common JSON issues before parsing
        optimized_text = fix_common_json_issues(optimized_text)

        # Safely parse JSON
        try:
            optimized_json = json.loads(optimized_text)
            
            # Validate structure
            if not isinstance(optimized_json, dict):
                return {}
                
            # Ensure required keys exist with proper types
            required_keys = {
                "technical_skills": list,
                "projects": list,
                "experience": list
            }
            
            for key, expected_type in required_keys.items():
                if key not in optimized_json:
                    print(f"Missing key in AI response: {key}")
                    optimized_json[key] = []
                elif not isinstance(optimized_json[key], expected_type):
                    print(f"Wrong type for {key}: expected {expected_type}, got {type(optimized_json[key])}")
                    optimized_json[key] = []
                    
            return optimized_json
            
        except json.JSONDecodeError as e:
            
            # Try to extract valid parts if possible
            return try_extract_partial_json(optimized_text)
            
    except Exception as e:
        print(f"Error in AI call: {e}")
        return {
            "technical_skills": [],
            "projects": [],
            "experience": []
        }