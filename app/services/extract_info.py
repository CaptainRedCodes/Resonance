import io
import re
import logging
from typing import List, Dict, Optional, Union
import PyPDF2
from pdfminer.high_level import extract_text
import spacy
from spacy.matcher import Matcher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ResumeParser:
    """A comprehensive resume parser that extracts structured information from PDF resumes."""
    
    def __init__(self, spacy_model: str = 'en_core_web_sm'):
        """
        Initialize the ResumeParser.
        
        Args:
            spacy_model: Name of the spacy language model to use
        """
        self.nlp = spacy.load(spacy_model)
        self.matcher = Matcher(self.nlp.vocab) if self.nlp else None
        self._setup_name_patterns()
    
    
    def _setup_name_patterns(self) -> None:
        """Setup patterns for name extraction using spacy matcher."""
        if not self.matcher:
            return
            
        # Define name patterns for different name formats
        patterns = [
            [{'POS': 'PROPN'}, {'POS': 'PROPN'}],  # First Last
            [{'POS': 'PROPN'}, {'POS': 'PROPN'}, {'POS': 'PROPN'}],  # First Middle Last
            [{'POS': 'PROPN'}, {'POS': 'PROPN'}, {'POS': 'PROPN'}, {'POS': 'PROPN'}]  # First Middle Middle Last
        ]
        
        for i, pattern in enumerate(patterns):
            self.matcher.add(f'NAME_PATTERN_{i}', [pattern])
    
    @staticmethod
    def extract_text_from_pdf(pdf_data: bytes, fallback_method: bool = True) -> str:
        """
        Extract text from PDF bytes with fallback options.
        
        Args:
            pdf_data: PDF file as bytes
            fallback_method: Whether to use pdfminer as fallback if PyPDF2 fails
            
        Returns:
            Extracted text content
        """
        text_content = []
        
        # Primary method: PyPDF2
        try:
            pdf_file = io.BytesIO(pdf_data)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text_content.append(page_text)
                except Exception as e:
                    logger.warning(f"Error extracting text from page {page_num + 1}: {e}")
                    continue
                    
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed: {e}")
        
        # Fallback method: pdfminer
        if not text_content and fallback_method:
            try:
                logger.info("Trying fallback method: pdfminer")
                pdf_file = io.BytesIO(pdf_data)
                text = extract_text(pdf_file)
                if text and text.strip():
                    text_content.append(text)
            except Exception as e:
                logger.error(f"pdfminer extraction also failed: {e}")
        
        return "\n".join(text_content)
    
    @staticmethod
    def detect_heading(line: str) -> bool:
        """
        Detect if a line is likely a heading/section title.
        
        Args:
            line: Text line to analyze
            
        Returns:
            True if line appears to be a heading
        """
        if not line or len(line.strip()) < 2:
            return False
            
        line = line.strip()
        
        # All caps and reasonable length
        if line.isupper() and 3 <= len(line) <= 50:
            return True
        
        # Common resume section headers
        section_headers = {
            'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 'CAREER',
            'EDUCATION', 'ACADEMIC BACKGROUND', 'QUALIFICATIONS',
            'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
            'SUMMARY', 'PROFILE', 'OBJECTIVE', 'ABOUT',
            'PROJECTS', 'KEY PROJECTS', 'ACHIEVEMENTS',
            'CERTIFICATIONS', 'CERTIFICATES', 'LICENSES',
            'CONTACT', 'CONTACT INFORMATION', 'PERSONAL DETAILS',
            'PUBLICATIONS', 'AWARDS', 'HONORS', 'LANGUAGES'
        }
        
        if line.upper() in section_headers:
            return True
        
        # Pattern-based detection
        heading_patterns = [
            r'^(Chapter|Section|Part|Article)\s+\d+',
            r'^\d+\.\s+[A-Z][a-zA-Z\s]+$',  # "1. Introduction"
            r'^[IVX]+\.\s+[A-Z]',  # Roman numerals
        ]
        
        for pattern in heading_patterns:
            if re.match(pattern, line, re.IGNORECASE):
                return True
        
        return False
    
    def convert_text_to_markdown(self, text: str) -> str:
        """
        Convert extracted PDF text to markdown format.
        
        Args:
            text: Raw text content from PDF
            
        Returns:
            Formatted markdown string
        """
        if not text:
            return ""
            
        lines = text.split('\n')
        markdown_lines = []
        
        for line in lines:
            original_line = line
            line = line.strip()
            
            if not line:
                markdown_lines.append("")
                continue
            
            # Convert page markers to markdown headers
            if line.startswith("--- Page") and line.endswith("---"):
                page_match = re.search(r'Page (\d+)', line)
                if page_match:
                    markdown_lines.append(f"\n## Page {page_match.group(1)}\n")
                continue
            
            # Detect headings
            if self.detect_heading(line):
                markdown_lines.append(f"### {line}\n")
            # Detect bullet points
            elif line.startswith(('•', '-', '*')) or re.match(r'^\d+\.', line):
                clean_bullet = re.sub(r'^[•\-*\d.\s]+', '', line).strip()
                markdown_lines.append(f"- {clean_bullet}")
            # Regular paragraph text
            else:
                markdown_lines.append(line)
        
        # Clean up multiple empty lines
        markdown_content = '\n'.join(markdown_lines)
        markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
        
        return markdown_content.strip()
    
    def extract_name(self, resume_text: str) -> str:
        """
        Extract candidate name from resume text using NLP.
        
        Args:
            resume_text: Full resume text
            
        Returns:
            Extracted name or empty string if not found
        """
        if not self.nlp or not self.matcher:
            logger.warning("Spacy model not loaded. Cannot extract name with NLP.")
            return self._extract_name_fallback(resume_text)
        
        # Analyze first few lines where name is typically located
        lines = resume_text.split('\n')
        text_to_analyze = '\n'.join(lines[:5])
        
        doc = self.nlp(text_to_analyze)
        matches = self.matcher(doc)
        
        if matches:
            # Get the first match (usually the most likely name)
            match_id, start, end = matches[0]
            span = doc[start:end]
            name = span.text.strip()
            
            # Basic validation - avoid common false positives
            if len(name.split()) >= 2 and not any(word.lower() in name.lower() 
                                                for word in ['resume', 'cv', 'curriculum']):
                return name
        
        return self._extract_name_fallback(resume_text)
    
    def _extract_name_fallback(self, text: str) -> str:
        """Fallback method for name extraction without NLP."""
        lines = text.split('\n')[:3]  # Check first 3 lines
        
        for line in lines:
            line = line.strip()
            # Simple heuristic: look for title case words
            if line and len(line.split()) >= 2:
                words = line.split()
                if all(word.istitle() and word.isalpha() for word in words[:3]):
                    return ' '.join(words[:3])
        
        return ""
    
    def extract_email(self, resume_text: str) -> str:
        """
        Extract email address from resume text.
        
        Args:
            resume_text: Full resume text
            
        Returns:
            First email found or empty string
        """
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        emails = re.findall(email_pattern, resume_text)
        
        if emails:
            # Return the first valid-looking email
            for email in emails:
                if '.' in email and '@' in email:
                    return email
        
        return ""
    
    def extract_phone(self, resume_text: str) -> str:
        """
        Extract phone number from resume text.
        
        Args:
            resume_text: Full resume text
            
        Returns:
            First phone number found or empty string
        """
        phone_patterns = [
            r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # US format
            r'\+?(\d{1,4})?[-.\s]?\(?(\d{3,4})\)?[-.\s]?(\d{3,4})[-.\s]?(\d{3,4})',  # International
            r'(\d{10})',  # Simple 10-digit number
        ]
        
        for pattern in phone_patterns:
            phones = re.findall(pattern, resume_text)
            if phones:
                phone = phones[0]
                if isinstance(phone, tuple):
                    # Join tuple elements and clean
                    phone_str = ''.join(filter(None, phone))
                else:
                    phone_str = phone
                
                # Basic validation
                digits_only = re.sub(r'\D', '', phone_str)
                if 10 <= len(digits_only) <= 15:
                    return phone_str
        
        return ""
    
    def extract_linkedin(self, text: str) -> str:
        """
        Extract LinkedIn profile URL from resume text.
        """
        # Match full URLs or just username
        patterns = [
            r'https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9\-_]+/?',
            r'linkedin\.com/in/[a-zA-Z0-9\-_]+',
            r'LinkedIn[:\s\-]+([a-zA-Z0-9\-_]{3,})',  # "LinkedIn: username"
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # Full URL or just username
                url = match.group(0) if match.group(0).startswith('http') else match.group(1) if match.lastindex else match.group(0)
                if not url.startswith('http'):
                    url = f"https://linkedin.com/in/{url.strip('/')}"
                return url

        return ""


    def extract_github(self, text: str) -> str:
        """
        Extract GitHub profile URL from resume text.
        """
        patterns = [
            r'https?://(?:www\.)?github\.com/[a-zA-Z0-9\-_]+/?',
            r'github\.com/[a-zA-Z0-9\-_]+',
            r'GitHub[:\s\-]+([a-zA-Z0-9\-_]{3,})',  # "GitHub: username"
            r'git[:\s\-]+([a-zA-Z0-9\-_]{3,})',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                url = match.group(0) if match.group(0).startswith('http') else match.group(1) if match.lastindex else match.group(0)
                if not url.startswith('http'):
                    url = f"https://github.com/{url.strip('/')}"
                return url

        return ""

    
    def extract_college_and_degree(self, text: str) -> List[Dict[str, str]]:
        """
        Extract education information including college and degree details.
        
        Args:
            text: Resume text or markdown
            
        Returns:
            List of education entries with college and degree information
        """
        education_list = []
        
        # Find education section
        education_patterns = [
            r'(?:###\s*)?Education\s*\n(.*?)(?:\n###|$)',
            r'(?:###\s*)?EDUCATION\s*\n(.*?)(?:\n###|$)',
            r'(?:###\s*)?Academic Background\s*\n(.*?)(?:\n###|$)',
        ]
        
        edu_text = ""
        for pattern in education_patterns:
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                edu_text = match.group(1).strip()
                break
        
        if not edu_text:
            return education_list
        
        lines = [line.strip() for line in edu_text.splitlines() if line.strip()]
        
        # Comprehensive degree patterns
        degree_patterns = [
            r"(?i)(B\.E\.|B\.Tech|B\.Sc|B\.A\.|B\.Com|BBA|BCA)",
            r"(?i)(M\.E\.|M\.Tech|M\.Sc|M\.A\.|M\.Com|MBA|MCA)",
            r"(?i)(Ph\.D|PhD|Doctorate)",
            r"(?i)(Bachelor(?:'s)?(?:\s+of)?(?:\s+\w+)*)",
            r"(?i)(Master(?:'s)?(?:\s+of)?(?:\s+\w+)*)",
            r"(?i)(Associate(?:'s)?(?:\s+of)?(?:\s+\w+)*)"
        ]
        
        for i, line in enumerate(lines):
            # Remove trailing dates
            line_clean = re.sub(
                r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\s*[-–—]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}|\d{4}\s*[-–—]\s*\d{4}',
                '',
                line
            ).strip(' -–—')
            
            # Check for degree in this line
            for degree_pattern in degree_patterns:
                degree_match = re.search(degree_pattern, line_clean)
                if degree_match:
                    degree = degree_match.group(1).strip()
                    
                    # Extract college name
                    before_degree = line_clean.split(degree)[0].strip(' -–—,')
                    college = before_degree if before_degree else (
                        lines[i-1].strip() if i > 0 else ''
                    )
                    
                    if college and degree:
                        education_list.append({
                            'college': college,
                            'degree': degree
                        })
                    break
        
        return education_list
    
    def extract_cgpa(self, text: str) -> str:
        """
        Extract CGPA/GPA from resume text.
        
        Args:
            text: Resume text
            
        Returns:
            CGPA/GPA string if found, empty string otherwise
        """
        patterns = [
            r'(?:GPA|CGPA)[:\s]*([0-9]\.?[0-9]{0,2}\s*/\s*(?:10|4)\.?0?0?)',
            r'(?:GPA|CGPA)[:\s]*([0-9]\.?[0-9]{0,2})',
            r'([0-9]\.?[0-9]{0,2})\s*/\s*(?:10|4)\.?0?0?',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                cgpa = match.group(1).strip()
                # Basic validation
                try:
                    cgpa_float = float(cgpa.split('/')[0])
                    if 0 <= cgpa_float <= 10:  # Reasonable CGPA range
                        return cgpa
                except ValueError:
                    continue
        
        return ""
    
    def clean_markdown(self, markdown: str, extracted_info: Dict) -> str:
        """
        Clean markdown by removing already extracted information.
        
        Args:
            markdown: Original markdown content
            extracted_info: Dictionary containing extracted information
            
        Returns:
            Cleaned markdown content
        """
        cleaned = markdown
        
        # Remove name
        if extracted_info.get("name"):
            cleaned = re.sub(
                rf"\b{re.escape(extracted_info['name'])}\b", 
                "", cleaned, flags=re.IGNORECASE
            )
        
        # Remove email
        if extracted_info.get("email"):
            cleaned = cleaned.replace(extracted_info["email"], "")
        
        # Remove phone
        if extracted_info.get("phone"):
            # Remove various phone formats
            phone_clean = re.sub(r'[\s\-\(\)\.]+', '', extracted_info["phone"])
            cleaned = re.sub(rf"{re.escape(extracted_info['phone'])}", "", cleaned)
            cleaned = re.sub(rf"{re.escape(phone_clean)}", "", cleaned)
        
        # Remove LinkedIn
        if extracted_info.get("linkedin"):
            cleaned = cleaned.replace(extracted_info["linkedin"], "")
            # Also remove partial LinkedIn mentions
            linkedin_variations = [
                extracted_info["linkedin"].replace("https://", ""),
                extracted_info["linkedin"].replace("https://www.", ""),
                extracted_info["linkedin"].replace("linkedin.com/in/", "")
            ]
            for variation in linkedin_variations:
                if variation:
                    cleaned = cleaned.replace(variation, "")
        
        # Remove GitHub  
        if extracted_info.get("github"):
            cleaned = cleaned.replace(extracted_info["github"], "")
            # Also remove partial GitHub mentions
            github_variations = [
                extracted_info["github"].replace("https://", ""),
                extracted_info["github"].replace("https://www.", ""),
                extracted_info["github"].replace("github.com/", "")
            ]
            for variation in github_variations:
                if variation:
                    cleaned = cleaned.replace(variation, "")
        
        # Remove education details
        for edu in extracted_info.get("education", []):
            if edu.get("college"):
                cleaned = re.sub(
                    rf"{re.escape(edu['college'])}", 
                    "", cleaned, flags=re.IGNORECASE
                )
            if edu.get("degree"):
                cleaned = re.sub(
                    rf"{re.escape(edu['degree'])}", 
                    "", cleaned, flags=re.IGNORECASE
                )
        
        # Remove CGPA
        if extracted_info.get("cgpa"):
            cleaned = re.sub(
                rf"{re.escape(extracted_info['cgpa'])}", 
                "", cleaned, flags=re.IGNORECASE
            )
        
        # Clean up extra whitespace and newlines
        cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)  # Max 2 consecutive newlines
        cleaned = re.sub(r' {2,}', ' ', cleaned)  # Multiple spaces to single
        cleaned = cleaned.strip()
        
        return cleaned
    
    def parse_resume(self, pdf_data: bytes) -> Dict[str, Union[str, List, Dict]]:
        """
        Parse resume from PDF data and extract structured information.
        
        Args:
            pdf_data: PDF file content as bytes
            
        Returns:
            Dictionary containing parsed resume data
        """
        try:
            # Extract text from PDF
            text = self.extract_text_from_pdf(pdf_data)
            
            if not text.strip():
                logger.warning("No text extracted from PDF")
                return {
                    'error': 'No text content found in PDF',
                    'clean_markdown': '',
                    'extracted_info': {}
                }
            
            # Extract structured information
            name = self.extract_name(text)
            email = self.extract_email(text)
            phone = self.extract_phone(text)
            linkedin = self.extract_linkedin(text)
            github = self.extract_github(text)
            education = self.extract_college_and_degree(text)
            cgpa = self.extract_cgpa(text)
            
            # Convert to markdown
            markdown = self.convert_text_to_markdown(text)
            
            # Prepare extracted info
            extracted_info = {
                'name': name,
                'email': email,
                'phone': phone,
                'linkedin': linkedin,
                'github': github,
                'education': education,
                'cgpa': cgpa
            }
            
            # Clean markdown
            clean_md = self.clean_markdown(markdown, extracted_info)
            
            return {
                'clean_markdown': clean_md,
                'extracted_info': extracted_info,
            }
            
        except Exception as e:
            logger.error(f"Error parsing resume: {str(e)}")
            return {
                'error': str(e),
                'clean_markdown': '',
                'extracted_info': {}
            }
