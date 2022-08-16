"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const QueryFunction_1 = require("./QueryFunction");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const port = 8080;
var jsonParser = bodyParser.json();
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
const whitelist = ["http://localhost:3000"];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));
app.post('/', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.tokenAuth || !req.body.repositoryId)
        res.sendStatus(400);
    else {
        const queryFunction = new QueryFunction_1.QueryFunction(req.body.tokenAuth, req.body.repositoryId, (req.body.after) ? req.body.after : null);
        yield queryFunction.runQuery().then((data) => {
            res.json(data);
        }).catch((erro) => {
            res.send(erro);
        });
    }
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=index.js.map