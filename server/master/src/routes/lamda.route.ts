import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { catchAsync } from "src/lib/utils";
import { GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import User from "src/models/user.model";
import { cloudwatch, cloudwatchLogs, lambda } from "../lib/configs";
import {
	getEventSourceMapping,
	getFunction,
	getFunctionConcurrency,
	getLogs,
	getStarredLambdaFunctions,
	getTags,
	listFunctions,
} from "./lambdautils/lambda.utils";

const router = Router();

router.get(
	"/get-lambda-functions",
	catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
		const data = await listFunctions(lambda);
		return res.status(200).json({
			message: "lambda functions fetched successfully",
			functions: data,
		});
	}),
);

router.get(
	"/get-lambda-function",
	catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
		const { name, hours, arn } = req.query as {
			name: string;
			hours: string;
			arn: string;
		};
		const ms = isNaN(Number(hours))
			? 86400000
			: Number(hours) * 60 * 60 * 1000;
		if (!name || name.trim() === "" || name === undefined) {
			return res
				.status(400)
				.json({ message: "query parameter 'name' is required" });
		}
		try {
			const [
				functionDetails,
				metrics,
				eventSources,
				concurrency,
				tags,
				logs,
			] = await Promise.allSettled([
				getFunction(lambda, name),
				cloudwatch.send(
					new GetMetricDataCommand({
						MetricDataQueries: [
							{
								Id: "invocations",
								MetricStat: {
									Metric: {
										Namespace: "AWS/Lambda",
										MetricName: "Invocations",
										Dimensions: [
											{
												Name: "FunctionName",
												Value: name,
											},
										],
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
										Dimensions: [
											{
												Name: "FunctionName",
												Value: name,
											},
										],
									},
									Period: 3600,
									Stat: "Sum",
								},
							},
						],
						StartTime: new Date(Date.now() - ms),
						EndTime: new Date(),
					}),
				), //invocations , errors
				getLogs(cloudwatchLogs, name),
				arn ?? getTags(lambda, arn),
				getEventSourceMapping(lambda, name),
				getFunctionConcurrency(lambda, name),
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
	}),
);

router.post(
	"/star-func",
	catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
		const { arn } = req.query as { arn: string };
		const updatedUser = await User.findByIdAndUpdate(
			req.userId,
			[
				{
					$set: {
						starred: {
							$cond: [
								{ $in: [arn, "$starred"] },
								{ $setDifference: ["$starred", [arn]] },
								{ $concatArrays: ["$starred", [arn]] },
							],
						},
					},
				},
			],
			{ new: true, runValidators: true },
		).populate("starred");

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.status(200).json({ starred: updatedUser.starred });
	}),
);

router.get(
	"/get-starred",
	catchAsync(async (req: Request, res: Response) => {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.starred.length === 0) {
			return res.status(200).json({
				message: "No starred functions",
				data: [],
			});
		}

		const results = await getStarredLambdaFunctions(lambda, user.starred);

		const formatted = results.map((result, index) => ({
			arn: user.starred[index],
			data: result.status === "fulfilled" ? result.value : null,
			error: result.status === "rejected" ? result.reason : null,
		}));

		return res.status(200).json({
			message: "Starred functions retrieved",
			count: formatted.length,
			data: formatted,
		});
	}),
);

router.get(
	"/cold-start/:arn",
	catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		return;
	}),
);

export default router;
