import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { catchAsync } from "src/lib/utils";
import {
  LambdaClient,
  ListFunctionsCommand,
  GetFunctionCommand,
  ListTagsCommand,
  ListEventSourceMappingsCommand,
  GetFunctionConcurrencyCommand,
} from "@aws-sdk/client-lambda";
import {
  GetMetricDataCommand,
  CloudWatchClient,
} from "@aws-sdk/client-cloudwatch";

import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const lambda = new LambdaClient({ region: "ap-south-1" });
const cloudwatch = new CloudWatchClient({ region: "ap-south-1" });
const cloudwatchLogs = new CloudWatchLogsClient({ region: "ap-south-1" });

const router = Router();

router.get(
  "/get-lambda-functions",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await lambda.send(new ListFunctionsCommand({}));
    return res.status(200).json({
      message: "lambda functions fetched successfully",
      functions: data,
    });
  })
);
router.get(
  "/get-lambda-function",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, hours, arn } = req.query as {
      name: string;
      hours: string;
      arn: string;
    };
    let ms = isNaN(Number(hours)) ? 86400000 : Number(hours) * 60 * 60 * 1000;
    if (!name || name.trim() === "" || name === undefined) {
      return res
        .status(400)
        .json({ message: "query parameter 'name' is required" });
    }
    try {
      const [functionDetails, metrics, eventSources, concurrency, tags, logs] =
        await Promise.allSettled([
          lambda.send(new GetFunctionCommand({ FunctionName: name })),
          cloudwatch.send(
            new GetMetricDataCommand({
              MetricDataQueries: [
                {
                  Id: "invocations",
                  MetricStat: {
                    Metric: {
                      Namespace: "AWS/Lambda",
                      MetricName: "Invocations",
                      Dimensions: [{ Name: "FunctionName", Value: name }],
                    },
                    Period: 3600,
                    Stat: "Sum",
                  },
                },
                {
                  Id: "errors",
                  MetricStat: {
                    Metric: {
                      Namespace: "AWS/Lambda",
                      MetricName: "Errors",
                      Dimensions: [{ Name: "FunctionName", Value: name }],
                    },
                    Period: 3600,
                    Stat: "Sum",
                  },
                },
              ],
              StartTime: new Date(Date.now() - ms),
              EndTime: new Date(),
            })
          ),
          cloudwatchLogs.send(
            new FilterLogEventsCommand({
              logGroupName: `/aws/lambda/${name}`,
              limit: 10,
            })
          ),
          arn ?? lambda.send(new ListTagsCommand({ Resource: arn })),
          lambda.send(
            new ListEventSourceMappingsCommand({
              FunctionName: name,
            })
          ),
          lambda.send(
            new GetFunctionConcurrencyCommand({
              FunctionName: name,
            })
          ),
        ]);
      return res.status(200).json({
        message: `lambda function named- ${name} fetched successfully`,
        functions: {
          functionDetails,
          metrics,
          eventSources,
          concurrency,
          tags,
          logs,
        },
      });
    } catch (err: any) {
      if (err?.["name"] === "ResourceNotFoundException") {
        return res.status(400).json({
          message: `no log groups for the fun ${name}`,
        });
      }
      return res.status(500).json({
        message: "internal server error",
        error: process.env.NODE_ENV === "production" ? null : err,
      });
    }
  })
);

export default router;
