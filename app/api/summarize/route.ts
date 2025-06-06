import { type NextRequest, NextResponse } from "next/server"

// JavaScript implementation of the summarization algorithms
function preprocessText(text: string): string {
  // Remove extra whitespace and normalize
  return text.replace(/\s+/g, " ").trim()
}

function tokenizeSentences(text: string): string[] {
  // Simple sentence tokenization (not as robust as NLTK but works for basic cases)
  return text.match(/[^.!?]+[.!?]+/g) || []
}

function tokenizeWords(text: string): string[] {
  // Simple word tokenization
  return text.toLowerCase().match(/\b\w+\b/g) || []
}

// English stopwords list
const STOPWORDS = new Set([
  "i",
  "me",
  "my",
  "myself",
  "we",
  "our",
  "ours",
  "ourselves",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "a",
  "an",
  "the",
  "and",
  "but",
  "if",
  "or",
  "because",
  "as",
  "until",
  "while",
  "of",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
])

function removeStopwords(words: string[]): string[] {
  return words.filter((word) => !STOPWORDS.has(word) && word.length > 1)
}

function calculateWordFrequencies(words: string[]): Map<string, number> {
  const frequencies = new Map<string, number>()
  for (const word of words) {
    frequencies.set(word, (frequencies.get(word) || 0) + 1)
  }
  return frequencies
}

function extractiveSummarize(text: string, ratio = 0.3): string {
  const sentences = tokenizeSentences(text)

  // If there are very few sentences, return them all
  if (sentences.length <= 3) {
    return sentences.join(" ")
  }

  const words = tokenizeWords(text)
  const filteredWords = removeStopwords(words)
  const frequencies = calculateWordFrequencies(filteredWords)

  // Score sentences based on word frequencies
  const sentenceScores = new Map<number, number>()
  sentences.forEach((sentence, i) => {
    const sentenceWords = tokenizeWords(sentence)
    let score = 0
    sentenceWords.forEach((word) => {
      if (frequencies.has(word)) {
        score += frequencies.get(word) || 0
      }
    })
    sentenceScores.set(i, score)
  })

  // Determine how many sentences to include in the summary
  const numSentences = Math.max(1, Math.floor(sentences.length * ratio))

  // Get the top sentences
  const indexScorePairs = Array.from(sentenceScores.entries())
  indexScorePairs.sort((a, b) => b[1] - a[1])
  const topIndices = indexScorePairs.slice(0, numSentences).map((pair) => pair[0])
  topIndices.sort((a, b) => a - b) // Sort by original order

  // Combine the top sentences
  const summary = topIndices.map((i) => sentences[i]).join(" ")
  return summary
}

function frequencyBasedSummarize(text: string, ratio = 0.3): string {
  const sentences = tokenizeSentences(text)

  // If there are very few sentences, return them all
  if (sentences.length <= 3) {
    return sentences.join(" ")
  }

  const words = tokenizeWords(text)
  const filteredWords = removeStopwords(words)
  const frequencies = calculateWordFrequencies(filteredWords)

  // Get most frequent words
  const sortedWords = Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.floor(frequencies.size * ratio))
    .map((pair) => pair[0])

  const mostFreqWords = new Set(sortedWords)

  // Score sentences based on presence of frequent words
  const sentenceScores = new Map<number, number>()
  sentences.forEach((sentence, i) => {
    const sentenceWords = tokenizeWords(sentence)
    let score = 0
    sentenceWords.forEach((word) => {
      if (mostFreqWords.has(word)) {
        score += 1
      }
    })
    sentenceScores.set(i, score)
  })

  // Determine how many sentences to include in the summary
  const numSentences = Math.max(1, Math.floor(sentences.length * ratio))

  // Get the top sentences
  const indexScorePairs = Array.from(sentenceScores.entries())
  indexScorePairs.sort((a, b) => b[1] - a[1])
  const topIndices = indexScorePairs.slice(0, numSentences).map((pair) => pair[0])
  topIndices.sort((a, b) => a - b) // Sort by original order

  // Combine the top sentences
  const summary = topIndices.map((i) => sentences[i]).join(" ")
  return summary
}

export async function POST(request: NextRequest) {
  try {
    const { text, ratio, method } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 })
    }

    // Try to call the Python backend first
    try {
      const backendUrl = process.env.BACKEND_URL || "http://backend:5000"
      const response = await fetch(`${backendUrl}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, ratio, method }),
        // Add a short timeout to fail fast if the backend is not available
        signal: AbortSignal.timeout(2000),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.log("Backend service not available, using JavaScript fallback")
    }

    // Fallback to JavaScript implementation if backend call fails
    const processedText = preprocessText(text)
    let summary

    if (method === "extractive") {
      summary = extractiveSummarize(processedText, ratio)
    } else if (method === "frequency") {
      summary = frequencyBasedSummarize(processedText, ratio)
    } else {
      return NextResponse.json({ error: "Invalid summarization method" }, { status: 400 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Error in summarize route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
