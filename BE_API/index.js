// index.js
const express = require('express');
const mysql = require('mysql2/promise');
const dbConfig = require('./db_config');

const app = express();
const PORT = 8080; // Port theo SG-Backend

// Middleware cho phép FE gọi API (nếu cần, nhưng ở đây dùng Nginx Proxy nên có thể bỏ qua)
app.use(express.json());

// Hàm kết nối và query Database
async function getStudentsFromDB() {
    let connection;
    try {
        // Tạo kết nối bằng thông tin từ db_config.js
        connection = await mysql.createConnection(dbConfig); 

        // Query test (Giả định bạn đã tạo bảng students với cột id và name)
        const [rows] = await connection.execute('SELECT id, name FROM students LIMIT 10');
        
        // Nếu không có dữ liệu, trả về dữ liệu mẫu để chứng minh kết nối DB thành công
        if (rows.length === 0) {
            console.log("DB connection successful, but no real data. Returning mock data.");
            return [
                { id: 99, name: 'Sinh Viên Mock 1' },
                { id: 100, name: 'Sinh Viên Mock 2' }
            ];
        }

        return rows;
    } catch (err) {
        console.error("Lỗi kết nối hoặc truy vấn DB (SG-DB hoặc config):", err.message);
        // Trả về lỗi để FE biết BE không kết nối được DB
        throw new Error("Không thể kết nối với Database.");
    } finally {
        if (connection) connection.end();
    }
}

// Định nghĩa API Endpoint
app.get('/api/students', async (req, res) => {
    try {
        const students = await getStudentsFromDB();
        res.status(200).json(students);
        console.log("API call successful. Data sent to FE.");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint đơn giản để kiểm tra BE đang hoạt động
app.get('/', (req, res) => {
    res.send('Backend API Server is running on port 8080.');
});


// Khởi động server
app.listen(PORT, () => {
    console.log(`Backend API Server running on http://localhost:${PORT}`);
});