"use server";

import { eq } from "drizzle-orm";
import webpush, { PushSubscription } from "web-push";

import { db, usersTable } from "@/db/schema";
import { defaultNotificationSettings, UserNotificationSettings } from "@/db/types";
import { deleteFromArray } from "@/lib/array";

import { actionError, authenticate } from ".";
import { getUser } from "./users";

webpush.setVapidDetails(
  "https://neptune.drewrat.dev/",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: PushSubscription, notifications: UserNotificationSettings) {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const dbUser = (await getUser())!;

	await db.update(usersTable).set({
		pushNotifications: notifications,
		pushSubscriptions: [...dbUser.pushSubscriptions, sub]
	}).where(eq(usersTable.id, user.id!));
}

export async function unsubscribeUser(sub: PushSubscription) {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const dbUser = (await getUser())!;

	await db.update(usersTable).set({
		pushNotifications: defaultNotificationSettings,
		pushSubscriptions: deleteFromArray(dbUser.pushSubscriptions, sub)
	}).where(eq(usersTable.id, user.id!));
}

export async function sendNotification() {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const subscriptions = (await db.select({ pushSubscription: usersTable.pushSubscriptions }).from(usersTable).where(eq(usersTable.id, user.id!)))[0].pushSubscription;

	if (!subscriptions.length)
		throw actionError("No push notification subscription available");

	for (const sub of subscriptions) {
		try {
			await webpush.sendNotification(
				sub,
				JSON.stringify({
					title: "Test Notification",
					body: "This is a test notification!",
					icon: "/neptune.png",
				})
			);
		} catch (error) {
			console.error("Error sending push notification:", error);
		}
	}
	return { success: true };
}
