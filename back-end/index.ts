import { QueryFunction } from "./QueryFunction";

const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors")

const app = express();
const port = 8080;
var jsonParser = bodyParser.json()
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
const whitelist = ["http://localhost:3000"]
const corsOptions = {
  origin: function (origin: string, callback: (arg0: Error | null, arg1: boolean | undefined) => void) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"), false)
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))

app.post('/', jsonParser, async (req: any, res: any) => {
  if(!req.body.tokenAuth || !req.body.repositoryId)
    res.sendStatus(400);
  else{
    const queryFunction = new QueryFunction(req.body.tokenAuth, req.body.repositoryId, (req.body.after)? req.body.after : null);
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