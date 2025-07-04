import pool from './db';

async function initDb() {
  try {
    // Drop tables in reverse order of dependency to avoid foreign key constraints issues
    await pool.execute('DROP TABLE IF EXISTS messages');
    await pool.execute('DROP TABLE IF EXISTS chats');
    await pool.execute('DROP TABLE IF EXISTS user_favorites');
    await pool.execute('DROP TABLE IF EXISTS product_images');
    await pool.execute('DROP TABLE IF EXISTS transactions');
    await pool.execute('DROP TABLE IF EXISTS products');
    await pool.execute('DROP TABLE IF EXISTS categories');
    await pool.execute('DROP TABLE IF EXISTS user_profiles');
    await pool.execute('DROP TABLE IF EXISTS users');

    await pool.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.execute(`
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

    await pool.execute(`
      CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT
      );
    `);

    await pool.execute(`
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

    await pool.execute(`
      CREATE TABLE product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    await pool.execute(`
      CREATE TABLE user_favorites (
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    await pool.execute(`
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

    await pool.execute(`
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

    await pool.execute(`
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
  } catch (error) {
    console.error('Error initializing database tables:', error);
  } finally {
    pool.end();
  }
}

initDb();