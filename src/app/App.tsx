import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { AdvisorPage } from '../features/advisor/AdvisorPage'
import { ChecklistPage } from '../features/checklist/ChecklistPage'
import { PlannerPage } from '../features/planner/PlannerPage'
import { RosterPage } from '../features/roster/RosterPage'
import { TriagePage } from '../features/triage/TriagePage'
import { Layout } from './Layout'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/planner" replace />} />
          <Route path="roster" element={<RosterPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="advisor" element={<AdvisorPage />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="triage" element={<TriagePage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
