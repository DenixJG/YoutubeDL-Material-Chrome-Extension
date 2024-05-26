import { useEffect, useState } from 'react'
import { GeneralOptions, Tab } from '../../types'
import { toast } from 'react-toastify'

type GeneralOptionsFormProps = {
  storeActiveTab: (tab: Tab) => Promise<Tab>
  generalOptions: GeneralOptions
  setGeneralOptions: (options: GeneralOptions) => void
}

export const GeneralOptionsForm = (props: GeneralOptionsFormProps) => {
  const [localGeneralOptions, setLocalGeneralOptions] = useState<GeneralOptions>()

  const saveGeneralOptions = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const backendUrl = (e.currentTarget.elements.namedItem('backendUrl') as HTMLInputElement).value

    try {
      const url = new URL(backendUrl)

      setLocalGeneralOptions({
        backendUrl: url,
      })

      chrome.storage.local.set({ generalOptions: { backendUrl: url.href } }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError)
          throw new Error('Failed to save general options!')
        }

        toast('General options saved!', { type: 'success' })
      })
    } catch (error) {
      toast('Failed to save general options!', { type: 'error' })
    }
  }

  useEffect(() => {
    setLocalGeneralOptions(props.generalOptions)
  }, [props.generalOptions])

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        saveGeneralOptions(e)
      }}
    >
      <div>
        <label
          htmlFor="backendUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Backend URL
        </label>
        <input
          type="text"
          name="backendUrl"
          id="backendUrl"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          defaultValue={localGeneralOptions?.backendUrl.href}
        />
      </div>

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

export default GeneralOptionsForm
