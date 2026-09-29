import mqtt from 'mqtt';

interface IClientOptions {
    username: string;
    password: string;
    reconnectPeriod: number;
    clean: boolean;
}

let client: mqtt.MqttClient;

export const initMqtt =  {
    async connect() {
        const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.emqx.io';
        const options: IClientOptions = {
            username: process.env.MQTT_SUPPER_USER as string,
            password: process.env.MQTT_PASSWORD as string,
            reconnectPeriod: 5000, // ถ้าหลุด ให้พยายามต่อใหม่ทุกๆ 5 วินาที
            clean: true, // เคลียร์ session เก่าทิ้งเมื่อเริ่มใหม่
        };
        
        // console.log('🔄 Connecting to MQTT Broker...');
        client = mqtt.connect(brokerUrl, options);

        client.on('connect', () => {
            client.subscribe(process.env.MQTT_TOPIC_HEADER as string);
            console.log('✅ MQTT Connected successfully');
        });

        client.on('error', (err) => {
            console.error('❌ MQTT Connection Error:', err);
        });
        
        client.on('reconnect', () => {
            console.log('⚠️ MQTT Reconnecting...');
        });
        
        client.on('close', () => {
            console.log('🔴 MQTT Connection Closed');
        });

        return client;
    },

    callbackMessage (ServiceCall: (topic: string, message: string) => void){
        if (!client) {
            throw new Error("❌ MQTT Client is not connected");
        }
        console.log('📡 Listening to topic: ' ,process.env.MQTT_TOPIC_HEADER as string);
        client.on('message', (topic, message) => {
            console.log(`📩 [Device: ${topic}] Data:`, message.toString());
            ServiceCall(topic, message.toString()); 
        });
    }
}


//   private handleMessage(topic: string, message: Buffer) {
//     try {
//       const topicParts = topic.split('/'); 
//       const deviceId = topicParts[1];
      
//       const payload = JSON.parse(message.toString());

//       console.log(`📩 [Device: ${deviceId}] Data:`, payload);
      
//     } catch (error) {
//       console.error('❌ Error parsing MQTT message:', error);
//     }
//   }

//   // เผื่ออนาคตหน้าเว็บอยากกดปุ่มสั่งปิด-เปิดไฟที่ ESP32
//   public publishCommand(deviceId: string, command: object) {
//     if (!this.client?.connected) {
//       console.error('⚠️ Cannot publish: MQTT is not connected');
//       return;
//     }
//     const targetTopic = `sensor/${deviceId}/cmd`;
//     this.client.publish(targetTopic, JSON.stringify(command));
//   }
// }

// // Export เป็น Singleton Instance (เรียกใช้ตัวเดิมเสมอ ไม่ต้อง new ใหม่)
// export const mqttService = new MqttService();