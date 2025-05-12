import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { LambdaClient } from "@aws-sdk/client-lambda";

export const lambda = new LambdaClient({ region: "ap-south-1" });
export const cloudwatch = new CloudWatchClient({ region: "ap-south-1" });
export const cloudwatchLogs = new CloudWatchLogsClient({
	region: "ap-south-1",
});
