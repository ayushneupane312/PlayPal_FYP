import React from "react";

const payments = [
  {
    name: "Arena Five",
    time: "Tonight, 8 PM",
    amount: "NPR 1,600",
    split: "Split 4",
    method: "eSewa",
    status: "Pay Now",
  },
  {
    name: "GoalHub",
    time: "Sat, 7:30 PM",
    amount: "NPR 1,200",
    split: "Split 5",
    method: "Khalti",
    status: "Settle",
  },
  {
    name: "City Turfs",
    time: "Sun, 8:30 PM",
    amount: "NPR 2,000",
    split: "Split 6",
    method: "Stripe",
    status: "Request",
  },
];

const methods = [
  { name: "eSewa", info: "Primary • 98% success", mode: "Auto-split" },
  { name: "Khalti", info: "Backup • Instant", mode: "Manual" },
  { name: "Stripe", info: "Cards • Intl", mode: "Enabled" },
];

export default function PaymentsDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 font-poppins flex flex-row">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white py-6 px-4">
        <h2 className="text-xl font-extrabold mb-8 tracking-wide">PlayPal</h2>
        <nav className="flex flex-col gap-3 text-lg font-semibold">
          <SidebarLink text="Dashboard" />
          <SidebarLink text="Book Futsal" />
          <SidebarLink text="Team & Matchmaking" />
          <SidebarLink text="Payments" active />
          <SidebarLink text="Tournaments" />
          <SidebarLink text="Leaderboard" />
          <SidebarLink text="Health & Injury" />
          <SidebarLink text="Community" />
          <SidebarLink text="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-7 py-5">
        {/* Header / Search */}
        <div className="flex items-center justify-between mb-5">
          <input
            className="w-2/3 px-4 py-2 rounded-full border-gray-300 border focus:outline-none"
            placeholder="Search invoices, splits, methods..."
          />
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Welcome back, Riya</span>
            {/* Add icon buttons here as needed */}
            <button className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg ml-3">New Payment</button>
          </div>
        </div>

        {/* Top: Upcoming Payments */}
        <section>
          <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold flex-1">Upcoming Payments</h3>
            <div className="space-x-2">
              <FilterButton text="All" active />
              <FilterButton text="Pending" />
              <FilterButton text="Paid" />
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <TabButton text="This week" active />
            <TabButton text="Split groups" />
            <TabButton text="Amount" />
            <TabButton text="Status" />
          </div>
          {/* Payment List */}
          <div>
            {payments.map((item, i) => (
              <PaymentCard key={i} {...item} />
            ))}
          </div>
        </section>

        {/* Split Details */}
        <section className="mt-8">
          <div className="rounded-xl bg-green-50 border border-green-200 p-5 shadow flex flex-col gap-3">
            <div className="font-bold text-lg">Arena Five • Tonight</div>
            <div className="text-xl font-semibold text-green-700">NPR 1,600</div>
            <div className="flex items-center gap-2">
              <ProgressBar percent={50} />
              <span className="ml-2 text-sm text-gray-600">2/4 paid • 2 pending</span>
              <span className="ml-2 text-sm text-gray-500">NPR 400 each</span>
            </div>
            <button className="bg-green-600 text-white px-4 py-1 rounded-md mt-2 self-start">Send Reminders</button>
          </div>
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white px-6 py-5 border-l border-gray-200 flex flex-col gap-6">
        {/* Preferred Methods */}
        <section>
          <div className="font-bold text-lg mb-2">Preferred Methods</div>
          <div className="flex flex-col gap-2">
            {methods.map((m, i) => (
              <MethodCard key={i} {...m} />
            ))}
          </div>
        </section>
        {/* Payment Rules */}
        <section>
          <div className="font-bold text-lg mb-2">Payment Rules</div>
          <RulesCard />
        </section>
        {/* Summary */}
        <section>
          <div className="font-bold text-lg mb-2">Summary</div>
          <SummaryCard />
        </section>
      </aside>
    </div>
  );
}

/* --- Subcomponents --- */
function SidebarLink({ text, active }) {
  return (
    <div
      className={`cursor-pointer py-2 px-4 rounded-lg hover:bg-green-800 ${
        active ? "bg-green-700" : ""
      }`}
    >
      {text}
    </div>
  );
}

function FilterButton({ text, active }) {
  return (
    <button
      className={`px-3 py-1 rounded-md border ${
        active ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-300"
      } font-semibold`}
    >
      {text}
    </button>
  );
}

function TabButton({ text, active }) {
  return (
    <button
      className={`px-3 py-1 rounded-full font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {text}
    </button>
  );
}

function PaymentCard({ name, time, amount, split, method, status }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 shadow mb-2">
      <div>
        <div className="font-bold text-lg">{name}</div>
        <div className="text-gray-500 text-sm">{time}</div>
        <div className="text-gray-900">{amount} • {split}</div>
        <div className="text-gray-700 text-sm">{method}</div>
      </div>
      <button className="bg-green-600 text-white font-bold px-5 py-2 rounded-lg">{status}</button>
    </div>
  );
}

function MethodCard({ name, info, mode }) {
  return (
    <div className="flex items-center justify-between p-2 rounded border border-gray-200 shadow-sm">
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-gray-500 text-xs">{info}</div>
      </div>
      <button className="bg-gray-100 px-2 py-1 rounded text-xs">{mode}</button>
    </div>
  );
}

function RulesCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-gray-700">
        <span>Split Strategy</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs">Equal</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs">Lock on start</span>
      </div>
      <div className="flex justify-between text-gray-700">
        <span>Late Policy</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs">Auto-remind 30m</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs">Grace 10m</span>
      </div>
      <div className="flex justify-between text-gray-700">
        <span>Deposits</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs">Required for 5+</span>
      </div>
    </div>
  );
}

function SummaryCard() {
  return (
    <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center gap-6">
      <div>
        <div className="text-xs text-gray-500">This Month Spent</div>
        <div className="font-bold text-xl text-green-700">NPR 6,450</div>
      </div>
      <div>
        <div className="text-xs text-gray-500">Splits Collected</div>
        <div className="font-bold text-xl text-green-700">82%</div>
      </div>
    </div>
  );
}

function ProgressBar({ percent }) {
  return (
    <div className="bg-gray-200 rounded-full w-64 h-3">
      <div
        className="bg-green-500 h-3 rounded-full"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
