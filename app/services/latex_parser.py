import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
from ..models.resume import ContactInfo,ResumeData,ExperienceItem,EducationItem,ProjectItem

class ComprehensiveLatexExtractor:
    """Extracts all possible data from LaTeX resume"""
    
    def __init__(self):
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        self.phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        self.url_pattern = r'https?://[^\s}]+'
        self.github_pattern = r'github\.com/[\w-]+'
        self.linkedin_pattern = r'linkedin\.com/in/[\w-]+'
    
    def extract_all_data(self, file_path: str) -> ResumeData:
        """Extract comprehensive data from LaTeX resume file"""
        content = Path(file_path).read_text(encoding='utf-8', errors='ignore')
        return self.extract_all_data_from_content(content)
    
    def extract_all_data_from_content(self, content: str) -> ResumeData:
        """Extract comprehensive data from LaTeX resume content"""
        
        # Initialize data structure
        resume_data = ResumeData(
            contact_info=ContactInfo(),
            sections={},
            experience=[],
            education=[],
            projects=[],
            skills={},
            certifications=[],
            awards=[],
            publications=[],
            languages=[],
            metadata={}
        )
        
        # Extract raw sections first
        resume_data.sections = self._extract_raw_sections(content)
        
        # Extract specific data types
        resume_data.contact_info = self._extract_contact_info(content)
        resume_data.experience = self._extract_experience(content)
        resume_data.education = self._extract_education(content)
        resume_data.projects = self._extract_projects(content)
        resume_data.skills = self._extract_skills(content)
        resume_data.certifications = self._extract_certifications(content)
        resume_data.awards = self._extract_awards(content)
        resume_data.publications = self._extract_publications(content)
        resume_data.languages = self._extract_languages(content)
        resume_data.metadata = self._extract_metadata(content, file_path=None)
        
        return resume_data
    
    def _extract_raw_sections(self, content: str) -> Dict[str, str]:
        """Extract all sections as raw text"""
        # Remove comments
        content = re.sub(r'%.*$', '', content, flags=re.MULTILINE)
        
        sections = {}
        section_matches = re.finditer(r'\\section\*?\{([^}]+)\}(.*?)(?=\\section|\Z)', 
                                     content, re.DOTALL | re.IGNORECASE)
        
        for match in section_matches:
            section_name = match.group(1).strip()
            section_content = match.group(2).strip()
            sections[section_name] = section_content
        
        return sections
    
    def _extract_contact_info(self, content: str) -> ContactInfo:
        """Extract contact information"""
        contact = ContactInfo()
        
        name_match = re.search(r'\\name\{([^}]+)\}', content, re.IGNORECASE)
        if name_match:
            contact.name = self._clean_text(name_match.group(1))
        else:
            author_match = re.search(r'\\author\{([^}]+)\}', content, re.IGNORECASE)
            if author_match:
                contact.name = self._clean_text(author_match.group(1))
        
        # Extract email
        email_matches = re.findall(self.email_pattern, content)
        if email_matches:
            contact.email = email_matches[0]
        
        # Extract phone
        phone_matches = re.findall(self.phone_pattern, content)
        if phone_matches:
            contact.phone = phone_matches[0][0] + phone_matches[0][1] if isinstance(phone_matches[0], tuple) else phone_matches[0]
        
        # Extract URLs
        url_matches = re.findall(self.url_pattern, content)
        github_matches = [url for url in url_matches if 'github.com' in url]
        linkedin_matches = [url for url in url_matches if 'linkedin.com' in url]
        website_matches = [url for url in url_matches if 'github.com' not in url and 'linkedin.com' not in url]
        
        if github_matches:
            contact.github = github_matches[0]
        if linkedin_matches:
            contact.linkedin = linkedin_matches[0]
        if website_matches:
            contact.website = website_matches[0]
        
        # Extract address (look for common address patterns)
        address_patterns = [
            r'\\address\{([^}]+)\}',
            r'\\location\{([^}]+)\}',
            r'\b\d+\s+[A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Za-z]{2}\s*\d{5}'
        ]
        for pattern in address_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                contact.address = self._clean_text(match.group(1))
                break
        
        return contact
    
    def _extract_experience(self, content: str) -> List[ExperienceItem]:
        """Extract work experience"""
        experience_items = []
        
        # Look for experience sections
        exp_sections = ['experience', 'work experience', 'professional experience', 'employment']
        
        for section_name in exp_sections:
            section_content = self._get_section_content(content, section_name)
            if section_content:
                items = self._parse_experience_items(section_content)
                experience_items.extend(items)
        
        return experience_items
    
    def _parse_experience_items(self, content: str) -> List[ExperienceItem]:
        """Parse individual experience items"""
        items = []
        
        item_patterns = [
            r'\\item\s*(.*?)(?=\\item|\Z)',
            r'\\position\{([^}]+)\}\s*\\company\{([^}]+)\}(.*?)(?=\\position|\Z)',
            r'\\job\{([^}]+)\}\s*\\employer\{([^}]+)\}(.*?)(?=\\job|\Z)',
        ]
        
        for pattern in item_patterns:
            matches = re.finditer(pattern, content, re.DOTALL)
            for match in matches:
                exp_item = ExperienceItem()
                
                if len(match.groups()) == 1:
                    full_text = match.group(1)
                    exp_item = self._parse_experience_text(full_text)
                else:
                    exp_item.title = self._clean_text(match.group(1))
                    exp_item.company = self._clean_text(match.group(2))
                    if len(match.groups()) > 2:
                        details = match.group(3)
                        exp_item = self._extract_experience_details(exp_item, details)
                
                if exp_item.title or exp_item.company:
                    items.append(exp_item)
        
        return items
    
    
    def _extract_experience_details(self, exp_item: ExperienceItem, details: str) -> ExperienceItem:
        """Extract additional details like dates, location, description from experience details"""
        clean_details = self._clean_latex_content(details)
        
        # Extract dates
        date_pattern = r'\b(\d{4}|\w+\s+\d{4})\s*[-–]\s*(\d{4}|\w+\s+\d{4}|present|current)\b'
        date_match = re.search(date_pattern, clean_details, re.IGNORECASE)
        if date_match:
            exp_item.start_date = date_match.group(1)
            exp_item.end_date = date_match.group(2)
        
        # Extract location (look for city, state patterns)
        location_pattern = r'\b([A-Za-z\s]+,\s*[A-Za-z]{2,})\b'
        location_match = re.search(location_pattern, clean_details)
        if location_match:
            exp_item.location = location_match.group(1)
        
        # Extract description points (split by newlines or bullet points)
        description_lines = re.split(r'[\n•]', clean_details)
        description_lines = [line.strip() for line in description_lines if line.strip() and not re.match(date_pattern, line)]
        if description_lines:
            exp_item.description = description_lines
        
        return exp_item
    
    def _parse_experience_text(self, text: str) -> ExperienceItem:
        """Parse experience from unstructured text"""
        exp_item = ExperienceItem()
        
        # Clean text
        clean_text = self._clean_latex_content(text)
        lines = [line.strip() for line in clean_text.split('\n') if line.strip()]
        
        if lines:
            # First line usually contains title and company
            first_line = lines[0]
            
            # Look for common separators
            if ' at ' in first_line:
                parts = first_line.split(' at ', 1)
                exp_item.title = parts[0].strip()
                exp_item.company = parts[1].strip()
            elif ' - ' in first_line:
                parts = first_line.split(' - ', 1)
                exp_item.title = parts[0].strip()
                exp_item.company = parts[1].strip()
            else:
                exp_item.title = first_line
            
            # Extract dates
            date_pattern = r'\b(\d{4}|\w+\s+\d{4})\s*[-–]\s*(\d{4}|\w+\s+\d{4}|present|current)\b'
            for line in lines:
                date_match = re.search(date_pattern, line, re.IGNORECASE)
                if date_match:
                    exp_item.start_date = date_match.group(1)
                    exp_item.end_date = date_match.group(2)
                    break
            
            # Rest are descriptions
            exp_item.description = lines[1:] if len(lines) > 1 else []
        
        return exp_item
    
    def _extract_education(self, content: str) -> List[EducationItem]:
        """Extract education information"""
        education_items = []
        
        edu_sections = ['education', 'academic background', 'qualifications']
        
        for section_name in edu_sections:
            section_content = self._get_section_content(content, section_name)
            if section_content:
                items = self._parse_education_items(section_content)
                education_items.extend(items)
        
        return education_items
    
    def _parse_education_items(self, content: str) -> List[EducationItem]:
        """Parse education items"""
        items = []
        
        # Look for degree patterns
        degree_patterns = [
            r'\\education\{([^}]+)\}\{([^}]+)\}(.*?)(?=\\education|\Z)',
            r'(Bachelor|Master|PhD|B\.S\.|M\.S\.|Ph\.D\.)[^\\]*(?:\\\\|\n)',
        ]
        
        for pattern in degree_patterns:
            matches = re.finditer(pattern, content, re.DOTALL | re.IGNORECASE)
            for match in matches:
                edu_item = EducationItem()
                
                if len(match.groups()) == 3:  # Structured format
                    edu_item.degree = self._clean_text(match.group(1))
                    edu_item.institution = self._clean_text(match.group(2))
                    details = match.group(3)
                    # Extract additional details from the details section
                else:  # Unstructured
                    text = match.group(0)
                    edu_item = self._parse_education_text(text)
                
                items.append(edu_item)
        
        return items
    
    def _parse_education_text(self, text: str) -> EducationItem:
        """Parse education from text"""
        edu_item = EducationItem()
        clean_text = self._clean_latex_content(text)
        
        # Extract degree
        degree_match = re.search(r'\b(Bachelor|Master|PhD|B\.S\.|M\.S\.|Ph\.D\.|B\.A\.|M\.A\.)[^,\n]*', clean_text, re.IGNORECASE)
        if degree_match:
            edu_item.degree = degree_match.group(0).strip()
        
        # Extract GPA
        gpa_match = re.search(r'GPA[:\s]*(\d+\.?\d*)', clean_text, re.IGNORECASE)
        if gpa_match:
            edu_item.gpa = gpa_match.group(1)
        
        # Extract graduation date
        date_pattern = r'\b(\d{4}|\w+\s+\d{4})\b'
        dates = re.findall(date_pattern, clean_text)
        if dates:
            edu_item.graduation_date = dates[-1]  # Usually the last date
        
        return edu_item
    
    def _extract_projects(self, content: str) -> List[ProjectItem]:
        """Extract projects"""
        projects = []
        
        project_sections = ['projects', 'personal projects', 'academic projects']
        
        for section_name in project_sections:
            section_content = self._get_section_content(content, section_name)
            if section_content:
                items = self._parse_project_items(section_content)
                projects.extend(items)
        
        return projects
    
    def _parse_project_items(self, content: str) -> List[ProjectItem]:
        """Parse project items"""
        items = []
        
        # Look for project patterns
        project_patterns = [
            r'\\project\{([^}]+)\}(.*?)(?=\\project|\Z)',
            r'\\item\s*\\textbf\{([^}]+)\}(.*?)(?=\\item|\Z)',
            r'\\subsection\{([^}]+)\}(.*?)(?=\\subsection|\Z)',
            r'\\textbf\{([^}]+)\}(.*?)(?=\\textbf|\Z)',
        ]
        
        for pattern in project_patterns:
            matches = re.finditer(pattern, content, re.DOTALL)
            for match in matches:
                project = ProjectItem()
                project.name = self._clean_text(match.group(1))
                
                details = match.group(2) if len(match.groups()) > 1 else ""
                project.description = self._clean_latex_content(details).strip()
                
                # Extract technologies using smarter pattern matching
                project.technologies = self._extract_technologies(details)
                
                # Extract project URL if present
                project.url = self._extract_project_url(details)
                
                # Extract project date
                project.date = self._extract_project_date(details)
                
                items.append(project)
        
        return items

    def _extract_technologies(self, text: str) -> List[str]:
        """Extract technologies from project text using pattern recognition"""
        technologies = []
        
        # Common patterns where technologies are mentioned
        tech_patterns = [
            r'(?:using|with|built with|technologies?:?|stack:?|tools?:?)\s*([^.!?\n]+)',
            r'(?:implemented in|developed using|written in)\s*([^.!?\n]+)',
            r'(?:tech stack|technology stack):?\s*([^.!?\n]+)',
            r'(?:languages?|frameworks?|libraries?):?\s*([^.!?\n]+)'
        ]
        
        clean_text = self._clean_latex_content(text).lower()
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, clean_text, re.IGNORECASE)
            for match in matches:
                # Split by common separators
                tech_list = re.split(r'[,;&\n]|\s+and\s+|\s+or\s+', match)
                for tech in tech_list:
                    tech = tech.strip()
                    if tech and len(tech) > 1:
                        # Clean up common words and keep actual technologies
                        tech = self._clean_technology_name(tech)
                        if tech and tech not in technologies:
                            technologies.append(tech)
        
        # If no patterns found, try to extract known technology formats
        if not technologies:
            technologies = self._extract_tech_by_format(clean_text)
        
        return technologies

    def _clean_technology_name(self, tech: str) -> str:
        """Clean and validate technology names"""
        # Remove common non-tech words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'with', 'using', 'for', 'to', 'in', 'on', 'at', 'by'}
        
        tech = tech.strip().title()
        
        # Skip if it's just a stop word
        if tech.lower() in stop_words:
            return ""
        
        # Skip if too short or too long
        if len(tech) < 2 or len(tech) > 30:
            return ""
        
        # Skip if it contains only numbers or common words
        if tech.isdigit() or tech.lower() in ['version', 'latest', 'new', 'old']:
            return ""
        
        # Fix common technology name formats
        tech_mappings = {
            'Javascript': 'JavaScript',
            'Nodejs': 'Node.js',
            'Reactjs': 'React.js',
            'Vuejs': 'Vue.js',
            'Mongodb': 'MongoDB',
            'Postgresql': 'PostgreSQL',
            'Mysql': 'MySQL',
            'Html': 'HTML',
            'Css': 'CSS',
            'Api': 'API',
            'Rest': 'REST',
            'Json': 'JSON',
            'Xml': 'XML'
        }
        
        return tech_mappings.get(tech, tech)

    def _extract_tech_by_format(self, text: str) -> List[str]:
        """Extract technologies by recognizing common tech name formats"""
        technologies = []
        
        # Patterns for common technology formats
        tech_format_patterns = [
            r'\b[A-Z][a-z]*\.js\b',  # React.js, Vue.js, etc.
            r'\b[A-Z]{2,}\b',        # HTML, CSS, API, REST, etc.
            r'\b[A-Z][a-z]+(?:SQL|DB)\b',  # MySQL, PostgreSQL, etc.
            r'\b(?:Python|Java|JavaScript|TypeScript|Go|Rust|Swift|Kotlin|Scala)\b',  # Languages
            r'\b(?:React|Angular|Vue|Django|Flask|Spring|Express)\b',  # Frameworks
            r'\b(?:Docker|Kubernetes|Git|AWS|Azure|GCP)\b',  # Tools/Platforms
        ]
        
        for pattern in tech_format_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                tech = self._clean_technology_name(match)
                if tech and tech not in technologies:
                    technologies.append(tech)
        
        return technologies

    def _extract_project_url(self, text: str) -> Optional[str]:
        """Extract project URL from text"""
        url_patterns = [
            r'https?://[^\s}]+',
            r'github\.com/[\w-]+/[\w-]+',
            r'gitlab\.com/[\w-]+/[\w-]+',
        ]
        
        for pattern in url_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        
        return None

    def _extract_project_date(self, text: str) -> Optional[str]:
        """Extract project date from text"""
        date_patterns = [
            r'\b(\d{4})\b',  # Year
            r'\b(\w+\s+\d{4})\b',  # Month Year
            r'\b(\d{4}\s*[-–]\s*\d{4})\b',  # Year range
            r'\b(\w+\s+\d{4}\s*[-–]\s*\w+\s+\d{4})\b',  # Full date range
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def _extract_skills(self, content: str) -> Dict[str, List[str]]:
        """Extract skills by category"""
        skills = {}
        
        skill_sections = ['skills', 'technical skills', 'core competencies']
        
        for section_name in skill_sections:
            section_content = self._get_section_content(content, section_name)
            if section_content:
                parsed_skills = self._parse_skills(section_content)
                skills.update(parsed_skills)
        
        return skills
    
    def _parse_skills(self, content: str) -> Dict[str, List[str]]:
        """Parse skills from content"""
        skills = {}
        
        # Look for categorized skills
        category_pattern = r'\\textbf\{([^}]+)\}[:\s]*(.*?)(?=\\textbf|\Z)'
        matches = re.finditer(category_pattern, content, re.DOTALL)
        
        for match in matches:
            category = self._clean_text(match.group(1))
            skill_text = self._clean_latex_content(match.group(2))
            
            # Split by common separators
            skill_list = re.split(r'[,;•\n]', skill_text)
            skill_list = [skill.strip() for skill in skill_list if skill.strip()]
            
            if skill_list:
                skills[category] = skill_list
        
        # If no categories found, treat as general skills
        if not skills:
            clean_content = self._clean_latex_content(content)
            skill_list = re.split(r'[,;•\n]', clean_content)
            skill_list = [skill.strip() for skill in skill_list if skill.strip()]
            if skill_list:
                skills['General'] = skill_list
        
        return skills
    
    def _extract_certifications(self, content: str) -> List[str]:
        """Extract certifications"""
        cert_sections = ['certifications', 'certificates']
        certifications = []
        
        for section_name in cert_sections:
            section_content = self._get_section_content(content, section_name)
            if section_content:
                clean_content = self._clean_latex_content(section_content)
                cert_list = re.split(r'[•\n]', clean_content)
                cert_list = [cert.strip() for cert in cert_list if cert.strip()]
                certifications.extend(cert_list)
        
        return certifications
    
    def _extract_awards(self, content: str) -> List[str]:
        """Extract awards and achievements"""
        award_sections = ['awards', 'achievements', 'honors']
        awards = []
        
        for section_name in award_sections:
            section_content = self._get_section_content(content, section_name)
            if section_content:
                clean_content = self._clean_latex_content(section_content)
                award_list = re.split(r'[•\n]', clean_content)
                award_list = [award.strip() for award in award_list if award.strip()]
                awards.extend(award_list)
        
        return awards
    
    def _extract_publications(self, content: str) -> List[str]:
        """Extract publications"""
        pub_sections = ['publications', 'research', 'papers']
        publications = []
        
        for section_name in pub_sections:
            section_content = self._get_section_content(content, section_name)
            if section_content:
                clean_content = self._clean_latex_content(section_content)
                pub_list = re.split(r'[•\n]', clean_content)
                pub_list = [pub.strip() for pub in pub_list if pub.strip()]
                publications.extend(pub_list)
        
        return publications
    
    def _extract_languages(self, content: str) -> List[str]:
        """Extract languages"""
        lang_sections = ['languages']
        languages = []
        
        for section_name in lang_sections:
            section_content = self._get_section_content(content, section_name)
            if section_content:
                clean_content = self._clean_latex_content(section_content)
                lang_list = re.split(r'[,;•\n]', clean_content)
                lang_list = [lang.strip() for lang in lang_list if lang.strip()]
                languages.extend(lang_list)
        
        return languages
    
    def _extract_metadata(self, content: str, file_path: str) -> Dict[str, Any]:
        """Extract metadata about the document"""
        metadata = {
            'file_path': file_path,
            'extracted_at': datetime.now().isoformat(),
            'total_sections': len(self._extract_raw_sections(content)),
            'document_class': None,
            'packages_used': []
        }
        
        # Extract document class
        doc_class_match = re.search(r'\\documentclass(?:\[[^\]]*\])?\{([^}]+)\}', content)
        if doc_class_match:
            metadata['document_class'] = doc_class_match.group(1)
        
        # Extract packages
        package_matches = re.findall(r'\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}', content)
        metadata['packages_used'] = list(set(package_matches))
        
        return metadata
    
    def _get_section_content(self, content: str, section_name: str) -> Optional[str]:
        """Get content of a specific section"""
        pattern = rf'\\section\*?\{{{re.escape(section_name)}\}}(.*?)(?=\\section|\Z)'
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        return match.group(1) if match else None
    
    def _clean_latex_content(self, content: str) -> str:
        """Clean LaTeX commands from content"""
        # Remove common LaTeX commands but keep content
        content = re.sub(r'\\textbf\{([^}]*)\}', r'\1', content)
        content = re.sub(r'\\textit\{([^}]*)\}', r'\1', content)
        content = re.sub(r'\\emph\{([^}]*)\}', r'\1', content)
        content = re.sub(r'\\href\{[^}]*\}\{([^}]*)\}', r'\1', content)
        content = re.sub(r'\\url\{([^}]*)\}', r'\1', content)
        
        # Remove other commands
        content = re.sub(r'\\[a-zA-Z]+\*?(?:\[[^\]]*\])*(?:\{[^}]*\})*', '', content)
        content = re.sub(r'\\\\', '\n', content)
        content = re.sub(r'\s+', ' ', content)
        
        return content.strip()
    
    def _clean_text(self, text: str) -> str:
        """Basic text cleaning"""
        return re.sub(r'\s+', ' ', text).strip()
    
    def to_json(self, resume_data: ResumeData) -> str:
        """Convert resume data to JSON"""
        return json.dumps(asdict(resume_data), indent=2, default=str)


def extract_comprehensive_resume_data(content: str) -> ResumeData:
    """Extract resume data from raw LaTeX content"""
    extractor = ComprehensiveLatexExtractor()
    return extractor.extract_all_data_from_content(content)  