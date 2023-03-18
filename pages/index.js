import { useState } from "react";

export default function Home() {
  const [n, setN] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please choose an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("n", n);

    try {
      const res = await fetch(`/api/generate-images?n=${n}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl mb-4">Generate Image Variations</h2>
          <div className="mb-4">
            <label htmlFor="n" className="block mb-2">
              Number of images (1-10):
            </label>
            <input
              type="number"
              id="n"
              min="1"
              max="10"
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:bg-gray-600"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block mb-2">
              Upload an image (PNG, max 2MB, square):
            </label>
            <input
              type="file"
              id="image"
              accept="image/png"
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:bg-gray-600"
            />
          </div>
          <button
            type="submit"
            className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 focus:outline-none focus:bg-green-600 rounded-md"
          >
            Generate
          </button>
          {error && (
            <div className="bg-red-600 p-2 mt-4 rounded-md">{error}</div>
          )}
        </form>
        {response && response.data.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
            {response.data.map((img, index) => (
              <div key={index} className="bg-white rounded-lg p-2">
                <a href={img.url} target="_blank"><img src={img.url} alt={`Generated Image ${index + 1}`} className="w-full h-auto" /></a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
