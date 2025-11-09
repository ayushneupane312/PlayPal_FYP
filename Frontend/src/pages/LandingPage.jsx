import { motion } from "framer-motion";
import { Calendar, Users, BarChart3, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6 bg-gradient-to-b from-emerald-700/20 to-gray-900">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text"
        >
          Welcome to PlayPal ⚽
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10"
        >
          The all-in-one futsal management platform where players can book
          courts, join matches, and owners can manage schedules, revenue, and
          events — all in one place.
        </motion.p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            to="/signup"
            className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 rounded-lg font-semibold text-white shadow-lg hover:from-green-600 hover:to-emerald-700"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-gray-800 bg-opacity-40 backdrop-blur-lg">
        <h2 className="text-4xl font-bold text-center mb-14">
          Why Choose PlayPal?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center"
          >
            <Calendar className="mx-auto text-green-400 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
            <p className="text-gray-400 text-sm">
              Book futsal courts in just a few clicks and manage your schedule
              effortlessly.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center"
          >
            <Users className="mx-auto text-green-400 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
            <p className="text-gray-400 text-sm">
              Create or join teams, organize matches, and keep track of your
              performance.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center"
          >
            <BarChart3 className="mx-auto text-green-400 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-400 text-sm">
              Owners can view booking trends, revenue reports, and player stats.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center"
          >
            <Smartphone className="mx-auto text-green-400 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Mobile Friendly</h3>
            <p className="text-gray-400 text-sm">
              Access PlayPal anytime, anywhere — fully optimized for mobile
              users.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Play Smarter?</h2>
        <p className="text-gray-200 mb-8">
          Join thousands of players and futsal owners using PlayPal today!
        </p>
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/signup"
            className="bg-white text-green-700 font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-200"
          >
            Create Free Account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center bg-gray-950 text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} <span className="text-green-400 font-semibold">PlayPal</span>. 
          All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
