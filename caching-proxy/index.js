#!/usr/bin/env node
const {Command} = require('commander');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });

const program = new Command();

program.option('--port <number>',"Port where the proxy will run", '8000').option('--target <url>', "original server url");

program.parse(process.argv);

const options = program.opts();

console.log(options);

const express = require('express');

if (options.clearCache){
    console.log("Not yet clearing cache");
    process.exit(1);
}

if(!options.target){
    console.error('must giveth thy target');
    process.exit(1);
}

const app = express();
const PORT = parseInt(options.port);

app.use(async (req, res) => {
  const targetUrl = options.target + req.originalUrl;
  const cachedResponse = cache.get(targetUrl);
  
  if(cachedResponse){
    console.log("fetching from cache:", targetUrl);
    for ( const [key, value] of Object.entries(cachedResponse.headers)){
        res.setHeader(key, value);
    }
    res.setHeader('X-Cache', 'HIT');
    return res.send(cachedResponse.body);
  }
  console.log("Fetching:", targetUrl);

  try {
    const response = await fetch(targetUrl);
    const data = await response.text();
    cache.set(targetUrl, {
        headers: Object.fromEntries(response.headers.entries()),
        body: data,
    });
    console.log("cached:", targetUrl);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.setHeader('X-Cache', 'MISS');
    res.send(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, ()=>{
    console.log("Proxy server running at port:", PORT);
});