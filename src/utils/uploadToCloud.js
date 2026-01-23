const cloudinary = require("../config/cloudinary")
const fs = require("fs");

const uploadToCloud = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "FEPA",
            transformation: [
                { width: 300, height: 300, crop: "fill" }
            ]
        });

        fs.unlinkSync(filePath);

        return result;
    } catch (err) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw err;
    }
};

module.exports = uploadToCloud;
