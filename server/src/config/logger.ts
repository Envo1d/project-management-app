export const getLoggerConfig = () => {
	switch (process.env.NODE_ENV) {
		case 'test':
			return false
		case 'local':
			return {
				transport: {
					target: 'pino-pretty',
					options: {
						translateTime: 'HH:MM:ss Z',
						ignore: 'pid,hostname'
					}
				}
			}
		default:
			return true
	}
}
