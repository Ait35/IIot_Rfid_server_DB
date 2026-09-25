DROP TABLE IF EXISTS Log_Rfid;
DROP TABLE IF EXISTS MQTT;
DROP TABLE IF EXISTS Map_tag;
DROP TABLE IF EXISTS Device_info;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    User_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    university_id VARCHAR(20) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    first_name    VARCHAR(255) NOT NULL,
    last_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(20) DEFAULT 'student',
    token         VARCHAR(255),              
    is_delete     BOOLEAN DEFAULT FALSE,       
    deleted_at    TIMESTAMP DEFAULT NULL      
);

CREATE TABLE Device_info (
    Device_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Device_name  VARCHAR(100),
    By_user_id   INT NOT NULL,
    mac          VARCHAR(17) NOT NULL UNIQUE,
    IP           VARCHAR(45) NOT NULL,
    subnet       VARCHAR(45) NOT NULL,
    gate_way     VARCHAR(45) NOT NULL,
    timeStart    TIMESTAMP NOT NULL,
    up_time      TIMESTAMP,
    Local        VARCHAR(255) NOT NULL,
    is_delete    BOOLEAN DEFAULT FALSE,       
    deleted_at   TIMESTAMP DEFAULT NULL,

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

    CONSTRAINT fk_mqtt_device
        FOREIGN KEY (Config_device)
        REFERENCES Device_info(Device_id),

    CONSTRAINT fk_mqtt_user
        FOREIGN KEY (By_user_id)
        REFERENCES Users(User_id)
);

CREATE TABLE Map_tag (
    EPC          VARCHAR(255) PRIMARY KEY,
    Tag          VARCHAR(255),
    time_Stamp   TIMESTAMP NOT NULL,
    By_user_id   INT NOT NULL,
    is_delete    BOOLEAN DEFAULT FALSE,        
    deleted_at   TIMESTAMP DEFAULT NULL,

    CONSTRAINT fk_maptag_user
        FOREIGN KEY (By_user_id)
        REFERENCES Users(User_id)
);

CREATE TABLE Log_Rfid (
    Log_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Device_id    INT NOT NULL,
    EPC          VARCHAR(255) NOT NULL,
    distance     DOUBLE PRECISION,
    time_stamp   TIMESTAMP NOT NULL,
    photo        BYTEA,

    CONSTRAINT fk_log_device
        FOREIGN KEY (Device_id)
        REFERENCES Device_info(Device_id),

    CONSTRAINT fk_log_epc
        FOREIGN KEY (EPC)
        REFERENCES Map_tag(EPC)
);