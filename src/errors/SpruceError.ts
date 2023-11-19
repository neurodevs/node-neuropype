import BaseSpruceError from '@sprucelabs/error'
import ErrorOptions from '#spruce/errors/options.types'

export default class SpruceError extends BaseSpruceError<ErrorOptions> {
	/** an easy to understand version of the errors */
	public friendlyMessage(): string {
		const { options } = this
		let message
		switch (options?.code) {
			case 'INVALID_PIPELINE_FORMAT':
				message = `Pipeline path must end in .pyp! Found: ${options.path}`
				break

			case 'PIPELINE_NOT_FOUND':
				message = `Pipeline not found: ${options.path}!`
				break

			case 'MISSING_NEUROPYPE_BASE_URL_ENV':
				message =
					'Please define NEUROPYPE_BASE_URL in your env! Usually: http://localhost:6937'
				break

			default:
				message = super.friendlyMessage()
		}

		const fullMessage = options.friendlyMessage
			? options.friendlyMessage
			: message

		return fullMessage
	}
}
