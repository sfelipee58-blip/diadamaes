const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Configuração do Multer para Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './photos';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/photos', express.static('photos'));

// Caminho do arquivo de dados
const DATA_FILE = './data.json';

// Inicializar dados se não existirem
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        title: "Nossas Raízes, Seu Amor",
        subtitle: "Uma homenagem à mulher que é o tronco da nossa história.",
        nodes: [
            { id: 'mom', type: 'main', title: 'Nossa Rainha', quote: 'Onde a vida começa e o amor nunca termina.', img: 'assets/magical_tree_bg.png' }
        ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Endpoints API
app.get('/api/tree', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

app.post('/api/update', (req, res) => {
    const newData = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
    res.json({ success: true });
});

app.post('/api/upload', upload.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');
    res.json({ url: `photos/${req.file.filename}` });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Para compartilhar, use: npx localtunnel --port ${PORT}`);
});
