# Resume Optimizer & Career Platform

An intelligent, full-stack web application designed to empower job seekers by providing AI-driven analysis, optimization suggestions, and a comprehensive suite of tools to manage their job search from start to finish.

---

## ✨ Key Features

* **Resume Analysis:** Instantly compares any resume against a job description to generate a match score, identify keyword gaps, and provide a strategic summary.
* **Actionable Optimization Suggestions:** Acts as an AI career coach by generating specific, actionable suggestions to rewrite resume bullet points for maximum impact.
* **Dynamic Job Application Tracker:** Features a drag-and-drop Kanban board to manage the entire job pipeline, complete with advanced filtering, searching, and sorting.
* **Centralized Document Hub:** Allows users to upload, store, and manage multiple versions of their resumes and cover letters in a dedicated and organized "Documents" section.
* **Data-Driven Insights:** Provides a visual dashboard with charts and key metrics to help users understand their job search activity and success rates.
* **Secure User Authentication:** Full user registration and login system with JWT-based authentication to ensure all user data is private and secure.

---

## Tech Stack

This project is built with a modern, decoupled microservice architecture.

* **Frontend:** React.js, Tailwind CSS, Chart.js, @dnd-kit
* **Backend (API & User Management):** Node.js, Express.js, MongoDB
* **AI Service (Microservice):** Python, FastAPI
* **AI & Machine Learning:** OpenAI API (GPT-4o)
* **Database:** MongoDB
* **Cloud & DevOps:** Amazon S3 (for file storage)

---

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js and npm installed
* Python and pip installed
* A MongoDB Atlas account
* An OpenAI API key
* An AWS account with an S3 bucket

### Installation & Setup

1.  **Clone the repo:**
    ```sh
    git clone [https://github.com/your-username/ai-resume-optimizer.git](https://github.com/your-username/ai-resume-optimizer.git)
    cd ai-resume-optimizer
    ```

2.  **Backend Setup:**
    * Navigate to the backend folder: `cd resume-optimizer-backend`
    * Install NPM packages: `npm install`
    * Create a `.env` file and add your keys:
        ```env
        MONGO_URI="your_mongodb_connection_string"
        JWT_SECRET="your_jwt_secret"
        PORT=5001
        AWS_ACCESS_KEY_ID="your_aws_access_key"
        AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
        AWS_BUCKET_NAME="your_s3_bucket_name"
        AWS_REGION="your_s3_bucket_region"
        ```

3.  **AI Service Setup:**
    * Navigate to the AI service folder: `cd ../ai-service`
    * Create and activate a virtual environment:
        ```sh
        python -m venv .venv
        source .venv/bin/activate
        ```
    * Install Python packages: `pip install -r requirements.txt`
    * Create a `.env` file and add your OpenAI key:
        ```env
        OPENAI_API_KEY="your_openai_api_key"
        ```

4.  **Frontend Setup:**
    * Navigate to the frontend folder: `cd ../frontend`
    * Install NPM packages: `npm install`

### Running the Application

You will need to run all three services simultaneously in three separate terminals.

1.  **Start the Backend Server:**
    * In the `resume-optimizer-backend` directory:
        ```sh
        npm start
        ```

2.  **Start the AI Service:**
    * In the `ai-service` directory (with `.venv` activated):
        ```sh
        uvicorn main:app --reload --port 8000
        ```

3.  **Start the Frontend Development Server:**
    * In the `frontend` directory:
        ```sh
        npm run dev
        ```

Open [http://localhost:5173](http://localhost:5173) to view the application in your browser.
