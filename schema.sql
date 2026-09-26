DROP TABLE IF EXISTS Activity_Log CASCADE;
DROP TABLE IF EXISTS Log_Rfid CASCADE;
DROP TABLE IF EXISTS MQTT CASCADE;
DROP TABLE IF EXISTS Map_tag CASCADE;
DROP TABLE IF EXISTS Device_info CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

CREATE TABLE Users (
    User_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    university_id VARCHAR(20) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    first_name    VARCHAR(255) NOT NULL,
    last_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(20) DEFAULT 'student',
    created_at    TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0), -- ปรับให้ออโต้
    last_login_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    is_delete     BOOLEAN DEFAULT FALSE,       
    token         VARCHAR(255)     
);

CREATE TABLE Device_info (
    Device_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Device_name  VARCHAR(100),
    By_user_id   INT NOT NULL,
    mac          VARCHAR(17) NOT NULL UNIQUE,
    IP           VARCHAR(45) NOT NULL,
    subnet       VARCHAR(45) NOT NULL,
    gate_way     VARCHAR(45) NOT NULL,
    timeStart    TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    up_time      TIMESTAMP(0),
    Local        VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0), -- ปรับให้ออโต้
    is_delete    BOOLEAN DEFAULT FALSE,       

    CONSTRAINT fk_device_user
        FOREIGN KEY (By_user_id)
        REFERENCES Users(User_id)
);

CREATE TABLE MQTT (
    Mqtt_id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Config_device  INT NOT NULL UNIQUE,
    By_user_id     INT NOT NULL,
    Topic          VARCHAR(255),
    User_Mqtt      VARCHAR(255),
    Pass_Mqtt      VARCHAR(255),
    created_at     TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0), -- ปรับให้ออโต้
    is_delete      BOOLEAN DEFAULT FALSE,       

    CONSTRAINT fk_mqtt_device
        FOREIGN KEY (Config_device)
        REFERENCES Device_info(Device_id),

    CONSTRAINT fk_mqtt_user
        FOREIGN KEY (By_user_id)
        REFERENCES Users(User_id)
);

CREATE TABLE Map_tag (
    EPC_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EPC          VARCHAR(255) NOT NULL UNIQUE,
    Tag          VARCHAR(255),
    By_user_id   INT NOT NULL,
    created_at   TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    is_delete    BOOLEAN DEFAULT FALSE,        

    CONSTRAINT fk_maptag_user
        FOREIGN KEY (By_user_id)
        REFERENCES Users(User_id)
);

CREATE TABLE Log_Rfid (
    Log_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Device_id    INT NOT NULL,
    EPC_id       INT NOT NULL,
    distance     DOUBLE PRECISION,
    time_stamp   TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0), -- ปกติ Log ควรสร้างเวลาออโต้เมื่อมีการบันทึก
    photo        BYTEA,

    CONSTRAINT fk_log_device
        FOREIGN KEY (Device_id)
        REFERENCES Device_info(Device_id),

    CONSTRAINT fk_log_epc
        FOREIGN KEY (EPC_id)
        REFERENCES Map_tag(EPC_id)
);

CREATE TABLE Activity_Log (
    Activity_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    User_id       INT,                                 
    action_type   VARCHAR(100) NOT NULL,      -- Sigin, LOGIN ,ADD_TAG , SOFT_DELETE , UPDATE , DELETE , RESTORE , ENABLE , DISABLE
    target_table  VARCHAR(100),    
    target_id     INT ,
    payload       JSONB,                 -- ค่าเก่า และค่าใหม่              
    time_action   TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0), 

    CONSTRAINT fk_activity_user
        FOREIGN KEY (User_id)
        REFERENCES Users(User_id) 
        ON DELETE SET NULL  
);

CREATE INDEX idx_activity_payload ON Activity_Log USING GIN (payload jsonb_path_ops);
CREATE INDEX idx_activity_time ON Activity_Log(time_action DESC);