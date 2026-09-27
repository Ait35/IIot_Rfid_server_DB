import { MqttWrite } from './mqttService/Write_mqtt.js';
import { MqttRead } from './mqttService/Read_mqtt.js';
import Service from './helper_func.js';
import {getMqtt} from '../Repository/MqttQuery/ReadQuery.js';
import {insertMqtt} from '../Repository/MqttQuery/InsertQuery.js';
import {updateMqtt} from '../Repository/MqttQuery/updataQuery.js';
import { Query } from '../Repository/helperQuery.js';
import { DeviceWrite } from './DeviceService/write.device.js';
import { insertDevice } from '../Repository/DeviceQuery/insert.Device.js';

export const Helper = {
    Service : Service,
    Query : Query
};

export const  MqttService = {
    MqttWrite : MqttWrite,
    MqttRead : MqttRead
}
export const  MqttQuery = {
    QueryWrite : 
    {
        insertMqtt , 
        updateMqtt
    },
    QueryRead: 
    {
        getMqtt
    }
}

export const  DeviceService = {
    DeviceWrite : DeviceWrite
}
export const  DeviceQuery = {
    QueryWrite : 
    {
        insertDevice
    }
}