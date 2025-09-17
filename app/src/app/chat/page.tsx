import Chat from "@/components/Chat/Chat";
import { ChatErrorBoundary } from "@/components/Chat/ChatErrorBoundary";

export default function ChatPage() {
  return (
    <div className="w-full h-screen max-w-6xl mx-auto p-6">
      <div className="h-full flex flex-col">
        <ChatErrorBoundary>
          <Chat />
        </ChatErrorBoundary>
      </div>
    </div>
  );
}
