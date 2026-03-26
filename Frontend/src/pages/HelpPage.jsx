import { Link } from "react-router-dom";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#17153B] text-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold mb-4">Help & support</h1>
      <p className="text-gray-400 text-center max-w-md mb-6">
        For payment or booking issues, include your booking ID and transaction reference when you contact support.
      </p>
      <Link
        to="/playerdashboard"
        className="text-emerald-400 hover:text-emerald-300 underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
