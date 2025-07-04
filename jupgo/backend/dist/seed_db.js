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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function seedDb() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Clear existing data in reverse order of dependency
            yield db_1.default.execute('DELETE FROM messages');
            yield db_1.default.execute('DELETE FROM chats');
            yield db_1.default.execute('DELETE FROM user_favorites');
            yield db_1.default.execute('DELETE FROM product_images');
            yield db_1.default.execute('DELETE FROM transactions');
            yield db_1.default.execute('DELETE FROM products');
            yield db_1.default.execute('DELETE FROM user_profiles');
            yield db_1.default.execute('DELETE FROM users');
            // Insert dummy users
            const usersToInsert = [
                { email: 'user1@example.com', password: 'password123', nickname: '테스트유저1', location: '서울' },
                { email: 'user2@example.com', password: 'password123', nickname: '테스트유저2', location: '부산' },
                { email: 'user3@example.com', password: 'password123', nickname: '테스트유저3', location: '대구' },
            ];
            const userIds = [];
            for (const userData of usersToInsert) {
                const salt = yield bcryptjs_1.default.genSalt(10);
                const passwordHash = yield bcryptjs_1.default.hash(userData.password, salt);
                const [userResult] = yield db_1.default.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', [userData.email, passwordHash]);
                const userId = userResult.insertId;
                userIds.push(userId);
                yield db_1.default.execute('INSERT INTO user_profiles (user_id, nickname, location) VALUES (?, ?, ?)', [userId, userData.nickname, userData.location]);
                console.log(`User ${userData.email} created with ID: ${userId}`);
            }
            // Insert dummy products with different authors
            const productsToInsert = [
                {
                    name: '빈티지 가죽 지갑',
                    price: '35,000원',
                    description: '오래된 가죽 지갑이지만 상태가 좋습니다. 빈티지 스타일을 좋아하시는 분께 추천합니다.',
                    author_index: 0,
                    category_id: null,
                    images: [
                        'https://via.placeholder.com/300/FF5733/FFFFFF?text=Vintage+Wallet+1',
                        'https://via.placeholder.com/300/33FF57/FFFFFF?text=Vintage+Wallet+2',
                    ],
                },
                {
                    name: '거의 새것인 블루투스 이어폰',
                    price: '70,000원',
                    description: '선물 받았으나 사용하지 않아 판매합니다. 음질 좋습니다.',
                    author_index: 1,
                    category_id: null,
                    images: [
                        'https://via.placeholder.com/300/3357FF/FFFFFF?text=Earphones+1',
                        'https://via.placeholder.com/300/FF33A1/FFFFFF?text=Earphones+2',
                    ],
                },
                {
                    name: '디자인 서적 세트',
                    price: '20,000원',
                    description: '디자인 공부에 도움되는 서적 3권 세트입니다. 깨끗하게 사용했습니다.',
                    author_index: 2,
                    category_id: null,
                    images: [
                        'https://via.placeholder.com/300/33FFBD/FFFFFF?text=Design+Book+1',
                    ],
                },
                {
                    name: '새상품 캠핑 의자',
                    price: '50,000원',
                    description: '한 번도 사용하지 않은 캠핑 의자입니다. 접이식이라 보관이 용이합니다.',
                    author_index: 0,
                    category_id: null,
                    images: [
                        'https://via.placeholder.com/300/FFC300/FFFFFF?text=Camping+Chair+1',
                    ],
                },
                {
                    name: '아이패드 프로 11인치',
                    price: '800,000원',
                    description: '작년에 구매한 아이패드 프로입니다. 케이스와 함께 드립니다.',
                    author_index: 1,
                    category_id: null,
                    images: [
                        'https://via.placeholder.com/300/DAF7A6/FFFFFF?text=iPad+Pro+1',
                    ],
                },
            ];
            for (const product of productsToInsert) {
                const authorId = userIds[product.author_index];
                const [result] = yield db_1.default.execute('INSERT INTO products (author_id, category_id, name, price, description) VALUES (?, ?, ?, ?, ?)', [authorId, product.category_id, product.name, product.price, product.description]);
                const productId = result.insertId;
                if (product.images && product.images.length > 0) {
                    for (let i = 0; i < product.images.length; i++) {
                        yield db_1.default.execute('INSERT INTO product_images (product_id, image_url, order_index) VALUES (?, ?, ?)', [productId, product.images[i], i]);
                    }
                }
            }
            console.log('Database seeded successfully with dummy users and products.');
        }
        catch (error) {
            console.error('Error seeding database:', error);
        }
        finally {
            db_1.default.end();
        }
    });
}
seedDb();
