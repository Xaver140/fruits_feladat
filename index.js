import express from "express";
import pool from "./fruit.js";

const app = express();
const PORT = process.env.SERVERPORT || 3000;
app.use( express.json());

app.get('/fruits', async (req, res) =>{
    try{
        const [rows] = await pool.query('SELECT * FROM fruits')
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error:"adatbázis hiba", details: err.message });
    }
});

app.get("/fruits/:id", async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `fruits` WHERE `id` = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "gyümi nem talált" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "adatbázis error", details: err.message });
    }
});

app.post('/fruits', async (req, res) => {
    const { name, color, price } = req.body;

    try {
        const [result] = await pool.execute(
            'INSERT INTO fruits (name, color, price) VALUES (?, ?, ?)',
            [name, color, price]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            color,
            price
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/fruits/:id', async (req, res) => {
    const fruitId = req.params.id;
    const { name, color, price } = req.body;

    try {
        const [result] = await pool.execute(
            'UPDATE fruits SET name = ?, color = ?, price = ? WHERE id = ?',
            [name, color, price, fruitId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Fruit not found' });
        }

        res.json({
            id: Number(fruitId),
            name,
            color,
            price
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/fruits/:id', async (req, res) => {
    const fruitId = req.params.id;

    try {
        const [result] = await pool.execute(
            'DELETE FROM fruits WHERE id = ?',
            [fruitId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'gyümi nem talált' });
        }

        res.json({ message: 'gyümi törölve' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})