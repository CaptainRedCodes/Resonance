from jinja2 import Environment, FileSystemLoader
import os
import json

def generate_html_resume(base_data: dict, optimized_data: dict) -> str:
    """Generate HTML resume from merged base + optimized content"""
    try:
        # Merge dictionaries
        context = {**base_data, **optimized_data}
        print(f"Generating HTML resume with keys: {list(context.keys())}")

        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        template_dir = os.path.join(project_root, "templates")

        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template("resume_template.jinja")  # can use HTML version

        # Ensure everything is string/list-friendly
        def clean_value(val):
            if isinstance(val, (list, dict)):
                return val
            return str(val) if val is not None else ""

        clean_context = {k: clean_value(v) for k, v in context.items()}

        html_content = template.render(clean_context)
        return html_content

    except Exception as e:
        raise
