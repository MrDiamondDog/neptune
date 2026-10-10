"use server";

import { eq } from "drizzle-orm";
import webpush, { PushSubscription } from "web-push";

import { db, usersTable } from "@/db/schema";
import { defaultNotificationSettings, UserNotificationSettings } from "@/db/types";

import { actionError, authenticate } from ".";

webpush.setVapidDetails(
  "https://neptune.drewrat.dev/",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: PushSubscription, notifications: UserNotificationSettings) {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	console.log(sub);

	await db.update(usersTable).set({ pushNotifications: notifications, pushSubscription: sub }).where(eq(usersTable.id, user.id!));
}

export async function unsubscribeUser() {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	await db.update(usersTable).set({ pushNotifications: defaultNotificationSettings, pushSubscription: null }).where(eq(usersTable.id, user.id!));
}

export async function sendNotification() {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const subscription = (await db.select({ pushSubscription: usersTable.pushSubscription }).from(usersTable).where(eq(usersTable.id, user.id!)))[0].pushSubscription;

	if (!subscription)
		throw actionError("No push notification subscription available");

	try {
		await webpush.sendNotification(
			subscription,
			JSON.stringify({
				title: "Test Notification",
				body: "This is a test notification!",
				icon: "/neptune.png",
			})
		);
		return { success: true };
	} catch (error) {
		console.error("Error sending push notification:", error);
		return { success: false, error: "Failed to send notification" };
	}
}
