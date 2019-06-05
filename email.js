const mongoose = require("mongoose");
const nodeMailer = require("nodemailer");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/sumtransfer123", {
  useNewUrlParser: true
});

const nameSchema = new mongoose.Schema({
  receiver: String,
  sender: String,
  subject: String,
  upfile: String,
  message: String
});

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "sum.transfer@gmail.com",
    pass: "tymczasowe2019"
  }
});

const baza_danych = mongoose.model("sum_baza", nameSchema);

const create_options_for_sender = ({ files, body }) => {
  const { receiver, sender, subject, message } = body;
  const { upfile } = files;

  const html = `
        <p> Wiadomość z formularza </p>
        <ul>
            <li>Mail do: ${receiver}</li>
            <li>Mail od: ${sender}</li>
            <li>Mail: ${subject}</li>
        </ul>
        <h3> Wiadomość </h3>
        <p> Wysłałeś plik z wiadomością ${message} </p>
        <p> Pozostała część wiadomości </p>
    `;

  return {
    from: '"SUM Transfer" <sum.transfer@gmail.com>',
    text: html,
    to: sender,
    subject,
    attachments: [{ filename: upfile.name, content: upfile.data }],
    html
  };
};

const create_options_for_receiver = ({ files, body }) => {
  const { receiver, sender, subject, message } = body;
  const { upfile } = files;

  const html = `
        <p> Wiadomość z formularza </p>
        <ul>
            <li>Mail do:  ${receiver}</li>
            <li>Mail od: ${sender}</li>
            <li>Mail: ${subject}</li>
        </ul>
        <h3> Wiadomość </h3>
        <p> Otrzymałeś plik z wiadomością ${message} </p>
        <p> Nazwa pliku ${
          upfile.name
        } lub <a href="http://example.com/uploads/${upfile.name}">klik</a> </p>
        <p> Pozostała część wiadomości </p>
    `;
  return {
    from: '"SUM Transfer" <sum.transfer@gmail.com>',
    text: html,
    to: receiver,
    subject,
    attachments: [{ filename: upfile.name, content: upfile.data }],
    html
  };
};

const send_to_sender = req =>
  new Promise((resolve, reject) => {
    transporter.sendMail(create_options_for_sender(req), (error, info) => {
      if (error) {
        reject(error);
      } else {
        console.log("Message %s sent: %s", info.messageId, info.response);
        resolve();
      }
    });
  });

const send_to_receiver = req =>
  new Promise((resolve, reject) => {
    transporter.sendMail(create_options_for_receiver(req), (error, info) => {
      if (error) {
        reject(error);
      } else {
        console.log("Message %s sent: %s", info.messageId, info.response);
        resolve();
      }
    });
  });

const save_to_db = body =>
  new Promise((resolve, reject) => {
    const myData = new baza_danych(body);

    myData
      .save()
      .then(item => resolve("Zapisano prawidłowo do bazy"))
      .catch(err => reject("Wystąpił błąd podczas zapisu do bazy danych"));
  });

module.exports = req =>
  Promise.all([
    send_to_receiver(req),
    send_to_sender(req),
    save_to_db(req.body)
  ]);
