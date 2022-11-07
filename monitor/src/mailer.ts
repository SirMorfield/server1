import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	auth: {
		user: process.env['SENDER_EMAIL'],
		pass: process.env['SENDER_PASSWORD']
	}
})

	;
(async () => {
	const success = await transporter.verify()
	if (!success) {
		throw new Error('Could not connect to mail server')
	}
})()

export async function sendMail(to: string, content: string, subject?: string): Promise<void> {
	const mailOptions = {
		from: process.env['SENDER_EMAIL'],
		to,
		subject: subject ?? `Monitoring update at ${new Date().toISOString()}`,
		text: content
	}

	const resp = await transporter.sendMail(mailOptions)
	console.log('Email sent: ', resp)
}
