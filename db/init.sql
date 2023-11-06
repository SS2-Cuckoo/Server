-- 사용자 생성 및 권한 부여
CREATE USER 'dksu'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON cuckoo.* TO 'dksu'@'localhost';

-- 데이터베이스 선택
USE cuckoo;

-- User 테이블 생성
CREATE TABLE User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  code VARCHAR(8) CHECK (LENGTH(code) BETWEEN 4 AND 8),
  uuid CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memo 테이블 생성
CREATE TABLE Memo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) DEFAULT NULL,
  comment VARCHAR(256),
  url_link TEXT,
  noti_cycle TEXT, -- 상세 요구 사항에 따라 데이터 타입이 변경될 필요가 있음
  noti_time TEXT,  -- 적절한 데이터 타입으로 변경 필요
  noti_status BOOLEAN,
  noti_count INT,
  is_pinned BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  remaining_noti_time TIME,
  FOREIGN KEY (user_id) REFERENCES User(id)
);

-- Tag 테이블 생성
CREATE TABLE Tag (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color CHAR(7) CHECK (color LIKE '#______'),
  `order` INT
);

-- MemoTag 테이블 생성
CREATE TABLE MemoTag (
  memo_id INT,
  tag_id INT,
  PRIMARY KEY (memo_id, tag_id),
  FOREIGN KEY (memo_id) REFERENCES Memo(id),
  FOREIGN KEY (tag_id) REFERENCES Tag(id)
);

-- AlarmPreset 테이블 생성
CREATE TABLE AlarmPreset (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  preset_name VARCHAR(255) NOT NULL,
  preset_icon TEXT,
  preset_value TEXT, -- 상세 요구 사항에 따라 데이터 타입이 변경될 필요가 있음
  FOREIGN KEY (user_id) REFERENCES User(id)
);

-- Notification_Log 테이
