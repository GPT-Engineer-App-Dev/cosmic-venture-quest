// Update this page (the content is just a fallback if you fail to update the page)

import SpaceGame from '../components/SpaceGame'

const Index = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">3D Space Explorer</h1>
      <p className="mb-4">Use your mouse to rotate the camera and explore the space!</p>
      <SpaceGame />
    </div>
  );
};

export default Index;
