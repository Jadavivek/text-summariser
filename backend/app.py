from flask import Flask, request, jsonify
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.probability import FreqDist
from string import punctuation
from heapq import nlargest
import re
import os

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)

def vivek_clean_text(text):
    # Custom text cleaning with unique implementation
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove special characters but keep sentence endings
    text = re.sub(r'[^\w\s.!?]', '', text)
    return text

def vivek_extractive_summarize(text, vivek_ratio=0.3):
    # Custom implementation of extractive summarization
    vivek_sentences = sent_tokenize(text)
    
    if len(vivek_sentences) <= 3:
        return ' '.join(vivek_sentences)
    
    # Custom stopwords handling
    vivek_stop_words = set(stopwords.words('english') + list(punctuation))
    vivek_words = word_tokenize(text.lower())
    vivek_meaningful_words = [word for word in vivek_words if word not in vivek_stop_words]
    
    # Custom frequency calculation
    vivek_word_freq = FreqDist(vivek_meaningful_words)
    
    # Custom sentence scoring
    vivek_sentence_scores = {}
    for vivek_idx, vivek_sentence in enumerate(vivek_sentences):
        vivek_sentence_words = word_tokenize(vivek_sentence.lower())
        vivek_score = sum(vivek_word_freq[word] for word in vivek_sentence_words)
        vivek_sentence_scores[vivek_idx] = vivek_score
    
    # Custom summary length calculation
    vivek_num_sentences = max(1, int(len(vivek_sentences) * vivek_ratio))
    
    # Get top sentences with custom sorting
    vivek_top_sentences = nlargest(vivek_num_sentences, vivek_sentence_scores, key=vivek_sentence_scores.get)
    vivek_top_sentences.sort()
    
    return ' '.join([vivek_sentences[i] for i in vivek_top_sentences])

def vivek_frequency_summarize(text, vivek_ratio=0.3):
    # Custom implementation of frequency-based summarization
    vivek_sentences = sent_tokenize(text)
    
    if len(vivek_sentences) <= 3:
        return ' '.join(vivek_sentences)
    
    # Custom word filtering
    vivek_stop_words = set(stopwords.words('english') + list(punctuation))
    vivek_words = word_tokenize(text.lower())
    vivek_filtered_words = [word for word in vivek_words if word not in vivek_stop_words]
    
    # Custom frequency analysis
    vivek_word_freq = FreqDist(vivek_filtered_words)
    vivek_important_words = [word for word, _ in vivek_word_freq.most_common(int(len(vivek_word_freq) * vivek_ratio))]
    
    # Custom sentence scoring
    vivek_sentence_scores = {}
    for vivek_idx, vivek_sentence in enumerate(vivek_sentences):
        vivek_sentence_words = word_tokenize(vivek_sentence.lower())
        vivek_score = sum(1 for word in vivek_sentence_words if word in vivek_important_words)
        vivek_sentence_scores[vivek_idx] = vivek_score
    
    # Custom summary length calculation
    vivek_num_sentences = max(1, int(len(vivek_sentences) * vivek_ratio))
    
    # Get top sentences with custom sorting
    vivek_top_sentences = nlargest(vivek_num_sentences, vivek_sentence_scores, key=vivek_sentence_scores.get)
    vivek_top_sentences.sort()
    
    return ' '.join([vivek_sentences[i] for i in vivek_top_sentences])

@app.route('/summarize', methods=['POST'])
def summarize():
    vivek_data = request.json
    
    if not vivek_data or 'text' not in vivek_data:
        return jsonify({'error': 'No text provided'}), 400
    
    vivek_text = vivek_data['text']
    vivek_ratio = float(vivek_data.get('ratio', 0.3))
    vivek_method = vivek_data.get('method', 'extractive')
    
    # Preprocess the text
    vivek_text = vivek_clean_text(vivek_text)
    
    try:
        if vivek_method == 'extractive':
            vivek_summary = vivek_extractive_summarize(vivek_text, vivek_ratio)
        elif vivek_method == 'frequency':
            vivek_summary = vivek_frequency_summarize(vivek_text, vivek_ratio)
        else:
            return jsonify({'error': 'Invalid summarization method'}), 400
        
        return jsonify({'summary': vivek_summary})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
