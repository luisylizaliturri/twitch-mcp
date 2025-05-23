#!/usr/bin/env node
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { startTwitchServer } from "./index.js"; // function you'll add in step 2
const argv = yargs(hideBin(process.argv))
    .option("client-id", {
    demandOption: true,
    type: "string",
    desc: "Twitch Client ID",
})
    .option("client-secret", {
    demandOption: true,
    type: "string",
    desc: "Twitch Client secret",
})
    .strict()
    .help()
    .parseSync();
startTwitchServer({
    clientId: argv["client-id"],
    clientSecret: argv["client-secret"],
});
