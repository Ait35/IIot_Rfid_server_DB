// a connect() {
//     const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
//     const options: IClientOptions = {
//       username: process.env.MQTT_USERNAME || 'admin',
//       password: process.env.MQTT_PASSWORD || 'password',
//       reconnectPeriod: 5000, // ถ้าหลุด ให้พยายามต่อใหม่ทุกๆ 5 วินาที
//       clean: true, // เคลียร์ session เก่าทิ้งเมื่อเริ่มใหม่
//     };

//     console.log('🔄 Connecting to MQTT Broker...');
//     this.client = mqtt.connect(brokerUrl, options);

//     // --- ดักจับ Event ต่างๆ ---
//     this.client.on('connect', () => {
//       console.log('✅ MQTT Connected successfully');
//       this.subscribeToDevices(); // พอต่อติดปุ๊บ ให้ Subscribe ทันที
//     });

//     this.client.on('error', (err) => {
//       console.error('❌ MQTT Connection Error:', err);
//     });

//     this.client.on('reconnect', () => {
//       console.log('⚠️ MQTT Reconnecting...');
//     });

//     this.client.on('close', () => {
//       console.log('🔴 MQTT Connection Closed');
//     });

//     // --- จัดการเมื่อมีข้อมูลส่งเข้ามา ---
//     this.client.on('message', (topic, message) => {
//       this.handleMessage(topic, message);
//     });
//   }

//   // ฟังก์ชันกางมุ้งรอรับข้อมูล
//   private subscribeToDevices() {
//     // ใช้ + เป็น Wildcard เพื่อรับข้อมูลจาก Device ทุกตัว
//     const topic = 'sensor/+/data'; 
    
//     this.client?.subscribe(topic, (err) => {
//       if (err) {
//         console.error(`❌ Failed to subscribe to ${topic}`, err);
//       } else {
//         console.log(`📡 Subscribed to topic: ${topic}`);
//       }
//     });
//   }

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