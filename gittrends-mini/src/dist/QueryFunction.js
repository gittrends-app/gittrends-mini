"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryFunction = void 0;
const RepositoryComponent_1 = __importDefault(require("./github/components/RepositoryComponent"));
const HttpClient_1 = __importDefault(require("./github/HttpClient"));
const Query_1 = __importDefault(require("./github/Query"));
//const fs = require('fs');
class QueryFunction {
    constructor(tokenAuth, repositoryId, after) {
        this.client = new HttpClient_1.default({
            host: "api.github.com",
            protocol: "https",
            authToken: tokenAuth
        });
        this.component = (after) ? new RepositoryComponent_1.default(repositoryId).includeStargazers(true, { first: 100, after: after }).includeDetails(true) : new RepositoryComponent_1.default(repositoryId).includeStargazers(true, { first: 100 }).includeDetails(true);
    }
    runQuery() {
        return Query_1.default.create(this.client)
            .compose(this.component)
            .run();
        // .then((data1: JSON) => {
        // var edges: JSON[] = edges = data1.repository._stargazers.edges;
        // var name: string = data1.repository.name;
        // var consultas: number = Math.ceil(data1.repository.stargazers / 100);
        // var has_next_page: boolean = data1.repository._stargazers.page_info.has_next_page;
        // var end_cursor: string = data1.repository._stargazers.page_info.end_cursor;
        // var i: number = 1;
        // console.log("Consulta " + i + "/" + consultas + " concluida");
        // await fs.writeFile("./" + name + ".txt", JSON.stringify(edges).replace(/,/g, '\n'), (error: any) => {
        //   if (error) return console.log(error);
        // })
        // while (has_next_page) {
        //   component = new ReposityComponent(
        //     "MDEwOlJlcG9zaXRvcnk1ODg5NDU4Mg=="
        //   ).includeStargazers(true, { first: 100, after: end_cursor });
        //   await Query.create(client)
        //     .compose(component)
        //     .run()
        //     .then((data2) => {
        //       edges = data2.repository._stargazers.edges;
        //       has_next_page = data2.repository._stargazers.page_info.has_next_page;
        //       end_cursor = data2.repository._stargazers.page_info.end_cursor;
        //     })
        //     .catch(console.error);
        //   i++;
        //   console.log("Consulta " + i + "/" + consultas + " concluida");
        //   await fs.writeFile("./" + name + ".txt", JSON.stringify(edges).replace(/,/g, '\n'), { flag: 'a+' }, (error: any) => {
        //     if (error) return console.log(error);
        //   })
        // }
        // })
        // .catch((error:any)=>{
        //   return error;
        // });
    }
}
exports.QueryFunction = QueryFunction;
//# sourceMappingURL=QueryFunction.js.map