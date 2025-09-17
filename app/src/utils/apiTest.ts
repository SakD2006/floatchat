// Simple test utility to check API endpoints
// Run this in the browser console on the frontend

export const testAPI = {
  // Test AI health check
  testAIHealth: async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_AI_URL || "https://ai.floatchat.upayan.dev"
        }/api/v1/health`
      );
      const data = await response.json();
      console.log("✅ AI Health Check:", data);
      return true;
    } catch (error) {
      console.error("❌ AI Health Check Failed:", error);
      return false;
    }
  },

  // Test API health check
  testAPIHealth: async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "https://api.floatchat.upayan.dev"
        }/api/auth/debug`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log("✅ API Debug:", data);
      return true;
    } catch (error) {
      console.error("❌ API Debug Failed:", error);
      return false;
    }
  },

  // Test chat message (requires authentication)
  testChatMessage: async (message = "Hello, tell me about ARGO floats") => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_AI_URL || "https://ai.floatchat.upayan.dev"
        }/api/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            message,
            session_id: `test_${Date.now()}`,
          }),
        }
      );
      const data = await response.json();
      console.log("✅ Chat Response:", data);
      return data;
    } catch (error) {
      console.error("❌ Chat Test Failed:", error);
      return null;
    }
  },

  // Run all tests
  runAllTests: async () => {
    console.log("🧪 Running API Integration Tests...");

    const aiHealth = await testAPI.testAIHealth();
    const apiHealth = await testAPI.testAPIHealth();

    console.log("\n📊 Test Results:");
    console.log(`AI Service: ${aiHealth ? "✅ OK" : "❌ FAILED"}`);
    console.log(`API Service: ${apiHealth ? "✅ OK" : "❌ FAILED"}`);

    if (aiHealth && apiHealth) {
      console.log("\n🎉 All services are accessible!");
      console.log(
        "💡 To test chat functionality, run: testAPI.testChatMessage()"
      );
    } else {
      console.log(
        "\n⚠️  Some services are not accessible. Check your environment variables and service URLs."
      );
    }
  },
};

// Auto-run tests when imported (for console usage)
if (typeof window !== "undefined") {
  (window as typeof window & { testAPI: typeof testAPI }).testAPI = testAPI;
  console.log(
    "🔧 API Test utilities loaded. Run testAPI.runAllTests() to test all endpoints."
  );
}
