-- 데이터베이스 선택
USE cuckoo;

-- User 테이블 생성
CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    UUID CHAR(36),
    created_at TIMESTAMP
) DEFAULT CHARSET=utf8mb4;

-- AlarmPreset 테이블 생성
CREATE TABLE AlarmPreset (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    icon VARCHAR(36),
    alarm_time TIME,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) DEFAULT CHARSET=utf8mb4;

-- UserPreset 테이블 생성
CREATE TABLE UserPreset (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    preset_id INT,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (preset_id) REFERENCES AlarmPreset(id)
) DEFAULT CHARSET=utf8mb4;

-- Memo 테이블 생성
CREATE TABLE Memo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    comment VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
) DEFAULT CHARSET=utf8mb4;

-- Tag 테이블 생성
CREATE TABLE Tag (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    color CHAR(30),
    memoCount INT
) DEFAULT CHARSET=utf8mb4;

-- MemoTag 테이블 생성
CREATE TABLE MemoTag (
    id INT PRIMARY KEY AUTO_INCREMENT,
    memo_id INT,
    tag_id INT,
    FOREIGN KEY (memo_id) REFERENCES Memo(id),
    FOREIGN KEY (tag_id) REFERENCES Tag(id)
) DEFAULT CHARSET=utf8mb4;

-- NotiLog 테이블 생성
CREATE TABLE NotiLog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sent_at TIMESTAMP,
    related_preset INT,
    FOREIGN KEY (related_preset) REFERENCES AlarmPreset(id)
) DEFAULT CHARSET=utf8mb4;

-- MemoLog 테이블 생성
CREATE TABLE MemoLog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_id INT,
    memo_id INT,
    FOREIGN KEY (log_id) REFERENCES NotiLog(id),
    FOREIGN KEY (memo_id) REFERENCES Memo(id)
) DEFAULT CHARSET=utf8mb4;

-- UserTag 테이블 생성
CREATE TABLE UserTag (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    tag_id INT,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (tag_id) REFERENCES Tag(id)
) DEFAULT CHARSET=utf8mb4;