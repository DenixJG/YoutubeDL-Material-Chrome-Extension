import {
  DownloadRequest,
  DownloadStatusRequest,
  YtDownloadFileBody,
  YtDownloadStatus,
} from '../types'

console.log('background is running')

const headers = new Headers()
headers.append('Content-Type', 'application/json')
headers.append('Accept', 'application/json')

const startDownload = async (request: DownloadRequest) => {
  const { url, jwtToken, apiKey, generalOptions } = request

  const backendUrl = new URL(generalOptions.backendUrl)

  const ytDownloadFileBody: YtDownloadFileBody = {
    url,
    customQualityConfiguration: null,
    customArgs: null,
    additionalArgs: null,
    customOutput: null,
    youtubeUsername: null,
    youtubePassword: null,
    selectedHeight: null,
    maxHeight: null,
    maxBitrate: null,
    type: 'audio',
  }

  const response = await fetch(
    `${backendUrl.origin}/api/downloadFile?apiKey=${apiKey}${jwtToken ? `&jwt=${jwtToken}` : ''}`,
    {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(ytDownloadFileBody),
    },
  )

  const data = await response.json()

  return data.download ?? data
}

const downloadStatus = async (request: DownloadStatusRequest) => {
  const { uuid, jwtToken, apiKey, generalOptions } = request

  const backendUrl = new URL(generalOptions.backendUrl)

  const rawBody: YtDownloadStatus = {
    download_uid: uuid,
  }

  const response = await fetch(
    `${backendUrl.origin}/api/download?apiKey=${apiKey}${jwtToken ? `&jwt=${jwtToken}` : ''}`,
    {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(rawBody),
    },
  )

  const data = await response.json()

  return data.download ?? data
}

chrome.runtime.onMessage.addListener(
  (request: DownloadRequest | DownloadStatusRequest, sender, sendResponse) => {
    let response = {
      error: 'error',
      message: 'Invalid request',
    }

    if (request.type === 'download') {
      const downloadRequest = request as DownloadRequest
      startDownload(downloadRequest)
        .then((data) => {
          sendResponse(data)
        })
        .catch((error) => {
          console.error('Error starting download', error)
          sendResponse(response)
        })

      return true
    }

    if (request.type === 'download-status') {
      const downloadStatusRequest = request as DownloadStatusRequest
      downloadStatus(downloadStatusRequest)
        .then((data) => {
          sendResponse(data)
        })
        .catch((error) => {
          console.error('Error getting download status', error)
          sendResponse(response)
        })

      return true
    }

    sendResponse(response)
    return false
  },
)
