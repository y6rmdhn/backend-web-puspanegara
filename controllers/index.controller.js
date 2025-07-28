

const getDummyData = (req, res) => {
    return res.status(200).json({
        messaage: "berhasil",
        data: "OK"
    })
}


module.exports = {getDummyData}