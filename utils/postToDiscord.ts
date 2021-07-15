import { default as axios } from "axios";

export default async (data: string, webhook: string) => {
    const config = {
        method: 'post',
        url: webhook,
        headers: {
            'Content-Type': 'application/json',
        },
        data : data
    }
    return await axios(config as any);
}
