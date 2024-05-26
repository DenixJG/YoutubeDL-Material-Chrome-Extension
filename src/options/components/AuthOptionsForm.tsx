import { useEffect, useState } from 'react'
import { AuthOptions, GeneralOptions, Tab } from '../../types'
import { toast } from 'react-toastify'

type AuthOptionsFormProps = {
  storeActiveTab: (tab: Tab) => Promise<Tab>
  generalOptions: GeneralOptions
  authOptions: AuthOptions
  setAuthOptions: (options: AuthOptions) => void
}

export const AuthOptionsForm = (props: AuthOptionsFormProps) => {
  const [showAuthInputs, setShowAuthInputs] = useState<boolean>(false)
  const [localAuthOptions, setLocalAuthOptions] = useState<AuthOptions>()

  const login = async () => {
    const backendUrl = props.generalOptions.backendUrl

    if (!backendUrl) {
      toast('Please provide a valid backend URL!', { type: 'warning' })
      return
    }

    if (!localAuthOptions?.apiKey) {
      toast('Please provide a valid API key!', { type: 'warning' })
      return
    }

    try {
      const response = await fetch(
        `${backendUrl.origin}/api/auth/login?apiKey=${localAuthOptions?.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: localAuthOptions?.username,
            password: localAuthOptions?.password,
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to login!')
      }

      const data = await response.json()

      if (!data.token) {
        throw new Error('Failed to login! Response does not contain a token.')
      }

      // Store token in chrome storage local API for future requests
      chrome.storage.local.set({ jwtToken: data.token }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError)
          throw new Error('Failed to store token!')
        }

        toast('Logged in successfully! Now you can access the API.', { type: 'success' })
      })
    } catch (error) {
      console.error(error)
      toast('Failed to login! Check your credentials and try again.', { type: 'error' })
    }
  }

  const saveAuthOptions = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const authOptionsKeys = Object.keys(props.authOptions) as Array<keyof AuthOptions>

    const authOptions = authOptionsKeys.reduce((acc, key) => {
      if (key === 'needAuth') {
        const element = e.currentTarget.elements.namedItem(key) as HTMLInputElement
        const value = element?.checked
        return { ...acc, [key]: value }
      }

      const element = e.currentTarget.elements.namedItem(key) as HTMLInputElement
      const value = element?.value

      return { ...acc, [key]: value }
    }, {} as AuthOptions)

    try {
      setLocalAuthOptions(authOptions)

      chrome.storage.local.set({ authOptions }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError)
          throw new Error('Failed to save auth options!')
        }

        toast(`Auth options saved!${authOptions.needAuth ? ' Logging in...' : ''}`, {
          type: 'success',
        })

        if (authOptions.needAuth) {
          login()
        }
      })
    } catch (error) {
      console.error(error)
      toast('Failed to save auth options!', { type: 'error' })
    }
  }

  useEffect(() => {
    setLocalAuthOptions(props.authOptions)
    setShowAuthInputs(props.authOptions.needAuth)
  }, [props.authOptions])

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        saveAuthOptions(e)
      }}
    >
      <div>
        <label
          htmlFor="apiKey"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          API Key
        </label>
        <input
          type="text"
          name="apiKey"
          id="apiKey"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          defaultValue={localAuthOptions?.apiKey}
        />
      </div>

      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input
            id="needAuth"
            name="needAuth"
            type="checkbox"
            className="h-4 w-4 rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            defaultChecked={localAuthOptions?.needAuth}
            onChange={(e) => {
              setShowAuthInputs(e.currentTarget.checked)
            }}
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor="needAuth" className="font-medium text-gray-700 dark:text-gray-200">
            Auth required
          </label>
          <p className="text-gray-500">Auth required to access the API</p>
        </div>
      </div>

      {showAuthInputs && (
        <>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              defaultValue={localAuthOptions?.username}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              defaultValue={localAuthOptions?.password}
            />
          </div>
        </>
      )}

      <div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default AuthOptionsForm
