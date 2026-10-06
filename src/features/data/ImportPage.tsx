import { useSearchParams } from 'react-router'
import { PageHeader } from '../../app/PageHeader'
import { ImportPanel } from './ImportPanel'

export function ImportPage() {
  const [params] = useSearchParams()
  return (
    <>
      <PageHeader title="Import roster">Someone shared a roster with you. Check it, then import it.</PageHeader>
      <ImportPanel initialCode={params.get('d') ?? ''} />
    </>
  )
}
