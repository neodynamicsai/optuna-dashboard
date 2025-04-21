import { useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { useSnackbar } from "notistack"
import { useEffect } from "react"
import type { APIMeta } from "../apiClient"
import { useAPIClient } from "../apiClientProvider"

// Fetch root prefix from the global variable injected by the backend.
// Fallback to empty string if it's not defined.
const rootPrefix = (window as any).rootPrefix || ""

export const useArtifactBaseUrlPath = (): string => {
  const { apiClient } = useAPIClient()
  const { enqueueSnackbar } = useSnackbar()
  const { data, isLoading, error } = useQuery<
    APIMeta,
    AxiosError<{ reason: string }>
  >({
    queryKey: ["apiMeta"],
    queryFn: () => apiClient.getMetaInfo(),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  useEffect(() => {
    if (error) {
      const reason = error.response?.data.reason
      enqueueSnackbar(`Failed to load API meta (reason=${reason})`, {
        variant: "error",
      })
    }
  }, [error])

  // Always return the runtime prefix. Ignore JupyterLab context for this purpose.
  return rootPrefix

  // Original logic (commented out):
  // if (isLoading || error !== null) {
  //   return ""
  // }
  // return data?.jupyterlab_extension_context?.base_url ?? ""
}
