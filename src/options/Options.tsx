import { useEffect, useState } from 'react'
import { CogIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { GeneralOptionsForm } from './components/GeneralOptionsForm'
import AuthOptionsForm from './components/AuthOptionsForm'
import { AuthOptions, GeneralOptions, Tab } from '../types'
import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.min.css'

export const Options = () => {
  const [tabs] = useState<Tab[]>(['general', 'auth'])
  const [activeTab, setActiveTab] = useState<Tab>('general')

  const [jwtToken, setJwtToken] = useState('')

  const [generalOptions, setGeneralOptions] = useState<GeneralOptions>({
    backendUrl: new URL('https://api.example.com'),
  })

  const [authOptions, setAuthOptions] = useState<AuthOptions>({
    apiKey: '',
    needAuth: false,
    username: '',
    password: '',
  })

  /**
   * Get stored options from chrome storage local API
   *
   * @param key - key to get stored options
   * @returns Promise<GeneralOptions | AuthOptions>
   */
  const getStoredOptions = (key: string): Promise<GeneralOptions | AuthOptions> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (items) => {
        resolve(items[key])
      })
    })
  }

  /**
   * Get active tab from chrome storage session API
   *
   * @returns Promise<Tab>
   */
  const getActiveTab = (): Promise<Tab> => {
    return new Promise((resolve) => {
      chrome.storage.session.get('activeTab', (items) => {
        resolve(items.activeTab)
      })
    })
  }

  /**
   * Store active tab in chrome storage session API
   *
   * @param tab - active tab to store
   * @returns Promise<Tab>
   */
  const storeActiveTab = (tab: Tab): Promise<Tab> => {
    return new Promise((resolve) => {
      chrome.storage.session.set({ activeTab: tab }, () => {
        resolve(tab)
      })
    })
  }

  const healthCheck = async () => {
    try {
      const response = await fetch(`${generalOptions.backendUrl.origin}/api/health`)

      if (!response.ok) {
        throw new Error('Failed to health check!')
      }

      const data = await response.json()

      console.log('data', data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getStoredOptions('generalOptions').then((options) => {
      const generalOptions = options as GeneralOptions
      if (generalOptions) {
        setGeneralOptions({
          backendUrl: new URL(generalOptions.backendUrl),
        })
      }
    })

    getStoredOptions('authOptions').then((options) => {
      const authOptions = options as AuthOptions
      if (authOptions) {
        setAuthOptions({
          apiKey: authOptions.apiKey,
          needAuth: authOptions.needAuth,
          username: authOptions.username,
          password: authOptions.password,
        })
      }
    })
  }, [])

  // Update active tab on component mount and when it changes
  useEffect(() => {
    getActiveTab().then((tab) => {
      setActiveTab(tab)
    })
  }, [activeTab])

  return (
    <>
      <nav className="flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            {tabs.map((tab) => (
              <li key={tab} className="me-2">
                <a
                  href="#"
                  className={`inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group ${activeTab === tab ? 'text-blue-500 border-blue-300 dark:text-blue-300' : ''}`}
                  onClick={async () => {
                    setActiveTab(tab)
                    await storeActiveTab(tab)
                  }}
                >
                  {tab === 'general' ? (
                    <CogIcon className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300" />
                  ) : (
                    <UserCircleIcon className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300" />
                  )}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Show a warning if the server is down or there is an error */}
      {generalOptions.backendUrl.href === 'https://api.example.com' && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-800 rounded-lg shadow">
          <p className="text-sm text-red-700 dark:text-red-200">
            The server is down or there is an error. Please update the backend URL in the general
            options.
          </p>
        </div>
      )}

      <main className="mt-6">
        <ToastContainer position="bottom-center" autoClose={5000} />
        {activeTab === 'general' ? (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">General</h1>
            <div className="mt-4 space-y-4">
              <GeneralOptionsForm
                storeActiveTab={storeActiveTab}
                generalOptions={generalOptions}
                setGeneralOptions={setGeneralOptions}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Auth</h1>
            <div className="mt-4 space-y-4">
              <AuthOptionsForm
                storeActiveTab={storeActiveTab}
                generalOptions={generalOptions}
                authOptions={authOptions}
                setAuthOptions={setAuthOptions}
              />
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export default Options
