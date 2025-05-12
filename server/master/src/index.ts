import express from "express";
import env from "./env";
import cookie from "cookie-parser";
import loggingMiddleware from "./middleware/loggingMiddleware";
import productionConfig from "./lib/productionConfig";
import cors from "cors";
import helmet from "helmet";
import logger from "./lib/logger";
import { connect } from "./lib/db";
import { lambdaRouter } from "./routes";

//logger.info(
`{
  /*
LEGEND :-
1) INFO: informational flags
2) WIP: parts of code work is going on
3) OPTI: optimisations required secodary priority
4) JGD: casual logic change for prod use
5) TODO: things to implement
*/
}`;
//);

connect();
const app = express();
app.use(express.json());
app.use(cookie());
app.use(express.urlencoded());
app.use(
	cors(env.NODE_ENV === "production" ? productionConfig.corsOptions : {}),
);
app.use(
	helmet(env.NODE_ENV === "production" ? productionConfig.helmetOptions : {}),
);

app.use(loggingMiddleware);

app.use("/api/lambda", lambdaRouter);

app.listen(env.PORT, () => {
	logger.info(`Server running on http://localhost:${env.PORT}`);
});
