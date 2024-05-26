import { useState, useEffect } from 'react'

export const Url = () => {
  const [ytUrl, setYtUrl] = useState('')

  const readYtUrl = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab && tab.url) {
      tab.url.includes('youtube') || tab.url.includes('youtu.be')
        ? setYtUrl(tab.url)
        : setYtUrl('You are not on a YouTube page')
    }
  }

  useEffect(() => {
    readYtUrl()
  }, [])

  return (
    <>
      <a href={ytUrl} target="_blank">
        {ytUrl}
      </a>
    </>
  )
}

export default Url
