const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const filepath = './data/expenses.json';

app.get('/', (req, res)=>{
    res.send('server running');
});

app.get('/data', (req, res)=>{
    try{
        if(!fs.existsSync(filepath)){
            res.json([]);
        }
        const data = fs.readFileSync(filepath, 'utf8');
        res.json(JSON.parse(data || '[]'));
    } catch(err){
        res.send(err);
    }
});

app.get('/data/:id', (req, res)=>{
    try{
        if(!fs.existsSync(filepath)){
            res.json([]);
        }
        const data = fs.readFileSync(filepath, 'utf8') || '[]';
        const id = parseInt(req.params.id);
        if(id > 0 && data !== '[]'){
            const expense = JSON.parse(data).find(e=> e.id === id);
            res.json(expense || {});
        }
        
    } catch(err){
        res.send(err)
    }
});

app.listen(PORT, ()=>{
    console.log('server is running at port', PORT);
});