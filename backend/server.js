const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const { db } = require("./config/firebase");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// CONFIG
// =====================================================

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "qwen2.5:0.5b";

const FRONTEND_PATH = path.join(__dirname, "..", "frontend");

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(FRONTEND_PATH));


// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});


// =====================================================
// API ROOT
// =====================================================

app.get("/api", (req, res) => {

    res.json({
        success: true,
        message: "7 WINGS API is running",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            tasks: "/api/tasks",
            resumes: "/api/resumes",
            portfolio: "/api/portfolio",
            interviewQuestions: "/api/interview/questions",
            interviewProgress: "/api/interview/progress",
            knowledge: "/api/knowledge/ask",
            calculator: "/api/calculator",
            information: "/api/information/news"
        }
    });

});


// =====================================================
// HEALTH
// =====================================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        status: "healthy",
        server: "7 WINGS Backend",
        time: new Date().toISOString()
    });

});


// =====================================================
// TASK MANAGER
// =====================================================

// GET TASKS

app.get("/api/tasks", async (req, res) => {

    try {

        const snapshot = await db
            .collection("tasks")
            .orderBy("createdAt", "desc")
            .get();

        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            success: true,
            count: tasks.length,
            tasks
        });

    } catch (error) {

        console.error("GET /api/tasks error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load tasks",
            error: error.message
        });

    }

});


// CREATE TASK

app.post("/api/tasks", async (req, res) => {

    try {

        const {
            title,
            description,
            priority,
            reminder
        } = req.body;

        if (!title || !title.trim()) {

            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });

        }

        const task = {

            title: title.trim(),

            description:
                description || "",

            priority:
                priority || "medium",

            completed: false,

            reminder:
                reminder || "none",

            createdAt:
                new Date().toISOString()

        };

        const docRef = await db
            .collection("tasks")
            .add(task);

        res.status(201).json({

            success: true,

            message: "Task created successfully",

            task: {
                id: docRef.id,
                ...task
            }

        });

    } catch (error) {

        console.error("POST /api/tasks error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: error.message
        });

    }

});


// UPDATE TASK

app.put("/api/tasks/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const updateData = {};

        if (req.body.title !== undefined) {
            updateData.title = req.body.title;
        }

        if (req.body.description !== undefined) {
            updateData.description = req.body.description;
        }

        if (req.body.priority !== undefined) {
            updateData.priority = req.body.priority;
        }

        if (req.body.completed !== undefined) {
            updateData.completed = req.body.completed;
        }

        if (req.body.reminder !== undefined) {
            updateData.reminder = req.body.reminder;
        }

        await db
            .collection("tasks")
            .doc(id)
            .update(updateData);

        res.json({

            success: true,

            message: "Task updated successfully"

        });

    } catch (error) {

        console.error("PUT /api/tasks error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message
        });

    }

});


// DELETE TASK

app.delete("/api/tasks/:id", async (req, res) => {

    try {

        const id = req.params.id;

        await db
            .collection("tasks")
            .doc(id)
            .delete();

        res.json({

            success: true,

            message: "Task deleted successfully"

        });

    } catch (error) {

        console.error("DELETE /api/tasks error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message
        });

    }

});


// =====================================================
// RESUME BUILDER
// =====================================================

// GET RESUMES

app.get("/api/resumes", async (req, res) => {

    try {

        const snapshot = await db
            .collection("resumes")
            .orderBy("createdAt", "desc")
            .get();

        const resumes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({

            success: true,

            count: resumes.length,

            resumes

        });

    } catch (error) {

        console.error("GET /api/resumes error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to load resumes",

            error: error.message

        });

    }

});


// CREATE RESUME

app.post("/api/resumes", async (req, res) => {

    try {

        const resume = {

            name: req.body.name || "",
            role: req.body.role || "",
            email: req.body.email || "",
            phone: req.body.phone || "",
            location: req.body.location || "",
            objective: req.body.objective || "",
            education: req.body.education || "",
            skills: req.body.skills || "",
            projects: req.body.projects || "",
            experience: req.body.experience || "",
            certifications: req.body.certifications || "",

            template:
                req.body.template || "modern",

            theme:
                req.body.theme || "blue",

            font:
                req.body.font || "Arial",

            createdAt:
                new Date().toISOString()

        };

        const docRef = await db
            .collection("resumes")
            .add(resume);

        res.status(201).json({

            success: true,

            message: "Resume saved successfully",

            resume: {

                id: docRef.id,

                ...resume

            }

        });

    } catch (error) {

        console.error("POST /api/resumes error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to save resume",

            error: error.message

        });

    }

});


// UPDATE RESUME

app.put("/api/resumes/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const resume = {

            name: req.body.name || "",
            role: req.body.role || "",
            email: req.body.email || "",
            phone: req.body.phone || "",
            location: req.body.location || "",
            objective: req.body.objective || "",
            education: req.body.education || "",
            skills: req.body.skills || "",
            projects: req.body.projects || "",
            experience: req.body.experience || "",
            certifications: req.body.certifications || "",

            template:
                req.body.template || "modern",

            theme:
                req.body.theme || "blue",

            font:
                req.body.font || "Arial",

            updatedAt:
                new Date().toISOString()

        };

        await db
            .collection("resumes")
            .doc(id)
            .update(resume);

        res.json({

            success: true,

            message: "Resume updated successfully"

        });

    } catch (error) {

        console.error("PUT /api/resumes error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to update resume",

            error: error.message

        });

    }

});


// =====================================================
// PORTFOLIO
// =====================================================

// GET PORTFOLIOS

app.get("/api/portfolio", async (req, res) => {

    try {

        const snapshot = await db
            .collection("portfolios")
            .orderBy("createdAt", "desc")
            .get();

        const portfolios = snapshot.docs.map(doc => ({

            id: doc.id,

            ...doc.data()

        }));

        res.json({

            success: true,

            count: portfolios.length,

            portfolios

        });

    } catch (error) {

        console.error("GET /api/portfolio error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to load portfolios",

            error: error.message

        });

    }

});


// CREATE PORTFOLIO

app.post("/api/portfolio", async (req, res) => {

    try {

        const portfolio = {

            name:
                req.body.name || "",

            role:
                req.body.role || "",

            about:
                req.body.about || "",

            skills:
                req.body.skills || "",

            linkedin:
                req.body.linkedin || "",

            github:
                req.body.github || "",

            projects:
                Array.isArray(req.body.projects)
                    ? req.body.projects
                    : [],

            createdAt:
                new Date().toISOString()

        };

        const docRef = await db
            .collection("portfolios")
            .add(portfolio);

        res.status(201).json({

            success: true,

            message:
                "Portfolio saved successfully",

            portfolio: {

                id: docRef.id,

                ...portfolio

            }

        });

    } catch (error) {

        console.error("POST /api/portfolio error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to save portfolio",

            error: error.message

        });

    }

});


// UPDATE PORTFOLIO

app.put("/api/portfolio/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const portfolio = {

            name:
                req.body.name || "",

            role:
                req.body.role || "",

            about:
                req.body.about || "",

            skills:
                req.body.skills || "",

            linkedin:
                req.body.linkedin || "",

            github:
                req.body.github || "",

            projects:
                Array.isArray(req.body.projects)
                    ? req.body.projects
                    : [],

            updatedAt:
                new Date().toISOString()

        };

        await db
            .collection("portfolios")
            .doc(id)
            .update(portfolio);

        res.json({

            success: true,

            message:
                "Portfolio updated successfully"

        });

    } catch (error) {

        console.error("PUT /api/portfolio error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to update portfolio",

            error: error.message

        });

    }

});


// =====================================================
// INTERVIEW QUESTIONS
// =====================================================

const interviewQuestions = [

    {
        id: 1,
        category: "Technical",
        question: "What is C++?",
        answer:
            "C++ is a general-purpose programming language that supports procedural, object-oriented and generic programming."
    },

    {
        id: 2,
        category: "Technical",
        question: "What is a variable?",
        answer:
            "A variable is a named memory location used to store a value."
    },

    {
        id: 3,
        category: "Technical",
        question: "What is HTML?",
        answer:
            "HTML stands for HyperText Markup Language and is used to structure web pages."
    },

    {
        id: 4,
        category: "HR",
        question: "Tell me about yourself.",
        answer:
            "Give a short introduction covering your education, skills, projects and career interests."
    },

    {
        id: 5,
        category: "HR",
        question: "What are your strengths?",
        answer:
            "Mention genuine strengths such as problem solving, teamwork, communication or willingness to learn."
    },

    {
        id: 6,
        category: "Aptitude",
        question: "What is 25% of 200?",
        answer:
            "25% of 200 is 50."
    }

];


// GET QUESTIONS

app.get("/api/interview/questions", (req, res) => {

    res.json({

        success: true,

        count: interviewQuestions.length,

        questions: interviewQuestions

    });

});


// GET SINGLE QUESTION

app.get("/api/interview/questions/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const question =
        interviewQuestions.find(
            item => item.id === id
        );

    if (!question) {

        return res.status(404).json({

            success: false,

            message: "Question not found"

        });

    }

    res.json({

        success: true,

        question

    });

});


// =====================================================
// INTERVIEW PROGRESS
// =====================================================

// GET PROGRESS

app.get("/api/interview/progress", async (req, res) => {

    try {

        const doc = await db
            .collection("interviewProgress")
            .doc("default")
            .get();

        if (!doc.exists) {

            return res.json({

                success: true,

                progress: []

            });

        }

        res.json({

            success: true,

            ...doc.data()

        });

    } catch (error) {

        console.error(
            "GET /api/interview/progress error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load interview progress",

            error: error.message

        });

    }

});


// SAVE PROGRESS

app.post("/api/interview/progress", async (req, res) => {

    try {

        const progress =
            Array.isArray(req.body.progress)
                ? req.body.progress
                : [];

        await db
            .collection("interviewProgress")
            .doc("default")
            .set({

                progress,

                updatedAt:
                    new Date().toISOString()

            });

        res.json({

            success: true,

            message:
                "Interview progress saved successfully!"

        });

    } catch (error) {

        console.error(
            "POST /api/interview/progress error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to save interview progress",

            error: error.message

        });

    }

});


// =====================================================
// AI KNOWLEDGE - OLLAMA
// =====================================================

app.post("/api/knowledge/ask", async (req, res) => {

    try {

        const question =
            req.body.question || "";

        if (!question.trim()) {

            return res.status(400).json({

                success: false,

                message:
                    "Question is required"

            });

        }

        console.log(
            "🤖 AI Question:",
            question
        );


        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                300000
            );


        let ollamaResponse;


        try {

            ollamaResponse =
                await fetch(
                    OLLAMA_URL,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            model:
                                OLLAMA_MODEL,

                            messages: [

                                {
                                    role: "system",

                                    content:
                                        "You are the 7 WINGS Knowledge Assistant. " +
                                        "Help students with programming, electronics, " +
                                        "academics, projects, career preparation and " +
                                        "general concepts. " +
                                        "Give clear, simple and useful answers. " +
                                        "For simple questions, keep answers concise."
                                },

                                {
                                    role: "user",

                                    content:
                                        question
                                }

                            ],

                            stream: false

                        }),

                        signal:
                            controller.signal

                    }
                );

        } finally {

            clearTimeout(timeout);

        }


        if (!ollamaResponse.ok) {

            const errorText =
                await ollamaResponse.text();

            throw new Error(
                `Ollama error ${ollamaResponse.status}: ${errorText}`
            );

        }


        const data =
            await ollamaResponse.json();


        const answer =
            data.message &&
            data.message.content
                ? data.message.content
                : "No answer received from Ollama.";


        console.log(
            "🤖 AI Answer received"
        );


        res.json({

            success: true,

            question,

            answer,

            model:
                OLLAMA_MODEL,

            source:
                "local"

        });

    } catch (error) {

        console.error(
            "POST /api/knowledge/ask error:",
            error
        );


        if (
            error.name ===
            "AbortError"
        ) {

            return res.status(504).json({

                success: false,

                message:
                    "The local AI model took too long to respond. Try a shorter question or use a smaller model."

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to get local AI response",

            error:
                error.message

        });

    }

});


// =====================================================
// CALCULATOR
// =====================================================

app.post("/api/calculator", (req, res) => {

    res.json({

        success: true,

        message:
            "Calculator API is ready"

    });

});


// =====================================================
// INFORMATION HUB - LIVE GOOGLE NEWS RSS
// =====================================================

const INFORMATION_CATEGORIES = {

    Technology:
        "technology",

    AI:
        "artificial intelligence",

    Education:
        "education students",

    Career:
        "jobs career students",

    Hackathons:
        "hackathon",

    Science:
        "science technology"

};


// Simple XML text extraction.
// This avoids installing another package.

function getXmlValue(
    item,
    tag
) {

    const regex =
        new RegExp(
            `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
            "i"
        );

    const match =
        item.match(regex);

    if (!match) {
        return "";
    }

    return match[1]
        .replace(
            /<!\[CDATA\[([\s\S]*?)\]\]>/g,
            "$1"
        )
        .replace(
            /<[^>]+>/g,
            ""
        )
        .replace(
            /&amp;/g,
            "&"
        )
        .replace(
            /&lt;/g,
            "<"
        )
        .replace(
            /&gt;/g,
            ">"
        )
        .replace(
            /&quot;/g,
            '"'
        )
        .replace(
            /&#39;/g,
            "'"
        )
        .trim();

}


// Parse RSS items.

function parseRSS(xml) {

    const items =
        xml.match(
            /<item[\s\S]*?<\/item>/gi
        ) || [];


    return items.map(item => {

        const title =
            getXmlValue(
                item,
                "title"
            );

        const link =
            getXmlValue(
                item,
                "link"
            );

        const pubDate =
            getXmlValue(
                item,
                "pubDate"
            );

        const description =
            getXmlValue(
                item,
                "description"
            );


        return {

            title,

            link,

            pubDate,

            description

        };

    }).filter(item =>
        item.title &&
        item.link
    );

}


// GET LIVE INFORMATION

app.get(
    "/api/information/news",
    async (req, res) => {

        try {

            const category =
                req.query.category ||
                "All";


            const search =
                req.query.search ||
                "";


            let query;


            if (
                search &&
                search.trim()
            ) {

                query =
                    search.trim();

            } else {

                query =
                    INFORMATION_CATEGORIES[
                        category
                    ] ||
                    "technology students";

            }


            const feedUrl =
                "https://news.google.com/rss/search?q=" +
                encodeURIComponent(query) +
                "&hl=en-IN&gl=IN&ceid=IN:en";


            console.log(
                "📰 News request:",
                query
            );


            const controller =
                new AbortController();


            const timeout =
                setTimeout(
                    () => controller.abort(),
                    15000
                );


            let response;


            try {

                response =
                    await fetch(
                        feedUrl,
                        {

                            headers: {

                                "User-Agent":
                                    "7-WINGS-Information-Hub/1.0"

                            },

                            signal:
                                controller.signal

                        }
                    );

            } finally {

                clearTimeout(timeout);

            }


            if (!response.ok) {

                throw new Error(
                    `News feed returned HTTP ${response.status}`
                );

            }


            const xml =
                await response.text();


            const articles =
                parseRSS(xml)
                    .slice(0, 12)
                    .map(article => ({

                        title:
                            article.title,

                        description:
                            article.description,

                        link:
                            article.link,

                        publishedAt:
                            article.pubDate,

                        category:
                            category === "All"
                                ? "Latest"
                                : category,

                        source:
                            "Google News"

                    }));


            res.json({

                success: true,

                category,

                search:
                    search || null,

                count:
                    articles.length,

                articles

            });


        } catch (error) {

            console.error(
                "GET /api/information/news error:",
                error
            );


            if (
                error.name ===
                "AbortError"
            ) {

                return res.status(504).json({

                    success: false,

                    message:
                        "News service took too long to respond."

                });

            }


            res.status(500).json({

                success: false,

                message:
                    "Failed to load live information",

                error:
                    error.message

            });

        }

    }
);


// Keep the old information endpoint working.

app.get(
    "/api/information",
    async (req, res) => {

        res.json({

            success: true,

            message:
                "Information Hub API is running",

            liveNewsEndpoint:
                "/api/information/news"

        });

    }
);


// =====================================================
// 404 API
// =====================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found"

        });

    }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Server error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error",

            error:
                error.message

        });

    }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log("======================================");
        console.log("🚀 7 WINGS BACKEND");
        console.log("======================================");

        console.log(
            `Server running on: http://localhost:${PORT}`
        );

        console.log(
            `API: http://localhost:${PORT}/api`
        );

        console.log(
            `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            `Live News: http://localhost:${PORT}/api/information/news`
        );

        console.log(
            `AI Model: ${OLLAMA_MODEL}`
        );

        console.log("======================================");
        console.log("");

    }
);