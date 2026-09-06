import threading
import os

class FallbackEmbedder:
    """Production-grade TF-IDF embedder using combined character + word n-grams.

    Delivers meaningful cosine similarity scores for resume-job matching
    without requiring PyTorch or sentence-transformers (~400 MB).
    Uses <15 MB RAM on-demand.
    """
    def encode(self, texts):
        import numpy as np
        from sklearn.feature_extraction.text import TfidfVectorizer

        if not texts or all(not t.strip() for t in texts):
            return np.zeros((len(texts), 512))

        try:
            # Character n-gram: captures partial skill name matches (e.g. "Pyt" in "Python")
            char_vec = TfidfVectorizer(
                analyzer='char_wb',
                ngram_range=(3, 5),
                max_features=512,
                sublinear_tf=True,
                strip_accents='unicode'
            )
            char_mat = char_vec.fit_transform(texts).toarray()

            # Word n-gram: captures exact and bigram technology term matches
            word_vec = TfidfVectorizer(
                analyzer='word',
                ngram_range=(1, 2),
                max_features=512,
                sublinear_tf=True,
                stop_words='english'
            )
            word_mat = word_vec.fit_transform(texts).toarray()

            # Weight char similarity higher — better for tech vocabulary matching
            combined = np.hstack([char_mat * 0.6, word_mat * 0.4])

            # L2 normalize for cosine similarity
            norms = np.linalg.norm(combined, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return combined / norms
        except Exception:
            return np.zeros((len(texts), 512))

class FallbackNLP:
    """Lightweight fallback regex entity extractor when spaCy is unavailable.
    
    Extracts candidate name from the first few lines of resume text
    using heuristic rules. Works within <1MB RAM.
    """
    def __call__(self, text):
        import re
        
        class Ent:
            def __init__(self, text, label):
                self.text = text
                self.label_ = label
        
        class Doc:
            def __init__(self, t):
                self.text = t
                self.ents = []
                lines = [line.strip() for line in t.split('\n') if line.strip()]
                for line in lines[:3]:
                    # Skip lines with emails, URLs, phone numbers
                    if re.search(r'[@\d:/]', line):
                        continue
                    words = line.split()
                    if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                        self.ents.append(Ent(line, "PERSON"))
                        break
                if not self.ents and lines:
                    first_words = lines[0].split()
                    if 1 <= len(first_words) <= 4 and not re.search(r'[@\d:/]', lines[0]):
                        self.ents.append(Ent(lines[0], "PERSON"))
        
        return Doc(text)


def is_lightweight_mode() -> bool:
    return bool(os.environ.get('RENDER') or os.environ.get('LIGHTWEIGHT_AI'))


class ModelManager:
    """Singleton AI model manager with memory-aware loading.
    
    On Render's 512MB free tier, always uses lightweight fallbacks.
    On local/high-memory environments, attempts to load spaCy and 
    SentenceTransformers if installed.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ModelManager, cls).__new__(cls)
                cls._instance._nlp = None
                cls._instance._embedder = None
                cls._instance._init_lock = threading.Lock()
        return cls._instance

    def get_nlp(self):
        with self._init_lock:
            if self._nlp is None:
                if is_lightweight_mode():
                    print("ModelManager: Using lightweight NLP (production memory-safe mode)")
                    self._nlp = FallbackNLP()
                else:
                    try:
                        import spacy
                        try:
                            self._nlp = spacy.load("en_core_web_sm")
                            print("ModelManager: spaCy en_core_web_sm loaded")
                        except OSError:
                            import subprocess
                            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=False)
                            self._nlp = spacy.load("en_core_web_sm")
                    except Exception as e:
                        print(f"ModelManager: Using fallback NLP extractor: {e}")
                        self._nlp = FallbackNLP()
        return self._nlp

    def get_embedder(self):
        with self._init_lock:
            if self._embedder is None:
                if is_lightweight_mode():
                    print("ModelManager: Using lightweight TF-IDF embedder (production memory-safe mode)")
                    self._embedder = FallbackEmbedder()
                else:
                    try:
                        from sentence_transformers import SentenceTransformer
                        self._embedder = SentenceTransformer('all-MiniLM-L6-v2')
                        print("ModelManager: SentenceTransformer all-MiniLM-L6-v2 loaded")
                    except Exception as e:
                        print(f"ModelManager: Using fallback TF-IDF embedder: {e}")
                        self._embedder = FallbackEmbedder()
        return self._embedder
