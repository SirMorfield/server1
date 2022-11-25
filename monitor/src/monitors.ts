import fetch from 'node-fetch'
import type { Alert } from './app'

export async function getFindPeersAlert(): Promise<undefined | Alert> {
	const maxSyncHours = 35 // maximum time since last sync

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
