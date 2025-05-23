#!/usr/bin/env node
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { startTwitchServer } from "./index.js"; // function you'll add in step 2

interface Args {
  "client-id": string;
  "client-secret": string;
}

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
  .parseSync() as Args;

startTwitchServer({
  clientId: argv["client-id"],
  clientSecret: argv["client-secret"],
});
