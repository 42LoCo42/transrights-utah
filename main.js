#!/usr/bin/env node

// code mostly taken from https://maiayoon.com/utah
// trans rights are human rights!

import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import crypto from "crypto";

const config = {
	apiKey: "AIzaSyC_Lx2qZYjtxP8Sw4YA6FdCJhKYA2umWbs",
	authDomain: "ut-sao-special-dev.firebaseapp.com",
	projectId: "ut-sao-special-dev",
	storageBucket: "ut-sao-special-dev-test-new",
	messagingSenderId: "967191099599",
	appId: "1:967191099599:web:9ecd5fb85db9a6c78c9fba",
	measurementId: "G-G3Y0X625G4",
	databaseURL: "https://ut-sao-special-dev-default-rtdb.firebaseio.com",
};

firebase.initializeApp(config);
const app = firebase.app();
const storage = app.storage("gs://ut-sao-special-dev-test-new");

let totalBytes = 0;

await (async () => {
	while (true) {
		// Why is this so shittily coded?
		// Because it's grabbed straight from the actual website's source code
		const currentdate = new Date();
		const timestampStr =
			currentdate.getFullYear() +
			"_" +
			(currentdate.getMonth() + 1) +
			"_" +
			currentdate.getDate() +
			" _ " +
			currentdate.getHours() +
			"_" +
			currentdate.getMinutes() +
			"_" +
			currentdate.getSeconds();
		const uq_file_name = timestampStr + "_" + getRandomWord();

		// We format the file name just like the real site does,
		// so they can't easily filter out our uploads
		console.log(uq_file_name);

		const blob = new Uint8Array(crypto.randomBytes(1024 ** 3).buffer);
		const ref = storage.ref().child(uq_file_name);
		const task = ref.put(blob);

		let lastBytesTransferred = 0;
		task.on(
			"state_changed",
			(snap) => {
				totalBytes += snap.bytesTransferred - lastBytesTransferred;
				lastBytesTransferred = snap.bytesTransferred;
				refreshUI();
			},
			(e) => {
				console.log(`Error: ${e}`);
			},
		);

		await task.then(async (snap) => {
			refreshUI();
			await task.snapshot.ref.getDownloadURL().then((downloadURL) => {
				console.log("File available at", downloadURL);
			});
		});
	}
})();

function refreshUI() {
	const gb = Math.floor(totalBytes / 1073741824);
	const cost = ((totalBytes / 1073741824) * 0.026).toFixed(5);
	console.log(`${totalBytes} bytes uploaded,\tcosting Utah $${cost}`);
}

function getRandomWord() {
	const characters =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
	const length = Math.floor(Math.random() * 20) + 4;
	let result = "";
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}
