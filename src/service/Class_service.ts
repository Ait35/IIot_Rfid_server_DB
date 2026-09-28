import { MqttWrite } from './mqttService/Write_mqtt.js';
import { MqttRead } from './mqttService/Read_mqtt.js';
import Service from './helper_func.js';
import { Query } from '../Repository/helperQuery.js';
import { DeviceWrite } from './DeviceService/write.device.js';
import { GroupWrite } from './GroupService/Write_mqtt.js';
// import { updateGroup } from '../Repository/updataQuery.js';

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
    // GroupRead : GroupRead
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
    DeviceWrite : DeviceWrite
}
// export const  DeviceQuery = {
//     QueryWrite : 
//     {
//         insertDevice
//     }
// }