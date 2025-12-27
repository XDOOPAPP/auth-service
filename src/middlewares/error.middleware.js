module.exports = (err, req, res, next) => {
  console.error(err); // log đầy đủ ra console

  res.status(err.statusCode || 500).json({
    // Nếu lỗi có response gốc từ axios (auth-service), trả nguyên
    ...(err.response?.data ? err.response.data : {
      message: err.message || "Internal Server Error",
    }),
    // Tuỳ chọn thêm debug info nếu muốn
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
