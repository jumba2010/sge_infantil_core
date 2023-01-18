const twilio = require('twilio');
const router=express.Router();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const optionsList = ['Ver Meses em divida', 'Ver aproveitamento do seu educando', 'Informacao geral da escola'];

router.post('/webhook', (req, res) => {
   
    //We need to validate the incomming request
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = req.protocol + '://' + req.get('host') + req.originalUrl;
    const valid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      url,
      req.body
    );
  
    //By this step we are sure the request is from twillo, so we can extract the data
    if (valid) {
    // Parse the incoming message
    const message = req.body.Body;
    const from = req.body.From;
   
     // Perform the appropriate action based on the contents of the message
     if (message === 'Oi') {
        // Send a response back to the client
        const options = optionsList.map((option, index) => `${index + 1}. ${option}`).join('\n');
        const response = 'Seja Bem vindo, sellecione a opcao desejada: \n' + options;
        client.messages.create({
            from: 'whatsapp:+14155238886',
            to: `whatsapp:${from}`,
            body: response
        })
        .then(() => {
            res.set('Content-Type', 'text/plain');
            res.send('message sent');
        })
        .catch((err) => {
            console.log(err);
            res.set('Content-Type', 'text/plain');
            res.send('Error sending message');
        });
    }

    else{


    }

} else {

    res.status(401).send('Unauthorized');  
}
});

module.exports=router;

