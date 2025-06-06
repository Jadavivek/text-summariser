# Text Summarizer

A powerful text summarization tool built with Next.js and Python Flask. This application allows users to upload text files or DOCX documents and generate concise summaries using different summarization methods.

## Features

- Upload and process text files (.txt, .md) and DOCX documents
- Multiple summarization methods:
  - Extractive summarization
  - Frequency-based summarization
- Adjustable compression ratio
- Edit and download generated summaries
- Modern and responsive UI
- Real-time processing

## Tech Stack

- Frontend:

  - Next.js 13
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - Mammoth.js for DOCX processing

- Backend:
  - Python Flask
  - NLTK for text processing
  - Custom summarization algorithms

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/text-summarizer.git
   cd text-summarizer
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Install backend dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Start the development servers:

   Frontend:

   ```bash
   npm run dev
   ```

   Backend:

   ```bash
   cd backend
   python app.py
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter text directly or upload a file (.txt, .md, .docx)
2. Choose the summarization method
3. Adjust the compression ratio
4. Click "Summarize"
5. Edit the generated summary if needed
6. Download the summary

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NLTK for text processing capabilities
- Next.js team for the amazing framework
- shadcn/ui for the beautiful components
