import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { of } from "rxjs";

import { UserModel } from "@/models/user.model";
import { ChartModel } from "@/models/chart.model";

import { Role } from "@/models/enums/role.enum";
import { Difficulty } from "@/models/enums/difficulty.enum";

export const FAKE_JWT_TOKEN =
	"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJDb2RlIFNob3RzIFdpdGggUHJvZmFuaXMiLCJpYXQiOjE2MjQyNzU1MjUsImV4cCI6MTY1NTgxMTUyNSwiYXVkIjoiQ29kZSBTaG90IFdpdGggUHJvZmFuaXMgU3Vic2NyaWJlcnMiLCJzdWIiOiJDb2RlIFNob3QgV2l0aCBQcm9mYW5pcyBTdWJzY3JpYmVycyIsIlVzZXJuYW1lIjoicHJvZmFuaXMiLCJGaXJzdE5hbWUiOiJGYW5pcyIsIlJvbGUiOlsiQWRtaW4iLCJTdXBlciBBZG1pbiJdfQ.mT1UD7DXTWRm4etsW9BuWcg5bj2CaeAQVXaoEOIwB7o";

export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
	const { url, method } = req;

	if (url.endsWith("/api/login") && method === "GET") {
		console.log("Returning fake user data");

		return of(
			new HttpResponse({
				status: 200,
				body: {
					user: {
						id: "1",
						username: "test_account",
						email: "test@gmail.com",
						imageUrl: "https://github.com/jamesber.png",
						discordId: "123456789",
						createdAt: new Date("2021-01-01"),
					} as UserModel,
					token: FAKE_JWT_TOKEN,
				},
			}),
		);
	}

	if (url.endsWith("charts") && method === "GET") {
		return of(
			new HttpResponse({
				status: 200,
				body: chart,
			}),
		);
	}

	return next(req);
};

const chart: ChartModel = {
	id: "1",
	track: "Example Chart",
	contributors: [
		{
			user: {
				id: "1",
				username: "meninocoiso",
				imageUrl: "https://github.com/theduardomaciel.png",
				discordId: "123456789",
				createdAt: new Date("2021-01-01"),
			},
			joinedAt: new Date("2021-01-01"),
			roles: [Role.OWNER, Role.CHART, Role.TESTING],
		},
		{
			user: {
				id: "1",
				username: "sarah123",
				imageUrl: "https://github.com/jamesber.png",
				discordId: "123456789",
				createdAt: new Date("2021-01-01"),
			},
			joinedAt: new Date("2021-01-01"),
			roles: [Role.SYNC],
		},
		{
			user: {
				id: "1",
				username: "james456",
				imageUrl: "https://github.com/ocosmo55.png",
				discordId: "123456789",
				createdAt: new Date("2021-01-01"),
			},
			joinedAt: new Date("2021-01-01"),
			roles: [Role.EFFECTS],
		},
		{
			user: {
				id: "1",
				username: "jane789",
				imageUrl: "https://github.com/teste123.png",
				discordId: "123456789",
				createdAt: new Date("2021-01-01"),
			},
			joinedAt: new Date("2021-01-01"),
			roles: [Role.CHART],
		},
	],
	versions: [
		{
			id: "1",
			chartId: "1",
			index: 1,
			publishedAt: new Date("2021-01-01"),
			chartUrl: "https://example.com/1.0.0",
			downloadsAmount: 84,
			duration: 432,
			notesAmount: 532,
			effectsAmount: 12,
			bpm: 120,
			knownIssues: [
				{
					index: 1,
					description: "Incorrect note placed at 03m12s",
					createdAt: new Date("2021-01-01"),
				},
				{
					index: 2,
					description: "Unsynchronized section after drop",
					createdAt: new Date("2021-01-01"),
				},
				{
					index: 3,
					description: "Wrong direction swipe effect",
					createdAt: new Date("2021-01-01"),
				},
			],
		},
		{
			id: "2",
			chartId: "1",
			index: 2,
			publishedAt: new Date("2021-02-01"),
			chartUrl: "https://example.com/1.1.0",
			downloadsAmount: 221,
			duration: 432,
			notesAmount: 532,
			effectsAmount: 12,
			bpm: 120,
			knownIssues: [
				{
					index: 1,
					description: "Incorrect note placed at 03m12s",
					createdAt: new Date("2021-01-01"),
				},
				{
					index: 2,
					description: "Unsynchronized section after drop",
					createdAt: new Date("2021-01-01"),
				},
			],
		},
		{
			id: "3",
			chartId: "1",
			index: 3,
			publishedAt: new Date("2021-03-01"),
			chartUrl: "https://example.com/1.2.0",
			downloadsAmount: 325,
			duration: 432,
			effectsAmount: 12,
			notesAmount: 532,
			bpm: 120,
			knownIssues: [
				{
					index: 1,
					description: "Incorrect note placed at 03m12s",
					createdAt: new Date("2021-01-01"),
				},
			],
		},
	],
	artist: "Example Artist",
	coverUrl: "https://example.com/cover.png",
	difficulty: Difficulty.Hard,
	isDeluxe: false,
	isExplicit: false,
	isFeatured: false,
};
