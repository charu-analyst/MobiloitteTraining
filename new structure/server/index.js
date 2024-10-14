import Config from 'config'
import Routes from "./routes";
import Server from "./common/server"
import {DateTime} from "luxon";
DateTime.now().setZone('asia/kolkata').minus({weeks:1}).endOf('day').toISO();

const dbUrl = `mongodb://0.0.0.0:${Config.get(
  "databasePort"
)}/${Config.get("databaseName")}`;
const server = new Server()
  .router(Routes)
  .configureSwagger(Config.get("swaggerDefinition"))
  .handleError()
  .configureDb(dbUrl)
  .then((_server) => _server.listen(Config.get("port")));

export default server;






