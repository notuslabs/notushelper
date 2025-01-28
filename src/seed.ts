import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const maintainers: Prisma.MaintainerUpsertArgs[] = [
	{
		where: {
			discordUserId: "692404092756164668",
		},
		create: {
			name: "Tiago Neves",
			discordUserId: "692404092756164668",
			role: ["FRONTEND"],
		},
		update: {},
	},
	{
		where: {
			discordUserId: "195746220902187008",
		},
		create: {
			name: "Bernardo Müller",
			discordUserId: "195746220902187008",
			role: ["FRONTEND"],
		},
		update: {},
	},
	{
		where: {
			discordUserId: "378956057180897292",
		},
		create: {
			name: "Guilherme Correa",
			discordUserId: "378956057180897292",
			role: ["FRONTEND", "BACKEND"],
		},
		update: {},
	},
	{
		where: {
			discordUserId: "321177932959711232",
		},
		create: {
			name: "Christian Daniel",
			discordUserId: "321177932959711232",
			role: ["FRONTEND"],
		},
		update: {},
	},
	{
		where: {
			discordUserId: "830162255403286539",
		},
		create: {
			name: "André Zanghelini",
			discordUserId: "830162255403286539",
			role: ["BACKEND"],
		},
		update: {},
	},
	{
		where: {
			discordUserId: "818959779326197841",
		},
		create: {
			name: "Thalles Passos",
			discordUserId: "818959779326197841",
			role: ["BACKEND"],
		},
		update: {},
	},
];

const projects: Prisma.ProjectUpsertArgs[] = [
	{
		where: {
			name: "chainless-app",
		},
		create: {
			name: "chainless-app",
			roleFocus: "FRONTEND",
		},
		update: {},
	},
	{
		where: {
			name: "chainless-backend",
		},
		create: {
			name: "chainless-backend",
			roleFocus: "BACKEND",
		},
		update: {},
	},
	{
		where: {
			name: "nas-sdk",
		},
		create: {
			name: "nas-sdk",
			roleFocus: "BACKEND",
		},
		update: {},
	},
	{
		where: {
			name: "react-native-chainless-signer",
		},
		create: {
			name: "react-native-chainless-signer",
			roleFocus: "BACKEND",
		},
		update: {},
	},
	{
		where: {
			name: "facto-contracts",
		},
		create: {
			name: "facto-contracts",
			roleFocus: "BACKEND",
		},
		update: {},
	},
	{
		where: {
			name: "kassandra-application",
		},
		create: {
			name: "kassandra-application",
			roleFocus: "FRONTEND",
		},
		update: {},
	},
	{
		where: {
			name: "portal-replan",
		},
		create: {
			name: "portal-replan",
			roleFocus: "FRONTEND",
		},
		update: {},
	},
	{
		where: {
			name: "kassandra-frontend",
		},
		create: {
			name: "kassandra-frontend",
			roleFocus: "FRONTEND",
		},
		update: {},
	},
];

await prisma.$transaction([
	...projects.map((project) => prisma.project.upsert(project)),
	...maintainers.map((maintainer) => prisma.maintainer.upsert(maintainer)),
]);
