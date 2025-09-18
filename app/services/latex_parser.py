from ..client.ai_client import client


async def call_ai_for_optimization(latex_resume: str, job_description: str, additional_info: str) -> str:
    """Call AI to optimize LaTeX resume"""
    prompt = f"""
        You are an expert career coach and professional resume writer specializing in LaTeX.
        Your task is to optimize the provided LaTeX resume to perfectly match the given job description.
        Ensure the final output is ONLY the complete, raw, and compilable LaTeX code. 
        Do not add any explanations, comments, or markdown formatting.

        **Job Description:**
        ---
        {job_description}
        ---

        **Original LaTeX Resume Code:**
        ---
        {latex_resume}
        ---

        **Optimized LaTeX Resume Code:**
        """

    response = client.models.generate_content(
        model='gemini-2.0-flash-001', contents=prompt)
    if not response or not response.text:
        return ""
    optimized_code = response.text.strip()

    if optimized_code.startswith("```latex"):
        optimized_code = optimized_code.removeprefix("```latex\n")
    elif optimized_code.startswith("```"):
        optimized_code = optimized_code.removeprefix("```\n")
        
    if optimized_code.endswith("```"):
        optimized_code = optimized_code.removesuffix("```")
        
    optimized_code = optimized_code.strip()
    return optimized_code
    