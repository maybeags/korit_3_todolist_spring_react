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
            yield db_1.default.execute('DELETE FROM categories');
            yield db_1.default.execute('DELETE FROM user_profiles');
            yield db_1.default.execute('DELETE FROM users');
            // Insert dummy users
            const usersToInsert = [
                { email: 'user1@example.com', password: 'password123', nickname: '테스트유저1', location: '서울' },
                { email: 'user2@example.com', password: 'password123', nickname: '테스트유저2', location: '부산' },
                { email: 'user3@example.com', password: 'password123', nickname: '테스트유저3', location: '대구' },
                { email: 'user4@example.com', password: 'password123', nickname: '테스트유저4', location: '인천' },
                { email: 'user5@example.com', password: 'password123', nickname: '테스트유저5', location: '광주' },
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
            // Insert dummy categories
            const categoriesToInsert = [
                { name: '디지털기기', description: '스마트폰, 태블릿, 노트북 등' },
                { name: '생활가전', description: '냉장고, 세탁기, 에어컨 등' },
                { name: '가구/인테리어', description: '침대, 소파, 책상 등' },
                { name: '스포츠/레저', description: '자전거, 등산용품, 헬스용품 등' },
                { name: '의류', description: '남성복, 여성복, 아동복 등' },
                { name: '도서/티켓/음반', description: '책, 공연 티켓, 앨범 등' },
                { name: '기타', description: '그 외 모든 상품' },
            ];
            const categoryIds = [];
            for (const categoryData of categoriesToInsert) {
                const [categoryResult] = yield db_1.default.execute('INSERT INTO categories (name, description) VALUES (?, ?)', [categoryData.name, categoryData.description]);
                const categoryId = categoryResult.insertId;
                categoryIds.push(categoryId);
                console.log(`Category ${categoryData.name} created with ID: ${categoryId}`);
            }
            // Insert dummy products with different authors and categories
            const productsToInsert = [
                {
                    name: '빈티지 가죽 지갑',
                    price: '35,000원',
                    description: '오래된 가죽 지갑이지만 상태가 좋습니다. 빈티지 스타일을 좋아하시는 분께 추천합니다.',
                    author_index: 0,
                    category_index: 6,
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
                    category_index: 0,
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
                    category_index: 5,
                    images: [
                        'https://via.placeholder.com/300/33FFBD/FFFFFF?text=Design+Book+1',
                    ],
                },
                {
                    name: '새상품 캠핑 의자',
                    price: '50,000원',
                    description: '한 번도 사용하지 않은 캠핑 의자입니다. 접이식이라 보관이 용이합니다.',
                    author_index: 0,
                    category_index: 3,
                    images: [
                        'https://via.placeholder.com/300/FFC300/FFFFFF?text=Camping+Chair+1',
                    ],
                },
                {
                    name: '아이패드 프로 11인치',
                    price: '800,000원',
                    description: '작년에 구매한 아이패드 프로입니다. 케이스와 함께 드립니다.',
                    author_index: 1,
                    category_index: 0,
                    images: [
                        'https://via.placeholder.com/300/DAF7A6/FFFFFF?text=iPad+Pro+1',
                    ],
                },
                {
                    name: '거의 새것인 냉장고',
                    price: '500,000원',
                    description: '이사하면서 판매합니다. 상태 좋습니다.',
                    author_index: 2,
                    category_index: 1,
                    images: [
                        'https://via.placeholder.com/300/FF5733/FFFFFF?text=Refrigerator+1',
                    ],
                },
                {
                    name: '모던 스타일 소파',
                    price: '250,000원',
                    description: '새로운 소파를 구매하여 판매합니다. 사용감 적습니다.',
                    author_index: 0,
                    category_index: 2,
                    images: [
                        'https://via.placeholder.com/300/33FF57/FFFFFF?text=Sofa+1',
                    ],
                },
                {
                    name: '나이키 운동화 270mm',
                    price: '80,000원',
                    description: '한 번 착용 후 보관만 했습니다. 새것과 다름 없습니다.',
                    author_index: 1,
                    category_index: 4,
                    images: [
                        'https://via.placeholder.com/300/3357FF/FFFFFF?text=Shoes+1',
                    ],
                },
                {
                    name: '베스트셀러 소설책',
                    price: '15,000원',
                    description: '재미있게 읽은 소설책입니다. 깨끗하게 보관했습니다.',
                    author_index: 2,
                    category_index: 5,
                    images: [
                        'https://via.placeholder.com/300/FF33A1/FFFFFF?text=Book+1',
                    ],
                },
                {
                    name: '미니멀 디자인 스탠드',
                    price: '40,000원',
                    description: '인테리어 소품으로 좋습니다. 불빛 조절 가능합니다.',
                    author_index: 0,
                    category_index: 6,
                    images: [
                        'https://via.placeholder.com/300/33FFBD/FFFFFF?text=Lamp+1',
                    ],
                },
                {
                    name: '고성능 게이밍 노트북',
                    price: '1,200,000원',
                    description: '최신 게임도 원활하게 돌아갑니다. 1년 사용했습니다.',
                    author_index: 3,
                    category_index: 0,
                    images: [
                        'https://via.placeholder.com/300/FFC300/FFFFFF?text=Gaming+Laptop+1',
                    ],
                },
                {
                    name: '드럼 세탁기',
                    price: '300,000원',
                    description: '용량 큰 드럼 세탁기입니다. 작동 잘 됩니다.',
                    author_index: 4,
                    category_index: 1,
                    images: [
                        'https://via.placeholder.com/300/DAF7A6/FFFFFF?text=Washing+Machine+1',
                    ],
                },
                {
                    name: '원목 식탁 세트',
                    price: '180,000원',
                    description: '4인용 원목 식탁과 의자 세트입니다. 튼튼합니다.',
                    author_index: 3,
                    category_index: 2,
                    images: [
                        'https://via.placeholder.com/300/C70039/FFFFFF?text=Dining+Table+1',
                    ],
                },
                {
                    name: '로드 자전거',
                    price: '400,000원',
                    description: '가볍고 속도 잘 나옵니다. 출퇴근용으로 좋습니다.',
                    author_index: 4,
                    category_index: 3,
                    images: [
                        'https://via.placeholder.com/300/900C3F/FFFFFF?text=Road+Bike+1',
                    ],
                },
                {
                    name: '여성 겨울 코트',
                    price: '90,000원',
                    description: '따뜻하고 디자인 예쁜 겨울 코트입니다. 드라이클리닝 완료.',
                    author_index: 3,
                    category_index: 4,
                    images: [
                        'https://via.placeholder.com/300/581845/FFFFFF?text=Winter+Coat+1',
                    ],
                },
                {
                    name: '클래식 기타',
                    price: '120,000원',
                    description: '입문용으로 좋은 클래식 기타입니다. 케이스 포함.',
                    author_index: 4,
                    category_index: 6,
                    images: [
                        'https://via.placeholder.com/300/FF5733/FFFFFF?text=Guitar+1',
                    ],
                },
                {
                    name: '무선 충전기',
                    price: '25,000원',
                    description: '고속 무선 충전기입니다. 모든 스마트폰 호환됩니다.',
                    author_index: 0,
                    category_index: 0,
                    images: [
                        'https://via.placeholder.com/300/33FF57/FFFFFF?text=Wireless+Charger+1',
                    ],
                },
                {
                    name: '공기청정기',
                    price: '150,000원',
                    description: '미세먼지 제거에 탁월합니다. 필�� 교체 시기 알림 기능.',
                    author_index: 1,
                    category_index: 1,
                    images: [
                        'https://via.placeholder.com/300/3357FF/FFFFFF?text=Air+Purifier+1',
                    ],
                },
                {
                    name: '책상 의자',
                    price: '60,000원',
                    description: '편안한 사무용 의자입니다. 높이 조절 가능.',
                    author_index: 2,
                    category_index: 2,
                    images: [
                        'https://via.placeholder.com/300/FF33A1/FFFFFF?text=Office+Chair+1',
                    ],
                },
                {
                    name: '캠핑 텐트',
                    price: '100,000원',
                    description: '2인용 캠핑 텐트입니다. 설치 간편합니다.',
                    author_index: 3,
                    category_index: 3,
                    images: [
                        'https://via.placeholder.com/300/33FFBD/FFFFFF?text=Camping+Tent+1',
                    ],
                },
            ];
            for (const product of productsToInsert) {
                const authorId = userIds[product.author_index];
                const categoryId = categoryIds[product.category_index];
                const [result] = yield db_1.default.execute('INSERT INTO products (author_id, category_id, name, price, description) VALUES (?, ?, ?, ?, ?)', [authorId, categoryId, product.name, product.price, product.description]);
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
