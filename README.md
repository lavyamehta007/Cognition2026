# Gemini Consequence Prediction Agent

A two-phase commit architecture with an adversarial consequence sandbox for high-stakes agent operations using Google Gemini API.

## Structure
- `agent_engine.py`: Core architecture separating Proposal, Gemini Simulation, and Commit Gate.
- `evaluation_suite.py`: Automated benchmark evaluation harness measuring Safety Recall and False Rejection Rate.
- `demo_cli.py`: Interactive CLI for live presentations and judge demonstrations.

## Setup & Running
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Set your Gemini API Key (Get a free key at https://aistudio.google.com/):
   ```bash
   # On macOS / Linux:
   export GEMINI_API_KEY="your-gemini-api-key"

   # On Windows (Command Prompt):
   set GEMINI_API_KEY=your-gemini-api-key

   # On Windows (PowerShell):
   $env:GEMINI_API_KEY="your-gemini-api-key"
   ```
3. Run the evaluation benchmark:
   ```bash
   python evaluation_suite.py
   ```
4. Run the interactive demo:
   ```bash
   python demo_cli.py
   ```
