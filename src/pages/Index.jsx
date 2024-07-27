// Update this page (the content is just a fallback if you fail to update the page)

import SpaceGame from '../components/SpaceGame'

const Index = () => {
  return (
    <div className="flex flex-col items-center bg-black text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-4 mt-8">Cosmic Voyager</h1>
      <p className="mb-4 text-lg">Embark on an interstellar journey through the cosmos!</p>
      <div className="w-full max-w-4xl bg-gray-900 p-4 rounded-lg shadow-lg">
        <SpaceGame />
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">How to Play</h2>
        <ul className="list-disc list-inside">
          <li>Use arrow keys to navigate your spaceship</li>
          <li>Explore the vast universe and discover celestial bodies</li>
          <li>Try to reach the space station in the distance</li>
        </ul>
      </div>
    </div>
  );
};

export default Index;
