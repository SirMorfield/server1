import fetch from 'node-fetch'
import dotenv from 'dotenv'
import util from 'util'

dotenv.config()
import { sendMail } from './mailer' // import only after injecting .env vars

util.inspect.defaultOptions.depth = 10

interface Alert {
	date: Date
	type: string // unique key that lets the program know what type of alert it is and not have to send it every time it triggers.
	message: string
}

async function getFindPeersAlert(): Promise<undefined | Alert> {
	const maxSyncHours = 48 // maximum time since last sync

	try {
		const response = await fetch('https://find-peers.codam.nl/status/pull')
		const json = await response.json() as { name: string, lastPull: Date, ago: { ms: number, human: string } }[]
		const alerts = json.filter((x) => x.ago.ms > maxSyncHours * 60 * 60 * 1000)
		if (alerts.length === 0) {
			return undefined
		}
		return {
			date: new Date(),
			type: 'FindPeers timeout',
			message: `Sync took more than ${maxSyncHours} hours\n ${JSON.stringify(alerts, null, 4)}`
		}
	} catch (e) {
		return {
			date: new Date(),
			type: 'FindPeers internal error',
			message: `Error while fetching FindPeers status: ${e}`
		}
	}
}
;
(async () => {
	console.log('Starting monitoring')
	while (true) {
		const alerts: (undefined | Alert)[] = [
			await getFindPeersAlert()
		].filter((x) => x !== undefined)


		if (alerts.length > 0) {
			const content = alerts
				.map((x) => `${x?.date.toISOString()}: ${x?.type}\n${x?.message}`)
				.join('\n---------------\n')

			await sendMail(process.env['RECEIVER_EMAIL'] || '', content, `${alerts.length.toString().padStart(2, ' ')}  Monitoring alerts`)
		}

		await new Promise(resolve => setTimeout(resolve, 4 * 60 * 60 * 1000)) // TODO check mor often, but don't send too many emails
	}
})()
