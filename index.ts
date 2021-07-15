import {SnapshotMirror } from "./snapshotMirror/snapshotMirror";

require("dotenv").config();

const mirror = new SnapshotMirror(process.env.WATCHED_SPACES.split(","));
mirror.watchSnapshot();

console.log("watching for new proposals...")
