-- CREATE TABLE users (
--     id BIGINT(255) NOT NULL AUTO_INCREMENT,
--     userclass ENUM('normal', 'retailer', 'agent', 'admin') NOT NULL DEFAULT 'normal',
--     username VARCHAR(255) COLLATE utf8_unicode_ci UNIQUE NOT NULL,
--     password VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
--     balance BIGINT(255) NOT NULL DEFAULT 0,
--     name VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
--     nickname VARCHAR(255) COLLATE utf8_unicode_ci UNIQUE NOT NULL,
--     user_level TINYINT(1) NOT NULL DEFAULT 1,
--     is_logged_in BOOLEAN NOT NULL DEFAULT FALSE,
--     last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
--     last_logged_ip INT UNSIGNED DEFAULT NULL,
--     currently_logged_ip INT UNSIGNED DEFAULT NULL,
--     reg_date DATETIME NOT NULL,
--     email VARCHAR(255) COLLATE utf8_unicode_ci DEFAULT NULL,
--     phone_num VARCHAR(255) COLLATE utf8_unicode_ci DEFAULT NULL,
--     bank_name VARCHAR(255) COLLATE utf8_unicode_ci DEFAULT NULL,
--     bank_number VARCHAR(255) COLLATE utf8_unicode_ci DEFAULT NULL,
--     bank_holder VARCHAR(255) COLLATE utf8_unicode_ci DEFAULT NULL,
--     dominant VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
--     total_bet BIGINT(255) NOT NULL DEFAULT 0,
--     total_won BIGINT(255) NOT NULL DEFAULT 0,
--     total_lost BIGINT(255) NOT NULL DEFAULT 0,
--     net_profit BIGINT(255) NOT NULL DEFAULT 0,
--     total_deposit BIGINT(255) NOT NULL DEFAULT 0,
--     total_withdrawn BIGINT(255) NOT NULL DEFAULT 0,
--     commission_rate FLOAT NOT NULL DEFAULT 0,
--     status CHAR(4) DEFAULT 0000,
--     description VARCHAR(255) COLLATE utf8_unicode_ci,
--     joined_domain VARCHAR(255) COLLATE utf8_unicode_ci,
--     PRIMARY KEY `id` (id),
--     KEY `domain` (joined_domain)
-- ) ENGINE=MyISAM AUTO_INCREMENT=23881 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE users (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    password VARCHAR(255) NOT NULL,
    userclass ENUM('normal', 'admin') NOT NULL DEFAULT 'normal',
    regdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM AUTO_INCREMENT=23881 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT(11) NOT NULL REFERENCES users(id),
    ip_address INT(11) UNSIGNED NOT NULL,
    user_agent VARCHAR(255),
    fingerprint VARCHAR(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired TIMESTAMP NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
