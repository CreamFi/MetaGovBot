import { default as axios } from "axios";
import axiosRetry from "axios-retry";
import postToDiscord from "../utils/postToDiscord";

require("dotenv").config();

axiosRetry(axios, { retries: 3 });

export class SnapshotMirror {

    _spaces: string[];
    _currentProps: string[];

    constructor(spaces: string[]) {
        this._spaces = spaces;
    }

    async watchSnapshot() {
        this._currentProps = await this._getCurrentProposals();
        setInterval(async () => await this._checkNewProp(), parseInt(process.env.DELAY));
    }

    async _checkNewProp() {
        const currentProps = await this._getCurrentProposals();

        const newProps = currentProps.filter(prop => !this._currentProps.includes(prop));

        if (newProps.length > 0) {
            const res = await axios.get("https://cloudflare-ipfs.com/ipfs/" + newProps[0]).catch(err => {
                console.error(err);
                throw err;
            });

            this._postToDiscord(newProps[0], res.data);
        }

        this._currentProps = currentProps;
    }

    async _getCurrentProposals(): Promise<string[]> {
        return (await Promise.all(this._spaces.map(async space => {
            const res = await axios.get(process.env.SNAPSHOT_HUB + `/api/${space}/proposals`).catch(err => {
                console.error(err);
                throw err;
            });
            const propHashes = Object.keys(res.data);
            return propHashes;
        }))).flat();
    }

    async _postToDiscord(hash: string, prop) {
        const msg = JSON.parse(prop.msg);
        const payload = msg.payload;
        const data = JSON.stringify({
            content: `https://${process.env.DOMAIN_NAME}/#/${process.env.SPACE_NAME}/proposal/${hash}`,
            embeds: [{
                title: `**New Snapshot Proposal**`,
                description: `**Title:** ${payload.name}\n\nGo Vote [Click here](https://${process.env.DOMAIN_NAME}/#/${process.env.SPACE_NAME}/proposal/${hash})`,
            }]
        });

        await postToDiscord(data, process.env.DISCORD_WEBHOOK);
    }
}
