
interface C_Log {
    device_id: number;
    epc_id: number;
    distance: number;
    timestamp?: string;
}

interface C_ECP_Tag {
    epc : string;
    tag : string | null;
    by_user_id : number;
    status	: string;	
    is_delete? : boolean;
}

export const RfidLogService = {
    async writeECP_Tag(topic : string, message : string) {
        // const topicParts = topic.split('/');
        // const payload = JSON.parse(message);

        // const dataOJB: C_ECP_Tag = {
        //     epc : payload.epc,
        //     tag : null,
        //     by_user_id : 1,
        //     status	: "",
        //     is_delete : false
        // }

        // console.log("📩 tocpic : ", topicParts);
        // console.log("📩 macIntopic : ", topicParts[5]);
        // console.log("📩 payload : ", payload);
    },

    async write_log(topic : string, message : string) {
        console.log("✅ Write Successful!");
    }
}