import { QueryFunction } from "./QueryFunction";

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

var jsonParser = bodyParser.json()
//var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/', jsonParser, async (req: any, res: any) => {
  if(!req.body.authToken || !req.body.repositoryId)
    res.sendStatus(400);
  else{
    const queryFunction = new QueryFunction(req.body.authToken, req.body.repositoryId, (req.body.after)? req.body.after : null);
    await queryFunction.runQuery().then((data: JSON)=>{
      res.json(data);
    }).catch((erro)=>{
      res.send(erro)
    });
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})