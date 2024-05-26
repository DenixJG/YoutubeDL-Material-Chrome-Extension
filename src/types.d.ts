type Tab = 'general' | 'auth'

export type GeneralOptions = {
  backendUrl: URL
}

export type AuthOptions = {
  apiKey: string
  needAuth: boolean
  username?: string
  password?: string
}

export type ReqType = 'download' | 'download-status'

export type DownloadRequest = {
  type: ReqType
  url: string
  jwtToken: string
  apiKey: string
  generalOptions: {
    backendUrl: string
  }
}

export type DownloadStatusRequest = {
  type: ReqType
  uuid: string
  jwtToken: string
  apiKey: string
  generalOptions: {
    backendUrl: string
  }
}

export type YtDownloadFileBody = {
  url: string
  customQualityConfiguration: string | null
  customArgs: string | null
  additionalArgs: string | null
  customOutput: string | null
  youtubeUsername: string | null
  youtubePassword: string | null
  selectedHeight: string | null
  maxHeight: string | null
  maxBitrate: string | null
  type: 'audio' // By default, it is audio but in the future, it can be a dynamic value based on the user's selection
}

export type YtDownloadStatus = {
  download_uid: string
}

export type YtDownloadStatusResponse = {
  error: any | null
  finished: boolean
  finished_step: boolean
  paused: boolean
  percent_complete: number
  running: boolean
  step_index: number
  timestamp_start: string
  type: 'audio' | 'video'
  url: string
  uid: string
  user_uid: string
}
