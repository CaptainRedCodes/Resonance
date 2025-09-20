# app/services/nlp_utils.py
import nltk
import spacy

def setup_nlp():
    # Force only valid resources
    required_resources = [
        ("tokenizers/punkt", "punkt"),
        ("corpora/stopwords", "stopwords"),
        ("taggers/averaged_perceptron_tagger", "averaged_perceptron_tagger"),
        ("chunkers/maxent_ne_chunker", "maxent_ne_chunker"),
        ("corpora/words", "words"),
    ]

    for path, resource in required_resources:
        try:
            nltk.data.find(path)
        except LookupError:
            nltk.download(resource)

    # Load spaCy
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        print("Please install spaCy English model: python -m spacy download en_core_web_sm")
        return None

# Initialize at import
nlp = setup_nlp()
