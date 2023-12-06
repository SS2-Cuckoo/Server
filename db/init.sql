-- 사용자 생성 및 권한 부여
-- CREATE USER 'dksu'@'localhost' IDENTIFIED BY '1234';
-- GRANT ALL PRIVILEGES ON cuckoo.* TO 'dksu'@'localhost';

-- 데이터베이스 선택
USE cuckoo;

CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(15),
    UUID CHAR(36),
    created_at TIMESTAMP
);

CREATE TABLE AlarmPreset (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(8),
    icon VARCHAR(36),
    alarm_time TIME,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE UserPreset (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    preset_id INT,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (preset_id) REFERENCES AlarmPreset(id)
);

CREATE TABLE Memo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(30),
    comment VARCHAR(256),
    url VARCHAR(2083),
    thumbURL VARCHAR(2083),
    noti_cycle INT,
    noti_preset INT,
    noti_count INT,
    is_pinned BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (noti_preset) REFERENCES AlarmPreset(id)
);

CREATE TABLE Tag (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30),
    color CHAR(30),
    memoCount INT
);

CREATE TABLE MemoTag (
    id INT PRIMARY KEY AUTO_INCREMENT,
    memo_id INT,
    tag_id INT,
    FOREIGN KEY (memo_id) REFERENCES Memo(id),
    FOREIGN KEY (tag_id) REFERENCES Tag(id)
);

CREATE TABLE NotiLog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sent_at TIMESTAMP,
    related_preset INT,
    FOREIGN KEY (related_preset) REFERENCES AlarmPreset(id)
);

CREATE TABLE MemoLog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_id INT,
    memo_id INT,
    FOREIGN KEY (log_id) REFERENCES NotiLog(id),
    FOREIGN KEY (memo_id) REFERENCES Memo(id)
);
