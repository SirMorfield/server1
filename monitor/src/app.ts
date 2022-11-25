import dotenv from 'dotenv'
import util from 'util'
import { getFindPeersAlert } from './monitors'

dotenv.config()
import { sendMail } from './mailer' // import only after injecting .env vars

util.inspect.defaultOptions.depth = 10

export interface Alert {
	date: Date
	type: string // unique key that lets the program know what type of alert it is and not have to send it every time it triggers.
	message: string
}

let sendAlerts: { type: string, date: Date }[] = []

	;
(async () => {
	console.log('Starting monitoring')
	while (true) {
		const deleteBefore = new Date(Date.now() - 1000 * 60 * 60 * 5)
		sendAlerts = sendAlerts.filter((x) => x.date < deleteBefore) // remove old emails

		const alerts1 = [
			await getFindPeersAlert()
		].filter((x) => !!x) as Alert[]

		const alerts = alerts1.filter((x) => !sendAlerts.find((y) => y.type === x.type)) // don't send the same email multiple times

		if (alerts.length > 0) {
			const content = alerts
				.map((x) => `${x.date.toISOString()}: ${x.type}\n${x.message}`)
				.join('\n---------------\n')

			sendAlerts.push(...alerts.map((x) => ({ type: x!.type, date: x!.date })))
			await sendMail(process.env['RECEIVER_EMAIL'] || '', content, `${alerts.length.toString().padStart(2)}  Monitoring alerts`)
		}

		await new Promise(resolve => setTimeout(resolve, 60 * 1000))
	}
})()
