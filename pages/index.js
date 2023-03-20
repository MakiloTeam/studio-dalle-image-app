import { useState } from "react";

export default function Home() {
  const [n, setN] = useState("1");
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  function handlePromptChange(e) {
    setPrompt(e.target.value);
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmitPrompt(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!prompt) {
      setError("Please type your prompt");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("n", n);

    try {
      const res = await fetch(`/api/generate-prompt-images?n=${n}`, {
        method: "POST",
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      const response = await res.json();
      console.debug(response);
      if (response.data.length) {
        setImages([...images, ...response.data]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitVariation(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!file) {
      setError("Please choose an image file.");
      setLoading(false);
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

      const response = await res.json();
      console.debug(response);
      if (response.data.length) {
        setImages([...images, ...response.data]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-white mt-10 mb-6">
            Makilo Studio - DALL·E 2 Image App
          </h1>
        </div>
        <div className="container mx-auto px-4 flex flex-wrap md:flex-nowrap items-start justify-center">
          <div className="w-full max-w-md m-2">
            <form
              onSubmit={handleSubmitPrompt}
              className="bg-gray-800 p-6 rounded-lg"
            >
              <h2 className="text-2xl mb-4">Generate image via prompt</h2>
              {/* <div className="mb-4">
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
              </div> */}
              <div className="mb-4">
                <label htmlFor="prompt" className="block mb-2">
                  Enter description of the image you want (max 1000 chars). The
                  more detailed the description, the more likely you are to get
                  the result that you want.
                </label>
                <textarea
                  id="prompt"
                  name="prompt"
                  rows="3"
                  value={prompt}
                  onChange={handlePromptChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-3 py-2 bg-green-500 hover:bg-green-600 focus:outline-none focus:bg-green-600 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Loading...' : 'Generate image'}
              </button>
            </form>
          </div>
          <div className="w-full max-w-md m-2">
            <form
              onSubmit={handleSubmitVariation}
              className="bg-gray-800 p-6 rounded-lg"
            >
              <h2 className="text-2xl mb-4">Generate image variation</h2>
              <p>Creating variations of an existing image.</p>
              {/* <div className="mb-4">
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
              </div> */}
              <div className="mb-4">
                <label htmlFor="image" className="block mb-2">
                  Upload an image (PNG, max 4MB, square):
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
                disabled={loading}
                className={`w-full px-3 py-2 bg-green-500 hover:bg-green-600 focus:outline-none focus:bg-green-600 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Loading...' : 'Generate image'}
              </button>
            </form>
          </div>
        </div>
        <div className="container max-w-xl mx-auto px-4">
          {error && (
            <div className="bg-red-600 p-2 mt-4 rounded-md">{error}</div>
          )}
        </div>
        <div className="container mx-auto px-4">
          {images.length > 0 && (
            <div className="mt-4 flex flex-row flex-wrap items-start justify-center gap-2">
              {images
                .slice(0)
                .reverse()
                .map((image, index) => (
                  <div key={index} className="bg-white rounded-lg p-2">
                    <a href={image.url} target="_blank">
                      <img
                        src={image.url}
                        alt={`Generated Image ${index + 1}`}
                        className="w-full h-auto md:max-w-sm"
                      />
                    </a>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
