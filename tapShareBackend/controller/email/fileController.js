const File = require("../../model/fileModel");
const sendEmail = require("../../services/sendEmail");
const sendSms = require("../../services/sendSms");

exports.sendFiles = async (req, res) => {
  console.log(req.files)
  console.log(req.body)
  const files = req.files;
  try {
    const filePaths = [];

    for (var i = 0; i < files.length; i++) {
      const newFile = await File.create({
        userId: req.body.userId,
        name: files[i].originalname,
        path:
          process.env.baseUrl +
          "u/" +
          files[i].path.replace(/\\/g, "/").replace("uploads/", ""), // replace backslash with forward slash
        size: files[i].size,
      });

      const savedFile = await newFile.save();
      if (savedFile) filePaths.push(newFile.path);
    }
    // send email here
    const emailOptions = {
      to: req.body.email,
      subject: "New File Received from TapShare ",
      text: "Tapshare is a simple, secure, and reliable file sharing platform that allows users to quickly and easily send large files over the internet.Give it a  try today at https://www.tapshare.xyz/ . For more Info visit https://github.com/maheshbasnet089/tapShare",
    };

    // Add file paths as links in the email body
    emailOptions.text += "\n\nShared Files(tap to download):\n";
    for (const filePath of filePaths) {
      emailOptions.text += `${filePath}\n`;
    }

    if (req.body.email.startsWith("98")) {
      try {
        await sendSms(emailOptions);
        return res.json({
          message: "File sent successfully",
          status: 200,
        });
      } catch (e) {
        return res.json({
          message: "Error sending sms",
          status: 500,
        });
      }
    } else if (req.body.email) {
      sendEmail(emailOptions);

      return res.json({
        message: "File sent successfully",
        status: 200,
      });
    } else if (req.body.email === "" || req.body.email === null) {
      return res.json({
        userId: req.body.userId,

        message: "Link generated",
        status: 201,
      });
    } else {
      return res.json({
        message: "Error sending file",
        status: 500,
      });
    }
  } catch (e) {
    res.json({
      errorMessage: e.message,
      message: "Error sending file",
      status: 500,
    });
  }
};
