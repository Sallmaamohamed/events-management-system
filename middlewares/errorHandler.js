const errorHandeler = (err, req, res, next) => {
    const satatusCode = res.satatusCode === 200 ? 500 : res.satatusCode;
    res.status(statusCode).json({
        massage: err.message || ' حدث خطأ في السيرفر',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandeler;

