// Em app/caller/[id]/page.tsx

const syncRaids = async () => {
  setSyncLoading(true)
  setSyncMessage(null)
  try {
    const response = await fetch("/api/sync-raids")
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Erro ao sincronizar raids")
    }

    setSyncMessage({
      type: "success",
      text: data.message || "Raids sincronizadas com sucesso!",
    })

    loadCallerAndRaids() // Recarregar os dados após a sincronização
  } catch (error) {
    console.error("Erro ao sincronizar raids:", error)
    setSyncMessage({
      type: "error",
      text: `Erro ao sincronizar raids: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    })
  } finally {
    setSyncLoading(false)
  }
}
<Button
  onClick={syncRaids}
  className="bg-[#0099cc] hover:bg-[#0077aa] dark:bg-blue-700 dark:hover:bg-blue-600"
  disabled={syncLoading}
>
  {syncLoading ? (
    <>
      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      Sincronizando...
    </>
  ) : (
    <>
      <RefreshCw className="h-4 w-4 mr-1" />
      Sincronizar Raids do Raid Helper
    </>
  )}
</Button>