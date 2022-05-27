import ReposityComponent from "./github/components/RepositoryComponent";
import HttpClient from "./github/HttpClient";
import Query from "./github/Query";
const fs = require('fs');

const client = new HttpClient({
  host: "api.github.com",
  protocol: "https",
  authToken: "seu token aqui"
});

var component = new ReposityComponent(
  "MDEwOlJlcG9zaXRvcnk1ODg5NDU4Mg=="
).includeStargazers(true, { first: 100 }).includeDetails(true);
Query.create(client)
  .compose(component)
  .run()
  .then(async (data1) => {
    var edges: JSON[] = edges = data1.repository._stargazers.edges;
    var name: string = data1.repository.name;
    var consultas: number = Math.ceil(data1.repository.stargazers / 100);
    var has_next_page: boolean = data1.repository._stargazers.page_info.has_next_page;
    var end_cursor: string = data1.repository._stargazers.page_info.end_cursor;
    var i: number = 1;

    console.log("Consulta " + i +"/"+ consultas +" concluida");
    await fs.writeFile("./"+ name +".txt", JSON.stringify(edges).replace(/,/g, '\n'), (error: any) => {
      if (error) return console.log(error);
    })

    while (has_next_page) {
      component = new ReposityComponent(
        "MDEwOlJlcG9zaXRvcnk1ODg5NDU4Mg=="
      ).includeStargazers(true, { first: 100, after: end_cursor });
      await Query.create(client)
        .compose(component)
        .run()
        .then((data2) => {
          edges = data2.repository._stargazers.edges;
          has_next_page = data2.repository._stargazers.page_info.has_next_page;
          end_cursor = data2.repository._stargazers.page_info.end_cursor;
        })
        .catch(console.error);
      i++;
      console.log("Consulta " + i +"/"+ consultas +" concluida");
      await fs.writeFile("./"+ name +".txt", JSON.stringify(edges).replace(/,/g, '\n'), { flag: 'a+' }, (error: any) => {
        if (error) return console.log(error);
      })
    }

  })
  .catch(console.error);
