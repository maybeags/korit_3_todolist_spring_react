"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
function initDb() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Drop tables in reverse order of dependency to avoid foreign key constraints issues
            yield db_1.default.execute('DROP TABLE IF EXISTS messages');
            yield db_1.default.execute('DROP TABLE IF EXISTS chats');
            yield db_1.default.execute('DROP TABLE IF EXISTS user_favorites');
            yield db_1.default.execute('DROP TABLE IF EXISTS product_images');
            yield db_1.default.execute('DROP TABLE IF EXISTS transactions');
            yield db_1.default.execute('DROP TABLE IF EXISTS products');
            yield db_1.default.execute('DROP TABLE IF EXISTS categories');
            yield db_1.default.execute('DROP TABLE IF EXISTS user_profiles');
            yield db_1.default.execute('DROP TABLE IF EXISTS users');
            yield db_1.default.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
            yield db_1.default.execute(`
      CREATE TABLE user_profiles (
        user_id INT PRIMARY KEY,
        nickname VARCHAR(100) UNIQUE NOT NULL,
        profile_image_url VARCHAR(255),
        bio TEXT,
        phone_number VARCHAR(20),
        location VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
            yield db_1.default.execute(`
      CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT
      );
    `);
            yield db_1.default.execute(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author_id INT NOT NULL,
        category_id INT,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(50) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT '판매중' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);
            yield db_1.default.execute(`
      CREATE TABLE product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);
            yield db_1.default.execute(`
      CREATE TABLE user_favorites (
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);
            yield db_1.default.execute(`
      CREATE TABLE chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        seller_id INT NOT NULL,
        buyer_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
            yield db_1.default.execute(`
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chat_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
            yield db_1.default.execute(`
      CREATE TABLE transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        seller_id INT NOT NULL,
        buyer_id INT NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        final_price VARCHAR(50),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
            console.log('Database tables initialized successfully for MariaDB.');
        }
        catch (error) {
            console.error('Error initializing database tables:', error);
        }
        finally {
            db_1.default.end();
        }
    });
}
initDb();
