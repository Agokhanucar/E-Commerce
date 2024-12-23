import Layouts from "../Layouts/Layouts";

const About = () => {
  return (
    <Layouts>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white text-center">
            About Us
          </h1>

          <div className="space-y-6 text-gray-600 dark:text-gray-300">
            <p className="leading-relaxed">
              Welcome to{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                CapsuleGame
              </span>
              , your ultimate destination for discovering and purchasing the
              best games!
            </p>

            <p className="leading-relaxed">
              Whether you're a casual player or a hardcore gamer, we've got
              something special for everyone. Our mission is to bring you a
              diverse selection of games across all genres and platforms,
              ensuring that you have access to the latest releases and timeless
              classics.
            </p>

            <p className="leading-relaxed">
              From adrenaline-pumping action titles to immersive role-playing
              adventures, we carefully curate our collection to cater to every
              gaming taste.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                Our Commitment
              </h2>
              <p className="leading-relaxed">
                At CapsuleGame, we are passionate about gaming and committed to
                providing an exceptional shopping experience. We pride ourselves
                on offering:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Competitive prices</li>
                <li>Fast and secure delivery</li>
                <li>User-friendly platform</li>
                <li>Carefully curated game selection</li>
                <li>Exceptional customer service</li>
              </ul>
            </div>

            <p className="leading-relaxed mt-6">
              We value our community of gamers and strive to create a space
              where you can explore, connect, and share your love for gaming.
            </p>

            <div className="text-center mt-8">
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                Ready to play? Dive into our catalog and start your adventure
                today!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layouts>
  );
};

export default About;
