const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static(__dirname));
// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');

        // Create the 'uploads' directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Parse JSON bodies
app.use(express.json());

// CORS middleware (enable cross-origin requests)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Store posts in memory (replace with a database in a production environment)
const posts = [];

// Endpoint to get all posts
app.get('/posts', (req, res) => {
    res.json(posts);
});

// Endpoint to post a new comment
app.post('/post', upload.single('image'), (req, res) => {
    const { comment } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = {
        _id: generateId(), // Add a function to generate unique IDs
        comment,
        imageUrl,
    };

    posts.push(newPost);

    res.json(newPost);
});

// Endpoint to update a post
app.put('/post/:id', upload.single('image'), (req, res) => {
    const postId = req.params.id;
    const { comment } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const updatedPost = {
        _id: postId,
        comment,
        imageUrl,
    };

    const index = posts.findIndex(post => post._id === postId);
    if (index !== -1) {
        posts[index] = updatedPost;
        res.json(updatedPost);
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
});

// Endpoint to delete a post
app.delete('/post/:id', (req, res) => {
    const postId = req.params.id;

    const index = posts.findIndex(post => post._id === postId);
    if (index !== -1) {
        posts.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
});

// Helper function to generate a unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
