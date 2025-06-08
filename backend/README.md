    Dokumentasi API PantaiKu (Beach Review API)

Selamat datang di dokumentasi API PantaiKu. API ini memungkinkan Anda untuk mengelola data pantai, ulasan pengguna, dan akun pengguna.

Base URL: http://localhost:5000 (Sesuaikan dengan URL server pengembangan Anda)

Autentikasi
Beberapa endpoint memerlukan autentikasi menggunakan JSON Web Token (JWT). Jika sebuah endpoint memerlukan autentikasi, Anda harus menyertakan token JWT di header Authorization dengan skema Bearer.

Contoh Header Autentikasi:

Authorization: Bearer <TOKEN_ANDA_DISINI>

Daftar Isi
Endpoints Pantai

Endpoints Pengguna (User)

Endpoints Ulasan (Review)

Skema Data Umum

Endpoints Pantai

1. Dapatkan Rekomendasi Pantai
   POST /beach/recommend

Mendapatkan rekomendasi pantai berdasarkan deskripsi preferensi teks dari pengguna. Request ini akan diteruskan ke layanan Machine Learning untuk mendapatkan skor rekomendasi.

Request Body: application/json

{
"preference_text": "Saya suka pantai yang sepi dengan air jernih dan pasir putih, cocok untuk snorkeling."
}

preference_text (string, required, min 10 karakter): Deskripsi preferensi pantai pengguna.

Responses:

200 OK: Rekomendasi berhasil diterima.

{
"message": "Beach recommendations based on your preference",
"recommendations": [
{
"placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
"score": 0.87,
"name": "Pantai Kuta",
"rating": 4.5
}
// ... rekomendasi lainnya
]
}

400 Bad Request: Kesalahan validasi (misalnya, preference_text terlalu pendek).

{
"success": false,
"status": 400,
"message": "Validation Error: Preference text should be descriptive (min 10 characters)"
}

500 Internal Server Error: Terjadi kesalahan pada server atau layanan ML.

2. Cari Pantai
   GET /beach/search

Mencari pantai berdasarkan kata kunci. Pencarian dilakukan pada nama dan deskripsi pantai. Hasilnya dipaginasi.

Query Parameters:

search (string, opsional): Kata kunci untuk pencarian. Contoh: sunset

limit (integer, opsional, default: 10): Jumlah item per halaman. Contoh: 5

page (integer, opsional, default: 1): Nomor halaman. Contoh: 1

Contoh Request: /beach/search?search=pasir putih&limit=5&page=1

Responses:

200 OK: Pencarian berhasil.

{
"message": "Beaches retrieved successfully",
"count": 1, // Jumlah pantai di halaman ini
"page": 1,
"limit": 5,
"data": [
{
"placeId": "ChIJ0f2fV5xzaS4R1xH9oJp5A-0",
"name": "Pantai Pasir Putih",
"description": "Pantai indah dengan pasir putih dan air yang tenang.",
"rating": 4.8,
"reviews": 75,
"sentimentSummary": {
"positive": 85.0,
"negative": 5.0,
"neutral": 10.0
},
"featured_image": "[https://example.com/image.jpg](https://example.com/image.jpg)",
"address": "Jl. Pantai Pasir Putih No.1",
"review_keywords": "bersih, tenang, indah",
"link": "[https://maps.google.com/?cid=12345](https://maps.google.com/?cid=12345)",
"coordinates": "-8.12345,115.12345"
}
// ... pantai lainnya
]
}

(Catatan: totalCount dan totalPages untuk endpoint search idealnya dihitung di service agar akurat, respons di atas mungkin tidak mencakupnya jika implementasi controller tidak menyertakannya)

400 Bad Request: Parameter query tidak valid.

500 Internal Server Error.

3. Cari Pantai Terdekat
   GET /beach/nearby

Menemukan pantai yang berada dalam radius tertentu dari koordinat (latitude, longitude) pengguna. Hasilnya dipaginasi dan diurutkan berdasarkan jarak terdekat.

Query Parameters:

lat (float, required): Latitude pengguna. Contoh: -6.2088

lng (float, required): Longitude pengguna. Contoh: 106.8456

radius (integer, opsional, default: 10): Radius pencarian dalam kilometer. Contoh: 15

limit (integer, opsional, default: 10): Jumlah item per halaman. Contoh: 5

page (integer, opsional, default: 1): Nomor halaman. Contoh: 1

Contoh Request: /beach/nearby?lat=-6.20&lng=106.81&radius=20&limit=5&page=1

Responses:

200 OK: Pantai terdekat berhasil ditemukan.

{
"message": "Nearby beaches within 20km radius",
"countOnPage": 2,
"totalCount": 2,
"currentPage": 1,
"totalPages": 1,
"data": [
{
"placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
"name": "Pantai Ancol",
"description": "Pantai populer di Jakarta.",
"rating": 4.2,
"reviews": 1500,
"sentimentSummary": { "positive": 60.0, "negative": 20.0, "neutral": 20.0 },
"featured_image": "[https://example.com/ancol.jpg](https://example.com/ancol.jpg)",
"address": "Jakarta Utara",
"review_keywords": "ramai, keluarga",
"link": "[https://maps.google.com/?cid=67890](https://maps.google.com/?cid=67890)",
"coordinates": "-6.123,106.832",
"distance": 8.5 // Jarak dalam km
}
// ... pantai terdekat lainnya
]
}

400 Bad Request: Parameter query tidak valid (misalnya, lat atau lng tidak ada).

500 Internal Server Error.

4. Dapatkan Detail Pantai
   GET /beach/{placeId}

Mengambil informasi detail tentang pantai tertentu menggunakan placeId (Google Place ID).

Path Parameters:

placeId (string, required): ID unik dari pantai. Contoh: ChIJN1t_tDeuEmsRUsoyG83frY4

Contoh Request: /beach/ChIJN1t_tDeuEmsRUsoyG83frY4

Responses:

200 OK: Detail pantai berhasil diambil.

// Skema sama dengan objek tunggal dalam array 'data' dari endpoint /beach/search
{
"placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
"name": "Pantai Kuta",
"description": "Pantai terkenal di Bali dengan ombak yang bagus untuk berselancar.",
"rating": 4.5,
"reviews": 2500,
"sentimentSummary": { "positive": 70.0, "negative": 15.0, "neutral": 15.0 },
"featured_image": "[https://example.com/kuta.jpg](https://example.com/kuta.jpg)",
"address": "Kuta, Kabupaten Badung, Bali",
"review_keywords": "ombak, selancar, sunset",
"link": "[https://maps.google.com/?cid=11223](https://maps.google.com/?cid=11223)",
"coordinates": "-8.7184,115.1686"
}

400 Bad Request: placeId tidak disediakan.

404 Not Found: Pantai dengan placeId tersebut tidak ditemukan.

500 Internal Server Error.

Endpoints Pengguna (User)

1. Registrasi Pengguna Baru
   POST /user/register

Mendaftarkan pengguna baru ke dalam sistem.

Request Body: application/json

{
"username": "penggunabaru",
"email": "penggunabaru@example.com",
"password": "password123",
"confirmPassword": "password123"
}

username (string, required)

email (string, required, format email valid)

password (string, required, min 6 karakter)

confirmPassword (string, required, harus sama dengan password)

Responses:

201 Created: Pengguna berhasil terdaftar.

{
"message": "User registered successfully",
"user": {
"id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
"username": "penggunabaru",
"email": "penggunabaru@example.com",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
}

400 Bad Request: Kesalahan validasi (misalnya, email sudah digunakan, password tidak cocok).

500 Internal Server Error.

2. Login Pengguna
   POST /user/login

Memungkinkan pengguna yang sudah terdaftar untuk login dan mendapatkan token JWT.

Request Body: application/json

{
"email": "penggunabaru@example.com",
"password": "password123"
}

email (string, required)

password (string, required)

Responses:

200 OK: Login berhasil.

{
"message": "Login successful",
"user": {
"id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
"username": "penggunabaru",
"email": "penggunabaru@example.com"
},
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

400 Bad Request: Email atau password salah.

500 Internal Server Error.

3. Perbarui Username Pengguna
   PATCH /user/update-username

Memperbarui username pengguna yang sedang terautentikasi.
Memerlukan Autentikasi (JWT).

Request Body: application/json

{
"username": "username_baru_saya"
}

username (string, required, min 3 karakter)

Responses:

200 OK: Username berhasil diperbarui.

{
"message": "Username updated successfully",
"user": {
"id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
"username": "username_baru_saya",
"email": "penggunabaru@example.com"
}
}

400 Bad Request: Kesalahan validasi atau username sudah digunakan.

401 Unauthorized: Token tidak valid atau tidak ada.

500 Internal Server Error.

4. Perbarui Password Pengguna
   PATCH /user/update-password

Memperbarui password pengguna yang sedang terautentikasi.
Memerlukan Autentikasi (JWT).

Request Body: application/json

{
"currentPassword": "password123",
"newPassword": "passwordbaru456",
"confirmNewPassword": "passwordbaru456"
}

currentPassword (string, required)

newPassword (string, required, min 6 karakter)

confirmNewPassword (string, required, harus sama dengan newPassword)

Responses:

200 OK: Password berhasil diperbarui.

{
"message": "Password updated successfully",
"user": {
"id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
"username": "username_saya",
"email": "penggunabaru@example.com"
}
}

400 Bad Request: Kesalahan validasi (misalnya, currentPassword salah, newPassword tidak cocok).

401 Unauthorized.

500 Internal Server Error.

Endpoints Ulasan (Review)

1. Buat Ulasan Baru
   POST /review

Pengguna yang terautentikasi dapat membuat ulasan baru untuk sebuah pantai. Ulasan akan dianalisis untuk sentimennya.
Memerlukan Autentikasi (JWT).

Request Body: application/json

{
"placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
"rating": 5,
"review_text": "Pantai ini sangat luar biasa! Bersih dan pemandangannya indah sekali."
}

placeId (string, required): ID pantai yang diulas.

rating (float, required, antara 1-5): Rating yang diberikan.

review_text (string, required, min 10 karakter): Isi teks ulasan.

Responses:

201 Created: Ulasan berhasil dibuat dan dianalisis.

{
"message": "Review analyzed and saved successfully",
"sentiment": "positive",
"confidence": 0.98,
"review": {
"id": "z9y8x7w6-v5u4-3210-fedc-ba0987654321",
"review_text": "Pantai ini sangat luar biasa! Bersih dan pemandangannya indah sekali.",
"rating": 5,
"average_sentiment": "positive",
"createdAt": "2025-06-03T14:30:00.000Z",
"updatedAt": "2025-06-03T14:30:00.000Z",
"placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
"userId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}
}

400 Bad Request: Kesalahan validasi, pantai tidak ditemukan, atau pengguna sudah pernah mengulas pantai ini.

401 Unauthorized.

500 Internal Server Error.

2. Dapatkan Ulasan untuk Pantai
   GET /review/{placeId}

Mengambil semua ulasan yang terkait dengan placeId pantai tertentu.

Path Parameters:

placeId (string, required): ID pantai. Contoh: ChIJN1t_tDeuEmsRUsoyG83frY4

Contoh Request: /review/ChIJN1t_tDeuEmsRUsoyG83frY4

Responses:

200 OK: Ulasan berhasil diambil.

{
"placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
"reviews": [
{
"id": "z9y8x7w6-v5u4-3210-fedc-ba0987654321",
"review_text": "Pantai ini sangat luar biasa!",
"rating": 5,
"average_sentiment": "positive",
"createdAt": "2025-06-03T14:30:00.000Z",
"updatedAt": "2025-06-03T14:30:00.000Z",
"placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
"userId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}
// ... ulasan lainnya
]
}

404 Not Found: Pantai tidak ditemukan atau tidak ada ulasan
