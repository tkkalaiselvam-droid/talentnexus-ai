# TalentNexus AI 🚀
### High-Throughput Predictive Candidate Ranking & Anti-Malpractice Engineering Framework

## 🌐 Live System Previews
* **📦 Complete Source Code Repository**: `https://github.com`
* **🎨 Interactive Frontend Live View**: `https://github.io`
* **📊 Pre-Calculated Shortlist Deliverable**: Check the file `TalentNexus_Recommended_Candidates.xlsx` in the root folder tree.

> ⚠️ **CRITICAL NOTE FOR JUDGES**: The GitHub Pages link above serves as a **Frontend UI/UX Live Preview Sandbox**. Because it is hosted statically in the cloud, it cannot query your local machine's background Python backend port. To simulate active data parsing or view the real-time calculated rank matrices, please review our pre-packaged spreadsheet or boot up the standalone engines locally using the evaluation guide below.

---

## 🛠️ System Architecture & Tech Stack
* **Frontend User Interface Presentation Layer**: React, Vite, Tailwind CSS, TypeScript, Lucide Icons, Framer Motion, XLSX Node Module.
* **Backend Mathematical Calculations Core**: Python 3.11+, FastAPI, Uvicorn Server, Pandas Dataframes, Openpyxl Engine, Regular Expressions (`re`).

## 💡 Key Architectural Core Evaluated
1. **Three-Dimensional Tensor Scoring Loop**: Holistically weights candidate matrices out of 10.00 across Academic Authority (30%), Applied Praxis (40%), and Growth Velocity (30%).
2. **Adversarial Token Penalty Valve**: Custom NLP scanner tracking rapid keyword-stuffing hacks, instantly slashing fraudulent candidate positions by 60%.
3. **Runtime Keystroke Cadence Guard**: Client-side clipboard monitoring engineered into React form hooks to flag and lock sub-millisecond data-copy malpractice.
4. **Deterministic Local Fallback Architecture**: Built-in fallback script pathways to ensure local file writing executes gracefully even if cloud APIs face network bottlenecks.

---

## 🚀 Standalone Local Evaluation Guide
If you wish to clone and run this full-stack system locally to see the live data endpoints compile dynamically, execute these commands sequentially to spin up your parallel environments:

### 🐍 1. Initialize the Python Data Engine Core
```powershell
pip install fastapi uvicorn pandas openpyxl
python -m uvicorn main:app --reload
```
*Server runs actively on: http://127.0.0.1:8000*

### 💻 2. Boot Up the React Dashboard Workspace
```powershell
cd frontend
npm install
npm run dev
```
*Web client loads on: http://localhost:5173*
## 🔗 Live Demo
👉 [Launch TalentNexus AI](https://spectacular-druid-de0ac9.netlify.app/)

**Note:** This link shows the frontend only. It displays the UI/UX layout. The backend is not connected.
