export default function EmployeeDashboard() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card border border-slate-100">
      <div className="text-sm font-semibold text-slate-500">Employee</div>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">My Tickets</h1>
      <p className="mt-2 text-slate-600">
        Step 1 only: auth + routing is wired. Next steps will show your tickets from
        <span className="font-medium"> /api/requests</span>.
      </p>
    </div>
  )
}
