import { useState, useEffect } from 'react'
import { GeneralOptions, YtDownloadStatusResponse } from '../types'

import 'react-toastify/dist/ReactToastify.min.css'
import { ToastContainer, toast } from 'react-toastify'

export const Popup = () => {
  const [jwtToken, setJwtToken] = useState<string>()
  const [apiKey, setApiKey] = useState<string>()
  const [youtubeUrl, setYoutubeUrl] = useState<string>()
  const [youtubeTabDetected, setYoutubeTabDetected] = useState<boolean>(false)
  const [generalOptions, setGeneralOptions] = useState<GeneralOptions>({
    backendUrl: new URL('https://api.example.com'),
  })

  const [downloadResponse, setDownloadResponse] = useState<YtDownloadStatusResponse>()
  const [activeDownload, setActiveDownload] = useState<boolean>(false)

  const readGeneralOptions = () => {
    chrome.storage.local.get(['generalOptions'], (result) => {
      try {
        const backendUrl = new URL(result.generalOptions.backendUrl)
        setGeneralOptions({ backendUrl })
      } catch (error) {
        console.error('Error reading generalOptions', error)
      }
    })
  }

  const readJwtToken = () => {
    chrome.storage.local.get(['jwtToken'], (result) => {
      setJwtToken(result.jwtToken)
    })
  }

  const readApiKey = () => {
    chrome.storage.local.get(['authOptions'], (result) => {
      setApiKey(result.authOptions.apiKey)
    })
  }

  /**
   * Check if the URL is a Youtube URL to download
   *
   * @param url URL to check
   * @returns True if the URL is a Youtube URL
   */
  const isYoutubeUrl = (url?: string) => {
    if (!url) {
      return false
    }

    try {
      const urlObject = new URL(url)
      const validHosts = ['www.youtube.com', 'youtube.com']
      if (!validHosts.includes(urlObject.host)) {
        return false
      }

      const searchParams = new URLSearchParams(urlObject.search)
      if (!searchParams.has('v')) {
        return false
      }

      if (urlObject.pathname !== '/watch') {
        return false
      }

      setYoutubeTabDetected(true)
      return true
    } catch (error) {
      return false
    }
  }

  const readYoutubeUrl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (tab && isYoutubeUrl(tab.url)) {
        setYoutubeUrl(tab.url)
      }
    })
  }

  useEffect(() => {
    readGeneralOptions()
    readJwtToken()
    readYoutubeUrl()
    readApiKey()
  }, [])

  useEffect(() => {
    if (downloadResponse) {
      setActiveDownload(true)
    }
  }, [downloadResponse])

  useEffect(() => {
    let intervalId: NodeJS.Timeout // Variable to store the interval ID

    if (activeDownload) {
      try {
        intervalId = setInterval(() => {
          chrome.runtime.sendMessage(
            {
              type: 'download-status',
              uuid: downloadResponse?.uid,
              jwtToken,
              apiKey,
              generalOptions,
            },
            (response: YtDownloadStatusResponse) => {
              if (response && response.error) {
                clearInterval(intervalId) // Stop interval on error
                toast('Error getting download status', { type: 'error' })
                setActiveDownload(false)
                throw new Error('Error getting download status')
              }

              if (response.finished) {
                clearInterval(intervalId) // Stop interval on finish
                toast('Download finished', { type: 'success' })
                setActiveDownload(false)
                return
              }
            },
          )
        }, 1000)
      } catch (error) {
        console.error('Error checking download status', error)
      }
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [activeDownload])

  return (
    <>
      <ToastContainer position="bottom-center" stacked={true} />
      <main className="min-h-screen py-6 px-4 bg-gray-100 dark:bg-gray-900">
        {/* Top Title */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h1 className="text-center text-lg font-semibold text-gray-800 dark:text-gray-200">
            Youtube-DL Material
          </h1>
        </div>

        <div className="mt-2 space-y-2"></div>

        {/* Show Link */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          {youtubeTabDetected ? (
            <h2 className="text-center text-sm font-semibold text-gray-800 dark:text-gray-200">
              {youtubeUrl}
            </h2>
          ) : (
            <h2 className="text-center text-sm font-semibold text-orange-400 dark:text-orange-300">
              Invalid Youtube URL or Youtube tab not detected
            </h2>
          )}
        </div>

        <div className="mt-2 space-y-2"></div>

        {/* Download Button */}
        <div className="">
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md"
            onClick={() => {
              if (youtubeUrl) {
                chrome.runtime.sendMessage(
                  {
                    type: 'download',
                    url: youtubeUrl,
                    jwtToken,
                    apiKey,
                    generalOptions,
                  },
                  (response) => {
                    if (response && response.error) {
                      toast('Error downloading video', { type: 'error' })
                      return
                    }

                    setDownloadResponse(response)
                  },
                )
              }
            }}
          >
            Download
          </button>
        </div>

        <div className="mt-2 space-y-2"></div>

        {/* Download Status */}
        {activeDownload && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-center text-sm font-semibold text-gray-800 dark:text-gray-200">
              Downloading...
            </h2>
          </div>
        )}
      </main>
    </>
  )
}

export default Popup
