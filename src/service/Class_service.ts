import { MqttWrite } from './mqttService/write.mqtt.js';
import { MqttRead } from './mqttService/read.mqtt.js';
import Service from './helper_func.js';
import { Query } from '../Repository/helperQuery.js';
import { DeviceWrite } from './DeviceService/write.device.js';
import { DeviceRead } from './DeviceService/read.device.js';
import { GroupWrite } from './GroupService/writ.group.js';
import { GroupRead } from './GroupService/read_group.js';
import { Map_tagWrite } from './MapService/write.tag.js';
import { TagRead } from './MapService/read.tag.js';

export const Helper = {
    Service : Service,
    Query : Query
};

export const  MqttService = {
    MqttWrite : MqttWrite,
    MqttRead : MqttRead
}
// export const  MqttQuery = {
//     QueryWrite : 
//     {
//         insertMqtt , 
//         updateMqtt
//     },
//     QueryRead: 
//     {
//         getMqtt
//     }
// }

export const  GroupService = {
    GroupWrite : GroupWrite,
    GroupRead : GroupRead
}
// export const  GroupQuery = {
//     QueryWrite : 
//     {
//         insertGroup,
//         // updateGroup
//     },
//     // QueryRead: 
//     // {
//     //     getMqtt
//     // }
// }

export const  DeviceService = {
    DeviceWrite : DeviceWrite,
    DeviceRead : DeviceRead
}
// export const  DeviceQuery = {
//     QueryWrite : 
//     {
//         insertDevice
//     }
// }
export const  MapTagService = {
    Map_tagWrite : Map_tagWrite,
    Map_tagRead : TagRead
}