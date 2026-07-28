import { validateChannel } from './exact-env.js'

export function buildArchiveName(version, projectName, channel) {
  return `${version}_${projectName}_${channel}.zip`
}

export function parseChannelBuildArguments(arguments_) {
  const [rawChannel, ...buildArguments] = arguments_
  const channel = validateChannel(rawChannel)

  if (
    buildArguments.some(
      (argument) => argument === '--mode' || argument.startsWith('--mode='),
    )
  ) {
    throw new Error('Channel builds set the Vite mode automatically.')
  }

  return {
    channel,
    createZip: buildArguments.includes('--zip'),
    viteArguments: buildArguments.filter((argument) => argument !== '--zip'),
  }
}
