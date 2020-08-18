const sgMail = require ('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/*sgMail.send ({
    to: 'alexcosta142@gmail.com',
    from: 'alexcosta96@hotmail.com',
    subject: 'This is my Second  Creation',
    text: 'Teste agora é que é'
})*/
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'alexcosta96@hotmail.com',
        subject: 'Welcome to the Task App',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'alexcosta96@hotmail.com',
        subject: 'Remove to the Task App',
        text: `Account, ${name} has been removed sucefully.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}