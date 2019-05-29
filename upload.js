module.exports = ({ upfile }) => new Promise((resolve, reject) => {

    if (upfile) {
        const uploadpath = `${__dirname}/uploads/${upfile.name}`

        const handleSuccess = err => {
            console.log('File Uploaded', upfile.name)
            resolve()
        }

        const handleError = err => {
            console.log('File Upload Failed', upfile.name, err)
            reject('Error Occured!')
        }
        upfile.mv(uploadpath, err => err ? handleError(err) : handleSuccess())
    } else {
        reject('Nie wybrano pliku !')
    }
})