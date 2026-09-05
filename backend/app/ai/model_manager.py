import threading
import numpy as np

class FallbackEmbedder:
    """Fast, zero-download TF-IDF / character n-gram cosine similarity embedder fallback"""
    def encode(self, texts):
        from sklearn.feature_extraction.text import TfidfVectorizer
        vec = TfidfVectorizer(ngram_range=(1, 2), max_features=384)
        try:
            matrix = vec.fit_transform(texts).toarray()
            # Normalize
            norms = np.linalg.norm(matrix, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return matrix / norms
        except Exception:
            return np.zeros((len(texts), 384))

class FallbackNLP:
    """Lightweight fallback regex entity extractor if spacy model is pending"""
    def __call__(self, text):
        class Ent:
            def __init__(self, text, label):
                self.text = text
                self.label_ = label
        class Doc:
            def __init__(self, t):
                self.text = t
                self.ents = []
                lines = [line.strip() for line in t.split('\n') if line.strip()]
                if lines:
                    # First line likely candidate name
                    first_words = lines[0].split()
                    if 1 <= len(first_words) <= 4:
                        self.ents.append(Ent(lines[0], "PERSON"))
        return Doc(text)

class ModelManager:
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
                try:
                    import spacy
                    try:
                        self._nlp = spacy.load("en_core_web_sm")
                    except OSError:
                        import subprocess
                        subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=False)
                        self._nlp = spacy.load("en_core_web_sm")
                except Exception as e:
                    print(f"Using fallback NLP extractor: {e}")
                    self._nlp = FallbackNLP()
        return self._nlp

    def get_embedder(self):
        with self._init_lock:
            if self._embedder is None:
                try:
                    from sentence_transformers import SentenceTransformer
                    self._embedder = SentenceTransformer('all-MiniLM-L6-v2')
                except Exception as e:
                    print(f"Using fallback TF-IDF embedder: {e}")
                    self._embedder = FallbackEmbedder()
        return self._embedder
