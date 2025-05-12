import {
	type CloudWatchLogsClient,
	FilterLogEventsCommand,
	type FilterLogEventsCommandOutput,
} from "@aws-sdk/client-cloudwatch-logs";
import {
	GetFunctionCommand,
	GetFunctionConcurrencyCommand,
	type LambdaClient,
	ListEventSourceMappingsCommand,
	ListFunctionsCommand,
	ListTagsCommand,
	type GetFunctionConcurrencyCommandOutput,
	type ListEventSourceMappingsCommandOutput,
	type ListFunctionsCommandOutput,
	type ListTagsCommandOutput,
} from "@aws-sdk/client-lambda";

export const getStarredLambdaFunctions = async (
	lambda: LambdaClient,
	arns: string[],
) => {
	if (!lambda.config.credentials) {
		throw new Error("AWS Lambda client not properly configured");
	}

	return Promise.allSettled(
		arns.map((arn) =>
			lambda
				.send(new GetFunctionCommand({ FunctionName: arn }))
				.catch((error) =>
					Promise.reject({
						arn,
						error: error.message,
					}),
				),
		),
	);
};

export const listFunctions = (
	lambda: LambdaClient,
): Promise<ListFunctionsCommandOutput> => {
	return lambda.send(new ListFunctionsCommand({}));
};

export const getFunction = (lambda: LambdaClient, name: string) => {
	return lambda.send(new GetFunctionCommand({ FunctionName: name }));
};

export const getLogs = (
	cloudwatchLogs: CloudWatchLogsClient,
	name: string,
): Promise<FilterLogEventsCommandOutput> => {
	return cloudwatchLogs.send(
		new FilterLogEventsCommand({
			logGroupName: `/aws/lambda/${name}`,
			limit: 10,
		}),
	);
};

export const getTags = (
	lambda: LambdaClient,
	arn: string,
): Promise<ListTagsCommandOutput> => {
	return lambda.send(new ListTagsCommand({ Resource: arn }));
};

export const getEventSourceMapping = (
	lambda: LambdaClient,
	name: string,
): Promise<ListEventSourceMappingsCommandOutput> => {
	return lambda.send(
		new ListEventSourceMappingsCommand({
			FunctionName: name,
		}),
	);
};
export const getFunctionConcurrency = (
	lambda: LambdaClient,
	name: string,
): Promise<GetFunctionConcurrencyCommandOutput> => {
	return lambda.send(
		new GetFunctionConcurrencyCommand({
			FunctionName: name,
		}),
	);
};
