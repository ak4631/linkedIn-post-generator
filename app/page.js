"use client";
import { useState } from "react";
import { Copy, Download, Linkedin, Sparkles, User, TrendingUp, MessageCircle } from "lucide-react";

export default function LinkedInPostGenerator() {
  const [niche, setNiche] = useState("");
  const [postType, setPostType] = useState("motivational");
  const [generatedPost, setGeneratedPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const postTypes = [
    { value: "motivational", label: "Motivational", icon: TrendingUp },
    { value: "educational", label: "Educational", icon: User },
    { value: "story", label: "Personal Story", icon: MessageCircle },
    { value: "tips", label: "Tips & Advice", icon: Sparkles }
  ];

  const handleGenerate = async () => {
    if (!niche.trim()) return;
    
    setLoading(true);
    setGeneratedPost("");
    
    const prompt = `Create a ${postType} LinkedIn post about ${niche}. Make it engaging, professional, and include relevant hashtags. Keep it concise but impactful.`;
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: prompt })
      });

      const data = await response.json();
      setGeneratedPost(data.response);
    } catch (error) {
      setGeneratedPost("Error generating post: " + error.message);
    }
    setLoading(false);
  };

  const handleStreamGenerate = async () => {
    if (!niche.trim()) return;
    
    setStreaming(true);
    setGeneratedPost("");
    
    const prompt = `Create a ${postType} LinkedIn post about ${niche}. Make it engaging, professional, and include relevant hashtags. Keep it concise but impactful.`;
    
    try {
      const response = await fetch("/api/chat_stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: prompt })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const jsonStr = line.slice(5).trim();
            if (jsonStr) {
              try {
                const data = JSON.parse(jsonStr);
                setGeneratedPost((prev) => prev + data.content);
              } catch (e) {
                console.error("Failed to parse JSON from stream line:", jsonStr, e);
              }
            }
          }
        }
      }
    } catch (error) {
      setGeneratedPost("Error generating post: " + error.message);
    }
    setStreaming(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost);
      // Simple feedback - in a real app you'd want a toast notification
      alert("Post copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const downloadPost = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedPost], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `linkedin-post-${postType}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Linkedin className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">LinkedIn Post Generator</h1>
          </div>
          <p className="text-gray-600 text-lg">Create engaging LinkedIn content in seconds</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
              Content Settings
            </h2>
            
            {/* Niche Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Niche/Topic
              </label>
              <textarea
                placeholder="e.g., Digital Marketing, Software Development, Leadership, Entrepreneurship..."
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Post Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Post Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {postTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setPostType(type.value)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                        postType === type.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!niche.trim() || loading || streaming}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Post
                  </>
                )}
              </button>
              
              <button
                onClick={handleStreamGenerate}
                disabled={!niche.trim() || loading || streaming}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
              >
                {streaming ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Stream Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <Linkedin className="w-6 h-6 mr-2 text-blue-600" />
                Generated Post
              </h2>
              
              {generatedPost && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={downloadPost}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    title="Download as text file"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 min-h-96">
              {generatedPost ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {generatedPost}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Linkedin className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Your generated LinkedIn post will appear here</p>
                    <p className="text-sm mt-2">Enter your niche and click generate to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Create professional LinkedIn content that engages your audience</p>
        </div>
      </div>
    </div>
  );
}


// "use client";
// import Image from "next/image";
// import styles from "./page.module.css";
// import { useState } from "react";

// export default function Home() {
//   const [message,setMessage] = useState("");
//   const [response,setResponse] = useState("");
//   const [streaming,setStreaming] = useState("");
//   const [loading,setLoading]=useState("");
//   const [streamResponse,setStreamResponse] = useState("");

//   const handleStreamChat = async() =>{
//     setLoading(true);
//     setResponse("");
//     try {
//       const response = await fetch("/api/chat",{
//         method:"POST",
//         headers:{
//           "Content-Type":"application/json"
//         },
//         body:JSON.stringify({message})
//       })

//       const data = await response.json();
//       setResponse(data.response);
//     } catch (error) {
//       setResponse("Error: " + error.message)
//     }
//     setLoading(false);
//   }

//   const handleStreamingResponse = async() =>{
//     setStreaming(true);
//     setStreamResponse("");
//     try {
//       const response = await fetch("/api/chat_stream",{
//         method:"POST",
//         headers:{
//           "Content-Type":"application/json"
//         },
//         body:JSON.stringify({message})
//       })

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       while(true){
//         const {done,value} = await reader.read();
//         if(done) break;

//         const chunk = decoder.decode(value);
//         const lines = chunk.split("\n");

//         for(const line of lines){
//           if(line.startsWith("data:")){
//             // const data = JSON.parse(line.slice(7));
//             // setStreamResponse((prev)=>prev + data.content);
//              const jsonStr = line.slice(5).trim(); // OR slice(5) if there's no space
//             if (jsonStr) {
//               try {
//                 const data = JSON.parse(jsonStr);
//                 setStreamResponse((prev) => prev + data.content);
//               } catch (e) {
//                 console.error("Failed to parse JSON from stream line:", jsonStr, e);
//               }
//             }
//           }
//         }
//       }
//       // const data = await
//     } catch (error) {
//        setStreamResponse("Error: " + error.message)
//     }
//     setStreaming(false);
//   }

//   return (
//     <div className={styles.page}>
//       <div style={{
//         width: "100%",
//         alignItems: "center",
//         justifyContent: "center",
//         display: "flex",
//         flexDirection: "column",
//         margin:"auto"
//       }}>
//         <div>
//           <textarea placeholder="Enter Your Text" onChange={(e)=>setMessage(e.target.value)} value={message} rows={6}/>
//         </div>
//         <div style={{border:"2px solid",margin:"10px 0px",padding:"10px 20px"}}>
//           Response: {response}
//         </div>
//         <div style={{border:"2px solid",margin:"10px 0px",padding:"10px 20px"}}>
//           Streaming Response: {streamResponse}
//         </div>
//         <div style={{display:"flex",gap:"1rem"}}>
//           <button onClick={handleStreamChat}>{loading ? "Loading..." : "Chat"}</button>
//           <button onClick={handleStreamingResponse}>{streaming ? "Loading..." : "Stream Chat"}</button>
//         </div>
        
//       </div>
//     </div>
//   );
// }
