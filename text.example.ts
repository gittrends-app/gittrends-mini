import ReposityComponent from "./github/components/RepositoryComponent";
import HttpClient from "./github/HttpClient";
import Query from "./github/Query";

const component = new ReposityComponent(
  "MDEwOlJlcG9zaXRvcnkxMDI3MDI1MA=="
).includeStargazers(true, { first: 100 });

const client = new HttpClient({
  host: "10.87.8.9",
  protocol: "http",
  port: 3000,
  userAgent: "Teste",
});

Query.create(client)
  .compose(component)
  .run()
  .then((data) => console.log(JSON.stringify(data, null, " ")))
  .catch(console.error);
